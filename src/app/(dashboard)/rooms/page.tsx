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

interface Room {
  id: string;
  number: string;
  name: string | null;
  capacity: number;
  type: string;
  departmentId: string;
  department: { name: string; shortCode: string } | null;
}

interface Department {
  id: string;
  name: string;
  shortCode: string;
}

const columns: Column<Room>[] = [
  { key: "number", label: "Number", sortable: true },
  { key: "name", label: "Name", render: (r) => r.name ?? "—" },
  { key: "capacity", label: "Capacity", sortable: true },
  {
    key: "type",
    label: "Type",
    sortable: true,
    render: (r) => <span className="capitalize">{r.type}</span>,
  },
  {
    key: "department",
    label: "Department",
    render: (r) => r.department?.shortCode ?? "—",
    sortable: true,
  },
];

export default function RoomsPage() {
  const [data, setData] = useState<Room[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState({
    number: "",
    name: "",
    capacity: "0",
    type: "classroom",
    departmentId: "",
  });

  const fetchData = useCallback(async () => {
    const [r, d] = await Promise.all([
      fetch("/api/rooms").then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
    ]);
    setData(r);
    setDepartments(d);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openCreate() {
    setEditing(null);
    setForm({ number: "", name: "", capacity: "0", type: "classroom", departmentId: "" });
    setOpen(true);
  }

  function openEdit(item: Room) {
    setEditing(item);
    setForm({
      number: item.number,
      name: item.name ?? "",
      capacity: String(item.capacity),
      type: item.type,
      departmentId: item.departmentId,
    });
    setOpen(true);
  }

  async function handleSave() {
    const body = {
      ...form,
      capacity: parseInt(form.capacity, 10),
    };
    if (editing) {
      await fetch("/api/rooms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...body }),
      });
    } else {
      await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setOpen(false);
    fetchData();
  }

  async function handleDelete(item: Room) {
    if (!confirm(`Delete room "${item.number}"?`)) return;
    await fetch(`/api/rooms?id=${item.id}`, { method: "DELETE" });
    fetchData();
  }

  async function handleRestore(item: Room) {
    await fetch("/api/rooms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) });
    fetchData();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rooms</h1>
        <p className="text-sm text-muted-foreground">Manage lecture halls, labs, and other rooms</p>
      </div>

      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(r) => r.id}
        searchKeys={["number", "name"]}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        deletedKey="deletedAt"
        addLabel="Add Room"
        bulkImportEndpoint="/api/rooms"
        bulkImportLabel="Import CSV"
        bulkImportExample="number,name,capacity,type,departmentId\n101,Room 101,60,classroom,<dept-id>"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Room" : "Create Room"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the room details below." : "Enter the details for the new room."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="number">Room Number</Label>
              <Input id="number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" min="0" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classroom">Classroom</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
            <Button onClick={handleSave} disabled={!form.number || !form.departmentId}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
