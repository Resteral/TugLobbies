/**
 * useDiscordActivity hook
 * Purpose: Lightweight detection for Discord Activities embedded environment.
 * Notes:
 * - Without the official SDK, we use UA heuristics and embed checks.
 * - Exposes a minimal shape that components can use to tailor UI.
 */

import { useEffect, useMemo, useState } from 'react';

interface DiscordActivityState {
  /** True if likely embedded inside Discord Activities or a webview */
  isDiscordActivity: boolean;
  /** Extracted from URL params when present (best-effort placeholder) */
  guildId?: string | null;
  channelId?: string | null;
  userId?: string | null;
  /** Helpful raw flags */
  isEmbedded: boolean;
  userAgent: string;
}

/**
 * Parse simple URL params into IDs (best-effort for demos).
 */
function parseIdsFromSearch(): Pick<DiscordActivityState, 'guildId' | 'channelId' | 'userId'> {
  try {
    const sp = new URLSearchParams(window.location.search);
    return {
      guildId: sp.get('guild_id') || sp.get('guildId'),
      channelId: sp.get('channel_id') || sp.get('channelId'),
      userId: sp.get('user_id') || sp.get('userId'),
    };
  } catch {
    return { guildId: null, channelId: null, userId: null };
  }
}

/**
 * Heuristic Discord Activities / webview detection:
 * - UA contains "Discord"
 * - or embedded (window.top !== window.self)
 * - optional hint via ?activity=true
 */
export function useDiscordActivity(): DiscordActivityState {
  const [ua, setUa] = useState<string>('');

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setUa(navigator.userAgent || '');
    }
  }, []);

  const isEmbedded = useMemo(() => {
    try {
      return typeof window !== 'undefined' && window.top !== window.self;
    } catch {
      return true; // cross-origin iframes
    }
  }, []);

  const { guildId, channelId, userId } = parseIdsFromSearch();

  const isDiscordActivity = useMemo(() => {
    const hint = typeof window !== 'undefined' && window.location.search.includes('activity=true');
    const discordUA = ua.toLowerCase().includes('discord');
    return hint || discordUA || isEmbedded;
  }, [ua, isEmbedded]);

  return {
    isDiscordActivity,
    guildId,
    channelId,
    userId,
    isEmbedded,
    userAgent: ua,
  };
}

export default useDiscordActivity;
