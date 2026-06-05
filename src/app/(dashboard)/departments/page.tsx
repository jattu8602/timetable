"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable, Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Department {
  id: string;
  name: string;
  shortCode: string;
  createdAt: string;
}

const columns: Column<Department>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "shortCode", label: "Short Code", sortable: true },
  { key: "createdAt", label: "Created", sortable: true },
];

export default function DepartmentsPage() {
  const [data, setData] = useState<Department[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/departments");
    setData(await res.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openCreate() {
    setEditing(null);
    setFormName("");
    setFormCode("");
    setOpen(true);
  }

  function openEdit(item: Department) {
    setEditing(item);
    setFormName(item.name);
    setFormCode(item.shortCode);
    setOpen(true);
  }

  async function handleSave() {
    if (editing) {
      await fetch("/api/departments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, name: formName, shortCode: formCode }),
      });
    } else {
      await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, shortCode: formCode }),
      });
    }
    setOpen(false);
    fetchData();
  }

  async function handleDelete(item: Department) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await fetch(`/api/departments?id=${item.id}`, { method: "DELETE" });
    fetchData();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
        <p className="text-sm text-muted-foreground">Manage departments and their short codes</p>
      </div>

      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(d) => d.id}
        searchKeys={["name", "shortCode"]}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={handleDelete}
        addLabel="Add Department"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Department" : "Create Department"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the department details below." : "Enter the details for the new department."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortCode">Short Code</Label>
              <Input id="shortCode" value={formCode} onChange={(e) => setFormCode(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formName || !formCode}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
