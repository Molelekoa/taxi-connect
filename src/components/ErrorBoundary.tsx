import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/** Report frontend errors to error_logs table for admin visibility */
async function reportError(error: Error, errorInfo?: ErrorInfo) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const profileId = session?.user?.id
      ? (await supabase.rpc("get_profile_id", { _auth_uid: session.user.id })).data
      : null;

    // Use service-role-free insert — RLS won't allow anon inserts to error_logs,
    // so we call an edge function instead if no admin session is available.
    // For simplicity, we log via the functions invoke pattern.
    await supabase.functions.invoke("log-frontend-error", {
      body: {
        error_message: error.message,
        stack: error.stack?.slice(0, 2000),
        component_stack: errorInfo?.componentStack?.slice(0, 2000),
        url: window.location.href,
        user_agent: navigator.userAgent,
      },
    });
  } catch {
    // Silent — don't crash the error boundary itself
  }
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    reportError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3 break-words">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Button variant="outline" onClick={this.handleReset}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
