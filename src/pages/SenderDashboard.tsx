import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, MapPin, CalendarDays, Scale, CheckCircle, Clock, User, RefreshCw, ArrowRightLeft, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SenderDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [parcels, setParcels] = useState<any[]>([]);
  const [matchesByParcel, setMatchesByParcel] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [reassigning, setReassigning] = useState<string | null>(null);
  const [earlierNotifications, setEarlierNotifications] = useState<Record<string, any>>({});
  const [confirmingArrival, setConfirmingArrival] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: pid } = await supabase.rpc("get_profile_id", { _auth_uid: user.id });
    if (!pid) { setLoading(false); return; }

    const { data: parcelsData } = await supabase
      .from("parcels")
      .select("*")
      .order("created_at", { ascending: false }) as { data: any[] | null };
    setParcels(parcelsData || []);

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*, trips(*, profiles:traveler_id(full_name, phone))")
      .eq("status", "accepted") as { data: any[] | null };

    const grouped: Record<string, any[]> = {};
    for (const m of matchesData || []) {
      if (!grouped[m.parcel_id]) grouped[m.parcel_id] = [];
      grouped[m.parcel_id].push(m);
    }
    setMatchesByParcel(grouped);

    const { data: notifs } = await supabase
      .from("notifications")
      .select("*, matches:related_match_id(id, trip_id, parcel_id, trips(travel_date, profiles:traveler_id(full_name)))")
      .eq("user_id", pid)
      .eq("type", "earlier_traveler_available")
      .eq("read", false) as { data: any[] | null };

    const notifsByParcel: Record<string, any> = {};
    for (const n of notifs || []) {
      const parcelId = n.matches?.parcel_id;
      if (parcelId) {
        notifsByParcel[parcelId] = n;
      }
    }
    setEarlierNotifications(notifsByParcel);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRetry = async (parcelId: string) => {
    setRetrying(parcelId);
    try {
      const { error } = await supabase.functions.invoke("find-matching-trips", {
        body: { parcelId },
      });
      if (error) throw error;
      toast({ title: "Matching retried", description: "We've searched for available travelers." });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Retry failed", description: err.message, variant: "destructive" });
    } finally {
      setRetrying(null);
    }
  };

  const handleReassign = async (parcelId: string, newMatchId: string, notificationId: string) => {
    setReassigning(parcelId);
    try {
      const { error } = await supabase.functions.invoke("reassign-parcel", {
        body: { parcelId, newMatchId },
      });
      if (error) throw error;
      await supabase.from("notifications").update({ read: true }).eq("id", notificationId);
      toast({ title: "Parcel reassigned", description: "Your parcel has been reassigned to the earlier traveler." });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Reassignment failed", description: err.message, variant: "destructive" });
    } finally {
      setReassigning(null);
    }
  };

  const handleDismissEarlier = async (notificationId: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", notificationId);
    setEarlierNotifications(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (next[key]?.id === notificationId) delete next[key];
      }
      return next;
    });
  };

  const handleConfirmArrival = async (parcelId: string) => {
    setConfirmingArrival(parcelId);
    try {
      const { error } = await supabase
        .from("parcels")
        .update({ sender_confirmed_at: new Date().toISOString() } as any)
        .eq("id", parcelId);
      if (error) throw error;
      toast({ title: "Arrival confirmed", description: "Thank you! Awaiting admin approval to finalise delivery." });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Failed to confirm", description: err.message, variant: "destructive" });
    } finally {
      setConfirmingArrival(null);
    }
  };

  const statusConfig: Record<string, { className: string; icon: any }> = {
    pending: { className: "bg-warning/10 text-warning", icon: Clock },
    matched: { className: "bg-primary/10 text-primary", icon: CheckCircle },
    pending_confirmation: { className: "bg-accent/10 text-accent", icon: ShieldCheck },
    delivered: { className: "bg-success/10 text-success", icon: CheckCircle },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container-narrow max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display font-bold text-2xl text-foreground mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              My Parcels
            </h1>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : parcels.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No parcels posted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {parcels.map(parcel => {
                  const config = statusConfig[parcel.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  const matches = matchesByParcel[parcel.id] || [];
                  const earlierNotif = earlierNotifications[parcel.id];
                  const isPendingConfirmation = parcel.status === "pending_confirmation";

                  return (
                    <div key={parcel.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            <MapPin className="w-4 h-4 text-primary" />
                            {parcel.pickup_location} → {parcel.dropoff_location}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Scale className="w-3 h-3" />{parcel.weight_kg || "?"}kg</span>
                            {parcel.price && <span>R{parcel.price}</span>}
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              {new Date(parcel.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge className={config.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {parcel.status === "pending_confirmation" ? "Awaiting Confirmation" : parcel.status}
                        </Badge>
                      </div>

                      {/* Pending confirmation banner */}
                      {isPendingConfirmation && !parcel.sender_confirmed_at && (
                        <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-semibold text-accent flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Your traveler reports this parcel has been delivered
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Please confirm the parcel has arrived at its intended destination.
                          </p>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleConfirmArrival(parcel.id)}
                            disabled={confirmingArrival === parcel.id}
                          >
                            {confirmingArrival === parcel.id ? "Confirming..." : "Confirm Arrival"}
                          </Button>
                        </div>
                      )}

                      {isPendingConfirmation && parcel.sender_confirmed_at && (
                        <div className="bg-success/5 border border-success/20 rounded-lg p-3">
                          <p className="text-xs font-semibold text-success flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> You confirmed arrival — awaiting admin approval
                          </p>
                        </div>
                      )}

                      {/* Retry Matching for pending parcels */}
                      {parcel.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(parcel.id)}
                          disabled={retrying === parcel.id}
                          className="w-full"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${retrying === parcel.id ? "animate-spin" : ""}`} />
                          {retrying === parcel.id ? "Searching..." : "Retry Matching"}
                        </Button>
                      )}

                      {/* Matched traveler info */}
                      {matches.length > 0 && (
                        <div className="bg-success/5 border border-success/20 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-semibold text-success flex items-center gap-1">
                            <User className="w-3 h-3" /> Traveler assigned
                          </p>
                          {matches.map(m => (
                            <div key={m.id} className="text-xs text-muted-foreground">
                              {m.trips?.profiles?.full_name && <p>Name: {m.trips.profiles.full_name}</p>}
                              {m.trips?.profiles?.phone && <p>Phone: {m.trips.profiles.phone}</p>}
                              <p>Trip date: {m.trips?.travel_date}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Earlier traveler reassignment prompt */}
                      {earlierNotif && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-semibold text-primary flex items-center gap-1">
                            <ArrowRightLeft className="w-3 h-3" /> Earlier traveler available
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {earlierNotif.content}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleReassign(parcel.id, earlierNotif.related_match_id, earlierNotif.id)}
                              disabled={reassigning === parcel.id}
                            >
                              {reassigning === parcel.id ? "Reassigning..." : "Reassign"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismissEarlier(earlierNotif.id)}
                            >
                              Keep Current
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SenderDashboard;
