"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail("admin@samayak.com");
    setPassword("admin123");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
  }

  function handleDemoLogin() {
    setEmail("admin@samayak.com");
    setPassword("admin123");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Demo Login
          </span>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/50 p-3 text-sm">
        <p className="font-medium">Demo Credentials</p>
        <p className="mt-1 text-muted-foreground">
          Email: admin@samayak.com
        </p>
        <p className="text-muted-foreground">Password: admin123</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={handleDemoLogin}
        >
          Fill Demo Credentials
        </Button>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#256199] to-[#3DA1FF] p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Samayak</h1>
        <p className="text-white/80">Academic Operations Platform</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
