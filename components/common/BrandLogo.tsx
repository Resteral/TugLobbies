/**
 * BrandLogo component
 * Purpose: Render the TUG logo with optional brand text. Compact and safe for embedded headers.
 */

import React from 'react';

/**
 * Props for BrandLogo
 */
export interface BrandLogoProps {
  /** Visual size of the logo */
  size?: 'sm' | 'md' | 'lg';
  /** Show the text label "TUG Lobbies" to the right of the logo */
  withText?: boolean;
  /** Optional container className */
  className?: string;
  /** Optional className applied to the text when withText is true */
  textClassName?: string;
}

/**
 * Internal mapping of size to Tailwind width/height classes
 */
const sizeMap: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

/**
 * BrandLogo
 * Displays the TUG logo image and optional brand text.
 */
export default function BrandLogo({
  size = 'md',
  withText = false,
  className = '',
  textClassName = '',
}: BrandLogoProps) {
  const imgClass = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo.png"
        alt="TUG logo"
        className={`${imgClass} object-contain rounded`}
      />
      {withText && (
        <span
          className={`font-extrabold tracking-tight bg-gradient-to-r from-amber-300 to-red-400 bg-clip-text text-transparent ${textClassName}`}
        >
          TUG Lobbies
        </span>
      )}
    </div>
  );
}
