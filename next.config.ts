import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["i.pravatar.cc"],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
