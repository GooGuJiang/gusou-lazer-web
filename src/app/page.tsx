'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import HeroSection from '@/components/Home/HeroSection';
import HomeFooter from '@/components/Home/HomeFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <HeroSection />
      <HomeFooter />
    </div>
  );
}
