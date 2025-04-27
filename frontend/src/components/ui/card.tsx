import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "bordered" | "glass" | "sui" | "gradient";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClassNames = {
    default:
      "bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300",
    bordered:
      "bg-background text-foreground border border-border shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300",
    glass:
      "backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300",
    sui: "bg-card text-card-foreground border-[#6fbcf0]/30 border shadow-sm hover:shadow-md hover:shadow-[#6fbcf0]/10 transition-all duration-300",
    gradient:
      "relative bg-gradient-to-br from-white to-white dark:from-[#0F1C35] dark:to-[#2D4264] text-card-foreground shadow-md hover:shadow-lg transition-all duration-300 before:absolute before:inset-0 before:rounded-inherit before:bg-[length:400%_400%] before:bg-gradient-to-br before:from-[#a6d8f7]/10 before:via-[#6fbcf0]/10 before:to-[#3a95d6]/10 dark:before:from-[#a6d8f7]/20 dark:before:via-[#6fbcf0]/20 dark:before:to-[#3a95d6]/20 before:animate-subtle-gradient before:blur-xl before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
  };

  return (
    <div
      ref={ref}
      className={cn("rounded-lg p-6", variantClassNames[variant], className)}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
