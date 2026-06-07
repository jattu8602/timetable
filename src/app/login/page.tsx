"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setDemoLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email: "admin@samayak.com",
        password: "admin123",
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid demo credentials");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F8FD] px-5 font-sans">
      <div className="flex w-full max-w-md flex-col items-center rounded-[26px] border border-line-2 bg-white p-8 shadow-card-md">
        <img
          src="/logo.png"
          alt="Samayak"
          width={80}
          height={80}
          className="mb-4 rounded-[22px] shadow-card-md"
        />
        <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#256199] leading-tight">
          Samayak
        </h1>
        <p className="mt-1 mb-6 text-center text-[14.5px] text-muted-foreground">
          The Academic Operations Platform
        </p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          {error && (
            <div className="rounded-[14px] border border-destructive/20 bg-destructive/5 p-3 text-center text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@samayak.com"
              required
              disabled={loading || demoLoading}
              className="w-full rounded-[14px] border border-lines bg-surface px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-muted-foreground focus-visible:border-brand-blue focus-visible:ring-3 focus-visible:ring-brand-blue/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading || demoLoading}
              className="w-full rounded-[14px] border border-lines bg-surface px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-muted-foreground focus-visible:border-brand-blue focus-visible:ring-3 focus-visible:ring-brand-blue/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient py-3 text-[14.5px] font-bold text-white shadow-card-sm transition-all duration-180 hover:-translate-y-[1px] hover:shadow-card-md disabled:pointer-events-none disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="relative my-6 w-full flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-lines"></div>
          </div>
          <span className="relative bg-white px-3 text-xs text-muted-foreground uppercase font-semibold">
            Or Quick Access
          </span>
        </div>

        <button
          onClick={handleDemoLogin}
          disabled={loading || demoLoading}
          className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-[#256199]/20 bg-[#256199]/5 py-3 text-[14.5px] font-bold text-[#256199] transition-all duration-180 hover:-translate-y-[1px] hover:bg-[#256199]/10 disabled:pointer-events-none disabled:opacity-50"
        >
          {demoLoading && <Loader2 className="h-4 w-4 animate-spin text-[#256199]" />}
          Use Demo Admin Credentials
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#F4F8FD]">
        <Loader2 className="h-8 w-8 animate-spin text-[#256199]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}


