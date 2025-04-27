import { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  const [mounted, setMounted] = useState(false);

  // Set dark as default
  const defaultProps = {
    defaultTheme: "dark",
    storageKey: "cryptofans-theme",
    enableSystem: true,
    enableColorScheme: true,
    ...props,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <NextThemesProvider {...defaultProps}>{children}</NextThemesProvider>;
}
