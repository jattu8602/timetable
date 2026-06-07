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

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: string;
  courseType: string;
  semester: string;
  branchId: string;
  departmentId: string;
  branch: { name: string; program: string } | null;
  department: { name: string; shortCode: string } | null;
}

interface Branch {
  id: string;
  name: string;
  program: string;
  departmentId: string;
}

interface Department {
  id: string;
  name: string;
  shortCode: string;
}

const columns: Column<Course>[] = [
  { key: "code", label: "Code", sortable: true },
  { key: "name", label: "Name", sortable: true },
  { key: "credits", label: "Credits", sortable: true },
  { key: "type", label: "Type", sortable: true, render: (c) => <span className="capitalize">{c.type}</span> },
  { key: "semester", label: "Semester", sortable: true },
  { key: "branch", label: "Branch", render: (c) => c.branch ? `${c.branch.name} (${c.branch.program})` : "—" },
];

export default function CoursesPage() {
  const [data, setData] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    credits: "0",
    type: "lecture",
    courseType: "lecture",
    semester: "",
    branchId: "",
    departmentId: "",
  });

  const fetchData = useCallback(async () => {
    const [c, d, b] = await Promise.all([
      fetch("/api/courses").then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
      fetch("/api/branches").then((r) => r.json()),
    ]);
    setData(c);
    setDepartments(d);
    setBranches(b.filter((br: Branch) => !form.departmentId || br.departmentId === form.departmentId));
  }, [form.departmentId]);

  useEffect(() => {
    (async () => {
      const [c, d, b] = await Promise.all([
        fetch("/api/courses").then((r) => r.json()),
        fetch("/api/departments").then((r) => r.json()),
        fetch("/api/branches").then((r) => r.json()),
      ]);
      setData(c);
      setDepartments(d);
      setBranches(b);
    })();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ code: "", name: "", credits: "0", type: "lecture", courseType: "lecture", semester: "", branchId: "", departmentId: "" });
    setOpen(true);
  }

  function openEdit(item: Course) {
    setEditing(item);
    setForm({
      code: item.code,
      name: item.name,
      credits: String(item.credits),
      type: item.type,
      courseType: item.courseType,
      semester: item.semester,
      branchId: item.branchId,
      departmentId: item.departmentId,
    });
    setOpen(true);
  }

  async function handleSave() {
    const body = { ...form, credits: parseFloat(form.credits) };
    if (editing) {
      await fetch("/api/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...body }),
      });
    } else {
      await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setOpen(false);
    const res = await fetch("/api/courses");
    setData(await res.json());
  }

  async function handleDelete(item: Course) {
    if (!confirm(`Delete course "${item.code} - ${item.name}"?`)) return;
    await fetch(`/api/courses?id=${item.id}`, { method: "DELETE" });
    const res = await fetch("/api/courses");
    setData(await res.json());
  }

  async function handleDeleteBulk(items: Course[]) {
    const ids = items.map((i) => i.id).join(",");
    await fetch(`/api/courses?ids=${ids}`, { method: "DELETE" });
    const res = await fetch("/api/courses");
    setData(await res.json());
  }

  async function handleRestore(item: Course) {
    await fetch("/api/courses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) });
    const res = await fetch("/api/courses");
    setData(await res.json());
  }

  const filteredBranches = branches.filter((b) => !form.departmentId || b.departmentId === form.departmentId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Courses</h1>
        <p className="text-sm text-muted-foreground">Manage courses across branches and semesters</p>
      </div>

      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(c) => c.id}
        searchKeys={["code", "name"]}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={handleDelete}
        onDeleteBulk={handleDeleteBulk}
        onRestore={handleRestore}
        deletedKey="deletedAt"
        addLabel="Add Course"
        bulkImportEndpoint="/api/import/courses"
        bulkImportLabel="Import"
        bulkImportExample="code,name,credits,type,branchId,semester,departmentId\nCS101,Intro to CS,4,lecture,<branch-id>,6,<dept-id>"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Course" : "Create Course"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the course details below." : "Enter the details for the new course."}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Course Code</Label>
              <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Course Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input id="credits" type="number" step="0.5" min="0" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v, courseType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">Lecture</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input id="semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={form.departmentId} onValueChange={(v) => {
                if (v) setForm({ ...form, departmentId: v, branchId: "" });
              }}>
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
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select value={form.branchId} onValueChange={(v) => v && setForm({ ...form, branchId: v })} disabled={!form.departmentId}>
                <SelectTrigger>
                  <SelectValue placeholder={form.departmentId ? "Select branch" : "Select department first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredBranches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name} ({b.program})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.code || !form.name || !form.branchId || !form.semester}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
