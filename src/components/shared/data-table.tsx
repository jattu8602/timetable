"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowUpDown, Plus, Pencil, Trash2, RotateCcw, Upload, Search } from "lucide-react";
import { BulkImportDialog } from "@/components/shared/bulk-import-dialog";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onDeleteBulk?: (items: T[]) => void;
  onRestore?: (item: T) => void;
  deletedKey?: string;
  addLabel?: string;
  bulkImportEndpoint?: string;
  bulkImportLabel?: string;
  bulkImportExample?: string;
  showDuplicateOptions?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchable = true,
  searchKeys,
  onAdd,
  onEdit,
  onDelete,
  onDeleteBulk,
  onRestore,
  deletedKey,
  addLabel = "Add New",
  bulkImportEndpoint,
  bulkImportLabel,
  bulkImportExample,
  showDuplicateOptions = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const filtered = searchable
    ? data.filter((item) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const keys = searchKeys ?? (Object.keys(data[0] ?? {}) as (keyof T)[]);
        return keys.some((k) => {
          const val = item[k];
          return val != null && String(val).toLowerCase().includes(q);
        });
      })
    : data;

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as Record<string, unknown>)[sortKey as string];
    const bVal = (b as Record<string, unknown>)[sortKey as string];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortDir === "asc" ? cmp : -cmp;
  });

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleBulkDelete() {
    if (!onDeleteBulk) return;
    const itemsToDelete = data.filter((item) => selected.has(keyExtractor(item)));
    onDeleteBulk(itemsToDelete);
    setSelected(new Set());
    setBulkConfirmOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {searchable && (
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 max-sm:w-full max-sm:justify-end">
          {onDeleteBulk && selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setBulkConfirmOpen(true)}>
              <Trash2 className="mr-1 h-4 w-4" />
              Delete Selected ({selected.size})
            </Button>
          )}
          {bulkImportEndpoint && (
            <>
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="mr-1 h-4 w-4" />
                {bulkImportLabel || "Import"}
              </Button>
              <BulkImportDialog
                open={importOpen}
                onOpenChange={setImportOpen}
                endpoint={bulkImportEndpoint}
                entityLabel={addLabel.toLowerCase()}
                exampleCSV={bulkImportExample || ""}
                showDuplicateOptions={showDuplicateOptions}
              />
            </>
          )}
          {onAdd && (
            <Button onClick={onAdd} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-[22px] border border-lines bg-surface shadow-card-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {onDeleteBulk && (
                <TableHead className="w-[50px] text-center pl-4">
                  <Checkbox 
                    checked={sorted.length > 0 && selected.size === sorted.length}
                    onCheckedChange={(c) => {
                      if (c) setSelected(new Set(sorted.map(keyExtractor)));
                      else setSelected(new Set());
                    }}
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead key={String(col.key)}>
                  {col.sortable ? (
                    <button
                      onClick={() => toggleSort(String(col.key))}
                      className="flex items-center gap-1 font-bold text-muted-foreground"
                    >
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
              {(onEdit || onDelete) && <TableHead className="w-24" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0) + (onDeleteBulk ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((item) => {
                const id = keyExtractor(item);
                return (
                  <TableRow key={id}>
                    {onDeleteBulk && (
                      <TableCell className="pl-4">
                        <Checkbox 
                          checked={selected.has(id)}
                          onCheckedChange={(c) => {
                            const next = new Set(selected);
                            if (c) next.add(id);
                            else next.delete(id);
                            setSelected(next);
                          }}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={String(col.key)}>
                        {col.render
                          ? col.render(item)
                          : String(
                              (item as Record<string, unknown>)[col.key as string] ?? ""
                            )}
                      </TableCell>
                    ))}
                    {(onEdit || onDelete || onRestore) && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {deletedKey && onRestore && (item as Record<string, unknown>)[deletedKey]
                            ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRestore(item)}
                                title="Restore"
                              >
                                <RotateCcw className="h-4 w-4 text-success" />
                              </Button>
                            )
                            : onDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(item)}
                              >
                                <Trash2 className="h-4 w-4 text-error" />
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selected.size} items? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

