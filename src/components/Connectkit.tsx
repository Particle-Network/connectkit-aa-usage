"use client";

import React from "react";

import { ConnectKitProvider, createConfig } from "@particle-network/connectkit";
import { authWalletConnectors } from "@particle-network/connectkit/auth";
import type { Chain } from "@particle-network/connectkit/chains";
// embedded wallet start
import { EntryPosition, wallet } from "@particle-network/connectkit/wallet";
// embedded wallet end
// aa start
import { aa } from "@particle-network/connectkit/aa";
// aa end
// evm start
import {
  base,
  baseSepolia,
  defineChain,
} from "@particle-network/connectkit/chains";
import {
  evmWalletConnectors,
  passkeySmartWallet,
} from "@particle-network/connectkit/evm";
// evm end

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY as string;
const appId = process.env.NEXT_PUBLIC_APP_ID as string;
const walletConnectProjectId = process.env
  .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

if (!projectId || !clientKey || !appId) {
  throw new Error("Please configure the Particle project in .env first!");
}

// Define Custom Chains
const KiteAiTestnet = defineChain({
  id: 2368,
  name: "Kite AI Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "KITE",
    symbol: "KITE",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.gokite.ai/"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://testnet.kitescan.ai/" },
  },
  testnet: true,
  custom: {
    icon: "https://ICON_URL",
  },
});

const config = createConfig({
  projectId,
  clientKey,
  appId,
  appearance: {
    //  optional, sort wallet connectors
    connectorsOrder: ["passkey", "social", "wallet"],
    recommendedWallets: [
      { walletId: "metaMask", label: "Recommended" },
      { walletId: "coinbaseWallet", label: "Popular" },
    ],
    language: "en-US",
  },
  walletConnectors: [
    authWalletConnectors({
      authTypes: ["google", "apple", "twitter", "github"], // Optional, restricts the types of social logins supported
    }),
    // evm start
    evmWalletConnectors({
      // TODO: replace it with your app metadata.
      metadata: {
        name: "Connectkit Demo",
        icon:
          typeof window !== "undefined"
            ? `${window.location.origin}/favicon.ico`
            : "",
        description: "Particle Connectkit Next.js Scaffold.",
        url: typeof window !== "undefined" ? window.location.origin : "",
      },
      walletConnectProjectId: walletConnectProjectId,
      connectorFns: [passkeySmartWallet()],
      multiInjectedProviderDiscovery: false,
    }),

    // evm end
  ],
  plugins: [
    // embedded wallet start
    wallet({
      visible: true,
      entryPosition: EntryPosition.BR,
    }),
    // embedded wallet end

    // aa config start
    // With Passkey auth use Biconomy or Coinbase
    aa({
      name: "BICONOMY",
      version: "2.0.0",
    }),
    // aa config end
  ],
  chains: [base, baseSepolia, KiteAiTestnet],
});

// Wrap your application with this component.
export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
  return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};
