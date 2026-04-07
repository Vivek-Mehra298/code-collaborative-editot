import type { NextConfig } from "next";

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");
const ensureApiPath = (value: string) => {
  const trimmed = trimTrailingSlash(value);
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const resolveApiDestination = () => {
  if (process.env.API_URL) return ensureApiPath(process.env.API_URL);
  if (process.env.NEXT_PUBLIC_API_URL) return ensureApiPath(process.env.NEXT_PUBLIC_API_URL);
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return `${trimTrailingSlash(process.env.NEXT_PUBLIC_SOCKET_URL)}/api`;
  return null;
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiDestination = resolveApiDestination();

    if (!apiDestination) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiDestination}/:path*`,
      },
    ];
  },
};

export default nextConfig;
