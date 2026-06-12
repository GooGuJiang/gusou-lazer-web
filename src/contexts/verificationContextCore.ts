import { createContext } from 'react';
import type { ReactNode } from 'react';

export interface VerificationContextType {
  showVerificationModal: (method: 'totp' | 'mail') => Promise<void>;
  handleVerificationError: (error: unknown) => boolean;
}

export interface VerificationProviderProps {
  children: ReactNode;
}

export const VerificationContext = createContext<VerificationContextType | undefined>(undefined);
