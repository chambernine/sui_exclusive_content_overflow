import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls whether the skeleton should pulse/animate
   * @default true
   */
  animate?: boolean;
  /**
   * Adjust the width of the skeleton
   */
  width?: string | number;
  /**
   * Adjust the height of the skeleton
   */
  height?: string | number;
  /**
   * Apply rounded corners to the skeleton
   * @default false
   */
  rounded?: boolean;
  /**
   * Make the skeleton fully rounded (circular)
   * @default false
   */
  circle?: boolean;
}

function Skeleton({
  className,
  animate = true,
  width,
  height,
  rounded = false,
  circle = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted/70 relative overflow-hidden",
        circle ? "rounded-full" : rounded ? "rounded-lg" : "rounded-md",
        className
      )}
      style={{
        width: width,
        height: height,
      }}
      data-slot="skeleton"
      {...props}
    >
      {animate && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"
          animate={{
            x: ["calc(-100%)", "calc(100%)"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </div>
  );
}

/**
 * Container for multiple skeletons with consistent spacing
 */
function SkeletonContainer({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("space-y-4", className)}
      data-slot="skeleton-container"
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Skeleton text block with multiple lines
 */
function SkeletonText({
  className,
  lines = 3,
  animate = true,
  lastLineWidth = "60%",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  lines?: number;
  animate?: boolean;
  lastLineWidth?: string | number;
}) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          animate={animate}
          className="h-4"
          style={{
            width:
              index === lines - 1 && lastLineWidth ? lastLineWidth : "100%",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton card for content loading
 */
function SkeletonCard({
  className,
  animate = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { animate?: boolean }) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-6 flex flex-col",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4 mb-4">
        <Skeleton circle animate={animate} className="h-12 w-12" />
        <div className="space-y-2 flex-1">
          <Skeleton animate={animate} className="h-4 w-3/5" />
          <Skeleton animate={animate} className="h-3 w-4/5" />
        </div>
      </div>
      <Skeleton animate={animate} className="h-32 w-full mb-4" />
      <div className="space-y-2">
        <Skeleton animate={animate} className="h-3 w-full" />
        <Skeleton animate={animate} className="h-3 w-4/5" />
        <Skeleton animate={animate} className="h-3 w-3/5" />
      </div>
    </div>
  );
}

/**
 * Skeleton for album or content item
 */
function SkeletonAlbum({
  className,
  animate = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { animate?: boolean }) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl overflow-hidden flex flex-col",
        className
      )}
      {...props}
    >
      <Skeleton animate={animate} className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton animate={animate} className="h-5 w-4/5" />
        <Skeleton animate={animate} className="h-4 w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton animate={animate} className="h-6 w-20" />
          <Skeleton animate={animate} className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton profile component
 */
function SkeletonProfile({
  className,
  animate = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { animate?: boolean }) {
  return (
    <div
      className={cn("bg-card border border-border rounded-xl p-6", className)}
      {...props}
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Skeleton circle animate={animate} className="h-24 w-24" />
        <div className="space-y-3 flex-1 w-full text-center md:text-left">
          <Skeleton animate={animate} className="h-6 w-40 mx-auto md:mx-0" />
          <Skeleton animate={animate} className="h-4 w-24 mx-auto md:mx-0" />
          <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
            <Skeleton animate={animate} className="h-6 w-16 rounded-full" />
            <Skeleton animate={animate} className="h-6 w-16 rounded-full" />
            <Skeleton animate={animate} className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonContainer,
  SkeletonCard,
  SkeletonText,
  SkeletonAlbum,
  SkeletonProfile,
};
