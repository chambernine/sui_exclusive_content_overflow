import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, Search, Plus, ClipboardList, User } from "lucide-react";

interface DockItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const DockItem = ({ to, icon, label, isActive }: DockItemProps) => {
  return (
    <Link to={to} className="relative">
      <motion.div
        className={cn(
          "relative flex flex-col items-center justify-center p-2 rounded-xl transition-colors",
          isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </motion.div>
    </Link>
  );
};

export function NavigationDock() {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const routes = [
    { path: "/home", icon: <Home className="h-5 w-5" />, label: "Home" },
    {
      path: "/explore-albums",
      icon: <Search className="h-5 w-5" />,
      label: "Discover",
    },
    {
      path: "/create-draft",
      icon: <Plus className="h-5 w-5" />,
      label: "Create",
    },
    {
      path: "/management-contents",
      icon: <ClipboardList className="h-5 w-5" />,
      label: "Requests",
    },
    { path: "/profile", icon: <User className="h-5 w-5" />, label: "Profile" },
  ];

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 py-2 "
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2,
      }}
    >
      <div className="flex items-center gap-1 md:gap-3 bg-card border border-border rounded-full px-6 py-1 shadow-lg backdrop-blur-lg">
        {routes.map((route) => (
          <DockItem
            key={route.path}
            to={route.path}
            icon={route.icon}
            label={route.label}
            isActive={
              route.path === "/home"
                ? location.pathname === "/home"
                : location.pathname.startsWith(route.path)
            }
          />
        ))}
      </div>
    </motion.div>
  );
}
