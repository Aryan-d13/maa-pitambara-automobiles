import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@mp-auto/content"],
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
};

export default nextConfig;
