import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { networkConfig } from "./config/networkConfig.ts";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" attribute="class">
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider autoConnect storageKey="sui-wallet-connection">
            <App />
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
