"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SvgAnimationProps {
  className?: string;
}

export const Svg3DAnimation = ({ className }: SvgAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate mouse position relative to the center of the container
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full", className)}
      style={{ perspective: "1000px" }}
    >
      {/* Main container for 3D animation */}
      <motion.div
        className="w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: mousePosition.y * 10,
          rotateY: -mousePosition.x * 10,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 1,
        }}
      >
        {/* Sui Symbol SVG - Front layer */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: 2 }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img
            src="/Sui_Symbol_Sea.svg"
            alt="Sui Symbol"
            className="w-full h-full object-contain"
            style={{ transform: "translateZ(30px)" }}
          />
        </motion.div>

        {/* Decorative floating elements */}
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-primary/20 blur-xl"
          style={{
            top: "20%",
            left: "15%",
            zIndex: 0,
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-40 h-40 rounded-full bg-blue-400/20 blur-xl"
          style={{
            top: "60%",
            right: "20%",
            zIndex: 0,
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </motion.div>
    </div>
  );
};
