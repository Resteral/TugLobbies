/**
 * ELO Tier utility
 * Maps ELO to a tier label and recommended colors for badges and accents.
 */

export interface TierInfo {
  label: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster';
  colorClass: string;
  gradientClass: string;
}

/**
 * Get tier information for a given ELO
 */
export function getTierForElo(elo?: number): TierInfo {
  const e = elo ?? 0;
  if (e >= 2600) {
    return { label: 'Grandmaster', colorClass: 'text-fuchsia-300', gradientClass: 'from-fuchsia-600 to-pink-600' };
  }
  if (e >= 2300) {
    return { label: 'Master', colorClass: 'text-purple-300', gradientClass: 'from-purple-600 to-indigo-600' };
  }
  if (e >= 2000) {
    return { label: 'Diamond', colorClass: 'text-cyan-300', gradientClass: 'from-cyan-600 to-blue-600' };
  }
  if (e >= 1800) {
    return { label: 'Platinum', colorClass: 'text-blue-300', gradientClass: 'from-blue-600 to-sky-600' };
  }
  if (e >= 1600) {
    return { label: 'Gold', colorClass: 'text-yellow-300', gradientClass: 'from-yellow-600 to-amber-600' };
  }
  if (e >= 1400) {
    return { label: 'Silver', colorClass: 'text-gray-300', gradientClass: 'from-gray-500 to-slate-600' };
  }
  return { label: 'Bronze', colorClass: 'text-orange-300', gradientClass: 'from-orange-600 to-amber-700' };
}
