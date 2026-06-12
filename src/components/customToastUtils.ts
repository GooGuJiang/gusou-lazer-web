import React from 'react';
import toast from 'react-hot-toast';
import { CustomToast } from './CustomToast';

interface CustomToastProps {
  title: string;
  message: string;
  sourceUserId?: number;
  type: 'pm' | 'team' | 'public' | 'system' | 'default';
  avatar?: string;
  username?: string;
  onDismiss?: () => void;
}

export const showCustomToast = (props: CustomToastProps) => {
  return toast.custom(
    toastInstance => React.createElement(CustomToast, {
      ...props,
      onDismiss: () => toast.dismiss(toastInstance.id),
    }),
    {
      duration: 5000,
      position: 'top-right',
    }
  );
};
