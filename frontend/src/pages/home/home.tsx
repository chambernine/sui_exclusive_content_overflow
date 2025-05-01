// src/pages/Home.tsx
import { ConnectButton } from "@mysten/dapp-kit";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Login } from "@/components/auth/Login";

export default function Home() {
  const { account, address } = useSuiAccount();
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      {account ? (
        <motion.div variants={container} className="text-center space-y-6">
          <motion.div variants={item}>
            <p className="text-lg font-medium mb-2">Welcome back!</p>
            <ConnectButton />

            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary dark:text-primary">
              <span className="mr-2">●</span>
              <span className="font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-primary to-blue-600 text-white font-medium rounded-full px-8 py-3 shadow-lg hover:shadow-primary/25"
              onClick={() => navigate("/content")}
            >
              Explore Content
            </motion.button>
          </motion.div>
        </motion.div>
      ) : (
        <Login description="Please connect your wallet to access exclusive content" />
      )}
    </div>
  );
}
