import { ReactNode } from "react";

import { useSuiAccount } from "@/hooks/useSuiAccount";
import { Login } from "./Login";

interface ProtectedProps {
  children: ReactNode;
  title?: string;
  description?: string;
  hideChildren?: boolean;
}

export function Protected({
  children,
  description = "You need to connect your wallet to access this feature",
  hideChildren = false,
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

      {!hideChildren && (
        <div className="absolute inset-0 filter blur-xl opacity-30 pointer-events-none overflow-hidden">
          {children}
        </div>
      )}

      {/* Login overlay */}
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Login description={description} />
      </div>
    </div>
  );
}
