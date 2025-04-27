import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-mesh">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {children}
      </main>

      <footer className="mt-auto py-8 border-t border-border/40 bg-background/80 backdrop-blur-md relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/90 to-chart-1 bg-clip-text text-transparent">
                Exclusive Content Platform
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Private, secure, and decentralized exclusive content platform
                powered by Sui blockchain
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground/90">
                Platform
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Creator Rankings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground/90">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    About
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/30 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} SUI Exclusive Content Platform. All
              rights reserved.
            </p>

            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Discord"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                  <path d="M15 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                  <path d="M7.5 7.5C8.5 6.5 9.5 6 12 6s3.5.5 4.5 1.5"></path>
                  <path d="M16.5 16.5c-1 1-2 1.5-4.5 1.5s-3.5-.5-4.5-1.5"></path>
                  <path d="M20 21v-5c0-4.4-1.2-8.5-3.5-12"></path>
                  <path d="M4 21v-5c0-4.4 1.2-8.5 3.5-12"></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
