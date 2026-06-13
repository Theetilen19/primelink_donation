import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Stripe webhooks to read raw body
  experimental: {},
  // Required for Stripe webhook signature verification
  serverExternalPackages: ['stripe'],
};

export default nextConfig;
