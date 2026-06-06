import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas p-3">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden pl-3">
        <Header />
        <main className="flex-1 overflow-y-auto pt-3">
          <div className="mx-auto max-w-[1120px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
