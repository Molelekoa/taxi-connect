import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentParams {
  parcelId: string;
  amount: number; // in ZAR (will be converted to cents)
  profileId: string;
}

export const useParcelPaymentHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const initiatePayment = async ({ parcelId, amount, profileId }: PaymentParams) => {
    setIsProcessing(true);
    try {
      // Insert payment record
      const { data: paymentRecord, error: insertError } = await supabase
        .from("payment_records")
        .insert({
          user_id: profileId,
          parcel_id: parcelId,
          amount,
          currency: "ZAR",
          status: "pending",
          payment_type: "parcel",
        } as any)
        .select("id")
        .single();

      if (insertError || !paymentRecord) {
        throw new Error(insertError?.message || "Failed to create payment record");
      }

      // Update parcel with payment info
      await supabase
        .from("parcels")
        .update({
          payment_status: "pending",
          payment_record_id: paymentRecord.id,
          calculated_price: amount,
        } as any)
        .eq("id", parcelId);

      // Call edge function to get Yoco checkout URL.
      // The server derives the charge amount from stored parcel data —
      // no amount is sent or trusted from the client.
      const { data, error } = await supabase.functions.invoke("process-parcel-payment", {
        body: {
          parcelId,
          paymentRecordId: paymentRecord.id,
        },
      });

      if (error || !data?.redirectUrl) {
        throw new Error(error?.message || "Failed to create checkout session");
      }

      // Redirect to Yoco
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      console.error("Payment error:", err);
      toast({
        title: "Payment failed",
        description: err.message || "Could not initiate payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return { initiatePayment, isProcessing };
};
