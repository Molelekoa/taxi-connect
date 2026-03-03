import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  getBandForWeight, getWeightBand, WEIGHT_BANDS, calculateDeliveryPrice, type WeightBand,
} from "@/config/pricingCalculator";
import {
  Users, Package, Truck, LayoutDashboard, Copy, Check, Phone, Mail, Eye,
  DollarSign, MapPin, Scale, Search, TrendingUp, ShieldCheck, ShieldX, Clock,
  FileText, ExternalLink, Loader2, CheckCircle,
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
  recipient_name: string | null;
  recipient_phone: string | null;
  pickup_address: string | null;
  delivery_address: string | null;
  weight_band: string | null;
  include_tracking: boolean | null;
  sender_name: string | null;
  sender_email: string | null;
  sender_phone: string | null;
  photo_url: string | null;
  sender_confirmed_at: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  delivery_geotagged_at: string | null;
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
  status: string;
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
  id_copy_url: string | null;
  license_copy_url: string | null;
  traveler_routes: TravelerRoute[];
};

// ── Status badge ───────────────────────────────────────────────────────────────

const STATUSES = ["pending", "collected", "in-transit", "pending_confirmation", "delivered", "delivered_pending_verification", "delivered_verified", "cancelled"] as const;

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:                          { label: "Pending",                    className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  collected:                        { label: "Collected",                  className: "bg-blue-100 text-blue-800 border-blue-200" },
  "in-transit":                     { label: "In Transit",                 className: "bg-orange-100 text-orange-800 border-orange-200" },
  pending_confirmation:             { label: "Pending Confirmation",       className: "bg-purple-100 text-purple-800 border-purple-200" },
  delivered:                        { label: "Delivered",                  className: "bg-green-100 text-green-800 border-green-200" },
  delivered_pending_verification:   { label: "Awaiting Verification",      className: "bg-amber-100 text-amber-800 border-amber-200" },
  delivered_verified:               { label: "Verified",                   className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled:                        { label: "Cancelled",                  className: "bg-red-100 text-red-800 border-red-200" },
};

const StatusBadge = ({ status }: { status: string | null }) => {
  const cfg = statusConfig[status ?? ""] ?? { label: status ?? "Unknown", className: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

// ── Weight band label helper ──────────────────────────────────────────────────

const BAND_LABELS: Record<string, string> = {
  envelope: "Envelope",
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
  "extra-heavy": "Extra Heavy",
};

const bandLabel = (band: string | null) => band ? (BAND_LABELS[band] ?? band) : "—";

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
    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-foreground hover:text-primary transition-colors" title={`Copy ${text}`}>
      <span className="truncate max-w-[140px]">{text}</span>
      {copied ? <Check className="w-3 h-3 text-green-500 shrink-0" /> : <Copy className="w-3 h-3 text-muted-foreground shrink-0" />}
    </button>
  );
};

// ── Document link with signed URL ──────────────────────────────────────────────

const DocumentLink = ({ storagePath, label }: { storagePath: string | null; label: string }) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const generateUrl = useCallback(async () => {
    if (!storagePath) return;
    // If it's already a full URL (http/https), use it directly
    if (storagePath.startsWith("http")) {
      setSignedUrl(storagePath);
      return;
    }
    setLoading(true);
    setError(false);
    const { data, error: err } = await supabase.storage
      .from("documents")
      .createSignedUrl(storagePath, 3600); // 1 hour expiry
    setLoading(false);
    if (err || !data?.signedUrl) {
      setError(true);
    } else {
      setSignedUrl(data.signedUrl);
    }
  }, [storagePath]);

  useEffect(() => {
    if (storagePath) generateUrl();
  }, [storagePath, generateUrl]);

  if (!storagePath) {
    return (
      <Row label={label}>
        <span className="text-muted-foreground text-xs">Not uploaded</span>
      </Row>
    );
  }

  if (loading) {
    return (
      <Row label={label}>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading…
        </span>
      </Row>
    );
  }

  if (error) {
    return (
      <Row label={label}>
        <button onClick={generateUrl} className="text-xs text-destructive hover:underline">
          Failed to load — retry
        </button>
      </Row>
    );
  }

  return (
    <Row label={label}>
      <a
        href={signedUrl ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-primary hover:underline text-xs"
      >
        <FileText className="w-3 h-3" />
        View Document
        <ExternalLink className="w-3 h-3" />
      </a>
    </Row>
  );
};

// ── Traveler detail sheet ──────────────────────────────────────────────────────

const TravelerSheet = ({ traveler, profile, open, onClose }: { traveler: TravelerProfile | null; profile: Profile | null; open: boolean; onClose: () => void }) => (
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
            ) : traveler.traveler_routes.map((r) => (
              <Row key={r.id} label={r.is_primary ? "Primary ★" : "Route"}>
                {r.route_from} → {r.route_to}
              </Row>
            ))}
          </Section>
          <Section title="Emergency Contact">
            <Row label="Name">{traveler.emergency_contact_name ?? "—"}</Row>
            <Row label="Relation">{traveler.emergency_contact_relation ?? "—"}</Row>
            <Row label="Phone"><CopyButton text={traveler.emergency_contact_phone ?? null} /></Row>
          </Section>
          <Section title="Documents">
            <DocumentLink storagePath={traveler.id_copy_url} label="ID Copy" />
            <DocumentLink storagePath={traveler.license_copy_url} label="License Copy" />
          </Section>
        </div>
      )}
    </SheetContent>
  </Sheet>
);

// ── Status history for a parcel ────────────────────────────────────────────────

type AuditEntry = {
  id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  performed_by: string | null;
  created_at: string;
};

const ParcelStatusHistory = ({ parcelId }: { parcelId: string }) => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["parcel-status-history", parcelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .eq("table_name", "parcels")
        .eq("record_id", parcelId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AuditEntry[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading history…
      </div>
    );
  }

  if (history.length === 0) {
    return <p className="text-xs text-muted-foreground">No status changes recorded.</p>;
  }

  return (
    <div className="space-y-2">
      {history.map((entry) => {
        const oldStatus = entry.old_values?.status ?? "—";
        const newStatus = entry.new_values?.status ?? "—";
        return (
          <div key={entry.id} className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="text-xs">
              <div className="text-foreground">
                <StatusBadge status={oldStatus} /> → <StatusBadge status={newStatus} />
              </div>
              <div className="text-muted-foreground mt-0.5">
                {new Date(entry.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Parcel detail sheet ────────────────────────────────────────────────────────

const ParcelDetailSheet = ({ parcel, open, onClose, onStatusChange }: {
  parcel: Parcel | null; open: boolean; onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) => (
  <Sheet open={open} onOpenChange={onClose}>
    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Booking Details</SheetTitle>
      </SheetHeader>
      {parcel && (
        <div className="mt-6 space-y-5 text-sm">
          <Section title="Sender">
            <Row label="Name">{parcel.sender_name ?? "—"}</Row>
            <Row label="Email"><CopyButton text={parcel.sender_email} /></Row>
            <Row label="Phone"><CopyButton text={parcel.sender_phone} /></Row>
          </Section>
          <Section title="Recipient">
            <Row label="Name">{parcel.recipient_name ?? "—"}</Row>
            <Row label="Phone"><CopyButton text={parcel.recipient_phone} /></Row>
          </Section>
          <Section title="Route">
            <Row label="Origin">{parcel.pickup_location ?? "—"}</Row>
            <Row label="Pickup Address">{parcel.pickup_address ?? "—"}</Row>
            <Row label="Destination">{parcel.dropoff_location ?? "—"}</Row>
            <Row label="Delivery Address">{parcel.delivery_address ?? "—"}</Row>
          </Section>
          <Section title="Parcel">
            <Row label="Weight Band">{bandLabel(parcel.weight_band)}</Row>
            <Row label="Weight">{parcel.weight_kg != null ? `${parcel.weight_kg} kg` : "—"}</Row>
            <Row label="Tracking">{parcel.include_tracking ? "Yes" : "No"}</Row>
            <Row label="Description">{parcel.description ?? "—"}</Row>
          </Section>
          <Section title="Financials">
            <Row label="Price">{parcel.price != null ? `R${parcel.price}` : "—"}</Row>
          </Section>
          <Section title="Status">
            <Row label="Current">
              <Select value={parcel.status ?? "pending"} onValueChange={(val) => onStatusChange(parcel.id, val)}>
                <SelectTrigger className="h-7 text-xs w-32 border-0 p-0 shadow-none">
                  <SelectValue><StatusBadge status={parcel.status} /></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}><StatusBadge status={s} /></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <Row label="Created">{new Date(parcel.created_at).toLocaleString()}</Row>
          </Section>
          <Section title="Status History">
            <ParcelStatusHistory parcelId={parcel.id} />
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
  const [sheetParcel, setSheetParcel] = useState<Parcel | null>(null);

  // Filter state for parcels tab
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Realtime subscription for parcel status changes ────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("admin-parcel-status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "parcels" },
        (payload) => {
          const oldStatus = (payload.old as any)?.status;
          const newStatus = (payload.new as any)?.status;
          if (oldStatus && newStatus && oldStatus !== newStatus) {
            const senderName = (payload.new as any)?.sender_name || "A parcel";
            const route = `${(payload.new as any)?.pickup_location ?? "?"} → ${(payload.new as any)?.dropoff_location ?? "?"}`;
            toast({
              title: `📦 Status Update: ${statusConfig[newStatus]?.label ?? newStatus}`,
              description: `${senderName} (${route}) changed from ${statusConfig[oldStatus]?.label ?? oldStatus} to ${statusConfig[newStatus]?.label ?? newStatus}`,
            });
            queryClient.invalidateQueries({ queryKey: ["admin-parcels"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, queryClient]);

  // Fetch all profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch all parcels
  const { data: parcels = [], isLoading: parcelsLoading } = useQuery({
    queryKey: ["admin-parcels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("parcels").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Parcel[];
    },
  });

  // Fetch all traveler profiles with routes
  const { data: travelerProfiles = [], isLoading: travelersLoading } = useQuery({
    queryKey: ["admin-traveler-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("traveler_profiles").select("*, traveler_routes(*)");
      if (error) throw error;
      return (data ?? []) as TravelerProfile[];
    },
  });

  // Mutations
  const updateVerifiedWeight = useMutation({
    mutationFn: async ({ id, weight }: { id: string; weight: number }) => {
      const { error } = await supabase.from("parcels").update({ weight_kg: weight }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-parcels"] }); toast({ title: "Verified weight updated" }); },
    onError: () => toast({ title: "Failed to update weight", variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("parcels").update({ status } as any).eq("id", id);
      if (error) throw error;
      // Notify sender about status change
      const parcel = parcels.find(p => p.id === id);
      if (parcel?.sender_id) {
        const statusLabel = statusConfig[status]?.label ?? status;
        await supabase.from("notifications").insert({
          user_id: parcel.sender_id,
          type: "status_update",
          content: `Your parcel from ${parcel.pickup_location ?? "?"} to ${parcel.dropoff_location ?? "?"} status has been updated to: ${statusLabel}.`,
        } as any);
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-parcels"] }); toast({ title: "Status updated" }); },
    onError: (err: any) => toast({ title: "Failed to update status", description: err?.message || "Unknown error", variant: "destructive" }),
  });

  const updateTravelerStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("traveler_profiles").update({ status } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-traveler-profiles"] }); toast({ title: "Traveler status updated" }); },
    onError: () => toast({ title: "Failed to update traveler status", variant: "destructive" }),
  });

  // Helpers
  const profileById = (id: string | null) => id ? profiles.find((p) => p.id === id) : undefined;
  const travelerProfileByProfileId = (profileId: string) => travelerProfiles.find((tp) => tp.profile_id === profileId);

  // ── Overview stats ──────────────────────────────────────────────────────────
  const senderCount = profiles.filter((p) => p.role === "sender").length;
  const travelerCount = profiles.filter((p) => p.role === "traveler" || travelerProfiles.some((tp) => tp.profile_id === p.id)).length;
  const parcelsByStatus = STATUSES.reduce((acc, s) => { acc[s] = parcels.filter((p) => p.status === s).length; return acc; }, {} as Record<string, number>);
  const recentUsers = profiles.filter((p) => { const d = new Date(p.created_at); const c = new Date(); c.setDate(c.getDate() - 7); return d >= c; }).length;

  // Income stats
  const totalIncome = parcels.reduce((sum, p) => sum + (p.price || 0), 0);
  const deliveredIncome = parcels.filter(p => p.status === 'delivered').reduce((sum, p) => sum + (p.price || 0), 0);
  const pendingIncome = parcels.filter(p => p.status !== 'delivered').reduce((sum, p) => sum + (p.price || 0), 0);

  // Weight band breakdown
  const parcelsByBand = useMemo(() => {
    const counts: Record<string, number> = {};
    parcels.forEach(p => {
      const band = p.weight_band || "unknown";
      counts[band] = (counts[band] || 0) + 1;
    });
    return counts;
  }, [parcels]);

  // Top routes
  const topRoutes = useMemo(() => {
    const routeCounts: Record<string, { count: number; income: number }> = {};
    parcels.forEach(p => {
      if (p.pickup_location && p.dropoff_location) {
        const key = `${p.pickup_location} → ${p.dropoff_location}`;
        if (!routeCounts[key]) routeCounts[key] = { count: 0, income: 0 };
        routeCounts[key].count++;
        routeCounts[key].income += p.price || 0;
      }
    });
    return Object.entries(routeCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
  }, [parcels]);

  // ── Filtered parcels for Parcels tab ────────────────────────────────────────
  const filteredParcels = useMemo(() => {
    let result = parcels;
    if (statusFilter !== "all") result = result.filter(p => p.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.sender_name?.toLowerCase().includes(q)) ||
        (p.recipient_name?.toLowerCase().includes(q)) ||
        (p.pickup_location?.toLowerCase().includes(q)) ||
        (p.dropoff_location?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [parcels, statusFilter, searchQuery]);

  const loading = profilesLoading || parcelsLoading || travelersLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container-narrow">
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
                <TabsTrigger value="overview" className="flex items-center gap-1.5"><LayoutDashboard className="w-4 h-4" /> Overview</TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Users ({profiles.length})</TabsTrigger>
                <TabsTrigger value="parcels" className="flex items-center gap-1.5"><Package className="w-4 h-4" /> Parcels ({parcels.length})</TabsTrigger>
               <TabsTrigger value="travelers" className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Travelers ({travelerProfiles.length})</TabsTrigger>
                <TabsTrigger value="deliveries" className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Deliveries
                  {parcels.filter(p => p.status === "delivered_pending_verification").length > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                      {parcels.filter(p => p.status === "delivered_pending_verification").length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Audit Log</TabsTrigger>
                <TabsTrigger value="errors" className="flex items-center gap-1.5"><ShieldX className="w-4 h-4" /> Errors</TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Metrics</TabsTrigger>
              </TabsList>

              {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────── */}
              <TabsContent value="overview">
                {/* User stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <StatCard title="Total Users" value={profiles.length} icon={<Users className="w-5 h-5" />} />
                  <StatCard title="Senders" value={senderCount} icon={<Package className="w-5 h-5" />} />
                  <StatCard title="Travelers" value={travelerCount} icon={<Truck className="w-5 h-5" />} />
                  <StatCard title="New (7 days)" value={recentUsers} icon={<Users className="w-5 h-5" />} />
                </div>

                {/* Income stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <span className="text-3xl font-bold text-foreground">R{totalIncome.toLocaleString()}</span>
                      <p className="text-xs text-muted-foreground mt-1">{parcels.length} bookings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Delivered Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold text-green-600">R{deliveredIncome.toLocaleString()}</span>
                      <p className="text-xs text-muted-foreground mt-1">{parcels.filter(p => p.status === 'delivered').length} delivered</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold text-yellow-600">R{pendingIncome.toLocaleString()}</span>
                      <p className="text-xs text-muted-foreground mt-1">{parcels.filter(p => p.status !== 'delivered').length} in pipeline</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Parcels by status */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

                {/* Weight band breakdown + Top routes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center gap-2"><Scale className="w-4 h-4" /> Parcels by Weight Band</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.keys(parcelsByBand).length === 0 ? (
                        <p className="text-muted-foreground text-sm">No parcels yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {Object.entries(parcelsByBand).map(([band, count]) => (
                            <div key={band} className="flex items-center justify-between text-sm">
                              <span className="text-foreground">{bandLabel(band)}</span>
                              <span className="font-semibold text-foreground">{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Top Routes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {topRoutes.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No routes yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {topRoutes.map(([route, data]) => (
                            <div key={route} className="flex items-center justify-between text-sm">
                              <span className="text-foreground truncate max-w-[180px]" title={route}>{route}</span>
                              <span className="text-muted-foreground shrink-0">{data.count} bookings · R{data.income.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
                            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No users found.</TableCell></TableRow>
                          ) : profiles.map((p) => {
                            const tp = travelerProfileByProfileId(p.id);
                            return (
                              <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.full_name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                                <TableCell><div className="flex items-center gap-1"><Mail className="w-3 h-3 text-muted-foreground shrink-0" /><CopyButton text={p.email} /></div></TableCell>
                                <TableCell><div className="flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground shrink-0" /><CopyButton text={p.phone} /></div></TableCell>
                                <TableCell>{p.country ?? <span className="text-muted-foreground">—</span>}</TableCell>
                                <TableCell><RoleBadge role={p.role} hasTravelerProfile={!!tp} /></TableCell>
                                <TableCell className="text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  {tp && (
                                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setSheetTraveler(tp); setSheetProfile(p); }}>
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
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search sender, recipient, or location…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Route</TableHead>
                            <TableHead>Sender</TableHead>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Band</TableHead>
                            <TableHead>Tracking</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredParcels.length === 0 ? (
                            <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No parcels found.</TableCell></TableRow>
                          ) : filteredParcels.map((parcel) => (
                            <TableRow key={parcel.id}>
                              <TableCell className="text-xs max-w-[160px]">
                                <span className="truncate block" title={`${parcel.pickup_location} → ${parcel.dropoff_location}`}>
                                  {parcel.pickup_location ?? "—"} → {parcel.dropoff_location ?? "—"}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs">
                                <div>{parcel.sender_name ?? "—"}</div>
                                {parcel.sender_phone && <div className="text-muted-foreground">{parcel.sender_phone}</div>}
                              </TableCell>
                              <TableCell className="text-xs">
                                <div>{parcel.recipient_name ?? "—"}</div>
                                {parcel.recipient_phone && <div className="text-muted-foreground">{parcel.recipient_phone}</div>}
                              </TableCell>
                              <TableCell className="text-xs">{bandLabel(parcel.weight_band)}</TableCell>
                              <TableCell className="text-xs">{parcel.include_tracking ? "✓" : "—"}</TableCell>
                              <TableCell className="text-xs font-medium">{parcel.price != null ? `R${parcel.price}` : "—"}</TableCell>
                              <TableCell>
                                <Select value={parcel.status ?? "pending"} onValueChange={(val) => updateStatus.mutate({ id: parcel.id, status: val })}>
                                  <SelectTrigger className="h-7 text-xs w-32 border-0 p-0 shadow-none">
                                    <SelectValue><StatusBadge status={parcel.status} /></SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STATUSES.map((s) => (<SelectItem key={s} value={s}><StatusBadge status={s} /></SelectItem>))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs">{new Date(parcel.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setSheetParcel(parcel)}>
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
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
                            <TableHead>Status</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Primary Route</TableHead>
                            <TableHead>License</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Actions</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {travelerProfiles.length === 0 ? (
                            <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No traveler profiles found.</TableCell></TableRow>
                          ) : travelerProfiles.map((tp) => {
                            const profile = profileById(tp.profile_id);
                            const primaryRoute = tp.traveler_routes.find((r) => r.is_primary) ?? tp.traveler_routes[0];
                            const tStatus = tp.status || "pending";
                            return (
                              <TableRow key={tp.id}>
                                <TableCell className="font-medium text-sm">{profile?.full_name ?? "—"}</TableCell>
                                <TableCell>
                                  <TravelerStatusBadge status={tStatus} />
                                </TableCell>
                                <TableCell className="text-xs">{tp.vehicle_type ?? "—"}</TableCell>
                                <TableCell className="text-xs">{primaryRoute ? `${primaryRoute.route_from} → ${primaryRoute.route_to}` : "—"}</TableCell>
                                <TableCell className="text-xs">{tp.license_type ?? "—"}</TableCell>
                                <TableCell className="text-xs">{tp.min_load_capacity} – {tp.max_load_capacity} kg</TableCell>
                                <TableCell className="text-xs">{tp.travel_frequency ?? "—"}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {tStatus !== "approved" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => updateTravelerStatus.mutate({ id: tp.id, status: "approved" })}
                                        title="Approve"
                                      >
                                        <ShieldCheck className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {tStatus !== "rejected" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => updateTravelerStatus.mutate({ id: tp.id, status: "rejected" })}
                                        title="Reject"
                                      >
                                        <ShieldX className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setSheetTraveler(tp); setSheetProfile(profile ?? null); }}>
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

              {/* ── TAB: DELIVERY APPROVALS ──────────────────────────────────── */}
              <TabsContent value="deliveries">
                <DeliveryApprovalsTab
                  pendingParcels={parcels.filter(p => p.status === "delivered_pending_verification")}
                  deliveredParcels={parcels.filter(p => p.status === "delivered_verified")}
                  onApprove={async (matchId) => {
                    try {
                      const res = await supabase.functions.invoke("verify-delivery", { body: { matchId, action: "approve" } });
                      if (res.error) throw new Error(res.error.message);
                      toast({ title: "Delivery approved", description: "Traveler has been notified with payment timeline." });
                      queryClient.invalidateQueries({ queryKey: ["admin-parcels"] });
                      queryClient.invalidateQueries({ queryKey: ["admin-delivery-matches"] });
                    } catch (err: any) {
                      toast({ title: "Failed to approve", description: err.message, variant: "destructive" });
                    }
                  }}
                  onReject={async (matchId) => {
                    try {
                      const res = await supabase.functions.invoke("verify-delivery", { body: { matchId, action: "reject" } });
                      if (res.error) throw new Error(res.error.message);
                      toast({ title: "Delivery rejected", description: "Traveler has been notified to resubmit proof." });
                      queryClient.invalidateQueries({ queryKey: ["admin-parcels"] });
                      queryClient.invalidateQueries({ queryKey: ["admin-delivery-matches"] });
                    } catch (err: any) {
                      toast({ title: "Failed to reject", description: err.message, variant: "destructive" });
                    }
                  }}
                />
              </TabsContent>

              {/* ── TAB 5: AUDIT LOG ────────────────────────────────────────── */}
              <TabsContent value="audit">
                <AuditLogTab />
              </TabsContent>

              {/* ── TAB: ERRORS ──────────────────────────────────────────── */}
              <TabsContent value="errors">
                <ErrorLogsTab profiles={profiles} />
              </TabsContent>

              {/* ── TAB 6: METRICS ──────────────────────────────────────────── */}
              <TabsContent value="metrics">
                <MetricsTab />
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
      <ParcelDetailSheet
        parcel={sheetParcel}
        open={!!sheetParcel}
        onClose={() => setSheetParcel(null)}
        onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
      />
    </div>
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

// ── Traveler status badge ──────────────────────────────────────────────────────

const TravelerStatusBadge = ({ status }: { status: string }) => {
  const cfg: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg[status] ?? cfg.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ── Delivery Approvals Tab ─────────────────────────────────────────────────────

type MatchWithProof = {
  id: string;
  parcel_id: string;
  trip_id: string;
  status: string;
  delivery_status: string | null;
  proof_photo_url: string | null;
  proof_geotag: any;
  proof_submitted_at: string | null;
  parcels: Parcel | null;
  trips: { traveler_id: string; profiles?: { full_name: string | null } | null } | null;
};

const DeliveryMatchCard = ({ match, senderName, onApprove, onReject }: {
  match: MatchWithProof;
  senderName: string | null;
  onApprove?: (matchId: string) => void;
  onReject?: (matchId: string) => void;
}) => {
  const parcel = match.parcels;
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-medium text-foreground text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              {parcel?.pickup_location} → {parcel?.dropoff_location}
            </div>
            <StatusBadge status={match.delivery_status ?? parcel?.status ?? ""} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground border-t border-border pt-3">
          <div><span className="font-medium text-foreground">Parcel ID:</span> {parcel?.id?.slice(0, 8)}…</div>
          <div><span className="font-medium text-foreground">Traveler:</span> {match.trips?.profiles?.full_name ?? "—"}</div>
          <div><span className="font-medium text-foreground">Sender:</span> {senderName ?? parcel?.sender_name ?? "—"}</div>
          <div><span className="font-medium text-foreground">Sender Phone:</span> {parcel?.sender_phone ?? "—"}</div>
          <div><span className="font-medium text-foreground">Recipient:</span> {parcel?.recipient_name ?? "—"}</div>
          <div><span className="font-medium text-foreground">Recipient Phone:</span> {parcel?.recipient_phone ?? "—"}</div>
          <div><span className="font-medium text-foreground">Pickup Address:</span> {parcel?.pickup_address ?? "—"}</div>
          <div><span className="font-medium text-foreground">Delivery Address:</span> {parcel?.delivery_address ?? "—"}</div>
          <div><span className="font-medium text-foreground">Weight:</span> {parcel?.weight_kg != null ? `${parcel.weight_kg}kg` : "—"} ({bandLabel(parcel?.weight_band ?? null)})</div>
          <div><span className="font-medium text-foreground">Price:</span> {parcel?.price != null ? `R${parcel.price}` : "—"}</div>
          {match.proof_submitted_at && (
            <div><span className="font-medium text-foreground">Submitted:</span> {new Date(match.proof_submitted_at).toLocaleString()}</div>
          )}
        </div>

        {/* Photo proof from match */}
        {match.proof_photo_url && (
          <div>
            <p className="text-xs font-medium text-foreground mb-1">📸 Delivery proof photo:</p>
            <img
              src={match.proof_photo_url}
              alt="Delivery proof"
              className="rounded-lg border border-border max-h-48 object-cover"
            />
          </div>
        )}

        {/* Geotag from match */}
        {match.proof_geotag && (
          <div className="bg-secondary/50 rounded-lg p-3 text-xs space-y-1">
            <p className="font-medium text-foreground">📍 Delivery Geotag</p>
            <p>Coordinates: {match.proof_geotag.lat.toFixed(5)}, {match.proof_geotag.lng.toFixed(5)}</p>
            <a
              href={`https://www.google.com/maps?q=${match.proof_geotag.lat},${match.proof_geotag.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> View on Google Maps
            </a>
          </div>
        )}

        {/* Fallback: show parcel-level proof if match doesn't have it */}
        {!match.proof_photo_url && parcel?.photo_url && (
          <div>
            <p className="text-xs font-medium text-foreground mb-1">📸 Delivery proof photo (parcel):</p>
            <img src={parcel.photo_url} alt="Delivery proof" className="rounded-lg border border-border max-h-48 object-cover" />
          </div>
        )}
        {!match.proof_geotag && parcel?.delivery_lat != null && parcel?.delivery_lng != null && (
          <div className="bg-secondary/50 rounded-lg p-3 text-xs space-y-1">
            <p className="font-medium text-foreground">📍 Delivery Geotag (parcel)</p>
            <p>Coordinates: {parcel.delivery_lat.toFixed(5)}, {parcel.delivery_lng.toFixed(5)}</p>
            <a href={`https://www.google.com/maps?q=${parcel.delivery_lat},${parcel.delivery_lng}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> View on Google Maps
            </a>
          </div>
        )}

        {!match.proof_photo_url && !parcel?.photo_url && !match.proof_geotag && parcel?.delivery_lat == null && (
          <p className="text-xs text-destructive font-medium">⚠ No delivery proof submitted</p>
        )}

        {/* Action buttons */}
        {(onApprove || onReject) && (
          <div className="flex gap-2">
            {onApprove && (
              <Button variant="default" size="sm" className="flex-1" onClick={() => onApprove(match.id)}>
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Approve
              </Button>
            )}
            {onReject && (
              <Button variant="outline" size="sm" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => onReject(match.id)}>
                <ShieldX className="w-3.5 h-3.5 mr-1.5" /> Reject
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DeliveryApprovalsTab = ({ pendingParcels, deliveredParcels, onApprove, onReject }: {
  pendingParcels: Parcel[];
  deliveredParcels: Parcel[];
  onApprove: (matchId: string) => void;
  onReject: (matchId: string) => void;
}) => {
  const pendingParcelIds = pendingParcels.map(p => p.id);
  const deliveredParcelIds = deliveredParcels.map(p => p.id);
  const allIds = [...pendingParcelIds, ...deliveredParcelIds];

  const { data: matches = [] } = useQuery({
    queryKey: ["admin-delivery-matches", allIds.join(",")],
    queryFn: async () => {
      if (allIds.length === 0) return [];
      const { data, error } = await supabase
        .from("matches")
        .select("*, parcels(*), trips(traveler_id, profiles:traveler_id(full_name))")
        .in("parcel_id", allIds)
        .eq("status", "accepted");
      if (error) throw error;
      return (data ?? []) as MatchWithProof[];
    },
    enabled: allIds.length > 0,
  });

  const pendingMatches = matches.filter(m => m.delivery_status === "delivered_pending_verification");
  const verifiedMatches = matches.filter(m => m.delivery_status === "delivered_verified");

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-600" />
          Awaiting Verification ({pendingMatches.length})
        </h3>
        {pendingMatches.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <ShieldCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No deliveries awaiting verification.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingMatches.map(match => (
              <DeliveryMatchCard key={match.id} match={match} senderName={match.parcels?.sender_name ?? null} onApprove={onApprove} onReject={onReject} />
            ))}
          </div>
        )}
      </div>

      {verifiedMatches.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Verified Deliveries ({verifiedMatches.length})
          </h3>
          <div className="space-y-4">
            {verifiedMatches.slice(0, 10).map(match => (
              <div key={match.id}>
                <DeliveryMatchCard match={match} senderName={match.parcels?.sender_name ?? null} />
                <div className="mt-2 px-5 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div><span className="font-medium text-foreground">Delivered:</span> {(match.parcels as any)?.delivered_at ? new Date((match.parcels as any).delivered_at).toLocaleString() : match.proof_submitted_at ? new Date(match.proof_submitted_at).toLocaleString() : "—"}</div>
                  <div><span className="font-medium text-foreground">Verified:</span> {(match.parcels as any)?.verified_at ? new Date((match.parcels as any).verified_at).toLocaleString() : "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Audit Log Tab ──────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, { label: string; className: string }> = {
  traveler_approved: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200" },
  traveler_rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
  parcel_matched: { label: "Matched", className: "bg-blue-100 text-blue-800 border-blue-200" },
  parcel_delivered: { label: "Delivered", className: "bg-green-100 text-green-800 border-green-200" },
  match_accepted: { label: "Accepted", className: "bg-green-100 text-green-800 border-green-200" },
  status_changed: { label: "Changed", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  cancelled_by_traveler: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
  verified_by_admin: { label: "Verified", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

const formatAuditValues = (values: Record<string, any> | null) => {
  if (!values) return "—";
  const parts: string[] = [];
  if (values.status) parts.push(`Status: ${values.status}`);
  if (values.traveler_id) parts.push(`Traveler: ${String(values.traveler_id).slice(0, 8)}…`);
  if (values.cancel_reason) parts.push(`Reason: ${values.cancel_reason}`);
  if (parts.length > 0) return parts.join(" · ");
  return JSON.stringify(values);
};

const AuditLogTab = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin-audit-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as AuditEntry[];
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Recent Audit Events</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Record ID</TableHead>
                <TableHead>Old</TableHead>
                <TableHead>New</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No audit events yet.</TableCell></TableRow>
              ) : logs.map(log => {
                const cfg = ACTION_LABELS[log.action] ?? ACTION_LABELS.status_changed;
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>{cfg.label}</span>
                    </TableCell>
                    <TableCell className="text-xs">{log.table_name}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{log.record_id?.slice(0, 8)}…</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px]" title={log.old_values ? JSON.stringify(log.old_values) : ""}>{formatAuditValues(log.old_values)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px]" title={log.new_values ? JSON.stringify(log.new_values) : ""}>{formatAuditValues(log.new_values)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Error Logs Tab ─────────────────────────────────────────────────────────────

type ErrorLogEntry = {
  id: string;
  user_id: string | null;
  action: string;
  error_message: string;
  context: Record<string, any> | null;
  created_at: string;
};

const ErrorLogsTab = ({ profiles }: { profiles: Profile[] }) => {
  const { data: errors = [], isLoading } = useQuery({
    queryKey: ["admin-error-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as ErrorLogEntry[];
    },
  });

  const profileById = (id: string | null) => id ? profiles.find(p => p.id === id) : undefined;

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2"><ShieldX className="w-4 h-4" /> Recent Errors</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Context</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No errors recorded.</TableCell></TableRow>
              ) : errors.map(e => {
                const profile = profileById(e.user_id);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{profile?.full_name || profile?.email || e.user_id || "—"}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border bg-red-100 text-red-800 border-red-200">
                        {e.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={e.error_message}>{e.error_message}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{e.context ? JSON.stringify(e.context) : "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Metrics Tab ────────────────────────────────────────────────────────────────

type MetricRow = { metric_name: string; metric_value: number; created_at: string };

const MetricsTab = () => {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_metrics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as MetricRow[];
    },
  });

  // Aggregate by metric name
  const totals = useMemo(() => {
    const counts: Record<string, number> = {};
    metrics.forEach(m => {
      counts[m.metric_name] = (counts[m.metric_name] || 0) + m.metric_value;
    });
    return counts;
  }, [metrics]);

  // Today's counts
  const todayCounts = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const counts: Record<string, number> = {};
    metrics.forEach(m => {
      if (m.created_at.slice(0, 10) === today) {
        counts[m.metric_name] = (counts[m.metric_name] || 0) + m.metric_value;
      }
    });
    return counts;
  }, [metrics]);

  const METRIC_LABELS: Record<string, string> = {
    parcel_created: "Parcels Created",
    match_created: "Matches Made",
    claim_completed: "Claims Completed",
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(METRIC_LABELS).map(([key, label]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-foreground">{totals[key] || 0}</span>
              <p className="text-xs text-muted-foreground mt-1">Today: {todayCounts[key] || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.slice(0, 50).map((m, i) => (
                  <TableRow key={m.created_at + i}>
                    <TableCell className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{METRIC_LABELS[m.metric_name] ?? m.metric_name}</TableCell>
                  </TableRow>
                ))}
                {metrics.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">No metrics recorded yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
