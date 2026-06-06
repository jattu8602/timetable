import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary/20 selection:text-primary-foreground flex h-auto w-full rounded-full bg-[#eef2f8] border-[1.5px] border-transparent p-[12px_18px] text-[14.5px] text-ink transition-all duration-180 shadow-xs outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-sm disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:bg-[#fdecee] focus-visible:border-brand-blue focus-visible:bg-surface focus-visible:shadow-[0_0_0_4px_rgba(61,161,255,.16)] aria-invalid:focus-visible:shadow-[0_0_0_4px_rgba(239,70,85,.16)] [&>svg]:stroke-[#7c8294] has-[>svg:focus-within]:stroke-brand-blue has-[.peer:focus]:stroke-brand-blue",
        className
      )}
      {...props}
    />
  );
}

export { Input }
