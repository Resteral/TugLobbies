/**
 * CardDescription component
 * Purpose: Safe, lightweight description element for cards that doesn't rely on shadcn export presence.
 * Ensures consistent typography even if the underlying UI library changes.
 */

import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Props for CardDescription wrapper, extending <p> attributes.
 */
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

/**
 * CardDescription
 * A styled paragraph used within Card headers/content.
 */
export const CardDescription: React.FC<CardDescriptionProps> = ({ className, ...props }) => {
  return <p className={cn('text-sm text-slate-300', className)} {...props} />;
};

export default CardDescription;
