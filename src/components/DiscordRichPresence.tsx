/**
 * Discord Rich Presence Integration Component
 * Shows real-time game activity and player status in Discord
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Activity, Users, Clock, Trophy, Gamepad2, Eye } from 'lucide-react';

interface DiscordRichPresenceProps {
  activeLobbies: number;
  totalPlayers: number;
  currentActivity: {
    playersInQueue: number;
    matchesInProgress: number;
    averageWaitTime: string;
  };
}

export const DiscordRichPresence: React.FC<DiscordRichPresenceProps> = ({
  activeLobbies,
  totalPlayers,
  currentActivity
}) => {
  const presenceFeatures = [
    {
      icon: Activity,
      title: "Live Activity Display",
      description: "Show current match status and ELO in Discord"
    },
    {
      icon: Users,
      title: "Player Count",
      description: "Display active players and queue size"
    },
    {
      icon: Trophy,
      title: "ELO & Rankings",
      description: "Show player rankings and progress"
    },
    {
      icon: Gamepad2,
      title: "Match Details",
      description: "Display current game type and team composition"
    }
  ];

  const presenceExamples = [
    {
      status: "In Queue",
      details: "Waiting for 4v4 Hockey Match",
      state: "ELO: 1450 • 3/8 players",
      image: "zealot_hockey",
      timestamp: "2 minutes"
    },
    {
      status: "In Match",
      details: "Playing 4v4 Zealot Hockey",
      state: "Team Alpha vs Team Beta • 5:2",
      image: "zealot_hockey_match",
      timestamp: "12 minutes"
    },
    {
      status: "Viewing Stats",
      details: "Checking Leaderboards",
      state: "Rank #3 • 1850 ELO",
      image: "stats",
      timestamp: "Just now"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-800/30 border-purple-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <span>Discord Rich Presence</span>
          <Badge variant="default" className="bg-green-600">
            Active
          </Badge>
        </CardTitle>
        <CardDescription className="text-purple-200">
          Real-time game activity displayed in Discord with match details and player statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600/50 text-center">
            <div className="text-2xl font-bold text-purple-400">{activeLobbies}</div>
            <div className="text-purple-300 text-sm">Active Lobbies</div>
          </div>
          <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600/50 text-center">
            <div className="text-2xl font-bold text-purple-400">{totalPlayers}</div>
            <div className="text-purple-300 text-sm">Total Players</div>
          </div>
          <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600/50 text-center">
            <div className="text-2xl font-bold text-purple-400">{currentActivity.playersInQueue}</div>
            <div className="text-purple-300 text-sm">In Queue</div>
          </div>
        </div>

        {/* Rich Presence Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presenceFeatures.map((feature, index) => (
            <div key={index} className="bg-purple-800/20 rounded-lg p-4 border border-purple-600/30">
              <feature.icon className="w-8 h-8 text-purple-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
              <p className="text-purple-200 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Presence Examples */}
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-600">
          <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span>Discord Display Examples</span>
          </h4>
          <div className="space-y-3">
            {presenceExamples.map((example, index) => (
              <div key={index} className="bg-gray-800/50 rounded p-3 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white font-medium">{example.status}</div>
                    <div className="text-purple-300 text-sm">{example.details}</div>
                  </div>
                  <Badge variant="secondary" className="bg-purple-600 text-xs">
                    {example.timestamp}
                  </Badge>
                </div>
                <div className="text-gray-400 text-sm">{example.state}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Status */}
        <div className="bg-green-900/20 rounded-lg p-4 border border-green-600">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <div className="text-green-400 font-semibold">Rich Presence Active</div>
              <div className="text-green-300 text-sm">
                Players' game activity is automatically displayed in Discord
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">How It Works</h4>
          <div className="text-gray-300 text-sm space-y-2">
            <p>• Rich presence automatically activates when players join lobbies or queues</p>
            <p>• Shows current ELO, match status, and team information</p>
            <p>• Updates in real-time as matches progress</p>
            <p>• Displays player statistics and rankings</p>
            <p>• Custom images for different game types and activities</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};