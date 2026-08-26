// Loads the Yoco web SDK once and opens a payment popup that stays on-site.
// Fallback-safe: if no public key is configured or the SDK fails to load,
// callers should use the classic redirect flow instead.

const YOCO_SDK_URL = "https://js.yoco.com/sdk/v1/yoco-sdk-web.js";

export const YOCO_PUBLIC_KEY = import.meta.env.VITE_YOCO_PUBLIC_KEY || "";

let sdkPromise: Promise<YocoConstructor | null> | null = null;

interface YocoConstructor {
  new (config: { publicKey: string }): {
    showPopup?: (options: Record<string, unknown>) => void;
    showBasicPopup?: (options: Record<string, unknown>) => void;
  };
}

declare global {
  interface Window {
    Yoco?: YocoConstructor;
  }
}

function loadYocoSdk(): Promise<YocoConstructor | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.Yoco) return Promise.resolve(window.Yoco);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = YOCO_SDK_URL;
    script.async = true;
    script.onload = () => resolve(window.Yoco ?? null);
    script.onerror = () => {
      console.error("Failed to load Yoco SDK");
      sdkPromise = null; // allow retry on next attempt
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}

export interface YocoPopupResult {
  /** true when the user completed payment (webhook remains source of truth) */
  completed: boolean;
  /** true when the popup could not be opened at all */
  unavailable: boolean;
  error?: string;
}

/**
 * Opens the Yoco payment popup for a server-created checkout.
 * Returns { completed: false, unavailable: true } when the popup cannot be
 * used so the caller can fall back to the hosted-page redirect.
 */
export async function openYocoCheckoutPopup(params: {
  checkoutId: string;
  name?: string;
  description?: string;
}): Promise<YocoPopupResult> {
  if (!YOCO_PUBLIC_KEY) return { completed: false, unavailable: true };

  const YocoCtor = await loadYocoSdk();
  if (!YocoCtor) return { completed: false, unavailable: true };

  return new Promise<YocoPopupResult>((resolve) => {
    let settled = false;
    const finish = (result: YocoPopupResult) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    // Safety net: if neither callback fires within 30 minutes, stop waiting.
    const timeout = setTimeout(
      () => finish({ completed: false, unavailable: false }),
      30 * 60 * 1000
    );

    const options: Record<string, unknown> = {
      checkoutId: params.checkoutId,
      name: params.name ?? "Parcolo",
      description: params.description ?? "Parcel delivery payment",
      callback: (result: { error?: { message?: string } | string }) => {
        clearTimeout(timeout);
        if (result?.error) {
          const message =
            typeof result.error === "string"
              ? result.error
              : result.error.message || "Payment was not completed";
          finish({ completed: false, unavailable: false, error: message });
        } else {
          finish({ completed: true, unavailable: false });
        }
      },
    };

    try {
      const instance = new YocoCtor({ publicKey: YOCO_PUBLIC_KEY });
      const show = instance.showPopup ?? instance.showBasicPopup;
      if (!show) throw new Error("Yoco SDK missing popup method");
      show.call(instance, options);
    } catch (err) {
      clearTimeout(timeout);
      console.error("Failed to open Yoco popup:", err);
      finish({ completed: false, unavailable: true });
    }
  });
}
