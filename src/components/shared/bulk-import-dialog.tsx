"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, Loader2, File, CheckCircle, XCircle } from "lucide-react";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: string;
  entityLabel: string;
  exampleCSV: string;
  showDuplicateOptions?: boolean;
}

export function BulkImportDialog({ 
  open, 
  onOpenChange, 
  endpoint, 
  entityLabel, 
  exampleCSV,
  showDuplicateOptions = false 
}: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [duplicateAction, setDuplicateAction] = useState<"merge" | "skip">("merge");
  const [result, setResult] = useState<{ created: number; updated?: number; skipped?: number; errors: string[] } | null>(null);
  const [progress, setProgress] = useState<{ processed: number, total: number }>({ processed: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (jobId && !result) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/import/status?jobId=${jobId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'completed') {
              setResult({
                created: data.result?.created ?? 0,
                updated: data.result?.updated ?? 0,
                skipped: data.result?.skipped ?? 0,
                errors: data.result?.errors ?? []
              });
              setImporting(false);
              setJobId(null);
            } else if (data.status === 'failed') {
              setResult({ created: 0, errors: [data.error || "Job failed unexpectedly"] });
              setImporting(false);
              setJobId(null);
            } else if (data.progress) {
              setProgress(data.progress);
            }
          }
        } catch (e) {
          console.error("Failed to poll status", e);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [jobId, result]);

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    setResult(null);
    setProgress({ processed: 0, total: 0 });
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (showDuplicateOptions) {
        formData.append("duplicateAction", duplicateAction);
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to start import job");
      }

      if (data.jobId) {
        setJobId(data.jobId);
      } else if (data.created !== undefined) {
        // Fallback for synchronous endpoints that don't use BullMQ yet
        setResult({
          created: data.created ?? 0,
          updated: data.updated,
          skipped: data.skipped,
          errors: data.errors ?? []
        });
        setImporting(false);
      }
    } catch (e) {
      setResult({ created: 0, errors: [(e as Error).message] });
      setImporting(false);
    }
  }

  function handleClose() {
    setFile(null);
    setResult(null);
    setJobId(null);
    setImporting(false);
    setProgress({ processed: 0, total: 0 });
    onOpenChange(false);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import {entityLabel}</DialogTitle>
          <DialogDescription>
            Upload a .csv or .xlsx file to bulk import {entityLabel}.
          </DialogDescription>
        </DialogHeader>

        {!importing && !result && (
          <div className="space-y-4 py-2">
            {!file ? (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-lines bg-canvas-2/50 p-12 text-center cursor-pointer hover:bg-canvas-2 transition-colors"
              >
                <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-ink">Click or drag file to upload</p>
                <p className="mt-1 text-xs text-muted-foreground">Supports .csv and .xlsx</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-lines bg-surface p-6">
                <File className="mb-2 h-10 w-10 text-brand-blue" />
                <p className="text-sm font-medium text-ink">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                <Button variant="ghost" size="sm" className="mt-4" onClick={() => setFile(null)}>
                  Remove file
                </Button>
              </div>
            )}

            {file && showDuplicateOptions && (
              <div className="flex items-center justify-between rounded-lg border border-lines p-3">
                <p className="text-sm font-medium">Duplicate Action</p>
                <select 
                  value={duplicateAction} 
                  onChange={(e) => setDuplicateAction(e.target.value as any)}
                  className="rounded-md border border-lines bg-white px-2 py-1 text-sm text-ink outline-none"
                >
                  <option value="merge">Update existing records</option>
                  <option value="skip">Skip existing records</option>
                </select>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleImport} disabled={!file}>
                Start Import
              </Button>
            </DialogFooter>
          </div>
        )}

        {importing && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            <p className="text-sm font-medium text-ink">Processing import...</p>
            {progress.total > 0 && (
              <p className="text-xs text-muted-foreground">
                Row {progress.processed} of {progress.total}
              </p>
            )}
            {jobId && <p className="text-xs text-muted-foreground italic">Running in background job...</p>}
          </div>
        )}

        {result && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 rounded-xl border border-lines bg-surface p-4">
              {result.errors.length === 0 ? (
                <CheckCircle className="h-8 w-8 text-success" />
              ) : result.created > 0 ? (
                <CheckCircle className="h-8 w-8 text-warning" />
              ) : (
                <XCircle className="h-8 w-8 text-error" />
              )}
              <div>
                <h3 className="text-sm font-bold text-ink">Import Complete</h3>
                <p className="text-xs text-muted-foreground">
                  Created: {result.created} | Updated: {result.updated ?? 0} | Skipped: {result.skipped ?? 0}
                </p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="mb-2 text-sm font-bold text-destructive">Rows with errors ({result.errors.length})</p>
                <div className="max-h-40 overflow-auto">
                  <ul className="list-inside list-disc text-xs text-muted-foreground space-y-1">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
