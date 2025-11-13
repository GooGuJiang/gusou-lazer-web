'use client';

import { useEffect } from 'react';
import i18n from '@/i18n';

export function I18nInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure i18n is initialized
    if (!i18n.isInitialized) {
      i18n.init();
    }
  }, []);
  
  return <>{children}</>;
}
