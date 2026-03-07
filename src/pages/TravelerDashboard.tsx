import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Package, MapPin, CalendarDays, Scale, CheckCircle, Clock, Truck, Search, ShieldAlert, XCircle, Camera, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostTrip from "@/components/PostTrip";
import { WEIGHT_BANDS } from "@/config/pricingCalculator";

const CANCEL_REASONS = [
  "Trip cancelled",
  "No room for parcel",
  "Could not reach sender",
];

const PAYOUT_RATE = 0.65;

const getBandLabel = (bandId: string | null | undefined) => {
  if (!bandId) return null;
  const band = WEIGHT_BANDS.find(b => b.id === bandId);
  return band ? `${band.label} (${band.range[0]}-${band.range[1]}kg)` : null;
};

const TravelerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [travelerStatus, setTravelerStatus] = useState<string>("pending");
  const [trips, setTrips] = useState<any[]>([]);
  const [pendingMatches, setPendingMatches] = useState<any[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<any[]>([]);
  const [deliveredMatches, setDeliveredMatches] = useState<any[]>([]);
  const [browseParcels, setBrowseParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);

  // Cancel state
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Delivery proof state
  const [showDeliveryDialog, setShowDeliveryDialog] = useState<string | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null);
  const [submittingProof, setSubmittingProof] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Collection proof state
  const [showCollectionDialog, setShowCollectionDialog] = useState<string | null>(null);
  const [collectionPhoto, setCollectionPhoto] = useState<File | null>(null);
  const [submittingCollection, setSubmittingCollection] = useState(false);
  const collectionPhotoInputRef = useRef<HTMLInputElement>(null);
  const [collectionGeoCoords, setCollectionGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [collectionGeoLoading, setCollectionGeoLoading] = useState(false);
  const [collectionGeoError, setCollectionGeoError] = useState<string | null>(null);

  // Geotag state
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: pid } = await supabase.rpc("get_profile_id", { _auth_uid: user.id });
    if (!pid) { setLoading(false); return; }
    setProfileId(pid);

    const { data: tp } = await supabase
      .from("traveler_profiles")
      .select("status")
      .eq("profile_id", pid)
      .single() as { data: any };
    setTravelerStatus(tp?.status || "pending");

    const { data: tripsData } = await supabase
      .from("trips")
      .select("*")
      .order("travel_date", { ascending: true }) as { data: any[] | null };
    setTrips(tripsData || []);

    const { data: pending } = await supabase
      .from("matches")
      .select("*, parcels(*), trips(*)")
      .eq("status", "pending") as { data: any[] | null };
    setPendingMatches((pending || []).filter((m: any) => m.trips?.traveler_id === pid));

    const { data: accepted } = await supabase
      .from("matches")
      .select("*, parcels(*), trips(*)")
      .eq("status", "accepted") as { data: any[] | null };
    const myAccepted = (accepted || []).filter((m: any) => m.trips?.traveler_id === pid);
    
    // Carrying: claimed, collected, in_transit, delivered_pending_verification
    const carryingStatuses = ["claimed", "matched", "collected", "in_transit", "in-transit", "delivered_pending_verification", "pending"];
    setAcceptedMatches(myAccepted.filter((m: any) =>
      carryingStatuses.includes(m.parcels?.status)
    ));

    // Delivered: only admin-verified parcels
    setDeliveredMatches(myAccepted.filter((m: any) =>
      m.parcels?.status === "delivered_verified"
    ));

    if (tp?.status === "approved") {
      const { data: tpFull } = await supabase
        .from("traveler_profiles")
        .select("id")
        .eq("profile_id", pid)
        .single();

      if (tpFull) {
        const { data: routes } = await supabase
          .from("traveler_routes")
          .select("route_from, route_to")
          .eq("traveler_profile_id", tpFull.id) as { data: any[] | null };

        if (routes && routes.length > 0) {
          const { data: allPending } = await supabase
            .from("parcels")
            .select("id, pickup_location, dropoff_location, weight_kg, weight_band, price, description, dimensions, pickup_earliest, pickup_latest, status, created_at, include_tracking, suburb, pickup_address, delivery_address")
            .eq("status", "pending") as { data: any[] | null };

          const matched = (allPending || []).filter((p: any) => {
            const pickup = (p.pickup_location || "").toLowerCase();
            const dropoff = (p.dropoff_location || "").toLowerCase();
            return routes.some((r: any) => {
              const from = (r.route_from || "").toLowerCase();
              return pickup.includes(from) || from.includes(pickup);
            }) && routes.some((r: any) => {
              const to = (r.route_to || "").toLowerCase();
              return dropoff.includes(to) || to.includes(dropoff);
            });
          });
          setBrowseParcels(matched);
        }
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Realtime subscription for traveler approval status
    if (!user) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      const { data: pid } = await supabase.rpc("get_profile_id", { _auth_uid: user.id });
      if (!pid) return;

      channel = supabase
        .channel("traveler-status")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "traveler_profiles", filter: `profile_id=eq.${pid}` },
          (payload) => {
            const newStatus = (payload.new as any)?.status;
            if (newStatus) {
              setTravelerStatus(newStatus);
              fetchData(); // re-fetch all data when status changes
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAccept = async (matchId: string) => {
    setAccepting(matchId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await supabase.functions.invoke("accept-match", { body: { matchId } });
      if (res.error) throw new Error(res.error.message);
      toast({ title: "Match accepted!", description: "The sender has been notified." });
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to accept", description: err.message, variant: "destructive" });
    } finally {
      setAccepting(null);
    }
  };

  const handleClaim = async (parcelId: string) => {
    setClaiming(parcelId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await supabase.functions.invoke("claim-parcel", { body: { parcelId } });
      if (res.error) throw new Error(res.error.message);
      toast({ title: "Parcel claimed!", description: "The sender has been notified." });
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to claim", description: err.message, variant: "destructive" });
    } finally {
      setClaiming(null);
    }
  };

  const handleCancel = async () => {
    if (!showCancelDialog || !cancelReason) return;
    setCancelling(showCancelDialog);
    try {
      const res = await supabase.functions.invoke("cancel-accepted-match", {
        body: { matchId: showCancelDialog, reason: cancelReason },
      });
      if (res.error) throw new Error(res.error.message);
      toast({ title: "Delivery cancelled", description: "The sender has been notified and we're searching for a replacement." });
      setShowCancelDialog(null);
      setCancelReason("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to cancel", description: err.message, variant: "destructive" });
    } finally {
      setCancelling(null);
    }
  };

  const handleTagLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoLoading(false);
      },
      (err) => {
        setGeoError(err.message || "Failed to get location.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmitDeliveryProof = async () => {
    if (!showDeliveryDialog || !deliveryPhoto || !geoCoords || !profileId) {
      toast({ title: "Both photo and GPS location are required", variant: "destructive" });
      return;
    }
    setSubmittingProof(true);
    try {
      let photoUrl: string | undefined;

      const uploadForm = new FormData();
      uploadForm.append("file", deliveryPhoto);
      uploadForm.append("purpose", "delivery-proof");

      const { data: uploadResult, error: uploadError } = await supabase.functions.invoke("upload-document", {
        body: uploadForm,
      });

      if (uploadError || !uploadResult?.success) {
        throw new Error(uploadError?.message || "Photo upload failed");
      }
      photoUrl = uploadResult.url;

      const body: any = { matchId: showDeliveryDialog, photoUrl, lat: geoCoords.lat, lng: geoCoords.lng };

      const res = await supabase.functions.invoke("submit-delivery-proof", { body });
      if (res.error) throw new Error(res.error.message);

      toast({ title: "Delivery proof submitted!", description: "Awaiting admin confirmation." });
      setShowDeliveryDialog(null);
      setDeliveryPhoto(null);
      setGeoCoords(null);
      setGeoError(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to submit proof", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleTagCollectionLocation = () => {
    if (!navigator.geolocation) {
      setCollectionGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setCollectionGeoLoading(true);
    setCollectionGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCollectionGeoCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setCollectionGeoLoading(false);
      },
      (err) => {
        setCollectionGeoError(err.message || "Failed to get location.");
        setCollectionGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmitCollectionProof = async () => {
    if (!showCollectionDialog || !collectionPhoto || !collectionGeoCoords || !profileId) {
      toast({ title: "Both photo and GPS location are required", variant: "destructive" });
      return;
    }
    setSubmittingCollection(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", collectionPhoto);
      uploadForm.append("purpose", "collection-proof");

      const { data: uploadResult, error: uploadError } = await supabase.functions.invoke("upload-document", {
        body: uploadForm,
      });

      if (uploadError || !uploadResult?.success) {
        throw new Error(uploadError?.message || "Photo upload failed");
      }

      const res = await supabase.functions.invoke("submit-collection-proof", {
        body: { matchId: showCollectionDialog, photoUrl: uploadResult.url, lat: collectionGeoCoords.lat, lng: collectionGeoCoords.lng },
      });
      if (res.error) throw new Error(res.error.message);

      toast({ title: "Collection proof submitted!", description: "The sender has been notified." });
      setShowCollectionDialog(null);
      setCollectionPhoto(null);
      setCollectionGeoCoords(null);
      setCollectionGeoError(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to submit collection proof", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingCollection(false);
    }
  };

  const payoutDisplay = (price: number | null | undefined) => {
    if (!price) return null;
    const payout = Math.round(Number(price) * PAYOUT_RATE);
    return (
      <span className="font-medium text-success">
        Your payout: R{payout}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-success/10 text-success",
      completed: "bg-muted text-muted-foreground",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  const isApproved = travelerStatus === "approved";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container-narrow max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display font-bold text-2xl text-foreground mb-2 flex items-center gap-2">
              <Truck className="w-6 h-6 text-primary" />
              Traveler Dashboard
            </h1>

            {travelerStatus === "pending" && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Approval Pending</p>
                  <p className="text-xs text-muted-foreground mt-1">Your profile is under review. Once approved, you'll be able to browse and claim parcels.</p>
                </div>
              </div>
            )}
            {travelerStatus === "rejected" && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Profile Rejected</p>
                  <p className="text-xs text-muted-foreground mt-1">Your traveler application was not approved. Please contact support for more details.</p>
                </div>
              </div>
            )}

            <Tabs defaultValue={isApproved ? "browse" : "trips"} className="w-full">
              <TabsList className="mb-6 bg-secondary border border-border">
                <TabsTrigger value="trips">My Trips</TabsTrigger>
                {isApproved && (
                  <TabsTrigger value="browse">
                    Browse Parcels
                    {browseParcels.length > 0 && (
                      <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                        {browseParcels.length}
                      </span>
                    )}
                  </TabsTrigger>
                )}
                <TabsTrigger value="available">
                  Matched
                  {pendingMatches.length > 0 && (
                    <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                      {pendingMatches.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="accepted">Carrying</TabsTrigger>
                <TabsTrigger value="delivered">
                  Delivered
                  {deliveredMatches.length > 0 && (
                    <span className="ml-1.5 bg-success text-success-foreground text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                      {deliveredMatches.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* My Trips */}
              <TabsContent value="trips" className="space-y-6">
                {isApproved && <PostTrip onTripPosted={fetchData} />}
                {!isApproved && (
                  <p className="text-muted-foreground text-center py-4 text-sm">You must be approved before posting trips.</p>
                )}
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : trips.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No trips posted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {trips.map(trip => (
                      <div key={trip.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {trip.origin_city} → {trip.destination_city}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{trip.travel_date}</span>
                            <span className="flex items-center gap-1"><Scale className="w-3 h-3" />{trip.available_weight_kg}kg</span>
                          </div>
                        </div>
                        {statusBadge(trip.status)}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Browse Available Parcels */}
              {isApproved && (
                <TabsContent value="browse" className="space-y-3">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : browseParcels.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No parcels matching your routes right now.</p>
                      <p className="text-xs text-muted-foreground mt-1">New parcels will appear here as senders book deliveries on your routes.</p>
                    </div>
                  ) : (
                    browseParcels.map(parcel => (
                      <div key={parcel.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                          <div className="flex items-center gap-2 font-medium text-foreground">
                              <Package className="w-4 h-4 text-accent" />
                              {parcel.pickup_location}{parcel.suburb ? ` – ${parcel.suburb}` : ""} → {parcel.dropoff_location}
                            </div>
                            {(parcel.pickup_address || parcel.delivery_address) && (
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                {parcel.pickup_address && <span>Pickup: {parcel.pickup_address}</span>}
                                {parcel.delivery_address && <span>Drop-off: {parcel.delivery_address}</span>}
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Scale className="w-3 h-3" />{getBandLabel(parcel.weight_band) || `${parcel.weight_kg || "?"}kg`}</span>
                              {parcel.pickup_earliest && (
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" />
                                  {parcel.pickup_earliest} – {parcel.pickup_latest}
                                </span>
                              )}
                              {parcel.dimensions && <span>{parcel.dimensions}</span>}
                            </div>
                            {parcel.price && (
                              <p className="mt-2 text-sm">{payoutDisplay(parcel.price)}</p>
                            )}
                            {parcel.description && (
                              <p className="text-xs text-muted-foreground mt-2">{parcel.description}</p>
                            )}
                          </div>
                          <Badge className="bg-warning/10 text-warning">
                            <Clock className="w-3 h-3 mr-1" />available
                          </Badge>
                        </div>
                        <Button
                          variant="coral"
                          size="sm"
                          className="w-full"
                          disabled={claiming === parcel.id}
                          onClick={() => handleClaim(parcel.id)}
                        >
                          {claiming === parcel.id ? "Claiming..." : "Claim for Delivery"}
                        </Button>
                      </div>
                    ))
                  )}
                </TabsContent>
              )}

              {/* Matched (pending acceptance) */}
              <TabsContent value="available" className="space-y-3">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : pendingMatches.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending matches.</p>
                ) : (
                  pendingMatches.map(match => (
                    <div key={match.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                           <div className="flex items-center gap-2 font-medium text-foreground">
                             <Package className="w-4 h-4 text-accent" />
                             {match.parcels?.pickup_location}{match.parcels?.suburb ? ` – ${match.parcels.suburb}` : ""} → {match.parcels?.dropoff_location}
                           </div>
                           {(match.parcels?.pickup_address || match.parcels?.delivery_address) && (
                             <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                               {match.parcels?.pickup_address && <span>Pickup: {match.parcels.pickup_address}</span>}
                               {match.parcels?.delivery_address && <span>Drop-off: {match.parcels.delivery_address}</span>}
                             </div>
                           )}
                           <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                             <span className="flex items-center gap-1"><Scale className="w-3 h-3" />{getBandLabel(match.parcels?.weight_band) || `${match.parcels?.weight_kg || "?"}kg`}</span>
                             {match.parcels?.pickup_earliest && (
                               <span className="flex items-center gap-1">
                                 <CalendarDays className="w-3 h-3" />
                                 {match.parcels.pickup_earliest} – {match.parcels.pickup_latest}
                               </span>
                             )}
                           </div>
                          {match.parcels?.price && (
                            <p className="mt-2 text-sm">{payoutDisplay(match.parcels.price)}</p>
                          )}
                        </div>
                        <Badge className="bg-warning/10 text-warning">
                          <Clock className="w-3 h-3 mr-1" />pending
                        </Badge>
                      </div>
                      <Button
                        variant="coral"
                        size="sm"
                        className="w-full"
                        disabled={accepting === match.id}
                        onClick={() => handleAccept(match.id)}
                      >
                        {accepting === match.id ? "Accepting..." : "Accept Delivery"}
                      </Button>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* Accepted */}
              <TabsContent value="accepted" className="space-y-3">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : acceptedMatches.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Parcels you've accepted to deliver will appear here.</p>
                ) : (
                  acceptedMatches.map(match => (
                    <div key={match.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <CheckCircle className="w-4 h-4 text-success" />
                          {match.parcels?.pickup_location}{match.parcels?.suburb ? ` – ${match.parcels.suburb}` : ""} → {match.parcels?.dropoff_location}
                        </div>
                        <Badge className={
                          match.parcels?.status === "delivered_pending_verification"
                            ? "bg-warning/10 text-warning"
                            : match.parcels?.status === "collected"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-success/10 text-success"
                        }>
                          {match.parcels?.status === "delivered_pending_verification"
                            ? "Awaiting Verification"
                            : match.parcels?.status === "collected"
                              ? "Collected"
                              : match.parcels?.status === "in_transit" || match.parcels?.status === "in-transit"
                                ? "In Transit"
                                : "Accepted"}
                        </Badge>
                      </div>
                       <div className="text-xs text-muted-foreground space-y-1">
                         <p className="flex items-center gap-1"><Scale className="w-3 h-3" />Size: {getBandLabel(match.parcels?.weight_band) || `${match.parcels?.weight_kg || "?"}kg`}</p>
                         {match.parcels?.suburb && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />Suburb: {match.parcels.suburb}</p>}
                         {match.parcels?.pickup_address && <p>Pickup: {match.parcels.pickup_address}</p>}
                         {match.parcels?.delivery_address && <p>Drop-off: {match.parcels.delivery_address}</p>}
                         {match.parcels?.pickup_earliest && (
                           <p className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />Pickup: {match.parcels.pickup_earliest} – {match.parcels.pickup_latest}</p>
                         )}
                         {match.parcels?.description && <p>Description: {match.parcels.description}</p>}
                         {match.parcels?.dimensions && <p>Dimensions: {match.parcels.dimensions}</p>}
                         {match.parcels?.sender_name && <p className="font-medium text-foreground mt-2">Sender: {match.parcels.sender_name}</p>}
                         {match.parcels?.sender_phone && <p>Sender Phone: {match.parcels.sender_phone}</p>}
                         {match.parcels?.recipient_name && <p className="font-medium text-foreground">Recipient: {match.parcels.recipient_name}</p>}
                         {match.parcels?.recipient_phone && <p>Recipient Phone: {match.parcels.recipient_phone}</p>}
                         {match.accepted_at && <p>Accepted: {new Date(match.accepted_at).toLocaleDateString()}</p>}
                       </div>
                      {match.parcels?.price && (
                        <p className="text-sm">{payoutDisplay(match.parcels.price)}</p>
                      )}
                      <div className="flex gap-2">
                        {/* Show "Mark Collected" if parcel hasn't been collected yet */}
                        {(!match.parcels?.status || match.parcels?.status === "matched" || match.parcels?.status === "pending") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setShowCollectionDialog(match.id);
                              setCollectionPhoto(null);
                              setCollectionGeoCoords(null);
                              setCollectionGeoError(null);
                            }}
                          >
                            <Package className="w-3.5 h-3.5 mr-1.5" />
                            Mark Collected
                          </Button>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setShowDeliveryDialog(match.id);
                            setDeliveryPhoto(null);
                            setGeoCoords(null);
                            setGeoError(null);
                          }}
                        >
                          <Camera className="w-3.5 h-3.5 mr-1.5" />
                          Mark as Delivered
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => {
                            setShowCancelDialog(match.id);
                            setCancelReason("");
                          }}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* Delivered */}
              <TabsContent value="delivered" className="space-y-3">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : deliveredMatches.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No delivered parcels yet.</p>
                ) : (
                  deliveredMatches.map(match => (
                    <div key={match.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <CheckCircle className="w-4 h-4 text-success" />
                          {match.parcels?.pickup_location} → {match.parcels?.dropoff_location}
                        </div>
                        <Badge className={
                          match.parcels?.status === "delivered_verified"
                            ? "bg-success/10 text-success"
                            : match.parcels?.status === "delivered"
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                        }>
                          {match.parcels?.status === "delivered_verified"
                            ? "Verified ✓"
                            : match.parcels?.status === "delivered"
                              ? "Delivered ✓"
                              : "Pending Verification"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="flex items-center gap-1"><Scale className="w-3 h-3" />Size: {getBandLabel(match.parcels?.weight_band) || `${match.parcels?.weight_kg || "?"}kg`}</p>
                        {match.parcels?.suburb && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />Suburb: {match.parcels.suburb}</p>}
                        {match.parcels?.pickup_address && <p>Pickup: {match.parcels.pickup_address}</p>}
                        {match.parcels?.delivery_address && <p>Drop-off: {match.parcels.delivery_address}</p>}
                        {match.parcels?.pickup_earliest && (
                          <p className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />Pickup: {match.parcels.pickup_earliest} – {match.parcels.pickup_latest}</p>
                        )}
                        {match.parcels?.sender_name && <p>Sender: {match.parcels.sender_name}</p>}
                        {match.parcels?.sender_phone && <p>Phone: {match.parcels.sender_phone}</p>}
                        {match.parcels?.recipient_name && <p>Recipient: {match.parcels.recipient_name}</p>}
                        {match.parcels?.recipient_phone && <p>Recipient Phone: {match.parcels.recipient_phone}</p>}
                      </div>
                      {match.parcels?.price && (
                        <p className="text-sm">{payoutDisplay(match.parcels.price)}</p>
                      )}
                      {(match.parcels?.status === "delivered" || match.parcels?.status === "delivered_verified") && (
                        <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-xs">
                          <p className="font-medium text-success">💰 Payment Information</p>
                          <p className="text-foreground mt-1">
                            {match.parcels?.status === "delivered_verified"
                              ? "Your delivery has been verified! Payment is being processed."
                              : (() => {
                                  const day = new Date().getDay();
                                  return day >= 1 && day <= 4
                                    ? "Payment will be made within 72 hours."
                                    : "Payment will be made on Wednesday.";
                                })()
                            }
                          </p>
                        </div>
                      )}
                      {(match.parcels?.status === "pending_confirmation" || match.parcels?.status === "delivered_pending_verification") && (
                        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-xs">
                          <p className="font-medium text-warning">⏳ Awaiting Admin Verification</p>
                          <p className="text-foreground mt-1">Your delivery proof has been submitted. An admin will review and verify it shortly.</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Cancel Dialog */}
      <Dialog open={!!showCancelDialog} onOpenChange={(open) => { if (!open) setShowCancelDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Delivery</DialogTitle>
            <DialogDescription>Please select a reason for cancelling this delivery.</DialogDescription>
          </DialogHeader>
          <RadioGroup value={cancelReason} onValueChange={setCancelReason} className="space-y-3">
            {CANCEL_REASONS.map(reason => (
              <div key={reason} className="flex items-center space-x-2">
                <RadioGroupItem value={reason} id={reason} />
                <Label htmlFor={reason}>{reason}</Label>
              </div>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(null)}>Back</Button>
            <Button
              variant="destructive"
              disabled={!cancelReason || cancelling === showCancelDialog}
              onClick={handleCancel}
            >
              {cancelling ? "Cancelling..." : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Proof Dialog — both photo AND geotag required */}
      <Dialog open={!!showDeliveryDialog} onOpenChange={(open) => { if (!open) { setShowDeliveryDialog(null); setGeoCoords(null); setGeoError(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Delivery Proof</DialogTitle>
            <DialogDescription>Both a photo and GPS location are required as proof of delivery.</DialogDescription>
          </DialogHeader>

          {/* Photo upload */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => photoInputRef.current?.click()}
          >
            {deliveryPhoto ? (
              <div className="space-y-2">
                <CheckCircle className="w-8 h-8 text-success mx-auto" />
                <p className="text-sm text-foreground">{deliveryPhoto.name}</p>
                <p className="text-xs text-muted-foreground">Click to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Click to upload photo <span className="text-destructive">*</span></p>
              </div>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setDeliveryPhoto(file);
              }}
            />
          </div>

          {/* Geotag — required */}
          <div className="border border-border rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Tag My Location <span className="text-destructive">*</span>
            </p>
            {geoCoords ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Location tagged: {geoCoords.lat.toFixed(5)}, {geoCoords.lng.toFixed(5)}
                </p>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleTagLocation} disabled={geoLoading}>
                {geoLoading ? "Getting location..." : "Capture GPS Location"}
              </Button>
            )}
            {geoError && <p className="text-xs text-destructive">{geoError}</p>}
          </div>

          {(!deliveryPhoto || !geoCoords) && (
            <p className="text-xs text-destructive">Both photo and GPS location must be provided before submitting.</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryDialog(null)}>Back</Button>
            <Button
              disabled={!deliveryPhoto || !geoCoords || submittingProof}
              onClick={handleSubmitDeliveryProof}
            >
              {submittingProof ? "Submitting..." : "Submit Proof"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collection Proof Dialog */}
      <Dialog open={!!showCollectionDialog} onOpenChange={(open) => { if (!open) { setShowCollectionDialog(null); setCollectionGeoCoords(null); setCollectionGeoError(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Collection Proof</DialogTitle>
            <DialogDescription>Upload a photo of the parcel at pickup and tag your GPS location.</DialogDescription>
          </DialogHeader>

          {/* Photo upload */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => collectionPhotoInputRef.current?.click()}
          >
            {collectionPhoto ? (
              <div className="space-y-2">
                <CheckCircle className="w-8 h-8 text-success mx-auto" />
                <p className="text-sm text-foreground">{collectionPhoto.name}</p>
                <p className="text-xs text-muted-foreground">Click to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Click to upload photo <span className="text-destructive">*</span></p>
              </div>
            )}
            <input
              ref={collectionPhotoInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setCollectionPhoto(file);
              }}
            />
          </div>

          {/* Geotag */}
          <div className="border border-border rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Tag Pickup Location <span className="text-destructive">*</span>
            </p>
            {collectionGeoCoords ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Location tagged: {collectionGeoCoords.lat.toFixed(5)}, {collectionGeoCoords.lng.toFixed(5)}
                </p>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleTagCollectionLocation} disabled={collectionGeoLoading}>
                {collectionGeoLoading ? "Getting location..." : "Capture GPS Location"}
              </Button>
            )}
            {collectionGeoError && <p className="text-xs text-destructive">{collectionGeoError}</p>}
          </div>

          {(!collectionPhoto || !collectionGeoCoords) && (
            <p className="text-xs text-destructive">Both photo and GPS location must be provided.</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCollectionDialog(null)}>Back</Button>
            <Button
              disabled={!collectionPhoto || !collectionGeoCoords || submittingCollection}
              onClick={handleSubmitCollectionProof}
            >
              {submittingCollection ? "Submitting..." : "Confirm Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TravelerDashboard;
