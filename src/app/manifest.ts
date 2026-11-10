import type { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => ({
  name: 'g0v0!',
  short_name: 'g0v0!',
  description:
    'g0v0! is a free and open rhythm game server with support for both stable and lazer clients and RX/AP pp calculation, designed to offer a freer rhythm experience.',
  start_url: '/',
  display: 'standalone',
  background_color: '#18191f',
  theme_color: '#5ca9e5',
  icons: [
    {
      src: '/favicon.png',
      sizes: '256x256',
      type: 'image/png',
    },
  ],
});

export default manifest;
