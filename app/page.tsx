import React from 'react';

import HeroSection from '@/components/Home/HeroSection';
import HomeFooter from '@/components/Home/HomeFooter';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex-1">
        <HeroSection />
      </div>
      <HomeFooter />
    </div>
  );
}
