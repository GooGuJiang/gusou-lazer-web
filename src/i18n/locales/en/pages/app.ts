export const appPages = {
  app: {
    beatmapsComingSoon: 'Beatmaps (coming soon)',
    notFound: '404 - Page not found',
  },
  shutdownNotice: {
    status: 'Service notice',
    languageLabel: 'Choose language',
    title: 'g0v0! is going offline for now.',
    content: `We received a cease and desist letter from peppy regarding our use of the osu! trademark.

We have taken down the client and related tools containing the affected copyrighted material.

The server and website will remain offline while we review and address trademark usage across our projects.

**Everything you have is still here. Nothing has been deleted.**

> Please don't go after peppy over this. They asked politely, and osu! is the reason any of us are here.

We'll be back as soon as we can. We'll post updates on [Discord](https://discord.gg/AhzJXXWYfF) when there is news.`,
    imageAlt: 'A sad character holding her hands in a heart shape',
  },
} as const;
