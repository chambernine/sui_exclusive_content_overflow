import { Outlet } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { motion } from "framer-motion";
import { NavigationDock } from "../navigation/navigation-dock";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { ConnectButton } from "@mysten/dapp-kit";

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
        {address && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex w-full flex-col md:flex-row justify-between items-center p-4 gap-4 relative"
          >
            <div className="relative">
              <h1 className="flex justify-between text-3xl md:text-4xl font-bold mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                  Silvy
                </span>
                <div className="block md:hidden">
                  <ConnectButton />
                </div>
              </h1>
              <motion.p
                className="text-muted-foreground max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Discover and collect exclusive content on the Sui blockchain
              </motion.p>
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 hidden md:block" />
            </div>
            <div className="hidden md:block">
              <ConnectButton />
            </div>
          </motion.div>
        )}
        <Outlet />
      </motion.main>
      {address && <NavigationDock />}
      <Toaster position={"top-right"} />
    </div>
  );
}
