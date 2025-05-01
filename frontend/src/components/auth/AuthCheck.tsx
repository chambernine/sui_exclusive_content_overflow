import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

import { useSuiAccount } from "@/hooks/useSuiAccount";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Login } from "./Login";

interface AuthCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthCheck({ children, fallback }: AuthCheckProps) {
  const { address } = useSuiAccount();
  const [showDialog, setShowDialog] = useState(false);

  // If the user is authenticated, render the children
  if (address) {
    return <>{children}</>;
  }

  // If not authenticated and a fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise show a button that opens the login dialog
  return (
    <>
      <motion.div
        className="w-full h-full flex flex-col items-center justify-center"
        whileHover={{ scale: 1.02 }}
      >
        <Button
          onClick={() => setShowDialog(true)}
          variant="outline"
          className="space-x-2"
        >
          <LogIn className="h-4 w-4" />
          <span>Connect Wallet to Continue</span>
        </Button>
      </motion.div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect your wallet</DialogTitle>
            <DialogDescription>
              You need to connect your wallet to access this feature.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            <Login description="Connect your wallet to access exclusive content" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
