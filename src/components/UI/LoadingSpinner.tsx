import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const spinnerClass = `spinner spinner-${size}`;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={spinnerClass} />
    </div>
  );
};

export default LoadingSpinner;
