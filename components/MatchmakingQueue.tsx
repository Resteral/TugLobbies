/**
 * Matchmaking Queue Component
 * Handles player queue management for matchmaking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Users, Clock, Play, X, UserPlus } from 'lucide-react';

interface QueuePlayer {
  id: string;
  name: string;
  elo: number;
  ready: boolean;
  queueTime: Date;
}

export default function MatchmakingQueue() {
  const [queuePlayers, setQueuePlayers] = useState<QueuePlayer[]>([]);
  const [queueTime, setQueueTime] = useState(0);
  const [isInQueue, setIsInQueue] = useState(false);
  const [estimatedWait, setEstimatedWait] = useState('2-5 minutes');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInQueue) {
      interval = setInterval(() => {
        setQueueTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInQueue]);

  const handleJoinQueue = () => {
    setIsInQueue(true);
    setQueueTime(0);
    // Add current player to queue
    const newPlayer: QueuePlayer = {
      id: 'current-player',
      name: 'You',
      elo: 1450,
      ready: true,
      queueTime: new Date()
    };
    setQueuePlayers([newPlayer]);
  };

  const handleLeaveQueue = () => {
    setIsInQueue(false);
    setQueueTime(0);
    setQueuePlayers([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/50 to-purple-800/30 border-blue-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-400" />
          <span>Matchmaking Queue</span>
          <Badge variant={isInQueue ? "default" : "secondary"} className={
            isInQueue ? "bg-green-600" : "bg-gray-600"
          }>
            {isInQueue ? "In Queue" : "Idle"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-blue-200">
          Join the matchmaking queue to find opponents with similar ELO ratings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Queue Status */}
        <div className="bg-blue-800/20 rounded-lg p-4 border border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">Queue Time</span>
            </div>
            <div className="text-blue-300 font-mono">
              {formatTime(queueTime)}
            </div>
          </div>
          <Progress value={(queuePlayers.length / 8) * 100} className="h-2 bg-blue-900" />
          <div className="flex justify-between text-sm text-blue-300 mt-2">
            <span>{queuePlayers.length}/8 players</span>
            <span>Est: {estimatedWait}</span>
          </div>
        </div>

        {/* Queue Players */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-green-400" />
            <span>Players in Queue</span>
          </h4>
          <div className="space-y-2">
            {queuePlayers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {player.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{player.name}</div>
                    <div className="text-gray-400 text-sm">ELO: {player.elo}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {player.ready && (
                    <Badge className="bg-green-600">Ready</Badge>
                  )}
                  <div className="text-gray-400 text-sm">
                    {Math.floor((new Date().getTime() - player.queueTime.getTime()) / 1000 / 60)}m
                  </div>
                </div>
              </div>
            ))}
            {queuePlayers.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No players in queue</p>
                <p className="text-sm">Be the first to join!</p>
              </div>
            )}
          </div>
        </div>

        {/* Queue Actions */}
        <div className="flex gap-3">
          {!isInQueue ? (
            <Button 
              onClick={handleJoinQueue}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Join Queue
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleLeaveQueue}
                variant="outline"
                className="flex-1 bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Leave Queue
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                Ready Check
              </Button>
            </>
          )}
        </div>

        {/* Queue Info */}
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="text-sm text-gray-300">
            <strong>ELO Range:</strong> 1200-1800 | <strong>Mode:</strong> Balanced Teams
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Teams are balanced automatically based on ELO ratings and player roles
          </div>
        </div>
      </CardContent>
    </Card>
  );
}