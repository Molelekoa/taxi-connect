import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, MapPin, CalendarDays, Scale, CheckCircle, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SenderDashboard = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<any[]>([]);
  const [matchesByParcel, setMatchesByParcel] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      const { data: pid } = await supabase.rpc("get_profile_id", { _auth_uid: user.id });
      if (!pid) { setLoading(false); return; }

      // Fetch parcels
      const { data: parcelsData } = await supabase
        .from("parcels")
        .select("*")
        .order("created_at", { ascending: false }) as { data: any[] | null };
      setParcels(parcelsData || []);

      // Fetch matches for sender's parcels
      const { data: matchesData } = await supabase
        .from("matches")
        .select("*, trips(*, profiles:traveler_id(full_name, phone, email))")
        .eq("status", "accepted") as { data: any[] | null };

      const grouped: Record<string, any[]> = {};
      for (const m of matchesData || []) {
        if (!grouped[m.parcel_id]) grouped[m.parcel_id] = [];
        grouped[m.parcel_id].push(m);
      }
      setMatchesByParcel(grouped);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const statusConfig: Record<string, { className: string; icon: any }> = {
    pending: { className: "bg-warning/10 text-warning", icon: Clock },
    matched: { className: "bg-primary/10 text-primary", icon: CheckCircle },
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
                          {parcel.status}
                        </Badge>
                      </div>

                      {matches.length > 0 && (
                        <div className="bg-success/5 border border-success/20 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-semibold text-success flex items-center gap-1">
                            <User className="w-3 h-3" /> Traveler assigned
                          </p>
                          {matches.map(m => (
                            <div key={m.id} className="text-xs text-muted-foreground">
                              {m.trips?.profiles?.full_name && <p>Name: {m.trips.profiles.full_name}</p>}
                              {m.trips?.profiles?.phone && <p>Phone: {m.trips.profiles.phone}</p>}
                              {m.trips?.profiles?.email && <p>Email: {m.trips.profiles.email}</p>}
                              <p>Trip date: {m.trips?.travel_date}</p>
                            </div>
                          ))}
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
