import { useEffect, useState } from "react";

/**
 * Animated top-of-page loading bar shown during lazy-load Suspense.
 * Fills to ~90% with an ease-out curve, then completes on unmount.
 */
const PageLoadingBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Quick jump to 30%, then slow crawl to 90%
    const t1 = setTimeout(() => setProgress(30), 100);
    const t2 = setTimeout(() => setProgress(60), 400);
    const t3 = setTimeout(() => setProgress(85), 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-background">
      {/* Top progress bar */}
      <div className="h-1 w-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
          <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
          <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
};

export default PageLoadingBar;
