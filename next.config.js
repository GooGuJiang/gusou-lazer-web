/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.memesearch.app', 'assets.ppy.sh', 'a.ppy.sh', 's.ppy.sh', 'b.ppy.sh'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.memesearch.app',
      },
      {
        protocol: 'https',
        hostname: '**.ppy.sh',
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
