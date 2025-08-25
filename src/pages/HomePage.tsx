import React from 'react';
import HeroSection from '../components/Home/HeroSection';
import HomeFooter from '../components/Home/HomeFooter';

const HomePage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
    <HeroSection />
    <HomeFooter />
  </div>
);

export default HomePage;
