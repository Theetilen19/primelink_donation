import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Stripe webhooks to read raw body
  experimental: {},
  // No external server packages needed currently
  serverExternalPackages: [],
};

export default nextConfig;
