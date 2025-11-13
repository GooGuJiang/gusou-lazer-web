'use client';

export const dynamic = 'force-dynamic';

import loadable from 'next/dynamic';

const BBCodeTester = loadable(() => import('@/components/BBCode/BBCodeTester'), {
  ssr: false,
});

export default function BBCodeTest() {
  return <BBCodeTester />;
}
