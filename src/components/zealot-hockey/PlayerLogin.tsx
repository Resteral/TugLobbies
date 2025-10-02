/**
 * Player login component for account ID authentication and stat mapping
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { HockeyPlayerStats } from '../../types/hockey-stats';
import { LogIn, User, BarChart3, Trophy, Target, Shield } from 'lucide-react';

interface PlayerLoginProps {
  hockeyStats: HockeyPlayerStats[];
  onLogin: (playerStats: HockeyPlayerStats) => void;
  onLogout: () => void;
}

export const PlayerLogin: React.FC<PlayerLoginProps> = ({ 
  hockeyStats, 
  onLogin, 
  onLogout 
}) => {
  const [accountId, setAccountId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<HockeyPlayerStats | null>(null);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!accountId.trim()) {
      setError('Please enter your account ID');
      return;
    }

    const player = hockeyStats.find(stat => 
      stat.accountId.toLowerCase() === accountId.toLowerCase().trim()
    );

    if (player) {
      setCurrentPlayer(player);
      setIsLoggedIn(true);
      setError('');
      onLogin(player);
    } else {
      setError('Account ID not found in current stats data');
    }
  };

  const handleLogout = () => {
    setAccountId('');
    setCurrentPlayer(null);
    setIsLoggedIn(false);
    setError('');
    onLogout();
  };

  const getPlayerStatsSummary = (player: HockeyPlayerStats) => {
    return {
      games: hockeyStats.filter(stat => stat.accountId === player.accountId).length,
      totalGoals: hockeyStats
        .filter(stat => stat.accountId === player.accountId)
        .reduce((sum, stat) => sum + stat.goals, 0),
      totalAssists: hockeyStats
        .filter(stat => stat.accountId === player.accountId)
        .reduce((sum, stat) => sum + stat.assists, 0),
      totalPoints: hockeyStats
        .filter(stat => stat.accountId === player.accountId)
        .reduce((sum, stat) => sum + (stat.points || 0), 0),
      shootingPercentage: player.shootingPercentage || 0
    };
  };

  if (isLoggedIn && currentPlayer) {
    const stats = getPlayerStatsSummary(currentPlayer);
    
    return (
      <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-green-400" />
              <span>Welcome, {currentPlayer.handle}</span>
            </div>
            <Badge variant="default" className="bg-green-600">
              Logged In
            </Badge>
          </CardTitle>
          <CardDescription className="text-green-300">
            Account ID: {currentPlayer.accountId} • Team: {currentPlayer.team}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-green-800/30 rounded">
              <div className="text-green-400 font-bold text-lg">{stats.games}</div>
              <div className="text-green-300 text-sm">Games</div>
            </div>
            <div className="text-center p-3 bg-green-800/30 rounded">
              <div className="text-green-400 font-bold text-lg">{stats.totalGoals}</div>
              <div className="text-green-300 text-sm">Goals</div>
            </div>
            <div className="text-center p-3 bg-green-800/30 rounded">
              <div className="text-green-400 font-bold text-lg">{stats.totalAssists}</div>
              <div className="text-green-300 text-sm">Assists</div>
            </div>
            <div className="text-center p-3 bg-green-800/30 rounded">
              <div className="text-green-400 font-bold text-lg">{stats.totalPoints}</div>
              <div className="text-green-300 text-sm">Points</div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={() => window.location.href = `#player-stats-${currentPlayer.accountId}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View My Stats
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <LogIn className="w-5 h-5 text-blue-400" />
          <span>Player Login</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Enter your account ID to view your personal statistics and performance dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="accountId" className="text-sm font-medium text-white">
            Account ID
          </label>
          <Input
            id="accountId"
            type="text"
            placeholder="e.g., 1-S2-1-6820063"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
          {error && (
            <div className="text-red-400 text-sm flex items-center space-x-1">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        <Button 
          onClick={handleLogin}
          disabled={!accountId.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login to View Stats
        </Button>

        {hockeyStats.length > 0 && (
          <div className="text-sm text-gray-400">
            <p>Available account IDs in current data:</p>
            <div className="mt-2 max-h-20 overflow-y-auto bg-gray-900 rounded p-2">
              {[...new Set(hockeyStats.map(stat => stat.accountId))].slice(0, 10).map(id => (
                <div key={id} className="text-xs font-mono text-gray-300">
                  {id}
                </div>
              ))}
              {[...new Set(hockeyStats.map(stat => stat.accountId))].length > 10 && (
                <div className="text-xs text-gray-500 mt-1">
                  ... and {[...new Set(hockeyStats.map(stat => stat.accountId))].length - 10} more
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
