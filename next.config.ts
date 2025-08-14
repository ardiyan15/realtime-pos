import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },

  devIndicators: false,
  images: {
    domains: ["https://hlnyevvoylahyatjsnbc.storage.supabase.co", "https://hlnyevvoylahyatjsnbc.supabase.co"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hlnyevvoylahyatjsnbc.storage.supabase.co',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'hlnyevvoylahyatjsnbc.supabase.co',
        port: '',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
