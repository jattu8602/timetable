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
import { ArrowUpDown, Plus, Pencil, Trash2, Search } from "lucide-react";

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
  addLabel?: string;
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
  addLabel = "Add New",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
        {onAdd && (
          <Button onClick={onAdd} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.key)}>
                  {col.sortable ? (
                    <button
                      onClick={() => toggleSort(String(col.key))}
                      className="flex items-center gap-1 font-medium"
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
                  {(onEdit || onDelete) && (
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
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
