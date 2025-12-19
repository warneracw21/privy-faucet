import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude problematic packages from server-side bundling
  // These packages have test files that reference dev dependencies
  serverExternalPackages: [
    "pino",
    "thread-stream",
    "@reown/appkit",
    "@reown/appkit-controllers",
    "@reown/appkit-utils",
    "@walletconnect/ethereum-provider",
    "@walletconnect/universal-provider",
    "@walletconnect/logger",
    "@walletconnect/utils",
  ],
  // Turbopack config (Next.js 16+ uses Turbopack by default)
  turbopack: {},
};

export default nextConfig;
