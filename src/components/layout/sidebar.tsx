"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  BookOpen,
  Users,
  FileText,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/faculty", label: "Faculty & Users", icon: Users },
  { href: "/timetable", label: "Timetable", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="bg-brand-gradient flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <span className="text-lg font-semibold text-white">Samayak</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
