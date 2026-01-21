import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  env: {
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};
module.exports = {
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
  },
};
export default nextConfig;
