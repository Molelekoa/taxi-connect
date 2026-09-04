import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { registerForPushNotifications } from "@/lib/firebaseMessaging";

/**
 * Requests FCM push permission and registers the device token with Supabase.
 * Mount once at the app root. Runs only on native (Capacitor) and when a
 * session exists; no-ops on the plain web build.
 */
export function usePushNotifications() {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;

    let unsubscribe: (() => void) | undefined;

    const maybeRegister = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      attemptedRef.current = true;
      await registerForPushNotifications();
    };

    // Try immediately if already signed in, else wait for login.
    void maybeRegister();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !attemptedRef.current) {
        void maybeRegister();
      }
    });

    unsubscribe = sub.subscription.unsubscribe;

    return () => {
      unsubscribe?.();
    };
  }, []);
}
