import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  SkeletonContainer,
  SkeletonCard,
  SkeletonText,
  SkeletonAlbum,
  SkeletonProfile,
  Skeleton,
} from "./skeleton";

import { Card, CardContent, CardFooter, CardHeader } from "./card";

interface LoadingWrapperProps {
  /**
   * Whether the content is loading
   */
  isLoading: boolean;
  /**
   * The content to render when loading is complete
   */
  children?: React.ReactNode;
  /**
   * The type of skeleton to show while loading
   * @default "default"
   */
  variant?:
    | "default"
    | "album"
    | "profile"
    | "card"
    | "text"
    | "none"
    | "publish-album";
  /**
   * The number of skeleton items to render in a grid
   * Works with album, card variants
   */
  count?: number;
  /**
   * Additional classes to apply to the container
   */
  className?: string;
  /**
   * Text to show below the spinner
   */
  loadingText?: string;
  /**
   * Container layout
   * @default "grid"
   */
  layout?: "grid" | "flex" | "block";
  /**
   * Grid columns for grid layout
   * @default "auto-fit"
   */
  gridCols?: "1" | "2" | "3" | "4" | "auto-fit";
  /**
   * Whether to animate the appearance of content when loaded
   * @default true
   */
  animateAppearance?: boolean;
}

export function LoadingWrapper({
  isLoading,
  children,
  variant = "default",
  count = 3,
  className,
  loadingText = "Loading...",
  layout = "grid",
  gridCols = "auto-fit",
  animateAppearance = true,
}: LoadingWrapperProps) {
  // Variables for grid layout
  const gridColsMap = {
    "1": "grid-cols-1",
    "2": "grid-cols-1 md:grid-cols-2",
    "3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    "auto-fit": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  const layoutClasses = {
    grid: `grid ${gridColsMap[gridCols]} gap-6`,
    flex: "flex flex-wrap gap-6",
    block: "space-y-6",
  };

  // Return different skeletons based on variant
  const renderSkeleton = () => {
    if (variant === "none") {
      return (
        <div className="flex justify-center items-center min-h-[200px] py-12">
          <div className="flex flex-col items-center text-center">
            <motion.div
              className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary mb-4"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            {loadingText && (
              <p className="text-sm text-muted-foreground">{loadingText}</p>
            )}
          </div>
        </div>
      );
    }

    if (variant === "publish-album") {
      return (
        <div className="w-full mx-auto p-4">
          {/* Back link and title section */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Skeleton className="h-4 w-4 mr-1" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>

          {/* Album Details Card */}
          <Card className="overflow-hidden border-border mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={`detail-left-${i}`}
                      className="flex justify-between items-center py-2 border-b border-border/50"
                    >
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={`detail-right-${i}`}
                      className="flex justify-between items-center py-2 border-b border-border/50"
                    >
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Status Card */}
          <Card className="overflow-hidden border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>

              {/* Content publication section */}
              <div className="bg-card/50 p-3 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-9 w-32 rounded-md" />
                </div>

                {/* Content blobs */}
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={`blob-${i}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border overflow-hidden border-border hover:shadow-md transition-shadow"
                    >
                      <div className="mb-3 sm:mb-0">
                        <Skeleton className="h-5 w-64 mb-2" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-9 w-28 sm:w-32 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (variant === "album") {
      return (
        <div className={layoutClasses[layout]}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonAlbum key={i} className="h-full" />
          ))}
        </div>
      );
    }

    if (variant === "profile") {
      return <SkeletonProfile />;
    }

    if (variant === "card") {
      return (
        <div className={layoutClasses[layout]}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} className="h-full" />
          ))}
        </div>
      );
    }

    if (variant === "text") {
      return (
        <div className="max-w-2xl w-full mx-auto">
          <SkeletonContainer>
            <div className="flex items-center gap-2 mb-6">
              <SkeletonText lines={1} className="w-40" />
            </div>
            <SkeletonText lines={5} />
          </SkeletonContainer>
        </div>
      );
    }

    // Default skeleton
    return (
      <div className={layoutClasses[layout]}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            <SkeletonText lines={3} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {isLoading ? (
        renderSkeleton()
      ) : (
        <>
          {animateAppearance ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          ) : (
            children
          )}
        </>
      )}
    </div>
  );
}
