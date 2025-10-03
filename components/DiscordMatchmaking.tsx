/**
 * Discord Matchmaking Component
 * Handles 4v4 matchmaking queue and team formation
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Users, Clock, Target, Trophy, UserPlus } from 'lucide-react'

interface QueuePlayer {
  id: string
  name: string
  elo: number
  role?: 'captain' | 'player'
  ready: boolean
}

export const DiscordMatchmaking: React.FC = () => {
  const [queuePlayers, setQueuePlayers] = useState<QueuePlayer[]>([])
  const [queueTime, setQueueTime] = useState(0)
  const [isInQueue, setIsInQueue] = useState(false)
  const [estimatedWait, setEstimatedWait] = useState('2-5 minutes')

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isInQueue) {
      interval = setInterval(() => {
        setQueueTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isInQueue])

  const handleJoinQueue = () => {
    setIsInQueue(true)
    setQueueTime(0)
    // Mock adding player to queue
    const newPlayer: QueuePlayer = {
      id: 'current-player',
      name: 'You',
      elo: 1450,
      role: 'player',
      ready: true
    }
    setQueuePlayers([newPlayer])
  }

  const handleLeaveQueue = () => {
    setIsInQueue(false)
    setQueueTime(0)
    setQueuePlayers([])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="bg-gradient-to-br from-green-900/50 to-emerald-800/30 border-green-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-green-400" />
          <span>4v4 Matchmaking Queue</span>
          <Badge variant={isInQueue ? "default" : "secondary"} className={
            isInQueue ? "bg-green-600" : "bg-gray-600"
          }>
            {isInQueue ? "In Queue" : "Idle"}
          </Badge>
        </CardTitle>
        <p className="text-green-200">
          Join the 4v4 matchmaking queue with ELO-based team balancing
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Queue Status */}
        <div className="bg-green-800/20 rounded-lg p-4 border border-green-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">Queue Time</span>
            </div>
            <div className="text-green-300 font-mono">
              {formatTime(queueTime)}
            </div>
          </div>
          <Progress value={(queuePlayers.length / 8) * 100} className="h-2 bg-green-900" />
          <div className="flex justify-between text-sm text-green-300 mt-2">
            <span>{queuePlayers.length}/8 players</span>
            <span>Est: {estimatedWait}</span>
          </div>
        </div>

        {/* Queue Players */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span>Team 1</span>
            </h4>
            <div className="space-y-2">
              {queuePlayers.filter((_, i) => i < 4).map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                  <span className="text-white text-sm">{player.name}</span>
                  <Badge variant="outline" className="bg-transparent text-xs">
                    {player.elo} ELO
                  </Badge>
                </div>
              ))}
              {Array.from({ length: 4 - queuePlayers.filter((_, i) => i < 4).length }).map((_, index) => (
                <div key={`empty-${index}`} className="flex items-center p-2 bg-gray-700/30 rounded border border-dashed border-gray-600">
                  <UserPlus className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-400 text-sm">Waiting...</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Team 2</span>
            </h4>
            <div className="space-y-2">
              {queuePlayers.filter((_, i) => i >= 4).map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                  <span className="text-white text-sm">{player.name}</span>
                  <Badge variant="outline" className="bg-transparent text-xs">
                    {player.elo} ELO
                  </Badge>
                </div>
              ))}
              {Array.from({ length: 4 - queuePlayers.filter((_, i) => i >= 4).length }).map((_, index) => (
                <div key={`empty-${index}`} className="flex items-center p-2 bg-gray-700/30 rounded border border-dashed border-gray-600">
                  <UserPlus className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-400 text-sm">Waiting...</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Queue Actions */}
        <div className="flex gap-3">
          {!isInQueue ? (
            <Button 
              onClick={handleJoinQueue}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Join 4v4 Queue
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleLeaveQueue}
                variant="outline"
                className="flex-1 bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                Leave Queue
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                Ready Check
              </Button>
            </>
          )}
        </div>

        {/* Queue Info */}
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="text-sm text-gray-300">
            <strong>ELO Range:</strong> 1200-1800 | <strong>Mode:</strong> Snake Draft
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Teams are balanced automatically based on ELO ratings
          </div>
        </div>
      </CardContent>
    </Card>
  )
}