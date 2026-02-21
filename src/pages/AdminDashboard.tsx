import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  getBandForWeight,
  getWeightBand,
  WEIGHT_BANDS,
  calculateDeliveryPrice,
  type WeightBand,
} from "@/config/pricingCalculator";
import {
  Users,
  Package,
  Truck,
  LayoutDashboard,
  Copy,
  Check,
  Phone,
  Mail,
  Eye,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Profile = {
  id: string;
  auth_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  role: string | null;
  created_at: string;
};

type Parcel = {
  id: string;
  pickup_location: string | null;
  dropoff_location: string | null;
  weight_kg: number | null;
  price: number | null;
  description: string | null;
  status: string | null;
  sender_id: string | null;
  traveler_id: string | null;
  created_at: string;
};

type TravelerRoute = {
  id: string;
  route_from: string | null;
  route_to: string | null;
  is_primary: boolean | null;
};

type TravelerProfile = {
  id: string;
  profile_id: string;
  vehicle_type: string | null;
  license_type: string | null;
  cargo_types: string[] | null;
  min_load_capacity: string | null;
  max_load_capacity: string | null;
  schedule_type: string | null;
  travel_frequency: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  traveler_routes: TravelerRoute[];
};

// ── Status badge ───────────────────────────────────────────────────────────────

const STATUSES = ["pending", "collected", "in-transit", "delivered"] as const;

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:    { label: "Pending",    className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  collected:  { label: "Collected",  className: "bg-blue-100 text-blue-800 border-blue-200" },
  "in-transit": { label: "In Transit", className: "bg-orange-100 text-orange-800 border-orange-200" },
  delivered:  { label: "Delivered",  className: "bg-green-100 text-green-800 border-green-200" },
};

const StatusBadge = ({ status }: { status: string | null }) => {
  const cfg = statusConfig[status ?? ""] ?? { label: status ?? "Unknown", className: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

// ── Copy button ────────────────────────────────────────────────────────────────

const CopyButton = ({ text }: { text: string | null }) => {
  const [copied, setCopied] = useState(false);
  if (!text) return <span className="text-muted-foreground text-xs">—</span>;
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-foreground hover:text-primary transition-colors"
      title={`Copy ${text}`}
    >
      <span className="truncate max-w-[140px]">{text}</span>
      {copied ? <Check className="w-3 h-3 text-green-500 shrink-0" /> : <Copy className="w-3 h-3 text-muted-foreground shrink-0" />}
    </button>
  );
};

// ── Traveler detail sheet ──────────────────────────────────────────────────────

const TravelerSheet = ({
  traveler,
  profile,
  open,
  onClose,
}: {
  traveler: TravelerProfile | null;
  profile: Profile | null;
  open: boolean;
  onClose: () => void;
}) => (
  <Sheet open={open} onOpenChange={onClose}>
    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{profile?.full_name ?? "Traveler"} — Profile</SheetTitle>
      </SheetHeader>
      {traveler && (
        <div className="mt-6 space-y-5 text-sm">
          <Section title="Contact">
            <Row label="Email"><CopyButton text={profile?.email ?? null} /></Row>
            <Row label="Phone"><CopyButton text={profile?.phone ?? null} /></Row>
            <Row label="Country">{profile?.country ?? "—"}</Row>
          </Section>
          <Section title="Vehicle">
            <Row label="Type">{traveler.vehicle_type ?? "—"}</Row>
            <Row label="License">{traveler.license_type ?? "—"}</Row>
            <Row label="Cargo">{traveler.cargo_types?.join(", ") ?? "—"}</Row>
            <Row label="Capacity">{traveler.min_load_capacity} – {traveler.max_load_capacity} kg</Row>
          </Section>
          <Section title="Schedule">
            <Row label="Type">{traveler.schedule_type ?? "—"}</Row>
            <Row label="Frequency">{traveler.travel_frequency ?? "—"}</Row>
          </Section>
          <Section title="Routes">
            {traveler.traveler_routes.length === 0 ? (
              <p className="text-muted-foreground">No routes added.</p>
            ) : (
              traveler.traveler_routes.map((r) => (
                <Row key={r.id} label={r.is_primary ? "Primary ★" : "Route"}>
                  {r.route_from} → {r.route_to}
                </Row>
              ))
            )}
          </Section>
          <Section title="Emergency Contact">
            <Row label="Name">{traveler.emergency_contact_name ?? "—"}</Row>
            <Row label="Relation">{traveler.emergency_contact_relation ?? "—"}</Row>
            <Row label="Phone"><CopyButton text={traveler.emergency_contact_phone ?? null} /></Row>
          </Section>
        </div>
      )}
    </SheetContent>
  </Sheet>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="font-semibold text-foreground mb-2 pb-1 border-b border-border">{title}</h4>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-2">
    <span className="text-muted-foreground shrink-0 w-28">{label}</span>
    <span className="text-foreground text-right">{children}</span>
  </div>
);

// ── Main Dashboard ─────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sheetTraveler, setSheetTraveler] = useState<TravelerProfile | null>(null);
  const [sheetProfile, setSheetProfile] = useState<Profile | null>(null);

  // Fetch all profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch all parcels
  const { data: parcels = [], isLoading: parcelsLoading } = useQuery({
    queryKey: ["admin-parcels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcels")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Parcel[];
    },
  });

  // Fetch all traveler profiles with routes
  const { data: travelerProfiles = [], isLoading: travelersLoading } = useQuery({
    queryKey: ["admin-traveler-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("traveler_profiles")
        .select("*, traveler_routes(*)");
      if (error) throw error;
      return (data ?? []) as TravelerProfile[];
    },
  });

  // Parcel verified weight update mutation
  const updateVerifiedWeight = useMutation({
    mutationFn: async ({ id, weight }: { id: string; weight: number }) => {
      const { error } = await supabase.from("parcels").update({ weight_kg: weight }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-parcels"] });
      toast({ title: "Verified weight updated" });
    },
    onError: () => toast({ title: "Failed to update weight", variant: "destructive" }),
  });

  // Parcel status update mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("parcels").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-parcels"] });
      toast({ title: "Status updated" });
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  // Helpers
  const profileById = (id: string | null) =>
    id ? profiles.find((p) => p.id === id) : undefined;

  const travelerProfileByProfileId = (profileId: string) =>
    travelerProfiles.find((tp) => tp.profile_id === profileId);

  // Overview counts
  const senderCount = profiles.filter((p) => p.role === "sender").length;
  const travelerCount = profiles.filter((p) => p.role === "traveler" || travelerProfiles.some((tp) => tp.profile_id === p.id)).length;
  const parcelsByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = parcels.filter((p) => p.status === s).length;
    return acc;
  }, {} as Record<string, number>);
  const recentUsers = profiles.filter((p) => {
    const created = new Date(p.created_at);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return created >= cutoff;
  }).length;

  const loading = profilesLoading || parcelsLoading || travelersLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container-narrow">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage shipments, users, and traveler registrations.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="overview">
              <TabsList className="mb-6 flex flex-wrap gap-1 h-auto">
                <TabsTrigger value="overview" className="flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Users ({profiles.length})
                </TabsTrigger>
                <TabsTrigger value="parcels" className="flex items-center gap-1.5">
                  <Package className="w-4 h-4" /> Parcels ({parcels.length})
                </TabsTrigger>
                <TabsTrigger value="travelers" className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4" /> Travelers ({travelerProfiles.length})
                </TabsTrigger>
              </TabsList>

              {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────── */}
              <TabsContent value="overview">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <StatCard title="Total Users" value={profiles.length} icon={<Users className="w-5 h-5" />} />
                  <StatCard title="Senders" value={senderCount} icon={<Package className="w-5 h-5" />} />
                  <StatCard title="Travelers" value={travelerCount} icon={<Truck className="w-5 h-5" />} />
                  <StatCard title="New (7 days)" value={recentUsers} icon={<Users className="w-5 h-5" />} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {STATUSES.map((s) => (
                    <Card key={s}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground capitalize">{statusConfig[s].label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-foreground">{parcelsByStatus[s]}</span>
                          <StatusBadge status={s} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">parcels</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* ── TAB 2: USERS ────────────────────────────────────────────── */}
              <TabsContent value="users">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {profiles.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No users found.</TableCell>
                            </TableRow>
                          ) : profiles.map((p) => {
                            const tp = travelerProfileByProfileId(p.id);
                            return (
                              <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.full_name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                                    <CopyButton text={p.email} />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                                    <CopyButton text={p.phone} />
                                  </div>
                                </TableCell>
                                <TableCell>{p.country ?? <span className="text-muted-foreground">—</span>}</TableCell>
                                <TableCell>
                                  <RoleBadge role={p.role} hasTravelerProfile={!!tp} />
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                  {new Date(p.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {tp && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2"
                                      onClick={() => { setSheetTraveler(tp); setSheetProfile(p); }}
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── TAB 3: PARCELS ──────────────────────────────────────────── */}
              <TabsContent value="parcels">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                         <TableHeader>
                          <TableRow>
                            <TableHead>Pickup</TableHead>
                            <TableHead>Dropoff</TableHead>
                            <TableHead>Declared Band</TableHead>
                            <TableHead>Verified Weight</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Sender</TableHead>
                            <TableHead>Traveler</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parcels.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">No parcels found.</TableCell>
                            </TableRow>
                          ) : parcels.map((parcel) => {
                            const sender = profileById(parcel.sender_id);
                            const traveler = profileById(parcel.traveler_id);
                            return (
                              <TableRow key={parcel.id}>
                                <TableCell className="max-w-[130px]">
                                  <span className="truncate block text-xs" title={parcel.pickup_location ?? ""}>{parcel.pickup_location ?? "—"}</span>
                                </TableCell>
                                <TableCell className="max-w-[130px]">
                                  <span className="truncate block text-xs" title={parcel.dropoff_location ?? ""}>{parcel.dropoff_location ?? "—"}</span>
                                </TableCell>
                                <TableCell className="text-xs">
                                  <DeclaredBandCell weightKg={parcel.weight_kg} />
                                </TableCell>
                                <TableCell className="text-xs">
                                  <VerifiedWeightCell parcel={parcel} onUpdate={(id, weight) => updateVerifiedWeight.mutate({ id, weight })} />
                                </TableCell>
                                <TableCell className="text-xs">{parcel.price != null ? `R${parcel.price}` : "—"}</TableCell>
                                <TableCell className="text-xs">{sender?.full_name ?? sender?.email ?? "—"}</TableCell>
                                <TableCell className="text-xs">{traveler?.full_name ?? traveler?.email ?? "—"}</TableCell>
                                <TableCell>
                                  <Select
                                    value={parcel.status ?? "pending"}
                                    onValueChange={(val) => updateStatus.mutate({ id: parcel.id, status: val })}
                                  >
                                    <SelectTrigger className="h-7 text-xs w-32 border-0 p-0 shadow-none">
                                      <SelectValue>
                                        <StatusBadge status={parcel.status} />
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {STATUSES.map((s) => (
                                        <SelectItem key={s} value={s}>
                                          <StatusBadge status={s} />
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                  {new Date(parcel.created_at).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── TAB 4: TRAVELERS ────────────────────────────────────────── */}
              <TabsContent value="travelers">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Primary Route</TableHead>
                            <TableHead>License</TableHead>
                            <TableHead>Cargo Types</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Emergency Contact</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {travelerProfiles.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">No traveler profiles found.</TableCell>
                            </TableRow>
                          ) : travelerProfiles.map((tp) => {
                            const profile = profileById(tp.profile_id);
                            const primaryRoute = tp.traveler_routes.find((r) => r.is_primary) ?? tp.traveler_routes[0];
                            return (
                              <TableRow key={tp.id}>
                                <TableCell className="font-medium text-sm">{profile?.full_name ?? "—"}</TableCell>
                                <TableCell className="text-xs">{tp.vehicle_type ?? "—"}</TableCell>
                                <TableCell className="text-xs">
                                  {primaryRoute ? `${primaryRoute.route_from} → ${primaryRoute.route_to}` : "—"}
                                </TableCell>
                                <TableCell className="text-xs">{tp.license_type ?? "—"}</TableCell>
                                <TableCell className="text-xs max-w-[120px]">
                                  <span className="truncate block" title={tp.cargo_types?.join(", ")}>{tp.cargo_types?.join(", ") ?? "—"}</span>
                                </TableCell>
                                <TableCell className="text-xs">{tp.min_load_capacity} – {tp.max_load_capacity} kg</TableCell>
                                <TableCell className="text-xs">{tp.travel_frequency ?? "—"}</TableCell>
                                <TableCell>
                                  <div className="text-xs space-y-0.5">
                                    <div className="font-medium">{tp.emergency_contact_name ?? "—"}</div>
                                    <CopyButton text={tp.emergency_contact_phone ?? null} />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() => { setSheetTraveler(tp); setSheetProfile(profile ?? null); }}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <TravelerSheet
        traveler={sheetTraveler}
        profile={sheetProfile}
        open={!!sheetTraveler}
        onClose={() => { setSheetTraveler(null); setSheetProfile(null); }}
      />
    </div>
  );
};

// ── Declared band cell ─────────────────────────────────────────────────────────

const DeclaredBandCell = ({ weightKg }: { weightKg: number | null }) => {
  if (weightKg == null) return <span className="text-muted-foreground">—</span>;
  const band = getBandForWeight(weightKg);
  if (band) {
    return <span>{band.label} ({band.range[0]}–{band.range[1]} kg)</span>;
  }
  // If weight doesn't match a band midpoint exactly, show the raw weight
  return <span>{weightKg} kg</span>;
};

// ── Verified weight cell ───────────────────────────────────────────────────────

const VerifiedWeightCell = ({ parcel, onUpdate }: { parcel: Parcel; onUpdate: (id: string, weight: number) => void }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  const handleSave = () => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      onUpdate(parcel.id, num);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          step="0.1"
          min="0.1"
          className="h-7 w-20 text-xs"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
        />
        <button onClick={handleSave} className="text-xs text-primary hover:underline">Save</button>
        <button onClick={() => setEditing(false)} className="text-xs text-muted-foreground hover:underline">✕</button>
      </div>
    );
  }

  // Determine if verified weight differs from declared band
  const declaredBand = parcel.weight_kg != null ? getBandForWeight(parcel.weight_kg) : null;

  return (
    <button
      onClick={() => { setValue(""); setEditing(true); }}
      className="text-xs text-primary/70 hover:text-primary hover:underline"
    >
      Verify weight
    </button>
  );
};

// ── Stat card ──────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </div>
    </CardHeader>
    <CardContent>
      <span className="text-3xl font-bold text-foreground">{value}</span>
    </CardContent>
  </Card>
);

// ── Role badge ─────────────────────────────────────────────────────────────────

const RoleBadge = ({ role, hasTravelerProfile }: { role: string | null; hasTravelerProfile: boolean }) => {
  const effectiveRole = hasTravelerProfile ? "traveler" : (role ?? "unregistered");
  const cfg: Record<string, string> = {
    sender: "bg-blue-100 text-blue-800 border-blue-200",
    traveler: "bg-purple-100 text-purple-800 border-purple-200",
    unregistered: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg[effectiveRole] ?? cfg.unregistered}`}>
      {effectiveRole.charAt(0).toUpperCase() + effectiveRole.slice(1)}
    </span>
  );
};

export default AdminDashboard;
