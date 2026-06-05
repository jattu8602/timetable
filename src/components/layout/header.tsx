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
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {session?.user && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {session.user.name?.charAt(0) ?? "A"}
            </div>
            <div className="hidden md:block">
              <p className="font-medium leading-tight">{session.user.name}</p>
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
