import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, CalendarIcon, MapPin, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { CITIES } from "@/config/cities";

interface PostTripProps {
  onTripPosted: () => void;
}

const PostTrip = ({ onTripPosted }: PostTripProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [travelDate, setTravelDate] = useState<Date>();
  const [form, setForm] = useState({
    origin_city: "",
    destination_city: "",
    available_weight_kg: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { data: profileId } = await supabase.rpc("get_profile_id", { _auth_uid: user.id });
      if (!profileId) {
        toast({ title: "Profile not found. Please register first.", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("trips").insert({
        traveler_id: profileId,
        origin_city: form.origin_city,
        destination_city: form.destination_city,
        travel_date: format(travelDate!, "yyyy-MM-dd"),
        available_weight_kg: parseFloat(form.available_weight_kg),
        notes: form.notes || null,
      } as any);

      if (error) throw error;

      toast({ title: "Trip posted!", description: "We'll notify you of matching parcels." });

      // Belt-and-suspenders: call find-matching-parcels as fallback
      try {
        const { data: recentTrip } = await supabase
          .from("trips")
          .select("id")
          .eq("traveler_id", profileId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (recentTrip) {
          await supabase.functions.invoke("find-matching-parcels", {
            body: { tripId: recentTrip.id },
          });

          // Check for earlier traveler reassignment opportunities
          try {
            await supabase.functions.invoke("check-earlier-traveler", {
              body: { tripId: recentTrip.id },
            });
          } catch {
            // Silent — best-effort
          }
        }
      } catch {
        // Silent fallback — trigger should have handled it
      }
    } catch (err: any) {
      toast({ title: "Failed to post trip", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-xl p-6">
      <h3 className="font-display font-bold text-lg text-foreground">Post a New Trip</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Origin City</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.origin_city}
            onChange={(e) => setForm(f => ({ ...f, origin_city: e.target.value }))}
            required
          >
            <option value="">Select origin</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Destination City</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.destination_city}
            onChange={(e) => setForm(f => ({ ...f, destination_city: e.target.value }))}
            required
          >
            <option value="">Select destination</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />Travel Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !travelDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {travelDate ? format(travelDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={travelDate}
                onSelect={setTravelDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" />Available Weight (kg)</Label>
          <Input
            type="number"
            min="0.5"
            step="0.5"
            placeholder="e.g. 20"
            value={form.available_weight_kg}
            onChange={(e) => setForm(f => ({ ...f, available_weight_kg: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Textarea
          placeholder="Any details about your trip..."
          value={form.notes}
          onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
        />
      </div>

      <Button type="submit" variant="coral" className="w-full" disabled={loading || !travelDate}>
        {loading ? "Posting..." : "Post Trip"}
      </Button>
    </form>
  );
};

export default PostTrip;
