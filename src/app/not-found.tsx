'use client';

import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">{t('app.notFound')}</h1>
    </div>
  );
}
