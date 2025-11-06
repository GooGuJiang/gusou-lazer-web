import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import { Toaster } from 'react-hot-toast';

import Navbar from '@/components/Layout/Navbar';
import ScrollToTop from '@/components/ScrollToTop';
import { Providers } from './providers';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'gusou! lazer',
  description: 'Community-driven osu! private server experience built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[var(--bg-primary)] text-[var(--text-primary)]`}>
        <Providers>
          <ScrollToTop />
          <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Navbar />
            <main className="pt-[56px] md:pt-20">
              {children}
            </main>
          </div>
          <Toaster
            position="top-right"
            containerStyle={{ top: 80, right: 16 }}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
