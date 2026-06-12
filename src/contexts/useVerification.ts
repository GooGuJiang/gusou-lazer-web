import { useContext } from 'react';
import { VerificationContext } from './verificationContextCore';
import type { VerificationContextType } from './verificationContextCore';

export const useVerification = (): VerificationContextType => {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};
