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
  department: { name: string; shortCode: string } | null;
  deletedAt: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string | null;
  department: { name: string; shortCode: string } | null;
  deletedAt: string | null;
}

interface Department {
  id: string;
  name: string;
  shortCode: string;
}

const roleColors: Record<string, string> = {
  admin: "bg-red-50 text-red-700 border-red-200",
  coordinator: "bg-blue-50 text-blue-700 border-blue-200",
  hod: "bg-indigo-50 text-indigo-700 border-indigo-200",
  dean: "bg-purple-50 text-purple-700 border-purple-200",
  professor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  faculty: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function FacultyAndUsersPage() {
  const [activeTab, setActiveTab] = useState<"faculty" | "users">("faculty");
  const [facultyData, setFacultyData] = useState<Faculty[]>([]);
  const [userData, setUserData] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Dialog states for Faculty
  const [facultyOpen, setFacultyOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [facultyForm, setFacultyForm] = useState({ name: "", email: "", departmentId: "" });

  // Dialog states for Users
  const [userOpen, setUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "professor",
    departmentId: "",
  });

  const fetchData = useCallback(async () => {
    const [fac, usr, depts] = await Promise.all([
      fetch("/api/faculty").then((r) => r.json()),
      fetch("/api/users?includeDeleted=true").then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
    ]);
    setFacultyData(fac);
    setUserData(usr);
    setDepartments(depts);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Faculty Handlers ---
  function openCreateFaculty() {
    setEditingFaculty(null);
    setFacultyForm({ name: "", email: "", departmentId: "" });
    setFacultyOpen(true);
  }

  function openEditFaculty(item: Faculty) {
    setEditingFaculty(item);
    setFacultyForm({
      name: item.name,
      email: item.email,
      departmentId: item.departmentId,
    });
    setFacultyOpen(true);
  }

  async function handleSaveFaculty() {
    if (editingFaculty) {
      await fetch("/api/faculty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingFaculty.id, ...facultyForm }),
      });
    } else {
      await fetch("/api/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(facultyForm),
      });
    }
    setFacultyOpen(false);
    fetchData();
  }

  async function handleDeleteFaculty(item: Faculty) {
    if (!confirm(`Delete faculty "${item.name}"?`)) return;
    await fetch(`/api/faculty?id=${item.id}`, { method: "DELETE" });
    fetchData();
  }

  async function handleDeleteBulkFaculty(items: Faculty[]) {
    const ids = items.map((i) => i.id).join(",");
    await fetch(`/api/faculty?ids=${ids}`, { method: "DELETE" });
    fetchData();
  }

  async function handleRestoreFaculty(item: Faculty) {
    await fetch("/api/faculty", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });
    fetchData();
  }

  // --- Users Handlers ---
  function openCreateUser() {
    setEditingUser(null);
    setUserForm({ name: "", email: "", password: "", role: "professor", departmentId: "" });
    setUserOpen(true);
  }

  function openEditUser(item: User) {
    setEditingUser(item);
    setUserForm({
      name: item.name,
      email: item.email,
      password: "", // Keep password blank unless changing
      role: item.role,
      departmentId: item.departmentId || "",
    });
    setUserOpen(true);
  }

  async function handleSaveUser() {
    const payload: any = {
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      departmentId: userForm.departmentId,
    };
    if (userForm.password) {
      payload.password = userForm.password;
    }

    if (editingUser) {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser.id, ...payload }),
      });
    } else {
      // Create user requires a password
      if (!userForm.password) {
        alert("Password is required for new users");
        return;
      }
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, password: userForm.password }),
      });
    }
    setUserOpen(false);
    fetchData();
  }

  async function handleDeleteUser(item: User) {
    if (!confirm(`Soft-delete user "${item.name}"?`)) return;
    await fetch(`/api/users?id=${item.id}`, { method: "DELETE" });
    fetchData();
  }

  async function handleDeleteBulkUser(items: User[]) {
    const ids = items.map((i) => i.id).join(",");
    await fetch(`/api/users?ids=${ids}`, { method: "DELETE" });
    fetchData();
  }

  async function handleRestoreUser(item: User) {
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });
    fetchData();
  }

  const facultyColumns: Column<Faculty>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "department",
      label: "Department",
      render: (f) => f.department?.shortCode ?? "—",
      sortable: true,
    },
  ];

  const userColumns: Column<User>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Role",
      render: (u) => (
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${roleColors[u.role] || "bg-gray-100 text-gray-800"}`}>
          {u.role}
        </span>
      ),
      sortable: true,
    },
    {
      key: "department",
      label: "Department Scope",
      render: (u) => u.department?.shortCode ?? "All Departments",
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Faculty & Users</h1>
          <p className="text-sm text-muted-foreground">Manage faculty members and administrative panel login accounts</p>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-full bg-canvas p-1 border">
          <button
            onClick={() => setActiveTab("faculty")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              activeTab === "faculty"
                ? "bg-brand-gradient text-white shadow-card-sm"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            Faculty Members
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-brand-gradient text-white shadow-card-sm"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            User Accounts
          </button>
        </div>
      </div>

      {activeTab === "faculty" ? (
        <DataTable
          data={facultyData}
          columns={facultyColumns}
          keyExtractor={(f) => f.id}
          searchKeys={["name", "email"]}
          onAdd={openCreateFaculty}
          onEdit={openEditFaculty}
          onDelete={handleDeleteFaculty}
          onDeleteBulk={handleDeleteBulkFaculty}
          onRestore={handleRestoreFaculty}
          deletedKey="deletedAt"
          addLabel="Add Faculty"
          bulkImportEndpoint="/api/import/faculty"
          bulkImportLabel="Import"
          bulkImportExample="name,email,departmentId\nJohn HOD,john@bitmesra.ac.in,<dept-id>"
        />
      ) : (
        <DataTable
          data={userData}
          columns={userColumns}
          keyExtractor={(u) => u.id}
          searchKeys={["name", "email", "role"]}
          onAdd={openCreateUser}
          onEdit={openEditUser}
          onDelete={handleDeleteUser}
          onDeleteBulk={handleDeleteBulkUser}
          onRestore={handleRestoreUser}
          deletedKey="deletedAt"
          addLabel="Add User"
          bulkImportEndpoint="/api/import/users"
          bulkImportLabel="Import"
          bulkImportExample="name,email,role,departmentId\nSam Dean,sam@samayak.com,dean,<dept-id>"
          showDuplicateOptions={true}
        />
      )}

      {/* --- Faculty Form Dialog --- */}
      <Dialog open={facultyOpen} onOpenChange={setFacultyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFaculty ? "Edit Faculty Member" : "Create Faculty Member"}</DialogTitle>
            <DialogDescription>
              {editingFaculty ? "Update the details for this faculty member." : "Enter details for the new faculty member."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fac-name">Name</Label>
              <Input
                id="fac-name"
                value={facultyForm.name}
                onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fac-email">Email Address</Label>
              <Input
                id="fac-email"
                type="email"
                value={facultyForm.email}
                onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fac-department">Owning Department</Label>
              <Select
                value={facultyForm.departmentId}
                onValueChange={(v) => setFacultyForm({ ...facultyForm, departmentId: v ?? "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.shortCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFacultyOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFaculty} disabled={!facultyForm.name || !facultyForm.email || !facultyForm.departmentId}>
              {editingFaculty ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- User Form Dialog --- */}
      <Dialog open={userOpen} onOpenChange={setUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User Account" : "Create User Account"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update system permissions and roles." : "Create a new administrative user."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="usr-name">Name</Label>
              <Input
                id="usr-name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usr-email">Email Address</Label>
              <Input
                id="usr-email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usr-password">
                Password {editingUser && <span className="text-xs text-muted-foreground">(leave blank to keep current)</span>}
              </Label>
              <Input
                id="usr-password"
                type="password"
                placeholder={editingUser ? "••••••••" : ""}
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usr-role">System Role</Label>
              <Select
                value={userForm.role}
                onValueChange={(v) => setUserForm({ ...userForm, role: v ?? "professor" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="hod">HOD (Head of Department)</SelectItem>
                  <SelectItem value="dean">Dean</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usr-department">Department Scope (optional)</Label>
              <Select
                value={userForm.departmentId}
                onValueChange={(v) => setUserForm({ ...userForm, departmentId: v ?? "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments (Global)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_depts">All Departments (Global)</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.shortCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveUser}
              disabled={!userForm.name || !userForm.email || (!editingUser && !userForm.password)}
            >
              {editingUser ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

