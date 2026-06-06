import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-[14.5px] font-bold whitespace-nowrap transition-all duration-180 outline-none select-none tracking-[-0.01em] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-brand-gradient text-white shadow-[0_8px_20px_rgba(37,97,153,.32)] hover:-translate-y-[2px] hover:shadow-[0_12px_26px_rgba(37,97,153,.4)]",
        outline:
          "bg-surface text-ink shadow-card-sm border-[1.5px] border-line-2 hover:shadow-card-md hover:-translate-y-[2px] [&>svg]:stroke-brand-blue",
        secondary:
          "bg-black text-white hover:-translate-y-[2px] hover:bg-[#1c1c22]",
        ghost:
          "bg-transparent text-brand-deep border-[1.5px] border-line-2 hover:bg-[#eef5fd] hover:border-brand-blue aria-expanded:bg-[#eef5fd]",
        destructive:
          "bg-error/10 text-error hover:bg-error/20 focus-visible:border-error/40 focus-visible:ring-error/20",
        link: "text-brand-deep underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-auto gap-[9px] p-[13px_24px] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        sm: "h-auto gap-[9px] p-[9px_16px] text-[13px] tracking-[-0.01em] has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3 [&_svg:not([class*='size-'])]:size-[17px]",
        icon: "size-[46px]",
        "icon-sm": "size-[36px]",
        "icon-lg": "size-[52px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
