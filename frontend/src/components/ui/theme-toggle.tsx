import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="cursor-pointer relative h-10 w-10 rounded-full bg-background/10 backdrop-blur-md flex items-center justify-center border border-primary/20 hover:border-primary/40"
      whileTap={{ scale: 0.9 }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 0 10px rgba(77, 162, 255, 0.2)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: theme === "dark" ? 270 : 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {theme === "dark" ? (
          <Moon className="h-5 w-5 text-primary drop-shadow-glow" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
