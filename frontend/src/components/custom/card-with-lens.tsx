"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lens } from "../magicui/lens";
import { ReactNode } from "react";
import { AspectRatio } from "../ui/aspect-ratio";
import { motion } from "framer-motion";

export interface CardWithLensProps {
  imageSrc: string;
  imageAlt?: string;
  onClick?: () => void;
  zoomFactor?: number;
  lensSize?: number;
  isStatic?: boolean;
  className?: string;
  children?: ReactNode;
}

export function CardWithLens({
  imageSrc,
  imageAlt = "Image",
  onClick,
  zoomFactor = 2,
  lensSize = 150,
  isStatic = false,
  className = "",
  children,
}: CardWithLensProps) {
  return (
    <Card
      className={`h-full flex flex-col bg-card border-border cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all pt-0 ${className}`}
      onClick={onClick}
    >
      <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}>
        <Lens
          zoomFactor={zoomFactor}
          lensSize={lensSize}
          isStatic={isStatic}
          ariaLabel="Zoom Area"
        >
          <AspectRatio ratio={16 / 9} className="w-full h-full">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full rounded-t-xl"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center rounded-t-xl text-muted-foreground">
                No preview
              </div>
            )}
          </AspectRatio>
        </Lens>
      </motion.div>
      {children}
    </Card>
  );
}
