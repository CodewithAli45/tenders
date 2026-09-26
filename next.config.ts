import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/pdf-manager",
        destination: "/tender-document-tools",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
