import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"]
  },
  typescript: {
    ignoreBuildErrors: true, // 👈 Add this to skip TypeScript errors during build
  }
};

export default nextConfig;
