"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  onRestore?: (item: T) => void;
  deletedKey?: string;
  addLabel?: string;
  bulkImportEndpoint?: string;
  bulkImportLabel?: string;
  bulkImportExample?: string;
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
  onRestore,
  deletedKey,
  addLabel = "Add New",
  bulkImportEndpoint,
  bulkImportLabel,
  bulkImportExample,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [importOpen, setImportOpen] = useState(false);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          {bulkImportEndpoint && (
            <>
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="mr-1 h-4 w-4" />
                {bulkImportLabel || "Import CSV"}
              </Button>
              <BulkImportDialog
                open={importOpen}
                onOpenChange={setImportOpen}
                endpoint={bulkImportEndpoint}
                entityLabel={addLabel.toLowerCase()}
                exampleCSV={bulkImportExample || ""}
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

      <div className="rounded-[22px] border border-lines bg-surface shadow-[0_4px_14px_rgba(37,97,153,.08)]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.key)}>
                  {col.sortable ? (
                    <button
                      onClick={() => toggleSort(String(col.key))}
                      className="flex items-center gap-1 font-medium text-muted"
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
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((item) => (
                <TableRow key={keyExtractor(item)}>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
