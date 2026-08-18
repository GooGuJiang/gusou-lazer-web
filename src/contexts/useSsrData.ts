import { useContext } from 'react';
import { SsrDataContext } from './ssrDataContextCore';
import type { SsrDataContextValue } from './ssrDataContextCore';

export const useSsrData = (): SsrDataContextValue => useContext(SsrDataContext);
