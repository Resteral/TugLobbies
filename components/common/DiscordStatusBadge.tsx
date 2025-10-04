/**
 * DiscordStatusBadge
 * Purpose: Small, simplified environment/Discord status indicator.
 */

import React from 'react';
import useDiscordActivity from '../../hooks/useDiscordActivity';

/**
 * DiscordStatusBadge component
 * Shows "Discord Activity" when embedded/Discord detected, otherwise "Web".
 */
export default function DiscordStatusBadge() {
  const { isDiscordActivity } = useDiscordActivity();

  return (
    <span
      className={
        isDiscordActivity
          ? 'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-600 text-white'
          : 'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-700 text-slate-100'
      }
      title={isDiscordActivity ? 'Running inside Discord Activities' : 'Running in web browser'}
    >
      {isDiscordActivity ? 'Discord Activity' : 'Web'}
    </span>
  );
}
