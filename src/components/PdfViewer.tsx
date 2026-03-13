import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerProps {
  signedUrl: string;
}

const PdfViewer = ({ signedUrl }: PdfViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        if (signedUrl.startsWith("blob:")) {
          const response = await fetch(signedUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch PDF blob (HTTP ${response.status})`);
          }
          const data = new Uint8Array(await response.arrayBuffer());
          loadingTask = pdfjsLib.getDocument({ data });
        } else {
          loadingTask = pdfjsLib.getDocument({ url: signedUrl });
        }

        const pdfDoc = await loadingTask.promise;

        if (cancelled) {
          await pdfDoc.destroy();
          return;
        }

        setPdf((prev) => {
          void prev?.destroy();
          return pdfDoc;
        });
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load PDF";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadPdf();

    return () => {
      cancelled = true;
      void loadingTask?.destroy();
    };
  }, [signedUrl]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    let cancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Failed to initialize PDF canvas");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to render PDF page";
        setError(message);
      }
    };

    void renderPage();

    return () => {
      cancelled = true;
    };
  }, [pdf, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading PDF…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="overflow-auto max-h-[70vh] w-full flex justify-center">
        <canvas ref={canvasRef} className="border border-border rounded-lg" />
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
