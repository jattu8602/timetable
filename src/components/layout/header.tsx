"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftOpen, PanelLeftClose } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/departments": "Departments",
  "/rooms": "Rooms",
  "/courses": "Courses",
  "/faculty": "Faculty & Users",
  "/timetable": "Class Timetable",
  "/upload": "Upload Timetable",
};

export function Header({
  onMenuClick,
  onToggleCollapse,
  collapsed = false,
}: {
  onMenuClick?: () => void;
  onToggleCollapse?: () => void;
  collapsed?: boolean;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  let title = pageTitles[pathname] ?? "Samayak";
  if (pathname.startsWith("/timetable/") && pathname !== "/timetable") {
    title = "Timetable Details";
  }

  return (
    <header className="group/header flex h-14 items-center justify-between rounded-full bg-surface px-5 shadow-card-sm border border-lines">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center rounded-lg p-1.5 text-ink hover:bg-canvas-2/50 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center rounded-lg p-1.5 text-ink hover:bg-canvas-2/50 transition-opacity duration-200 opacity-0 group-hover/header:opacity-100"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        )}
        <h2 className="text-lg font-bold tracking-[-0.02em] text-ink leading-none">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {session?.user && (
          <div className="flex items-center gap-2 text-sm">
            <img
              src="/logo.png"
              alt=""
              width={28}
              height={28}
              className="rounded-full size-7 shrink-0"
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

