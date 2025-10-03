/**
 * Dashboard page component
 * Main dashboard with statistics, leaderboard, and matchmaking features
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Trophy, Users, BarChart3, Gamepad2, Settings, LogOut } from 'lucide-react';
import BettingMarket from '../components/betting/BettingMarket';
import BettingCSVConnector from '../components/betting/BettingCSVConnector';
import MatchmakingQueue from '../components/MatchmakingQueue';
import { HockeyStatsDashboard } from '../components/zealot-hockey/HockeyStatsDashboard';
import { HockeyStatsSpreadsheet } from '../components/zealot-hockey/HockeyStatsSpreadsheet';
import { Leaderboard } from '../components/zealot-hockey/Leaderboard';
import { PlayerLogin } from '../components/zealot-hockey/PlayerLogin';
import { playerManagement } from '../services/player-management';
import { Player } from '../types/zealot-hockey';
import ResultsWebhookConsole from '../components/webhook/ResultsWebhookConsole';
import { GlobalEloLeaderboard } from '../components/leaderboards/GlobalEloLeaderboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Check if player is logged in
    const player = playerManagement.getCurrentPlayer();
    setCurrentPlayer(player);
  }, []);

  const handleLogin = (player: Player) => {
    setCurrentPlayer(player);
    setShowLogin(false);
  };

  const handleLogout = () => {
    playerManagement.logout();
    setCurrentPlayer(null);
  };

  // Mock player data for demonstration
  const mockPlayers: Player[] = [
    {
      id: '1',
      name: 'ZealotMaster',
      accountId: '1-S2-1-850006',
      elo: 1450,
      matchesPlayed: 25,
      wins: 18,
      losses: 7,
      winRate: 72,
      lastPlayed: new Date(),
      joinDate: new Date('2024-01-01'),
      gameStats: {}
    },
    {
      id: '2',
      name: 'HockeyPro',
      accountId: '1-S2-1-850007',
      elo: 1380,
      matchesPlayed: 22,
      wins: 15,
      losses: 7,
      winRate: 68,
      lastPlayed: new Date(),
      joinDate: new Date('2024-01-02'),
      gameStats: {}
    },
    {
      id: '3',
      name: 'GoalGuardian',
      accountId: '1-S2-1-850008',
      elo: 1420,
      matchesPlayed: 30,
      wins: 20,
      losses: 10,
      winRate: 67,
      lastPlayed: new Date(),
      joinDate: new Date('2024-01-03'),
      gameStats: {}
    }
  ];

  // Mock hockey stats data
  const mockHockeyStats = [
    {
      id: '1',
      accountId: '1-S2-1-850006',
      name: 'ZealotMaster',
      gamesPlayed: 25,
      goals: 18,
      assists: 12,
      points: 30,
      rating: 8.5,
      elo: 1450,
      plusMinus: 15,
      timeOnIce: 1250,
      shots: 45,
      shootingPercentage: 40.0,
      penalties: 2,
      penaltyMinutes: 4
    },
    {
      id: '2',
      accountId: '1-S2-1-850007',
      name: 'HockeyPro',
      gamesPlayed: 22,
      goals: 15,
      assists: 10,
      points: 25,
      rating: 7.8,
      elo: 1380,
      plusMinus: 12,
      timeOnIce: 1100,
      shots: 38,
      shootingPercentage: 39.5,
      penalties: 1,
      penaltyMinutes: 2
    },
    {
      id: '3',
      accountId: '1-S2-1-850008',
      name: 'GoalGuardian',
      gamesPlayed: 30,
      goals: 20,
      assists: 15,
      points: 35,
      rating: 9.2,
      elo: 1420,
      plusMinus: 18,
      timeOnIce: 1500,
      shots: 52,
      shootingPercentage: 38.5,
      penalties: 3,
      penaltyMinutes: 6
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              TUG Lobbies Dashboard
            </h1>
            <p className="text-purple-200 mt-2">
              Advanced matchmaking and statistics for Zealot Hockey
            </p>
          </div>
          
          {/* User Section */}
          <div className="flex items-center space-x-4">
            {currentPlayer ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-white font-semibold">{currentPlayer.name}</div>
                  <div className="text-purple-300 text-sm">Account: {currentPlayer.accountId}</div>
                  <div className="text-blue-300 text-sm">ELO: {currentPlayer.elo}</div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowLogin(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-900/20 border-blue-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-400">1,247</div>
              <div className="text-blue-300 text-sm">Active Players</div>
            </CardContent>
          </Card>
          <Card className="bg-green-900/20 border-green-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-400">42</div>
              <div className="text-green-300 text-sm">Tournaments</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-900/20 border-purple-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-400">8,956</div>
              <div className="text-purple-300 text-sm">Matches Played</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-900/20 border-yellow-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-400">$2,580</div>
              <div className="text-yellow-300 text-sm">Prize Pool</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Statistics */}
          <div className="space-y-6">
            {/* Hockey Statistics Dashboard */}
            <Card className="bg-slate-800/30 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span>Hockey Statistics Dashboard</span>
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Comprehensive player statistics and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HockeyStatsDashboard stats={mockHockeyStats} />
              </CardContent>
            </Card>

            {/* Detailed Statistics Spreadsheet */}
            <Card className="bg-slate-800/30 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Gamepad2 className="w-5 h-5 text-green-400" />
                  <span>Detailed Statistics Spreadsheet</span>
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Advanced filtering and analysis with account ID tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HockeyStatsSpreadsheet stats={mockHockeyStats} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Matchmaking & Leaderboard */}
          <div className="space-y-6">
            {/* Player Leaderboard */}
            <Card className="bg-slate-800/30 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span>Player Leaderboard</span>
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Top players ranked by ELO and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Leaderboard players={mockPlayers} />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800/30 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <p className="text-purple-200">
                  Get started with matchmaking and tournaments
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={() => navigate('/tournaments')}
                    className="bg-purple-600 hover:bg-purple-700 justify-start"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Browse Tournaments
                  </Button>
                  <Button 
                    onClick={() => navigate('/host')}
                    variant="outline"
                    className="bg-transparent border-green-600 text-green-400 hover:bg-green-600 hover:text-white justify-start"
                  >
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Host Tournament
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="bg-transparent border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Matchmaking Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Matchmaking visible */}
            <MatchmakingQueue />

            {/* Betting & CSV Settlement */}
            <BettingMarket />
            <BettingCSVConnector />

            {/* Webhook Console (CSV) */}
            <ResultsWebhookConsole />

            {/* Global ELO Leaderboard from applied webhook results */}
            <GlobalEloLeaderboard />
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full">
            <PlayerLogin onLogin={handleLogin} onCancel={() => setShowLogin(false)} />
          </div>
        </div>
      )}
    </div>
  );
}