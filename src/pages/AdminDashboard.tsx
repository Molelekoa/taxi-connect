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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  getBandForWeight, getWeightBand, WEIGHT_BANDS, calculateDeliveryPrice, type WeightBand,
} from "@/config/pricingCalculator";
import {
  Users, Package, Truck, LayoutDashboard, Copy, Check, Phone, Mail, Eye,
  DollarSign, MapPin, Scale, Search, TrendingUp, ShieldCheck, ShieldX, Clock,
  FileText, ExternalLink, Loader2, CheckCircle, Image, Navigation, History,
  XCircle, Trash2, HardDrive, AlertTriangle, Camera, ChevronRight,
  Calendar, ArrowRight,
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
  updated_at: string;
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
  suburb: string | null;
  pickup_earliest: string | null;
  pickup_latest: string | null;
  dimensions: string | null;
  collected_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  collection_photo_url: string | null;
  collection_lat: number | null;
  collection_lng: number | null;
  verified_at: string | null;
  delivered_at: string | null;
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
  vehicle_photo_url: string | null;
  license_disk_url: string | null;
  proof_of_residence_url: string | null;
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
      {copied ? <Check className="w-3 h-3 text-success shrink-0" /> : <Copy className="w-3 h-3 text-muted-foreground shrink-0" />}
    </button>
  );
};

// ── Document viewer with inline thumbnail + fullscreen ─────────────────────────

const DocumentPhoto = ({ storagePath, label }: { storagePath: string | null; label: string }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const isPdf = storagePath?.toLowerCase().endsWith(".pdf");

  const loadDocument = useCallback(async () => {
    if (!storagePath) return;

    setLoading(true);
    setError(null);

    try {
      // If it's already a full URL (e.g. a signed URL stored in DB), fetch directly
      let fetchUrl = storagePath;

      if (!storagePath.startsWith("http")) {
        // Get a signed URL from the edge function first
        const { data, error: err } = await supabase.functions.invoke("get-document-url", {
          body: { bucket: "documents", path: storagePath },
        });

        if (err || !data?.signedUrl) {
          console.error(`[DocumentPhoto] Failed to sign "${storagePath}":`, err);
          setError("Could not load document");
          return;
        }
        fetchUrl = data.signedUrl;
      }

      // Fetch the actual file as a blob (avoids browser blocks on external URLs)
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch (e) {
      console.error(`[DocumentPhoto] Failed to load "${storagePath}":`, e);
      setError("Could not load document");
    } finally {
      setLoading(false);
    }
  }, [storagePath]);

  useEffect(() => {
    if (storagePath) loadDocument();
  }, [storagePath, loadDocument]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  if (!storagePath) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground flex items-center gap-1">
          <FileText className="w-3 h-3" /> {label}
        </p>
        <span className="text-muted-foreground text-xs">Not uploaded</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground flex items-center gap-1">
          <FileText className="w-3 h-3" /> {label}
        </p>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground flex items-center gap-1">
          <FileText className="w-3 h-3" /> {label}
        </p>
        <p className="text-xs text-destructive">{error}</p>
        <button onClick={loadDocument} className="text-xs text-primary hover:underline">
          Retry
        </button>
      </div>
    );
  }

  // PDF — blob rendered in iframe inside dialog
  if (isPdf) {
    return (
      <>
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground flex items-center gap-1">
            <FileText className="w-3 h-3" /> {label}
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={() => setFullscreen(true)}
            disabled={!blobUrl}
          >
            <Eye className="w-3 h-3" />
            View PDF
          </Button>
        </div>

        <Dialog open={fullscreen} onOpenChange={setFullscreen}>
          <DialogContent className="max-w-4xl h-[85vh] p-2">
            <DialogHeader>
              <DialogTitle>{label}</DialogTitle>
              <DialogDescription className="sr-only">PDF preview of {label}</DialogDescription>
            </DialogHeader>
            {blobUrl ? (
              <iframe
                src={blobUrl}
                title={label}
                className="w-full h-[72vh] rounded-lg border border-border"
              />
            ) : (
              <p className="text-sm text-muted-foreground">Preview not available.</p>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Image — inline thumbnail with click-to-fullscreen (using blob URL, same as ProofPhoto)
  return (
    <>
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground flex items-center gap-1">
          <Camera className="w-3 h-3" /> {label}
        </p>
        {blobUrl && (
          <img
            src={blobUrl}
            alt={label}
            className="rounded-lg border border-border max-h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setFullscreen(true)}
          />
        )}
      </div>
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-3xl p-2">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription className="sr-only">Full-size view of {label}</DialogDescription>
          </DialogHeader>
          {blobUrl && <img src={blobUrl} alt={label} className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </>
  );
};

// ── Photo viewer component ─────────────────────────────────────────────────────

const ProofPhoto = ({ url, label }: { url: string | null; label: string }) => {
  const [fullscreen, setFullscreen] = useState(false);
  if (!url) return null;
  return (
    <>
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground flex items-center gap-1">
          <Camera className="w-3 h-3" /> {label}
        </p>
        <img
          src={url}
          alt={label}
          className="rounded-lg border border-border max-h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
          loading="lazy"
          onClick={() => setFullscreen(true)}
        />
      </div>
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-3xl p-2">
          <img src={url} alt={label} className="w-full rounded-lg" loading="lazy" />
        </DialogContent>
      </Dialog>
    </>
  );
};

// ── Geo link component ─────────────────────────────────────────────────────────

const GeoLink = ({ lat, lng, timestamp, label }: { lat: number | null; lng: number | null; timestamp?: string | null; label: string }) => {
  if (lat == null || lng == null) return null;
  return (
    <div className="bg-secondary/50 rounded-lg p-3 text-xs space-y-1">
      <p className="font-medium text-foreground flex items-center gap-1">
        <Navigation className="w-3 h-3" /> {label}
      </p>
      <p>Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}</p>
      {timestamp && <p className="text-muted-foreground">Recorded: {new Date(timestamp).toLocaleString()}</p>}
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline inline-flex items-center gap-1"
      >
        <ExternalLink className="w-3 h-3" /> View on Google Maps
      </a>
    </div>
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
            <div className="grid grid-cols-2 gap-3">
              <DocumentPhoto storagePath={traveler.id_copy_url} label="ID Copy" />
              <DocumentPhoto storagePath={traveler.license_copy_url} label="License Copy" />
              <DocumentPhoto storagePath={traveler.vehicle_photo_url ?? null} label="Vehicle Photo" />
              <DocumentPhoto storagePath={traveler.license_disk_url ?? null} label="License Disk" />
              <DocumentPhoto storagePath={traveler.proof_of_residence_url ?? null} label="Proof of Residence" />
            </div>
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

const ParcelTimeline = ({ parcelId, parcel, profiles }: { parcelId: string; parcel: Parcel; profiles: Profile[] }) => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["parcel-full-timeline", parcelId],
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

  // Also fetch cancellations for this parcel
  const { data: cancellations = [] } = useQuery({
    queryKey: ["parcel-cancellations", parcelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cancellations")
        .select("*")
        .eq("parcel_id", parcelId)
        .order("created_at", { ascending: true });
      if (error) return [];
      return data ?? [];
    },
  });

  const getProfileName = (id: string | null) => {
    if (!id) return "System";
    const p = profiles.find(pr => pr.id === id || pr.auth_id === id);
    return p?.full_name || p?.email || id.slice(0, 8) + "…";
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading timeline…
      </div>
    );
  }

  // Build combined timeline
  type TimelineEvent = { time: string; type: string; detail: string; actor?: string };
  const events: TimelineEvent[] = [];

  // Created event
  events.push({ time: parcel.created_at, type: "created", detail: "Parcel created" });

  // Audit entries
  history.forEach((entry) => {
    const oldStatus = entry.old_values?.status;
    const newStatus = entry.new_values?.status;
    const oldTraveler = entry.old_values?.traveler_id;
    const newTraveler = entry.new_values?.traveler_id;

    if (oldStatus !== newStatus) {
      events.push({
        time: entry.created_at,
        type: "status",
        detail: `${statusConfig[oldStatus]?.label ?? oldStatus ?? "?"} → ${statusConfig[newStatus]?.label ?? newStatus ?? "?"}`,
        actor: getProfileName(entry.performed_by),
      });
    }
    if (oldTraveler !== newTraveler) {
      if (newTraveler && !oldTraveler) {
        events.push({ time: entry.created_at, type: "assigned", detail: `Traveler assigned: ${getProfileName(newTraveler)}`, actor: getProfileName(entry.performed_by) });
      } else if (!newTraveler && oldTraveler) {
        events.push({ time: entry.created_at, type: "unassigned", detail: `Traveler unassigned: ${getProfileName(oldTraveler)}`, actor: getProfileName(entry.performed_by) });
      }
    }
  });

  // Collection event
  if (parcel.collected_at) {
    events.push({ time: parcel.collected_at, type: "collected", detail: "Parcel collected (pickup proof submitted)" });
  }

  // Delivery event
  if (parcel.delivered_at) {
    events.push({ time: parcel.delivered_at, type: "delivered", detail: "Delivery proof submitted" });
  }

  // Verification event
  if (parcel.verified_at) {
    events.push({ time: parcel.verified_at, type: "verified", detail: "Delivery verified by admin" });
  }

  // Cancellation events
  cancellations.forEach((c: any) => {
    const travelerName = getProfileName(c.traveler_id);
    events.push({
      time: c.created_at,
      type: "cancelled",
      detail: `Cancelled by ${travelerName}${c.reason ? `: ${c.reason}` : ""}`,
    });
  });

  if (parcel.cancelled_at) {
    events.push({
      time: parcel.cancelled_at,
      type: "cancelled",
      detail: `Parcel cancelled${parcel.cancel_reason ? `: ${parcel.cancel_reason}` : ""}`,
    });
  }

  // Sort by time
  events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  if (events.length === 0) {
    return <p className="text-xs text-muted-foreground">No events recorded.</p>;
  }

  const typeColors: Record<string, string> = {
    created: "bg-primary",
    status: "bg-accent",
    assigned: "bg-success",
    unassigned: "bg-destructive",
    collected: "bg-blue-500",
    delivered: "bg-success",
    verified: "bg-emerald-600",
    cancelled: "bg-destructive",
  };

  return (
    <div className="space-y-3">
      {events.map((event, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full ${typeColors[event.type] ?? "bg-muted-foreground"} shrink-0 mt-1`} />
            {i < events.length - 1 && <div className="w-px h-full bg-border min-h-[20px]" />}
          </div>
          <div className="text-xs pb-3">
            <p className="text-foreground font-medium">{event.detail}</p>
            <p className="text-muted-foreground">
              {new Date(event.time).toLocaleString()}
              {event.actor && <span> · by {event.actor}</span>}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Enhanced Parcel detail sheet ───────────────────────────────────────────────

const ParcelDetailSheet = ({ parcel, open, onClose, onStatusChange, profiles }: {
  parcel: Parcel | null; open: boolean; onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  profiles: Profile[];
}) => {
  const [activeTab, setActiveTab] = useState("details");

  // Fetch match data for this parcel (for proof photos/geotags)
  const { data: matchData } = useQuery({
    queryKey: ["parcel-match-detail", parcel?.id],
    queryFn: async () => {
      if (!parcel?.id) return null;
      const { data, error } = await supabase
        .from("matches")
        .select("*, trips(traveler_id, profiles:traveler_id(full_name, phone))")
        .eq("parcel_id", parcel.id)
        .eq("status", "accepted")
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!parcel?.id,
  });

  const travelerProfile = parcel?.traveler_id ? profiles.find(p => p.id === parcel.traveler_id) : null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Parcel Detail
            {parcel && <StatusBadge status={parcel.status} />}
          </SheetTitle>
          {parcel && (
            <p className="text-xs text-muted-foreground font-mono">ID: {parcel.id}</p>
          )}
        </SheetHeader>
        {parcel && (
          <div className="mt-4">
            {/* Tab navigation */}
            <div className="flex gap-1 mb-4 border-b border-border pb-2 overflow-x-auto">
              {[
                { key: "details", label: "Details", icon: FileText },
                { key: "gallery", label: "Evidence", icon: Image },
                { key: "timeline", label: "Timeline", icon: History },
                ...(parcel.status === "cancelled" ? [{ key: "cancellation", label: "Cancellation", icon: XCircle }] : []),
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Details tab */}
            {activeTab === "details" && (
              <div className="space-y-5 text-sm">
                <Section title="Route">
                  <Row label="Origin">{parcel.pickup_location ?? "—"}</Row>
                  <Row label="Destination">{parcel.dropoff_location ?? "—"}</Row>
                  {parcel.suburb && <Row label="Suburb">{parcel.suburb}</Row>}
                  <Row label="Pickup Address">{parcel.pickup_address ?? "—"}</Row>
                  <Row label="Delivery Address">{parcel.delivery_address ?? "—"}</Row>
                </Section>
                {(parcel.pickup_earliest || parcel.pickup_latest) && (
                  <Section title="Pickup Window">
                    <Row label="Earliest">{parcel.pickup_earliest ?? "—"}</Row>
                    <Row label="Latest">{parcel.pickup_latest ?? "—"}</Row>
                  </Section>
                )}
                <Section title="Sender">
                  <Row label="Name">{parcel.sender_name ?? "—"}</Row>
                  <Row label="Email"><CopyButton text={parcel.sender_email} /></Row>
                  <Row label="Phone"><CopyButton text={parcel.sender_phone} /></Row>
                </Section>
                <Section title="Recipient">
                  <Row label="Name">{parcel.recipient_name ?? "—"}</Row>
                  <Row label="Phone"><CopyButton text={parcel.recipient_phone} /></Row>
                </Section>
                {travelerProfile && (
                  <Section title="Assigned Traveler">
                    <Row label="Name">{travelerProfile.full_name ?? "—"}</Row>
                    <Row label="Phone"><CopyButton text={travelerProfile.phone} /></Row>
                    <Row label="Email"><CopyButton text={travelerProfile.email} /></Row>
                  </Section>
                )}
                {matchData?.trips?.profiles && (
                  <Section title="Matched Traveler (via trip)">
                    <Row label="Name">{(matchData.trips.profiles as any)?.full_name ?? "—"}</Row>
                    <Row label="Phone"><CopyButton text={(matchData.trips.profiles as any)?.phone ?? null} /></Row>
                  </Section>
                )}
                <Section title="Parcel">
                  <Row label="Weight Band">{bandLabel(parcel.weight_band)}</Row>
                  <Row label="Weight">{parcel.weight_kg != null ? `${parcel.weight_kg} kg` : "—"}</Row>
                  <Row label="Dimensions">{parcel.dimensions ?? "—"}</Row>
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
                  <Row label="Updated">{new Date(parcel.updated_at).toLocaleString()}</Row>
                </Section>
              </div>
            )}

            {/* Evidence / Gallery tab */}
            {activeTab === "gallery" && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Photos & Evidence</h4>

                {/* Package photo */}
                <ProofPhoto url={parcel.photo_url} label="Package Photo" />

                {/* Collection proof */}
                <ProofPhoto url={parcel.collection_photo_url} label="Collection Proof" />
                <GeoLink lat={parcel.collection_lat} lng={parcel.collection_lng} timestamp={parcel.collected_at} label="Collection Geolocation" />

                {/* Delivery proof from match */}
                {matchData?.proof_photo_url && (
                  <ProofPhoto url={matchData.proof_photo_url} label="Delivery Proof (Match)" />
                )}
                {matchData?.proof_geotag && typeof matchData.proof_geotag === "object" && !Array.isArray(matchData.proof_geotag) && (
                  <GeoLink
                    lat={(matchData.proof_geotag as any).lat}
                    lng={(matchData.proof_geotag as any).lng}
                    timestamp={matchData.proof_submitted_at}
                    label="Delivery Geolocation (Match)"
                  />
                )}

                {/* Delivery proof from parcel */}
                {!matchData?.proof_photo_url && parcel.delivery_lat != null && (
                  <GeoLink lat={parcel.delivery_lat} lng={parcel.delivery_lng} timestamp={parcel.delivery_geotagged_at} label="Delivery Geolocation" />
                )}

                {!parcel.photo_url && !parcel.collection_photo_url && !matchData?.proof_photo_url && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No photos uploaded yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Timeline tab */}
            {activeTab === "timeline" && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <History className="w-4 h-4" /> Event Timeline
                </h4>
                <ParcelTimeline parcelId={parcel.id} parcel={parcel} profiles={profiles} />
              </div>
            )}

            {/* Cancellation tab */}
            {activeTab === "cancellation" && parcel.status === "cancelled" && (
              <CancellationDetails parcel={parcel} profiles={profiles} />
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

// ── Cancellation details component ─────────────────────────────────────────────

const CancellationDetails = ({ parcel, profiles }: { parcel: Parcel; profiles: Profile[] }) => {
  const { data: cancellations = [] } = useQuery({
    queryKey: ["parcel-cancellations-detail", parcel.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cancellations")
        .select("*")
        .eq("parcel_id", parcel.id)
        .order("created_at", { ascending: false });
      if (error) return [];
      return data ?? [];
    },
  });

  const getProfileName = (id: string | null) => {
    if (!id) return "Unknown";
    const p = profiles.find(pr => pr.id === id);
    return p?.full_name || p?.email || id.slice(0, 8) + "…";
  };

  const timeElapsed = parcel.cancelled_at
    ? (() => {
        const created = new Date(parcel.created_at).getTime();
        const cancelled = new Date(parcel.cancelled_at).getTime();
        const diffMs = cancelled - created;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
        return `${hours}h ${minutes}m`;
      })()
    : "—";

  return (
    <div className="space-y-5 text-sm">
      <Section title="Cancellation Summary">
        <Row label="Cancelled At">{parcel.cancelled_at ? new Date(parcel.cancelled_at).toLocaleString() : "—"}</Row>
        <Row label="Time Elapsed">{timeElapsed}</Row>
        <Row label="Reason">{parcel.cancel_reason ?? "No reason provided"}</Row>
        <Row label="Status">{parcel.traveler_id ? "Was assigned to traveler" : "Unassigned at cancellation"}</Row>
      </Section>

      {cancellations.length > 0 && (
        <Section title="Cancellation Records">
          {cancellations.map((c: any) => (
            <div key={c.id} className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 space-y-1">
              <p className="text-xs font-medium text-foreground">
                Cancelled by: {getProfileName(c.traveler_id)}
              </p>
              <p className="text-xs text-muted-foreground">
                Reason: {c.reason ?? "No reason"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(c.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </Section>
      )}

      <Section title="Reassignment">
        <Row label="Current Traveler">{parcel.traveler_id ? getProfileName(parcel.traveler_id) : "None (unassigned)"}</Row>
        <Row label="Current Status"><StatusBadge status={parcel.status} /></Row>
      </Section>
    </div>
  );
};

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

  // Controlled tab state for clickable navigation
  const [activeTab, setActiveTab] = useState("overview");

  // Filter state for parcels tab
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [parcelsPage, setParcelsPage] = useState(0);
  const PARCELS_PER_PAGE = 50;

  // Helper: navigate to parcels tab with a specific status filter
  const goToParcelsByStatus = (status: string) => {
    setStatusFilter(status);
    setActiveTab("parcels");
  };

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
    staleTime: 2 * 60 * 1000, // 2 min — admin can manually refresh
  });

  // Fetch all parcels
  const { data: parcels = [], isLoading: parcelsLoading } = useQuery({
    queryKey: ["admin-parcels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("parcels").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Parcel[];
    },
    staleTime: 30 * 1000, // 30s — parcels change frequently
  });

  // Fetch all traveler profiles with routes
  const { data: travelerProfiles = [], isLoading: travelersLoading } = useQuery({
    queryKey: ["admin-traveler-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("traveler_profiles").select("*, traveler_routes(*)");
      if (error) throw error;
      return (data ?? []) as TravelerProfile[];
    },
    staleTime: 2 * 60 * 1000,
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
      const parcel = parcels.find(p => p.id === id);
      const statusLabel = statusConfig[status]?.label ?? status;
      const route = `${parcel?.pickup_location ?? "?"} → ${parcel?.dropoff_location ?? "?"}`;
      const message = `Your parcel (${route}) status has been updated to: ${statusLabel}.`;
      
      const notifications: Array<{ user_id: string; type: string; content: string }> = [];
      if (parcel?.sender_id) {
        notifications.push({ user_id: parcel.sender_id, type: "status_update", content: message });
      }
      if (parcel?.traveler_id && parcel.traveler_id !== parcel.sender_id) {
        notifications.push({ user_id: parcel.traveler_id, type: "status_update", content: message });
      }
      if (notifications.length > 0) {
        const { error: notifError } = await supabase.from("notifications").insert(notifications as any);
        if (notifError) {
          console.error("Failed to insert notification:", notifError);
          throw new Error(`Status updated but notification failed: ${notifError.message}`);
        }
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-parcels"] }); toast({ title: "Status updated" }); },
    onError: (err: any) => toast({ title: "Failed to update status", description: err?.message || "Unknown error", variant: "destructive" }),
  });

  const updateTravelerStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("traveler_profiles").update({ status } as any).eq("id", id);
      if (error) throw error;

      // Send notification on approval or rejection
      if (status === "approved" || status === "rejected") {
        const tp = travelerProfiles.find(t => t.id === id);
        if (tp) {
          const content = status === "approved"
            ? "Your traveler application has been approved! You can now view and claim parcels matching your routes."
            : "Your traveler application has been reviewed and was not approved at this time. Please contact support for more information.";
          const { error: notifError } = await supabase.from("notifications").insert({
            user_id: tp.profile_id,
            type: status === "approved" ? "traveler_approved" : "traveler_rejected",
            content,
          } as any);
          if (notifError) {
            console.error("Failed to insert notification:", notifError);
          }
        }
      }
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
  const deliveredIncome = parcels.filter(p => p.status === 'delivered' || p.status === 'delivered_verified').reduce((sum, p) => sum + (p.price || 0), 0);
  const pendingIncome = parcels.filter(p => !['delivered', 'delivered_verified', 'cancelled'].includes(p.status ?? '')).reduce((sum, p) => sum + (p.price || 0), 0);

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
        (p.dropoff_location?.toLowerCase().includes(q)) ||
        (p.suburb?.toLowerCase().includes(q)) ||
        (p.id.toLowerCase().includes(q))
      );
    }
    return result;
  }, [parcels, statusFilter, searchQuery]);

  // Reset page when filters change
  useEffect(() => { setParcelsPage(0); }, [statusFilter, searchQuery]);

  const totalParcelPages = Math.ceil(filteredParcels.length / PARCELS_PER_PAGE);
  const paginatedParcels = filteredParcels.slice(parcelsPage * PARCELS_PER_PAGE, (parcelsPage + 1) * PARCELS_PER_PAGE);

  const loading = profilesLoading || parcelsLoading || travelersLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container-narrow">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">Operations Hub</h1>
            <p className="text-muted-foreground mt-1">Complete oversight of shipments, users, evidence, and storage.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                <TabsTrigger value="storage" className="flex items-center gap-1.5"><HardDrive className="w-4 h-4" /> Storage</TabsTrigger>
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
                      <span className="text-2xl font-bold text-success">R{deliveredIncome.toLocaleString()}</span>
                      <p className="text-xs text-muted-foreground mt-1">{parcels.filter(p => p.status === 'delivered' || p.status === 'delivered_verified').length} delivered</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold text-accent">R{pendingIncome.toLocaleString()}</span>
                      <p className="text-xs text-muted-foreground mt-1">{parcels.filter(p => !['delivered', 'delivered_verified', 'cancelled'].includes(p.status ?? '')).length} in pipeline</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Parcels by status — CLICKABLE */}
                <h3 className="text-sm font-semibold text-foreground mb-3">Parcels by Status — click to drill down</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {STATUSES.map((s) => (
                    <Card
                      key={s}
                      className="cursor-pointer transition-all hover:shadow-elevated hover:border-primary/30 hover:-translate-y-0.5"
                      onClick={() => goToParcelsByStatus(s)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground capitalize">{statusConfig[s].label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-foreground">{parcelsByStatus[s]}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <StatusBadge status={s} />
                          <span className="text-[10px] text-primary font-medium">View →</span>
                        </div>
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

              {/* ── TAB 3: PARCELS — Enhanced ──────────────────────────────── */}
              <TabsContent value="parcels">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by sender, recipient, location, suburb, or ID…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses ({parcels.length})</SelectItem>
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{statusConfig[s].label} ({parcelsByStatus[s]})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {statusFilter !== "all" && (
                  <div className="flex items-center gap-2 mb-4">
                    <StatusBadge status={statusFilter} />
                    <span className="text-sm text-muted-foreground">{filteredParcels.length} parcels</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setStatusFilter("all")}>
                      Clear filter ×
                    </Button>
                  </div>
                )}

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-20">ID</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Suburb</TableHead>
                            <TableHead>Sender</TableHead>
                            <TableHead>Traveler</TableHead>
                            <TableHead>Band</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Pickup Window</TableHead>
                            <TableHead>Proof</TableHead>
                            <TableHead>Geo</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedParcels.length === 0 ? (
                            <TableRow><TableCell colSpan={13} className="text-center text-muted-foreground py-8">No parcels found.</TableCell></TableRow>
                          ) : paginatedParcels.map((parcel) => {
                            const traveler = profileById(parcel.traveler_id);
                            return (
                              <TableRow key={parcel.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => setSheetParcel(parcel)}>
                                <TableCell className="text-xs font-mono text-primary hover:underline">
                                  {parcel.id.slice(0, 8)}…
                                </TableCell>
                                <TableCell className="text-xs max-w-[160px]">
                                  <span className="truncate block" title={`${parcel.pickup_location} → ${parcel.dropoff_location}`}>
                                    {parcel.pickup_location ?? "—"} → {parcel.dropoff_location ?? "—"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-xs">{parcel.suburb ?? "—"}</TableCell>
                                <TableCell className="text-xs">
                                  <div>{parcel.sender_name ?? "—"}</div>
                                  {parcel.sender_phone && <div className="text-muted-foreground">{parcel.sender_phone}</div>}
                                </TableCell>
                                <TableCell className="text-xs">
                                  <div>{traveler?.full_name ?? "—"}</div>
                                  {traveler?.phone && <div className="text-muted-foreground">{traveler.phone}</div>}
                                </TableCell>
                                <TableCell className="text-xs">{bandLabel(parcel.weight_band)}</TableCell>
                                <TableCell className="text-xs font-medium">{parcel.price != null ? `R${parcel.price}` : "—"}</TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <Select value={parcel.status ?? "pending"} onValueChange={(val) => updateStatus.mutate({ id: parcel.id, status: val })}>
                                    <SelectTrigger className="h-7 text-xs w-32 border-0 p-0 shadow-none">
                                      <SelectValue><StatusBadge status={parcel.status} /></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {STATUSES.map((s) => (<SelectItem key={s} value={s}><StatusBadge status={s} /></SelectItem>))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {parcel.pickup_earliest ? (
                                    <span>{parcel.pickup_earliest}{parcel.pickup_latest ? ` – ${parcel.pickup_latest}` : ""}</span>
                                  ) : "—"}
                                </TableCell>
                                <TableCell>
                                  {(parcel.photo_url || parcel.collection_photo_url) ? (
                                    <Camera className="w-4 h-4 text-success" />
                                  ) : (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {(parcel.delivery_lat != null || parcel.collection_lat != null) ? (
                                    <a
                                      href={`https://www.google.com/maps?q=${parcel.delivery_lat ?? parcel.collection_lat},${parcel.delivery_lng ?? parcel.collection_lng}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-primary hover:text-primary/80"
                                    >
                                      <Navigation className="w-4 h-4" />
                                    </a>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{new Date(parcel.created_at).toLocaleDateString()}</TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setSheetParcel(parcel)}>
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Pagination controls */}
                    {totalParcelPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          Showing {parcelsPage * PARCELS_PER_PAGE + 1}–{Math.min((parcelsPage + 1) * PARCELS_PER_PAGE, filteredParcels.length)} of {filteredParcels.length}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" disabled={parcelsPage === 0} onClick={() => setParcelsPage(p => p - 1)}>
                            Previous
                          </Button>
                          <Button variant="outline" size="sm" disabled={parcelsPage >= totalParcelPages - 1} onClick={() => setParcelsPage(p => p + 1)}>
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
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
                                        className="h-7 px-2 text-success hover:text-success hover:bg-success/10"
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
                                        className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
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

              {/* ── TAB 7: STORAGE MANAGER ──────────────────────────────────── */}
              <TabsContent value="storage">
                <StorageManagerTab parcels={parcels} />
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
        profiles={profiles}
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

        {/* Photo + geotag side by side for verification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Photo proof */}
          <div>
            {match.proof_photo_url ? (
              <ProofPhoto url={match.proof_photo_url} label="Delivery proof" />
            ) : parcel?.photo_url ? (
              <ProofPhoto url={parcel.photo_url} label="Delivery proof (parcel)" />
            ) : (
              <p className="text-xs text-destructive font-medium">⚠ No photo proof</p>
            )}
          </div>

          {/* Geotag */}
          <div>
            {match.proof_geotag ? (
              <GeoLink lat={match.proof_geotag.lat} lng={match.proof_geotag.lng} timestamp={match.proof_submitted_at} label="Delivery Geotag" />
            ) : parcel?.delivery_lat != null ? (
              <GeoLink lat={parcel.delivery_lat} lng={parcel.delivery_lng} timestamp={parcel.delivery_geotagged_at} label="Delivery Geotag (parcel)" />
            ) : (
              <p className="text-xs text-destructive font-medium">⚠ No geolocation data</p>
            )}
          </div>
        </div>

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
          <Clock className="w-4 h-4 text-accent" />
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
            <CheckCircle className="w-4 h-4 text-success" />
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
    staleTime: 60 * 1000, // 1 min
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
    staleTime: 60 * 1000,
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
    staleTime: 2 * 60 * 1000,
  });

  const totals = useMemo(() => {
    const counts: Record<string, number> = {};
    metrics.forEach(m => {
      counts[m.metric_name] = (counts[m.metric_name] || 0) + m.metric_value;
    });
    return counts;
  }, [metrics]);

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

// ── Storage Manager Tab ────────────────────────────────────────────────────────

const StorageManagerTab = ({ parcels }: { parcels: Parcel[] }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteFilter, setDeleteFilter] = useState<string>("cancelled");
  const [deleteDaysOld, setDeleteDaysOld] = useState<number>(90);
  const [photosOnly, setPhotosOnly] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // List storage objects to estimate usage
  const { data: storageFiles = [], isLoading: storageLoading } = useQuery({
    queryKey: ["admin-storage-files"],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("documents").list("", { limit: 1000 });
      if (error) return [];
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000, // storage rarely changes
  });

  // Count photos across parcels
  const photoStats = useMemo(() => {
    let packagePhotos = 0;
    let collectionPhotos = 0;
    let deliveryGeos = 0;
    parcels.forEach(p => {
      if (p.photo_url) packagePhotos++;
      if (p.collection_photo_url) collectionPhotos++;
      if (p.delivery_lat != null) deliveryGeos++;
    });
    return { packagePhotos, collectionPhotos, deliveryGeos, documents: storageFiles.length };
  }, [parcels, storageFiles]);

  // Parcels eligible for deletion based on filters
  const eligibleParcels = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - deleteDaysOld);

    return parcels.filter(p => {
      if (deleteFilter !== "all" && p.status !== deleteFilter) return false;
      if (new Date(p.created_at) > cutoff) return false;
      return true;
    });
  }, [parcels, deleteFilter, deleteDaysOld]);

  const handleBulkDelete = async () => {
    if (eligibleParcels.length === 0) return;
    setIsDeleting(true);
    try {
      const res = await supabase.functions.invoke("delete-parcels", {
        body: {
          parcelIds: eligibleParcels.map(p => p.id),
          photosOnly,
        },
      });
      if (res.error) throw new Error(res.error.message);
      const result = res.data;
      toast({
        title: "Cleanup complete",
        description: `${result?.deletedParcels ?? 0} parcels processed, ${result?.deletedFiles ?? 0} files removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-parcels"] });
      queryClient.invalidateQueries({ queryKey: ["admin-storage-files"] });
    } catch (err: any) {
      toast({ title: "Cleanup failed", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Storage overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Documents Bucket</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-foreground">{photoStats.documents}</span>
            <p className="text-xs text-muted-foreground mt-1">files stored</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Package Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-foreground">{photoStats.packagePhotos}</span>
            <p className="text-xs text-muted-foreground mt-1">across all parcels</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collection Proofs</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-foreground">{photoStats.collectionPhotos}</span>
            <p className="text-xs text-muted-foreground mt-1">pickup confirmations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Geotagged Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-foreground">{photoStats.deliveryGeos}</span>
            <p className="text-xs text-muted-foreground mt-1">GPS verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Free tier warning */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Supabase Free Tier: 1GB Storage Limit</p>
            <p className="text-muted-foreground mt-1">
              Use the cleanup tools below to safely remove old data. The delete function uses the Supabase Storage API
              to remove actual files from S3 before deleting database records — preventing orphaned files.
            </p>
            <p className="text-destructive text-xs mt-2 font-medium">
              ⚠ Never delete storage files using raw SQL. Always use the Storage API to avoid orphaned S3 objects.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bulk cleanup tool */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Safe Bulk Cleanup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Status filter</label>
              <Select value={deleteFilter} onValueChange={setDeleteFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cancelled">Cancelled only</SelectItem>
                  <SelectItem value="delivered_verified">Verified only</SelectItem>
                  <SelectItem value="delivered">Delivered only</SelectItem>
                  <SelectItem value="all">All statuses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Older than (days)</label>
              <Select value={String(deleteDaysOld)} onValueChange={(v) => setDeleteDaysOld(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Mode</label>
              <Select value={photosOnly ? "photos" : "full"} onValueChange={(v) => setPhotosOnly(v === "photos")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Delete records + photos</SelectItem>
                  <SelectItem value="photos">Photos only (keep records)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
            <div className="text-sm">
              <span className="font-semibold text-foreground">{eligibleParcels.length}</span>
              <span className="text-muted-foreground"> parcels match your criteria</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={eligibleParcels.length === 0 || isDeleting}
              onClick={() => setConfirmOpen(true)}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Trash2 className="w-4 h-4 mr-1" />}
              {photosOnly ? "Clear Photos" : "Delete Permanently"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirm {photosOnly ? "Photo Cleanup" : "Permanent Deletion"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to {photosOnly ? "remove photos from" : "permanently delete"}{" "}
                <strong>{eligibleParcels.length}</strong> parcels
                with status "{deleteFilter === "all" ? "any" : statusConfig[deleteFilter]?.label ?? deleteFilter}"
                older than {deleteDaysOld} days.
              </p>
              {!photosOnly && (
                <p className="text-destructive font-medium">
                  This will delete parcel records, associated matches, notifications, and all uploaded files.
                  This action cannot be undone.
                </p>
              )}
              {photosOnly && (
                <p className="text-muted-foreground">
                  Records will be preserved but associated photos will be permanently removed from storage.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              {photosOnly ? "Clear Photos" : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
