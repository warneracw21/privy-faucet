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
  webpack: (config, { isServer }) => {
    // Ignore test files in node_modules
    config.module.rules.push({
      test: /\.test\.(js|mjs|ts)$/,
      loader: "ignore-loader",
    });

    // Handle pino/thread-stream issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        worker_threads: false,
      };
    }

    return config;
  },
};

export default nextConfig;
