import { ReactNode } from "react";
import { ConnectButton } from "@mysten/dapp-kit";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

import { useSuiAccount } from "@/hooks/useSuiAccount";

interface ProtectedProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function Protected({
  children,
  title = "Connect Wallet to Continue",
  description = "You need to connect your wallet to access this feature",
}: ProtectedProps) {
  const { address } = useSuiAccount();

  // If the user is authenticated, render the children
  if (address) {
    return <>{children}</>;
  }

  // Otherwise show blurred content with a login overlay
  return (
    <div className="relative w-full h-full min-h-[300px]">
      {/* Blurred content in background */}
      <div className="absolute inset-0 filter blur-md opacity-30 pointer-events-none overflow-hidden">
        {children}
      </div>

      {/* Login overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg border border-border z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center p-8 max-w-md text-center"
        >
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Lock className="h-10 w-10 text-primary" />
          </div>

          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{description}</p>

          <ConnectButton />

          <p className="text-xs text-muted-foreground mt-4">
            Secure blockchain authentication powered by Sui Wallet
          </p>
        </motion.div>
      </div>
    </div>
  );
}
