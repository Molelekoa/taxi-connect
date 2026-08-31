import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Wallet, RefreshCw, Search, Landmark, CheckCircle2, Clock, AlertCircle, type LucideIcon } from "lucide-react";

interface Payout {
  id: string;
  match_id: string;
  parcel_id: string | null;
  traveler_id: string | null;
  amount: number;
  payout_rate: number;
  status: "pending" | "paid" | "failed" | "voided";
  notes: string | null;
  paid_at: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  bank_details: {
    bank_name: string | null;
    bank_account_holder: string | null;
    bank_account_number: string | null;
    bank_branch_code: string | null;
    bank_account_type: string | null;
  } | null;
  parcels: {
    pickup_location: string | null;
    dropoff_location: string | null;
  } | null;
}

const STATUS_STYLES: Record<string, { label: string; className: string; icon: LucideIcon }> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
  paid: { label: "Paid", className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  failed: { label: "Failed", className: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
  voided: { label: "Voided", className: "bg-gray-100 text-gray-600 border-gray-200", icon: AlertCircle },
};

const AdminPayouts = () => {
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<Payout[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [marking, setMarking] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchPayouts = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await supabase.functions.invoke("list-payouts", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      setPayouts(res.data?.payouts || []);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayouts(); }, []);

  const handleMarkPaid = async (p: Payout) => {
    setMarking(p.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await supabase.functions.invoke("mark-payout-paid", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { payoutId: p.id, notes: notes[p.id] || null },
      });
      if (res.error) throw new Error(res.error.message);
      toast({ title: "Payout marked as paid" });
      await fetchPayouts();
    } catch (err: any) {
      toast({ title: "Failed to update payout", description: err.message, variant: "destructive" });
    } finally {
      setMarking(null);
    }
  };

  const filtered = useMemo(() => {
    let list = payouts || [];
    if (statusFilter !== "all") list = list.filter(p => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.profiles?.full_name || "").toLowerCase().includes(q) ||
        (p.profiles?.email || "").toLowerCase().includes(q) ||
        (p.bank_details?.bank_account_number || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [payouts, statusFilter, search]);

  const totals = useMemo(() => {
    const pendingTotal = (payouts || [])
      .filter(p => p.status === "pending")
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    const paidTotal = (payouts || [])
      .filter(p => p.status === "paid")
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    return { pendingTotal, paidTotal };
  }, [payouts]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container-narrow max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
              <Wallet className="w-6 h-6 text-primary" /> Traveler Payouts
            </h1>
            <Button variant="outline" size="sm" onClick={fetchPayouts} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Pending payouts</p>
              <p className="text-2xl font-bold text-amber-600">R{totals.pendingTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Paid to date</p>
              <p className="text-2xl font-bold text-success">R{totals.paidTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search traveler, email or account number..."
                className="pl-9"
              />
            </div>
            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="voided">Voided</option>
            </select>
          </div>

          {fetchError ? (
            <div className="text-center py-12 border border-destructive/30 bg-destructive/5 rounded-xl">
              <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
              <p className="text-destructive font-medium">{fetchError}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={fetchPayouts}>Retry</Button>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payouts found. Payouts are generated automatically when you approve a delivery.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((p) => {
                const cfg = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                const Icon = cfg.icon;
                return (
                  <div key={p.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-foreground">{p.profiles?.full_name || "Traveler"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {p.profiles?.email} {p.profiles?.phone ? `· ${p.profiles.phone}` : ""}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {p.parcels?.pickup_location || "?"} → {p.parcels?.dropoff_location || "?"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">R{Number(p.amount).toFixed(2)}</div>
                        <Badge className={`${cfg.className}`}><Icon className="w-3 h-3 mr-1" />{cfg.label}</Badge>
                      </div>
                    </div>

                    <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs">
                      <p className="font-medium text-foreground flex items-center gap-1 mb-1.5">
                        <Landmark className="w-3 h-3" /> Payout account
                      </p>
                      {p.bank_details?.bank_name || p.bank_details?.bank_account_holder ? (
                        <div className="text-muted-foreground space-y-0.5">
                          <p>Bank: {p.bank_details.bank_name || "—"} {p.bank_details.bank_account_type ? `(${p.bank_details.bank_account_type})` : ""}</p>
                          <p>Holder: {p.bank_details.bank_account_holder || "—"}</p>
                          <p>Account: ···{String(p.bank_details.bank_account_number || "").slice(-4) || "—"}</p>
                          <p>Branch: {p.bank_details.bank_branch_code || "—"}</p>
                        </div>
                      ) : (
                        <p className="text-amber-600">No bank details on file — contact traveler to collect.</p>
                      )}
                    </div>

                    {p.status === "pending" && (
                      <div className="flex flex-col sm:flex-row gap-2 items-end">
                        <div className="flex-1">
                          <Label htmlFor={`note-${p.id}`} className="text-xs">Payment reference / note (optional)</Label>
                          <Input
                            id={`note-${p.id}`}
                            value={notes[p.id] || ""}
                            onChange={(e) => setNotes(n => ({ ...n, [p.id]: e.target.value }))}
                            placeholder="e.g. EFT ref / bank slip"
                          />
                        </div>
                        <Button
                          variant="hero"
                          onClick={() => handleMarkPaid(p)}
                          disabled={marking === p.id}
                        >
                          {marking === p.id ? "Updating..." : "Mark as Paid"}
                        </Button>
                      </div>
                    )}
                    {p.notes && <p className="text-xs text-muted-foreground">Note: {p.notes}</p>}
                    {p.paid_at && <p className="text-xs text-muted-foreground">Paid: {new Date(p.paid_at).toLocaleString()}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPayouts;
