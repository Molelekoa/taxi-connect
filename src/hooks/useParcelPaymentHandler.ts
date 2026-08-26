import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { openYocoCheckoutPopup, YOCO_PUBLIC_KEY } from "@/lib/yocoSdk";

interface PaymentParams {
  parcelId: string;
  amount: number; // in ZAR — display only; the server computes the charge
  profileId: string;
}

export const useParcelPaymentHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const initiatePayment = async ({ parcelId, amount, profileId }: PaymentParams) => {
    setIsProcessing(true);
    try {
      // Insert payment record (server overwrites the authoritative amount)
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

      // Server creates the Yoco checkout session and returns its id.
      // The charge amount is derived entirely from stored parcel data.
      const { data, error } = await supabase.functions.invoke("process-parcel-payment", {
        body: {
          parcelId,
          paymentRecordId: paymentRecord.id,
        },
      });

      if (error || !data?.checkoutId) {
        throw new Error(error?.message || "Failed to create checkout session");
      }

      const recordId = paymentRecord.id as string;

      // Preferred flow: in-app popup so the user never leaves Parcolo.
      if (YOCO_PUBLIC_KEY) {
        const popup = await openYocoCheckoutPopup({
          checkoutId: data.checkoutId,
          name: "Parcolo",
          description: "Parcel delivery payment",
        });

        if (!popup.unavailable) {
          if (popup.completed) {
            navigate(`/parcel-payment-success?payment_id=${recordId}`);
          } else {
            navigate(`/parcel-payment-cancelled?payment_id=${recordId}`);
            if (popup.error) {
              toast({
                title: "Payment not completed",
                description: popup.error,
                variant: "destructive",
              });
            }
          }
          return; // handled in-app — do not redirect
        }
        // Popup unavailable → fall through to hosted-page redirect below
      }

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
