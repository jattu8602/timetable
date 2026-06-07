"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    if (stored === "true") {
      setDesktopCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !desktopCollapsed;
    setDesktopCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-canvas p-3 max-sm:p-0">
      {/* Desktop Persistent Sidebar */}
      <div className={`hidden lg:flex h-full transition-all duration-300 ${desktopCollapsed ? "w-[82px]" : "w-[280px]"}`}>
        <Sidebar collapsed={desktopCollapsed} />
      </div>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sliding Navigation Drawer */}
      <div
        className={`fixed inset-y-3 left-3 z-50 transition-transform duration-300 ease-out lg:hidden h-[calc(100vh-24px)] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-[300px]"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden pl-3 max-lg:pl-0 max-sm:p-3">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onToggleCollapse={toggleCollapse}
          collapsed={desktopCollapsed}
        />
        <main className="flex-1 overflow-y-auto pt-3">
          <div className="mx-auto max-w-[1120px] pb-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
