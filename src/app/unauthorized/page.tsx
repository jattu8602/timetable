"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-6 rounded-full bg-error/10 p-4">
          <ShieldAlert className="h-12 w-12 text-error" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-ink">403 Forbidden</h1>
        <p className="mb-8 text-muted-foreground">
          You do not have the required permissions to access the Admin Panel. 
          This area is restricted to users with the <strong>Admin</strong> role.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full sm:w-auto"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
