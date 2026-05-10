import type { NextConfig } from "next";

let supabaseHostname = "localhost";

try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  }
} catch {
  // ignore invalid URL
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**"
      },
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http:")
        ? [
            {
              protocol: "http" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**"
            }
          ]
        : [])
    ]
  }
};

export default nextConfig;
