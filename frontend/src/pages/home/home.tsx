// src/pages/Home.tsx
import { ConnectButton } from "@mysten/dapp-kit";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      <div className="relative w-full max-w-4xl">
        {/* Background elements */}
        <motion.div
          className="absolute top-[-20%] right-[5%] w-64 h-64 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.div
          className="absolute bottom-[-10%] left-[15%] w-48 h-48 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 bg-white/70 dark:bg-black/50 rounded-3xl border border-primary/20 shadow-xl backdrop-blur-lg p-8 md:p-12"
        >
          <motion.div
            variants={item}
            className="flex items-center justify-center mb-6"
          >
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-6">
              <Lock className="h-12 w-12 text-primary" />
            </div>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-2xl md:text-3xl font-bold text-center mb-4"
          >
            Exclusive Premium Content
          </motion.h1>

          <motion.p
            variants={item}
            className="text-center text-base md:text-lg text-foreground/80 mb-8 max-w-lg mx-auto"
          >
            Access exclusive content from your favorite creators in a secure,
            decentralized platform.
          </motion.p>

          {account ? (
            <motion.div variants={container} className="text-center space-y-6">
              <motion.div variants={item}>
                <p className="text-lg font-medium mb-2">Welcome back!</p>
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
            <motion.div variants={item} className="flex flex-col items-center">
              <p className="mb-6 text-center text-foreground/80">
                Please connect your wallet to access exclusive content
              </p>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="glow dark:drop-shadow-glow"
              >
                <ConnectButton />
              </motion.div>
            </motion.div>
          )}

          <motion.div variants={item} className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Powered by Sui Blockchain • Secure Transactions • Exclusive
              Content
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
