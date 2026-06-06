"use client";

import Link from "next/link";
import Image from "next/image";
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
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/faculty", label: "Faculty & Users", icon: Users },
  { href: "/timetable", label: "Class Timetable", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col overflow-hidden rounded-[24px] border border-lines bg-surface shadow-card-md">
      <div className="flex items-center gap-[11px] px-[16px] pb-[18px] pt-[14px]">
        <Image src="/logo.png" alt="Anugat AI" width={42} height={42} className="rounded-[11px]" />
        <span className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">Anugat AI</span>
      </div>

      <nav className="flex-1 space-y-[4px] px-[12px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-[13px] p-[13px_16px] rounded-[14px] text-[15px] font-semibold transition-all duration-[0.16s] [&>svg]:w-[19px] [&>svg]:h-[19px] [&>svg]:stroke-[2] [&>svg]:fill-none ${
                isActive
                  ? "bg-brand-gradient text-white shadow-card-glow [&>svg]:stroke-current"
                  : "text-ink-soft hover:bg-[#f1f7ff] hover:text-ink [&>svg]:stroke-current"
              }`}
            >
              <item.icon className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-[12px] h-[1px] bg-lines" />

      <div className="p-[12px]">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-[12px] rounded-[16px] bg-black p-[14px_18px] text-[15px] font-semibold text-white transition-all hover:bg-[#1c1c22] [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:stroke-white [&>svg]:stroke-[2] [&>svg]:fill-none"
        >
          <LogOut className="shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
}
