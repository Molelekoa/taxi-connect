import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, MapPin, CalendarDays, Scale, CheckCircle, Clock, Truck, Search, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostTrip from "@/components/PostTrip";

const TravelerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [travelerStatus, setTravelerStatus] = useState<string>("pending");
  const [trips, setTrips] = useState<any[]>([]);
  const [pendingMatches, setPendingMatches] = useState<any[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<any[]>([]);
  const [browseParcels, setBrowseParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: pid } = await supabase.rpc("get_profile_id", { _auth_uid: user.id });
    if (!pid) { setLoading(false); return; }
    setProfileId(pid);

    // Check traveler approval status
    const { data: tp } = await supabase
      .from("traveler_profiles")
      .select("status")
      .eq("profile_id", pid)
      .single() as { data: any };
    setTravelerStatus(tp?.status || "pending");

    // Fetch trips
    const { data: tripsData } = await supabase
      .from("trips")
      .select("*")
      .order("travel_date", { ascending: true }) as { data: any[] | null };
    setTrips(tripsData || []);

    // Fetch pending matches for traveler's trips
    const { data: pending } = await supabase
      .from("matches")
      .select("*, parcels(*), trips(*)")
      .eq("status", "pending") as { data: any[] | null };
    setPendingMatches((pending || []).filter((m: any) => m.trips?.traveler_id === pid));

    // Fetch accepted matches
    const { data: accepted } = await supabase
      .from("matches")
      .select("*, parcels(*), trips(*)")
      .eq("status", "accepted") as { data: any[] | null };
    setAcceptedMatches((accepted || []).filter((m: any) => m.trips?.traveler_id === pid));

    // Browse available parcels (only for approved travelers)
    if (tp?.status === "approved") {
      // Get traveler routes
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
          // Fetch pending parcels - the RLS policy will filter to pending only
          const { data: allPending } = await supabase
            .from("parcels")
            .select("*")
            .eq("status", "pending") as { data: any[] | null };

          // Client-side filter by route match (case-insensitive)
          const matched = (allPending || []).filter((p: any) => {
            const pickup = (p.pickup_location || "").toLowerCase();
            const dropoff = (p.dropoff_location || "").toLowerCase();
            return routes.some((r: any) => {
              const from = (r.route_from || "").toLowerCase();
              const to = (r.route_to || "").toLowerCase();
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

  useEffect(() => { fetchData(); }, [user]);

  const handleAccept = async (matchId: string) => {
    setAccepting(matchId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("accept-match", {
        body: { matchId },
      });

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

      const res = await supabase.functions.invoke("claim-parcel", {
        body: { parcelId },
      });

      if (res.error) throw new Error(res.error.message);

      toast({ title: "Parcel claimed!", description: "The sender has been notified." });
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to claim", description: err.message, variant: "destructive" });
    } finally {
      setClaiming(null);
    }
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

            {/* Approval status banner */}
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
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
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
                              {parcel.pickup_location} → {parcel.dropoff_location}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Scale className="w-3 h-3" />{parcel.weight_kg || "?"}kg</span>
                              {parcel.pickup_earliest && (
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" />
                                  {parcel.pickup_earliest} – {parcel.pickup_latest}
                                </span>
                              )}
                              {parcel.dimensions && <span>{parcel.dimensions}</span>}
                              {parcel.price && <span className="font-medium text-foreground">You earn: R{Math.round(Number(parcel.price) * 0.65)}</span>}
                            </div>
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
                            {match.parcels?.pickup_location} → {match.parcels?.dropoff_location}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Scale className="w-3 h-3" />{match.parcels?.weight_kg || "?"}kg</span>
                            {match.parcels?.pickup_earliest && (
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {match.parcels.pickup_earliest} – {match.parcels.pickup_latest}
                              </span>
                            )}
                          </div>
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
                  <p className="text-muted-foreground text-center py-8">No accepted deliveries yet.</p>
                ) : (
                  acceptedMatches.map(match => (
                    <div key={match.id} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <CheckCircle className="w-4 h-4 text-success" />
                          {match.parcels?.pickup_location} → {match.parcels?.dropoff_location}
                        </div>
                        <Badge className="bg-success/10 text-success">accepted</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Weight: {match.parcels?.weight_kg || "?"}kg</p>
                        {match.parcels?.sender_name && <p>Sender: {match.parcels.sender_name}</p>}
                        {match.parcels?.sender_phone && <p>Phone: {match.parcels.sender_phone}</p>}
                        {match.parcels?.sender_email && <p>Email: {match.parcels.sender_email}</p>}
                        {match.accepted_at && <p>Accepted: {new Date(match.accepted_at).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TravelerDashboard;
