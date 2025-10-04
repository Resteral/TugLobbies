/**
 * RankingsExtras
 * Purpose: Compose additional ranking content (betting) to keep Dashboard tidy.
 */

import React from 'react';
import BettingMarkets from '../../components/markets/BettingMarkets';
import BettingRankings from '../../components/markets/BettingRankings';

export default function RankingsExtras() {
  return (
    <div className="space-y-6">
      <BettingRankings />
      <BettingMarkets />
    </div>
  );
}
