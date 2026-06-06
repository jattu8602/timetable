"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/departments": "Departments",
  "/rooms": "Rooms",
  "/courses": "Courses",
  "/faculty": "Faculty & Users",
  "/timetable": "Class Timetable",
};

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Samayak";

  return (
    <header className="flex h-14 items-center justify-between rounded-full bg-surface px-5 shadow-card-sm border border-lines">
      <div>
        <h2 className="text-lg font-bold tracking-[-0.02em] text-ink">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {session?.user && (
          <div className="flex items-center gap-2 text-sm">
            <img
              src="/logo.png"
              alt=""
              width={28}
              height={28}
              className="rounded-full size-7"
            />
            <div className="hidden md:block">
              <p className="font-semibold leading-tight text-ink">
                {session.user.name}
              </p>
              <p className="text-xs font-medium capitalize text-muted-foreground">
                {session.user.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
