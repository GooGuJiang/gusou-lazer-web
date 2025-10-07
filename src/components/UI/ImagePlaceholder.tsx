import React from 'react';

interface ImagePlaceholderProps {
  className?: string;
  text?: string;
  showIcon?: boolean;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  className = '',
  text = '加载中...',
  showIcon = true,
}) => {
  return (
    <div className={`animate-pulse flex items-center justify-center ${className}`} style={{ background: 'var(--card-bg)' }}>
      <div className="text-center" style={{ color: 'var(--text-muted)' }}>
        {showIcon && (
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        )}
        <span className="text-xs">{text}</span>
      </div>
    </div>
  );
};

export default ImagePlaceholder;