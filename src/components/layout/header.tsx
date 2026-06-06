"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/departments": "Departments",
  "/rooms": "Rooms",
  "/courses": "Courses",
  "/faculty": "Faculty & Users",
  "/timetable": "Timetable",
};

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Samayak";

  return (
    <header className="flex h-14 items-center justify-between rounded-full bg-surface px-5 shadow-[0_4px_14px_rgba(37,97,153,.08)]">
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {session?.user && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-white">
              {session.user.name?.charAt(0) ?? "A"}
            </div>
            <div className="hidden md:block">
              <p className="font-medium leading-tight text-ink">
                {session.user.name}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {session.user.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
