'use client';

import NextTopLoader from 'nextjs-toploader';

export function TopProgressBar() {
  return (
    <NextTopLoader
      color="#38bdf8"
      shadow="0 0 10px #38bdf8, 0 0 5px #38bdf8"
      showSpinner={false}
      height={3}
      crawlSpeed={150}
    />
  );
}
