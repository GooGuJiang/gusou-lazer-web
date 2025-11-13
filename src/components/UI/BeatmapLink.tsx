import React from 'react';
import Link from 'next/link';
import { beatmapAPI } from '../../utils/api';

interface BeatmapLinkProps {
  beatmapUrl?: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  external?: boolean;
}

/**
 * BeatmapLink component that converts external osu! beatmap URLs to internal routes
 * or falls back to external links when needed
 */
const BeatmapLink: React.FC<BeatmapLinkProps> = ({ 
  beatmapUrl, 
  children, 
  className,
  title,
  external = false
}) => {
  if (!beatmapUrl || beatmapUrl === '#') {
    return <span className={className} title={title}>{children}</span>;
  }

  // Convert to internal route if possible
  const internalUrl = beatmapAPI.convertToInternalBeatmapUrl(beatmapUrl);
  
  // If we can convert to internal URL and external is not forced, use internal routing
  if (internalUrl && !external) {
    return (
      <Link
        href={internalUrl}
        className={className}
        title={title}
      >
        {children}
      </Link>
    );
  }

  // Fall back to external link
  return (
    <a
      href={beatmapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title}
    >
      {children}
    </a>
  );
};

export default BeatmapLink;
