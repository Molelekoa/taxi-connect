import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, MapPin, Scale } from "lucide-react";

interface PostTripProps {
  onTripPosted: () => void;
}

const CITIES = [
  "Johannesburg", "Pretoria", "Durban", "Cape Town", "Bloemfontein",
  "Maseru", "Harare", "Bulawayo",
];

const PostTrip = ({ onTripPosted }: PostTripProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    origin_city: "",
    destination_city: "",
    travel_date: "",
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
        travel_date: form.travel_date,
        available_weight_kg: parseFloat(form.available_weight_kg),
        notes: form.notes || null,
      } as any);

      if (error) throw error;

      toast({ title: "Trip posted!", description: "We'll notify you of matching parcels." });
      setForm({ origin_city: "", destination_city: "", travel_date: "", available_weight_kg: "", notes: "" });
      onTripPosted();
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
          <Label className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />Travel Date</Label>
          <Input
            type="date"
            value={form.travel_date}
            onChange={(e) => setForm(f => ({ ...f, travel_date: e.target.value }))}
            required
          />
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

      <Button type="submit" variant="coral" className="w-full" disabled={loading}>
        {loading ? "Posting..." : "Post Trip"}
      </Button>
    </form>
  );
};

export default PostTrip;
