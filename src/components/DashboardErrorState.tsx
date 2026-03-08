import { WifiOff, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardErrorStateProps {
  isOffline: boolean;
  error: string | null;
  onRetry: () => void;
}

const DashboardErrorState = ({ isOffline, error, onRetry }: DashboardErrorStateProps) => {
  if (isOffline) {
    return (
      <div className="text-center py-12 space-y-3">
        <WifiOff className="w-12 h-12 text-muted-foreground mx-auto" />
        <p className="font-medium text-foreground">You're offline</p>
        <p className="text-sm text-muted-foreground">Check your internet connection and try again.</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        <p className="font-medium text-foreground">Failed to load data</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  return null;
};

export default DashboardErrorState;
