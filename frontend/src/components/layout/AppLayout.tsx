import { Outlet } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { motion } from "framer-motion";
import { NavigationDock } from "../navigation/navigation-dock";
import { useSuiAccount } from "@/hooks/useSuiAccount";

export function AppLayout() {
  const { address } = useSuiAccount();

  return (
    <div className="min-h-screen bg-background">
      <motion.main
        className={`container mx-auto ${
          address && "px-4 pb-16"
        } w-full flex flex-col items-center justify-center`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
      {address && <NavigationDock />}
      <Toaster position={"top-right"} />
    </div>
  );
}
