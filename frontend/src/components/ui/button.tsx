import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 dark:hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-white shadow-lg hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 hover:shadow-xl hover:shadow-destructive/20 dark:hover:shadow-destructive/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border bg-primary-foreground dark:bg-accent-foreground shadow-sm hover:bg-accent hover:text-accent-foreground dark:bg-input/20 dark:border-input/60 dark:hover:bg-input/40 hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
        ghost:
          "text-primary-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline transition-all duration-300",
        premium:
          "bg-gradient-to-r from-chart-1 via-primary to-chart-3 text-white shadow-lg hover:shadow-xl hover:shadow-primary/20 dark:hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
        sui: "bg-[#6fbcf0] text-white shadow-lg hover:bg-[#6fbcf0]/90 hover:shadow-xl hover:shadow-[#6fbcf0]/20 dark:hover:shadow-[#6fbcf0]/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
        "sui-dark":
          "bg-[#0F1C35] text-white shadow-lg hover:bg-[#2D4264] hover:shadow-xl hover:shadow-[#0F1C35]/20 dark:hover:shadow-[#0F1C35]/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
        "sui-gradient":
          "relative overflow-hidden bg-gradient-to-r from-[#3a95d6] via-[#6fbcf0] to-[#a6d8f7] text-white shadow-lg hover:shadow-xl hover:shadow-[#6fbcf0]/30 dark:hover:shadow-[#6fbcf0]/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#a6d8f7] before:via-[#6fbcf0] before:to-[#3a95d6] before:opacity-0 before:transition-opacity hover:before:opacity-100 [&>*]:relative",
        glass:
          "backdrop-blur-md bg-background/40 border border-border/40 hover:bg-background/60 hover:border-primary/30 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
        success:
          "bg-success text-success-foreground shadow-lg hover:bg-success/90 hover:shadow-xl hover:shadow-success/20 dark:hover:shadow-success/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
        warning:
          "bg-warning text-warning-foreground shadow-lg hover:bg-warning/90 hover:shadow-xl hover:shadow-warning/20 dark:hover:shadow-warning/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
        info: "bg-info text-info-foreground shadow-lg hover:bg-info/90 hover:shadow-xl hover:shadow-info/20 dark:hover:shadow-info/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-md gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-11 rounded-md px-6 has-[>svg]:px-5 text-base",
        xl: "h-12 rounded-md px-8 has-[>svg]:px-6 text-lg",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
