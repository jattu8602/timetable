"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-xl font-semibold text-ink">Something went wrong</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {error.message}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_14px_rgba(37,97,153,.08)]"
      >
        Try again
      </button>
    </div>
  );
}
