import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ConnectButton } from "@mysten/dapp-kit";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../theme-toggle";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Create Content", path: "/allowlist-example" },
  { name: "My Content", path: "/allowlist-example/admin/allowlists" },
  { name: "Creator Rankings", path: "/creator-rankings" },
  { name: "My Profile", path: "/creator-profile/me" },
];

export const Navigation = () => {
  const location = useLocation();
  const currentAccount = useCurrentAccount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-xl shadow-sm dark:shadow-primary/5"
          : "bg-background/70 backdrop-blur-lg"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="size-9 rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all">
                <span className="font-bold text-white text-xl">S</span>
              </div>
              <span className="font-bold text-lg text-primary">
                SUI
                <span className="hidden sm:inline ml-1  bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent transition-colors">
                  Exclusive Content
                </span>
              </span>
            </Link>
          </div>

          {/* Navigation links - desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {currentAccount &&
              navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    location.pathname === item.path ||
                      (item.path !== "/" &&
                        location.pathname.startsWith(item.path))
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            {/* Connect button wrapper with styling */}
            <div className="relative group">
              <ConnectButton
                connectText="Connect Wallet"
                className="relative"
              />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "block px-3 py-2.5 rounded-md text-base font-medium transition-all",
                    location.pathname === item.path ||
                      (item.path !== "/" &&
                        location.pathname.startsWith(item.path))
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
