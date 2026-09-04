import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

/**
 * FCM push for the Capacitor Android app.
 *
 * NOTES
 * - This only runs on native mobile (Capacitor). In the plain web/PWA build it
 *   is a no-op, so it never pulls Firebase into the web bundle.
 * - Native FCM requires `google-services.json` in `android/app/` and a native
 *   rebuild in Android Studio (see README / Android shell notes).
 */

async function isNative(): Promise<boolean> {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Request permission and fetch the FCM token, then register it with Supabase. */
export async function registerForPushNotifications(): Promise<{ registered: boolean; reason?: string }> {
  if (!(await isNative())) {
    // Web/PWA or browser: no-op. Web push is handled separately (not FCM-native).
    return { registered: false, reason: "not-native" };
  }

  try {
    const { FirebaseMessaging } = await import("@capacitor-firebase/messaging");

    // Ionic-aware permission request (Android 13+ runtime permission).
    const perm = await FirebaseMessaging.requestPermissions();
    if (perm.receive === "denied") {
      return { registered: false, reason: "permission-denied" };
    }

    const tokenResult = await FirebaseMessaging.getToken();
    const token = tokenResult.token;
    if (!token) {
      return { registered: false, reason: "no-token" };
    }

    // Only register if a user is authenticated.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Store for later? Keep it simple: return unregistered; caller can retry.
      return { registered: false, reason: "not-authenticated" };
    }

    const res = await supabase.functions.invoke("register-device-token", {
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: { token, platform: "android" },
    });

    if (res.error) {
      console.error("register-device-token error:", res.error);
      return { registered: false, reason: "server-error" };
    }

    return { registered: true };
  } catch (err) {
    console.error("FCM registration error:", err);
    return { registered: false, reason: "error" };
  }
}
