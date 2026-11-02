import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/pdf-manager",
        destination: "/tender-document-tools",
        permanent: true,
      },
      {
        source: "/services/cost-estimation",
        destination: "/services/estimation-billing-schedule",
        permanent: true,
      },
      {
        source: "/services/billing-schedule",
        destination: "/services/estimation-billing-schedule",
        permanent: true,
      },
      {
        source: "/services/reply-of-clarification",
        destination: "/services/clarification-submission",
        permanent: true,
      },
      {
        source: "/services/l2-network",
        destination: "/services",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
    ];
  },
};

export default nextConfig;
