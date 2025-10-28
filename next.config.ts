import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  env: {
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
  },
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
};

export default nextConfig;
