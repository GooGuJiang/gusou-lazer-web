import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
