"use client";
import { useState } from "react";
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
  X,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/faculty", label: "Faculty & Users", icon: Users },
  { href: "/timetable", label: "Class Timetable", icon: FileText },
];

export function Sidebar({
  onClose,
  collapsed = false,
}: {
  onClose?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  return (
    <>
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-lines bg-surface shadow-card-md">
      {/* Sidebar Header (Logo) */}
      <div
        className={`flex items-center pb-[18px] pt-[14px] ${
          collapsed ? "justify-center px-0" : "justify-between px-[16px]"
        }`}
      >
        <div className={`flex items-center gap-[11px] ${collapsed ? "justify-center" : ""}`}>
          <img
            src="/logo.png"
            alt="Anugat AI"
            width={42}
            height={42}
            className="rounded-[11px] shrink-0"
          />
          {!collapsed && (
            <span className="text-[18px] font-extrabold tracking-[-0.02em] text-ink whitespace-nowrap">
              Anugat AI
            </span>
          )}
        </div>
        {onClose && !collapsed && (
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg p-1.5 text-ink hover:bg-canvas-2/50 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 space-y-[4px] ${collapsed ? "px-[8px]" : "px-[12px]"}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-[14px] text-[15px] font-semibold transition-all duration-[0.16s] [&>svg]:w-[19px] [&>svg]:h-[19px] [&>svg]:stroke-[2] [&>svg]:fill-none ${
                collapsed
                  ? "justify-center p-[13px] gap-0"
                  : "p-[13px_16px] gap-[13px]"
              } ${
                isActive
                  ? "bg-brand-gradient text-white shadow-card-glow [&>svg]:stroke-current"
                  : "text-ink-soft hover:bg-[#f1f7ff] hover:text-ink [&>svg]:stroke-current"
              }`}
            >
              <item.icon className="shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mx-[12px] h-[1px] bg-lines" />

      {/* Logout Action */}
      <div className={collapsed ? "p-[8px] flex justify-center" : "p-[12px]"}>
        <button
          onClick={() => setShowLogoutPopup(true)}
          title={collapsed ? "Log out" : undefined}
          className={`flex items-center rounded-[16px] bg-black text-[15px] font-semibold text-white transition-all hover:bg-[#1c1c22] [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:stroke-white [&>svg]:stroke-[2] [&>svg]:fill-none ${
            collapsed
              ? "justify-center p-[14px] gap-0"
              : "w-full p-[14px_18px] gap-[12px]"
          }`}
        >
          <LogOut className="shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Log out</span>}
        </button>
      </div>
    </aside>
      {showLogoutPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[400px] rounded-[24px] border border-lines bg-surface p-6 shadow-card-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-[20px] font-bold text-ink">Confirm Logout</h3>
            <p className="mt-2 text-[15px] text-ink-soft">Are you sure you want to log out?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="rounded-xl px-5 py-2.5 text-[15px] font-semibold text-ink-soft hover:bg-[#f1f7ff] hover:text-ink transition-colors"
              >
                No
              </button>
              <button
                onClick={() => {
                  setShowLogoutPopup(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="rounded-xl bg-black px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-[#1c1c22] transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

