/**
 * Comprehensive hockey statistics dashboard with advanced metrics
 */

import React from 'react';
import { HockeyPlayerStats } from '../../types/hockey-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Trophy, Target, Users, Clock, Zap, TrendingUp, Shield, Crosshair } from 'lucide-react';
import { HockeyCSVParser } from '../../utils/hockey-csv-parser';

interface HockeyStatsDashboardProps {
  stats: HockeyPlayerStats[];
  onExport?: () => void;
}

export const HockeyStatsDashboard: React.FC<HockeyStatsDashboardProps> = ({ stats, onExport }) => {
  if (stats.length === 0) {
    return (
      <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Hockey Statistics</h3>
          <p className="text-gray-400">Import a CSV file to view detailed hockey statistics</p>
        </CardContent>
      </Card>
    );
  }

  const teamStats = HockeyCSVParser.calculateTeamStats(stats);
  const players = [...stats].sort((a, b) => b.points! - a.points!);
  const goalies = stats.filter(stat => stat.goaltenderTime > 0);
  const skaters = stats.filter(stat => stat.skaterTime > 0);

  // Top performers
  const topScorer = [...stats].sort((a, b) => b.goals - a.goals)[0];
  const topAssist = [...stats].sort((a, b) => b.assists - a.assists)[0];
  const topGoalie = goalies.length > 0 ? [...goalies].sort((a, b) => b.savePercentage! - a.savePercentage!)[0] : null;
  const topPossession = [...stats].sort((a, b) => b.possession - a.possession)[0];

  const StatCard = ({ icon: Icon, title, value, subtitle, trend }: { 
    icon: any; 
    title: string; 
    value: string | number; 
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Icon className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-sm">{title}</span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
          </div>
          {trend && (
            <div className={`w-3 h-3 rounded-full ${
              trend === 'up' ? 'bg-green-500' : 
              trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Target className="w-6 h-6 text-green-400" />
            <span>Hockey Statistics Dashboard</span>
          </h2>
          <p className="text-gray-400">
            Advanced analytics for {stats.length} players across {teamStats.length} teams
          </p>
        </div>
        {onExport && (
          <Button onClick={onExport} className="bg-green-600 hover:bg-green-700">
            <TrendingUp className="w-4 h-4 mr-2" />
            Export Analysis
          </Button>
        )}
      </div>

      {/* Team Overview */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Team Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {teamStats.map(team => (
              <Card key={team.team} className="bg-blue-900/20 border-blue-600">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="font-bold text-blue-400 text-lg mb-2">{team.team}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-white font-semibold">{team.totalGoals}</div>
                        <div className="text-gray-400">Goals</div>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{team.totalShots}</div>
                        <div className="text-gray-400">Shots</div>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{team.shootingPercentage.toFixed(1)}%</div>
                        <div className="text-gray-400">Shot %</div>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{team.passCompletion.toFixed(1)}%</div>
                        <div className="text-gray-400">Pass %</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>Performance Leaders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={Target}
              title="Top Scorer"
              value={topScorer?.goals || 0}
              subtitle={topScorer?.handle}
              trend="up"
            />
            <StatCard 
              icon={Zap}
              title="Top Assists"
              value={topAssist?.assists || 0}
              subtitle={topAssist?.handle}
              trend="up"
            />
            <StatCard 
              icon={Shield}
              title="Top Save %"
              value={topGoalie ? `${topGoalie.savePercentage?.toFixed(1)}%` : 'N/A'}
              subtitle={topGoalie?.handle}
              trend="up"
            />
            <StatCard 
              icon={Clock}
              title="Possession Leader"
              value={`${Math.floor((topPossession?.possession || 0) / 60)}m`}
              subtitle={topPossession?.handle}
              trend="up"
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Statistics */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Player Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {players.slice(0, 10).map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{player.handle}</div>
                      <div className="text-gray-400 text-sm">{player.team}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{player.points} pts</div>
                    <div className="text-gray-400 text-sm">
                      {player.goals}G {player.assists}A
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Analytics */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Crosshair className="w-5 h-5" />
              <span>Advanced Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  icon={Target}
                  title="Avg Shooting %"
                  value={`${(stats.reduce((sum, p) => sum + (p.shootingPercentage || 0), 0) / stats.length).toFixed(1)}%`}
                  subtitle="All Players"
                />
                <StatCard 
                  icon={Zap}
                  title="Avg Pass Completion"
                  value={`${(stats.reduce((sum, p) => sum + (p.passCompletion || 0), 0) / stats.length).toFixed(1)}%`}
                  subtitle="All Players"
                />
              </div>
              
              {/* Goalie Stats */}
              {goalies.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Goaltender Performance</h4>
                  <div className="space-y-2">
                    {goalies.map(goalie => (
                      <div key={goalie.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                        <div className="text-white font-medium">{goalie.handle}</div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">{goalie.savePercentage?.toFixed(1)}%</div>
                          <div className="text-gray-400 text-sm">{goalie.saves}/{goalie.shotsAllowed} saves</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Analysis */}
              <div>
                <h4 className="text-white font-semibold mb-2">Time Distribution</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-blue-900/20 rounded">
                    <div className="text-blue-400 font-bold">
                      {Math.floor(stats.reduce((sum, p) => sum + p.skaterTime, 0) / 60)}m
                    </div>
                    <div className="text-gray-400">Total Skater Time</div>
                  </div>
                  <div className="text-center p-2 bg-green-900/20 rounded">
                    <div className="text-green-400 font-bold">
                      {Math.floor(stats.reduce((sum, p) => sum + p.goaltenderTime, 0) / 60)}m
                    </div>
                    <div className="text-gray-400">Total Goalie Time</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Detailed Player Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2 text-gray-400">Player</th>
                  <th className="text-right p-2 text-gray-400">Team</th>
                  <th className="text-right p-2 text-gray-400">G</th>
                  <th className="text-right p-2 text-gray-400">A</th>
                  <th className="text-right p-2 text-gray-400">PTS</th>
                  <th className="text-right p-2 text-gray-400">SHT</th>
                  <th className="text-right p-2 text-gray-400">SHT%</th>
                  <th className="text-right p-2 text-gray-400">PICK</th>
                  <th className="text-right p-2 text-gray-400">PASS%</th>
                  <th className="text-right p-2 text-gray-400">POS</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <tr key={player.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-2 text-white font-medium">{player.handle}</td>
                    <td className="p-2 text-right text-gray-400">{player.team}</td>
                    <td className="p-2 text-right text-white">{player.goals}</td>
                    <td className="p-2 text-right text-white">{player.assists}</td>
                    <td className="p-2 text-right text-green-400 font-bold">{player.points}</td>
                    <td className="p-2 text-right text-white">{player.shots}</td>
                    <td className="p-2 text-right text-blue-400">{player.shootingPercentage?.toFixed(1)}%</td>
                    <td className="p-2 text-right text-white">{player.pickups}</td>
                    <td className="p-2 text-right text-yellow-400">{player.passCompletion?.toFixed(1)}%</td>
                    <td className="p-2 text-right text-purple-400">{Math.floor(player.possession / 60)}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};