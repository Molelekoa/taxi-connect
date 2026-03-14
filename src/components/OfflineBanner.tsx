import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Full-screen overlay shown when the browser goes offline.
 * Automatically dismisses when connectivity is restored.
 */
const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="text-center max-w-sm mx-auto px-6">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <WifiOff className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="font-display font-bold text-xl text-foreground mb-2">
          You're Offline
        </h2>
        <p className="text-muted-foreground mb-6">
          It looks like you've lost your internet connection. The app will
          resume automatically once you're back online.
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default OfflineBanner;
