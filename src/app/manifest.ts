import type { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => ({
  name: 'g0v0! osu! lazer',
  short_name: 'g0v0!',
  description: 'An osu! lazer private server for every supported ruleset.',
  start_url: '/',
  display: 'standalone',
  background_color: '#18191f',
  theme_color: '#5ca9e5',
  icons: [
    {
      src: '/lazer.ico',
      sizes: 'any',
      type: 'image/x-icon',
    },
  ],
});

export default manifest;
