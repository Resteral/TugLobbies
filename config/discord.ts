/**
 * Discord configuration constants
 * Centralized place to store Discord Application settings.
 */

export const DISCORD_APP_ID = '1422066214666244227';

/**
 * Get the active Discord Application ID.
 * In the future, this can read from env vars safely (e.g., VITE_ prefixed).
 */
export function getDiscordAppId(): string {
  return DISCORD_APP_ID;
}
