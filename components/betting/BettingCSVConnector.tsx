/**
 * BettingCSVConnector
 * Bridges CSV match results into the betting service to settle markets and bets.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CSVImporter } from '../zealot-hockey/CSVImporter';
import { bettingService } from '../../services/betting-service';
import { CheckCircle, Upload } from 'lucide-react';

export const BettingCSVConnector: React.FC = () => {
  const [summary, setSummary] = useState<{ settled: number; updatedBets: number } | null>(null);

  const handleImport = (rows: any[]) => {
    // rows are CSVMatchData[]
    const res = bettingService.settleFromMatches(rows as any);
    setSummary(res);
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-900/40 to-blue-900/30 border-emerald-700/40">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-400" />
          Settle Markets from CSV
          {summary && (
            <Badge className="bg-emerald-600 ml-2">
              <CheckCircle className="w-3 h-3 mr-1" />
              {summary.settled} markets • {summary.updatedBets} bets
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CSVImporter onImport={handleImport} type="matches" />
      </CardContent>
    </Card>
  );
};

export default BettingCSVConnector;
