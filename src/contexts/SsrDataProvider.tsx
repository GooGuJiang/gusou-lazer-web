import type { ReactNode } from 'react';
import { SsrDataContext } from './ssrDataContextCore';
import type { SsrDataContextValue } from './ssrDataContextCore';

interface SsrDataProviderProps extends SsrDataContextValue {
  children: ReactNode;
}

const SsrDataProvider = ({ children, userPage, beatmapsets }: SsrDataProviderProps) => (
  <SsrDataContext.Provider value={{ userPage, beatmapsets }}>{children}</SsrDataContext.Provider>
);

export default SsrDataProvider;
