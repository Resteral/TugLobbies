/**
 * Hockey Statistics Dashboard Component
 * Displays imported hockey statistics in a dashboard format
 */

import React from 'react';
import { HockeyPlayerStats } from '../../types/zealot-hockey';

/**
 * Props interface for HockeyStatsDashboard
 */
interface HockeyStatsDashboardProps {
  stats?: HockeyPlayerStats[];
}

/**
 * Hockey Statistics Dashboard Component
 * Displays hockey player statistics in an organized dashboard layout
 */
export function HockeyStatsDashboard({ stats = [] }: HockeyStatsDashboardProps) {
  // Calculate summary statistics
  const totalPlayers = stats.length;
  const totalGames = stats.reduce((sum, player) => sum + (player.gamesPlayed || 0), 0);
  const totalGoals = stats.reduce((sum, player) => sum + (player.goals || 0), 0);
  const totalAssists = stats.reduce((sum, player) => sum + (player.assists || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
          <div className="text-2xl font-bold text-purple-400">{totalPlayers}</div>
          <div className="text-sm text-purple-200">Players</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
          <div className="text-2xl font-bold text-green-400">{totalGames}</div>
          <div className="text-sm text-green-200">Games Played</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
          <div className="text-2xl font-bold text-blue-400">{totalGoals}</div>
          <div className="text-sm text-blue-200">Total Goals</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
          <div className="text-2xl font-bold text-yellow-400">{totalAssists}</div>
          <div className="text-sm text-yellow-200">Total Assists</div>
        </div>
      </div>

      {/* Player Statistics */}
      {stats.length > 0 ? (
        <div className="bg-slate-800/30 rounded-lg p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold mb-4 text-purple-300">Player Statistics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="text-left py-2 px-4 text-purple-300">Player</th>
                  <th className="text-right py-2 px-4 text-purple-300">Games</th>
                  <th className="text-right py-2 px-4 text-purple-300">Goals</th>
                  <th className="text-right py-2 px-4 text-purple-300">Assists</th>
                  <th className="text-right py-2 px-4 text-purple-300">Points</th>
                  <th className="text-right py-2 px-4 text-purple-300">Rating</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((player, index) => (
                  <tr 
                    key={player.id || index} 
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-2 px-4 font-medium">{player.name}</td>
                    <td className="py-2 px-4 text-right">{player.gamesPlayed || 0}</td>
                    <td className="py-2 px-4 text-right text-green-400">{player.goals || 0}</td>
                    <td className="py-2 px-4 text-right text-blue-400">{player.assists || 0}</td>
                    <td className="py-2 px-4 text-right font-bold">
                      {(player.goals || 0) + (player.assists || 0)}
                    </td>
                    <td className="py-2 px-4 text-right text-yellow-400">
                      {player.rating ? player.rating.toFixed(1) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/30 rounded-lg p-8 border border-purple-500/20 text-center">
          <div className="text-4xl mb-4">🏒</div>
          <h3 className="text-xl font-bold mb-2 text-purple-300">No Statistics Available</h3>
          <p className="text-purple-200 mb-4">
            Import your hockey statistics CSV file to see detailed player analytics
          </p>
          <div className="text-sm text-purple-300">
            Use the Hockey Stats Importer to upload your data
          </div>
        </div>
      )}
    </div>
  );
}