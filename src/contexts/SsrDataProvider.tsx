import type { ReactNode } from 'react';
import { SsrDataContext } from './ssrDataContextCore';
import type { SsrDataContextValue } from './ssrDataContextCore';

interface SsrDataProviderProps extends SsrDataContextValue {
  children: ReactNode;
}

const SsrDataProvider = ({ children, userPage, beatmapsets, beatmapset }: SsrDataProviderProps) => (
  <SsrDataContext.Provider value={{ userPage, beatmapsets, beatmapset }}>
    {children}
  </SsrDataContext.Provider>
);

export default SsrDataProvider;
