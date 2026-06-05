"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable, Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Faculty {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  department: { name: string; shortCode: string };
}

interface Department {
  id: string;
  name: string;
  shortCode: string;
}

const columns: Column<Faculty>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "department", label: "Department", render: (f) => f.department.shortCode, sortable: true },
];

export default function FacultyPage() {
  const [data, setData] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [form, setForm] = useState({ name: "", email: "", departmentId: "" });

  const fetchData = useCallback(async () => {
    const [f, d] = await Promise.all([
      fetch("/api/faculty").then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
    ]);
    setData(f);
    setDepartments(d);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", email: "", departmentId: "" });
    setOpen(true);
  }

  function openEdit(item: Faculty) {
    setEditing(item);
    setForm({ name: item.name, email: item.email, departmentId: item.departmentId });
    setOpen(true);
  }

  async function handleSave() {
    if (editing) {
      await fetch("/api/faculty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
    } else {
      await fetch("/api/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setOpen(false);
    fetchData();
  }

  async function handleDelete(item: Faculty) {
    if (!confirm(`Delete faculty "${item.name}"?`)) return;
    await fetch(`/api/faculty?id=${item.id}`, { method: "DELETE" });
    fetchData();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Faculty & Users</h1>
        <p className="text-sm text-muted-foreground">Manage faculty members across departments</p>
      </div>

      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(f) => f.id}
        searchKeys={["name", "email"]}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={handleDelete}
        addLabel="Add Faculty"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Faculty" : "Create Faculty"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the faculty details below." : "Enter the details for the new faculty member."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={form.departmentId} onValueChange={(v) => v && setForm({ ...form, departmentId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.email || !form.departmentId}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
