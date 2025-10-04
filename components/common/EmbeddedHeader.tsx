/**
 * EmbeddedHeader
 * Purpose: Render a compact header when embedded (e.g., Discord Activities / iframe).
 * - Saves vertical space and shows only brand + status.
 */

import React from 'react';
import useDiscordActivity from '../../hooks/useDiscordActivity';
import DiscordStatusBadge from './DiscordStatusBadge';

/**
 * EmbeddedHeader component
 * Displays a thin bar when embedded. Hidden in normal web.
 */
export default function EmbeddedHeader() {
  const { isDiscordActivity, isEmbedded } = useDiscordActivity();
  const show = isDiscordActivity || isEmbedded;

  if (!show) return null;

  return (
    <div className="w-full sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-purple-600" />
          <span className="text-sm font-semibold text-white">TUG Lobbies</span>
        </div>
        <div className="flex items-center gap-2">
          <DiscordStatusBadge />
          <a
            href="https://tuglobbies.com"
            className="text-xs text-blue-300 hover:text-blue-200 underline"
            target="_blank"
            rel="noreferrer"
            title="Open in browser"
          >
            Open in browser
          </a>
        </div>
      </div>
    </div>
  );
}
