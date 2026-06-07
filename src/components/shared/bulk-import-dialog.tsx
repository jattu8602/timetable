"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Loader2 } from "lucide-react";
import { parseCSV } from "@/lib/csv";

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
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [duplicateAction, setDuplicateAction] = useState<"merge" | "skip">("merge");
  const [result, setResult] = useState<{ created: number; updated?: number; skipped?: number; errors: string[] } | null>(null);

  function handlePreview() {
    const parsed = parseCSV(csvText);
    setPreview(parsed);
    setResult(null);
  }

  async function handleImport() {
    if (!preview || preview.rows.length === 0) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          rows: preview.rows, 
          duplicateAction: showDuplicateOptions ? duplicateAction : undefined 
        }),
      });
      const data = await res.json();
      setResult({ 
        created: data.created ?? 0, 
        updated: data.updated, 
        skipped: data.skipped, 
        errors: data.errors ?? [] 
      });
    } catch (e) {
      setResult({ created: 0, errors: [(e as Error).message] });
    } finally {
      setImporting(false);
    }
  }

  function handleClose() {
    setCsvText("");
    setPreview(null);
    setResult(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk Import {entityLabel}</DialogTitle>
          <DialogDescription>
            Paste CSV data below (header row required). Preview before importing.
          </DialogDescription>
        </DialogHeader>

        {!preview && !result && (
          <div className="space-y-3 py-2">
            <textarea
              rows={6}
              placeholder={`Paste CSV here...\n\ne.g.\n${exampleCSV}`}
              value={csvText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCsvText(e.target.value)}
              className="w-full rounded-[14px] border border-lines bg-surface px-4 py-3 font-mono text-xs text-ink outline-none transition-all placeholder:text-muted-foreground focus-visible:border-brand-blue focus-visible:ring-3 focus-visible:ring-brand-blue/20"
            />
            <Button onClick={handlePreview} disabled={!csvText.trim()}>
              Preview
            </Button>
          </div>
        )}

        {preview && !result && (
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {preview.rows.length} row(s) parsed. Review and confirm.
              </p>
              {showDuplicateOptions && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-muted-foreground">Duplicates:</label>
                  <select 
                    value={duplicateAction} 
                    onChange={(e) => setDuplicateAction(e.target.value as any)}
                    className="rounded-lg border border-lines bg-white p-1 text-xs text-ink outline-none"
                  >
                    <option value="merge">Merge (Overwrite)</option>
                    <option value="skip">Skip (Keep existing)</option>
                  </select>
                </div>
              )}
            </div>
            <div className="max-h-60 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {preview.headers.map((h) => (
                      <TableHead key={h} className="text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((row, i) => (
                    <TableRow key={i}>
                      {preview.headers.map((h) => (
                        <TableCell key={h} className="text-xs">{row[h] || "—"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreview(null)}>Edit</Button>
              <Button onClick={handleImport} disabled={importing}>
                {importing && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                {importing ? "Importing..." : `Import ${preview.rows.length} ${entityLabel}`}
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <p className="text-sm">
                Created: <strong>{result.created}</strong>
              </p>
              {result.updated !== undefined && (
                <p className="text-sm">
                  Updated/Merged: <strong>{result.updated}</strong>
                </p>
              )}
              {result.skipped !== undefined && (
                <p className="text-sm">
                  Skipped: <strong>{result.skipped}</strong>
                </p>
              )}
            </div>
            {result.errors.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <p className="mb-1 text-sm font-medium text-destructive">Errors</p>
                <ul className="list-inside list-disc text-xs text-muted-foreground">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
            <Button onClick={handleClose}>Done</Button>
          </div>
        )}

        {!preview && result && (
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

