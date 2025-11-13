/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.memesearch.app',
      },
      {
        protocol: 'https',
        hostname: 'assets.ppy.sh',
      },
      {
        protocol: 'https',
        hostname: 'a.ppy.sh',
      },
      {
        protocol: 'https',
        hostname: 's.ppy.sh',
      },
      {
        protocol: 'https',
        hostname: 'b.ppy.sh',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.memesearch.app/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'content-type',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'DELETE,PUT,POST,GET,OPTIONS',
          },
        ],
      },
    ];
  },
  transpilePackages: ['react-native-web'],
};

export default nextConfig;
