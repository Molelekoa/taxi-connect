import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Package, MapPin, CalendarDays, Scale, CheckCircle, Clock, User, RefreshCw, ArrowRightLeft, ShieldCheck, Trash2, XCircle } from "lucide-react";
import DashboardErrorState from "@/components/DashboardErrorState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SenderDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [parcels, setParcels] = useState<any[]>([]);
  const [matchesByParcel, setMatchesByParcel] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [reassigning, setReassigning] = useState<string | null>(null);
  const [earlierNotifications, setEarlierNotifications] = useState<Record<string, any>>({});
  const [confirmingArrival, setConfirmingArrival] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [cancellingParcel, setCancellingParcel] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setFetchError(null);

    try {
      const { data: pid } = await supabase.rpc("get_profile_id", { _auth_uid: user.id });
      if (!pid) { setLoading(false); return; }

      const [parcelsResult, matchesResult, notifsResult] = await Promise.all([
        supabase.from("parcels").select("*").order("created_at", { ascending: false }).then(r => r),
        supabase.from("matches").select("*, trips(*, profiles:traveler_id(full_name, phone))").eq("status", "accepted").then(r => r),
        supabase.from("notifications").select("*, matches:related_match_id(id, trip_id, parcel_id, trips(travel_date, profiles:traveler_id(full_name)))").eq("user_id", pid).eq("type", "earlier_traveler_available").eq("read", false).then(r => r),
      ]);

      setParcels(parcelsResult.data || []);

      const grouped: Record<string, any[]> = {};
      for (const m of matchesResult.data || []) {
        if (!grouped[m.parcel_id]) grouped[m.parcel_id] = [];
        grouped[m.parcel_id].push(m);
      }
      setMatchesByParcel(grouped);

      const notifsByParcel: Record<string, any> = {};
      for (const n of notifsResult.data || []) {
        const parcelId = n.matches?.parcel_id;
        if (parcelId) {
          notifsByParcel[parcelId] = n;
        }
      }
      setEarlierNotifications(notifsByParcel);
    } catch (err: any) {
      console.error("SenderDashboard fetchData error:", err);
      setFetchError(err.message || "Something went wrong loading your data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  const handleCancelParcel = async (parcelId: string) => {
    setCancellingParcel(parcelId);
    try {
      const res = await supabase.functions.invoke("cancel-parcel-by-sender", {
        body: { parcelId, reason: "Cancelled by sender" },
      });
      if (res.error) throw new Error(res.error.message);
      toast({ title: "Parcel cancelled", description: "The traveler has been notified and the parcel is back in the available pool." });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Failed to cancel", description: err.message, variant: "destructive" });
    } finally {
      setCancellingParcel(null);
    }
  };

  const statusConfig: Record<string, { className: string; icon: any; label: string }> = {
    pending: { className: "bg-warning/10 text-warning", icon: Clock, label: "Awaiting pickup" },
    matched: { className: "bg-primary/10 text-primary", icon: CheckCircle, label: "Matched, awaiting pickup" },
    collected: { className: "bg-primary/10 text-primary", icon: CheckCircle, label: "On the way" },
    in_transit: { className: "bg-primary/10 text-primary", icon: CheckCircle, label: "On the way" },
    "in-transit": { className: "bg-primary/10 text-primary", icon: CheckCircle, label: "On the way" },
    pending_confirmation: { className: "bg-accent/10 text-accent", icon: ShieldCheck, label: "Awaiting Confirmation" },
    delivered_pending_verification: { className: "bg-accent/10 text-accent", icon: ShieldCheck, label: "Delivered – awaiting admin confirmation" },
    delivered_verified: { className: "bg-success/10 text-success", icon: CheckCircle, label: "Delivered – confirmed" },
    delivered: { className: "bg-success/10 text-success", icon: CheckCircle, label: "Delivery complete" },
    cancelled: { className: "bg-destructive/10 text-destructive", icon: Clock, label: "Cancelled" },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container-narrow max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display font-bold text-2xl text-foreground mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              Sent Parcels
            </h1>
            <p className="text-sm text-muted-foreground -mt-4 mb-6">Parcels you've booked for delivery</p>

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
                  const isPendingConfirmation = parcel.status === "pending_confirmation" || parcel.status === "delivered_pending_verification";

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
                          {config.label}
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

                      {/* Retry Matching + Remove for pending parcels */}
                      {parcel.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetry(parcel.id)}
                            disabled={retrying === parcel.id}
                            className="flex-1"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${retrying === parcel.id ? "animate-spin" : ""}`} />
                            {retrying === parcel.id ? "Searching..." : "Retry Matching"}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={deleting === parcel.id}>
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                {deleting === parcel.id ? "Removing..." : "Remove"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove this parcel?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the parcel from {parcel.pickup_location} to {parcel.dropoff_location}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    setDeleting(parcel.id);
                                    try {
                                      const { error } = await supabase.from("parcels").delete().eq("id", parcel.id);
                                      if (error) throw error;
                                      toast({ title: "Parcel removed", description: "The parcel has been deleted." });
                                      await fetchData();
                                    } catch (err: any) {
                                      toast({ title: "Failed to remove", description: err.message, variant: "destructive" });
                                    } finally {
                                      setDeleting(null);
                                    }
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}

                      {/* Cancel assigned parcel */}
                      {["matched", "collected", "in_transit", "in-transit"].includes(parcel.status) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={cancellingParcel === parcel.id}>
                              <XCircle className="w-3.5 h-3.5 mr-1.5" />
                              {cancellingParcel === parcel.id ? "Cancelling..." : "Cancel Delivery"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel this delivery?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will unassign the traveler and return the parcel ({parcel.pickup_location} → {parcel.dropoff_location}) to the available pool so other travelers can claim it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelParcel(parcel.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Cancel Delivery
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

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
