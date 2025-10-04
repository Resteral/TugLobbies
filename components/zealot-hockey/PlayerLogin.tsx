/**
 * Player Login Component
 * Handles player authentication with account ID generation
 */

import React, { useState } from 'react';
import { Player } from '../../types/zealot-hockey';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { User, Key, LogIn, UserPlus, X } from 'lucide-react';

interface PlayerLoginProps {
  onLogin: (player: Player) => void;
  onCancel?: () => void;
}

/**
 * Player Login Component
 * Provides authentication interface for players with account ID generation
 */
export function PlayerLogin({ onLogin, onCancel }: PlayerLoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [accountId, setAccountId] = useState('');

  /**
   * Generate a new account ID in 1-S2-1-XXXXXX format
   */
  const generateAccountId = (): string => {
    const uniqueId = 100000 + Math.floor(Math.random() * 900000);
    return `1-S2-1-${uniqueId}`;
  };

  /**
   * Handle player login/signup
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      alert('Please enter your player name');
      return;
    }

    const finalAccountId = isSignUp ? generateAccountId() : (accountId || generateAccountId());

    const player: Player = {
      id: `player-${Date.now()}`,
      accountId: finalAccountId,
      name: playerName.trim(),
      elo: 1200,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      lastPlayed: new Date(),
      joinDate: new Date(),
      gameStats: {}
    };

    onLogin(player);
  };

  return (
    <Card className="w-full max-w-md bg-slate-800 border-purple-500/30">
      <CardHeader className="relative">
        <CardTitle className="text-white flex items-center space-x-2">
          <User className="w-5 h-5 text-purple-400" />
          <span>{isSignUp ? 'Create Account' : 'Player Login'}</span>
        </CardTitle>
        <CardDescription className="text-purple-200">
          {isSignUp ? 'Create your hockey player account' : 'Sign in to access your stats'}
        </CardDescription>
        {onCancel && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-6 w-6 bg-transparent text-purple-300 hover:text-white"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Player Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Player Name
            </label>
            <Input
              placeholder="Enter your player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300"
              required
            />
          </div>

          {/* Account ID Input (for login) */}
          {!isSignUp && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300 flex items-center">
                <Key className="w-4 h-4 mr-2" />
                Account ID (Optional)
              </label>
              <Input
                placeholder="1-S2-1-XXXXXX (leave blank for new account)"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300 font-mono text-sm"
              />
              <p className="text-xs text-purple-400">
                Leave blank to generate a new account ID automatically
              </p>
            </div>
          )}

          {/* Account ID Preview (for signup) */}
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">
                Your Account ID
              </label>
              <div className="bg-slate-700/50 border border-purple-500/30 rounded-md p-3">
                <div className="font-mono text-blue-400 text-sm text-center">
                  {generateAccountId()}
                </div>
                <p className="text-xs text-purple-400 mt-1 text-center">
                  This will be your permanent player identifier
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isSignUp ? (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>

          {/* Toggle between login/signup */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-400 hover:text-purple-300 text-sm underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>

          {/* Info Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-transparent border-blue-500 text-blue-400">
              Account ID Format: 1-S2-1-XXXXXX
            </Badge>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}