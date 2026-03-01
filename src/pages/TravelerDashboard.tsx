import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, MapPin, CalendarDays, Scale, CheckCircle, Clock, Truck } from "lucide-react";
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
  const [trips, setTrips] = useState<any[]>([]);
  const [pendingMatches, setPendingMatches] = useState<any[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: pid } = await supabase.rpc("get_profile_id", { _auth_uid: user.id });
    if (!pid) { setLoading(false); return; }
    setProfileId(pid);

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
    // Filter to only this traveler's trips
    setPendingMatches((pending || []).filter((m: any) => m.trips?.traveler_id === pid));

    // Fetch accepted matches
    const { data: accepted } = await supabase
      .from("matches")
      .select("*, parcels(*), trips(*)")
      .eq("status", "accepted") as { data: any[] | null };
    setAcceptedMatches((accepted || []).filter((m: any) => m.trips?.traveler_id === pid));

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

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-success/10 text-success",
      completed: "bg-muted text-muted-foreground",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container-narrow max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display font-bold text-2xl text-foreground mb-6 flex items-center gap-2">
              <Truck className="w-6 h-6 text-primary" />
              Traveler Dashboard
            </h1>

            <Tabs defaultValue="trips" className="w-full">
              <TabsList className="mb-6 bg-secondary border border-border">
                <TabsTrigger value="trips">My Trips</TabsTrigger>
                <TabsTrigger value="available">
                  Available Parcels
                  {pendingMatches.length > 0 && (
                    <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                      {pendingMatches.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
              </TabsList>

              <TabsContent value="trips" className="space-y-6">
                <PostTrip onTripPosted={fetchData} />

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

              <TabsContent value="available" className="space-y-3">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : pendingMatches.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No matching parcels yet. Post a trip to get matched!</p>
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
                            {match.parcels?.dimensions && <span>{match.parcels.dimensions}</span>}
                          </div>
                          {match.parcels?.description && (
                            <p className="text-xs text-muted-foreground mt-2">{match.parcels.description}</p>
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
