/**
 * Discord Rich Presence Component
 * Displays Discord activity and rich presence status
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Activity, Users, Gamepad2, Clock, MessageSquare } from 'lucide-react'

interface DiscordRichPresenceProps {
  activeLobbies: number
  totalPlayers: number
  currentActivity: {
    playersInQueue: number
    matchesInProgress: number
    averageWaitTime: string
  }
}

export const DiscordRichPresence: React.FC<DiscordRichPresenceProps> = ({
  activeLobbies,
  totalPlayers,
  currentActivity
}) => {
  const discordActivities = [
    {
      user: 'ZealotMaster#1234',
      status: 'In Lobby - Zealot Hockey 4v4',
      details: 'Team Captain • ELO: 1450',
      game: 'Zealot Hockey',
      time: '15m'
    },
    {
      user: 'SC2Pro#5678',
      status: 'In Queue - SC2 1v1',
      details: 'Position: 3 • Wait: 2m',
      game: 'StarCraft II',
      time: '5m'
    },
    {
      user: 'HockeyChamp#9012',
      status: 'Watching Replay',
      details: 'Analyzing match • ELO: 1520',
      game: 'Zealot Hockey',
      time: '8m'
    }
  ]

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-pink-800/30 border-purple-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <span>Discord Rich Presence</span>
          <Badge variant="default" className="bg-purple-600">
            Live
          </Badge>
        </CardTitle>
        <p className="text-purple-200">
          Real-time Discord activity and status updates
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-800/20 rounded-lg p-4 text-center border border-purple-600/50">
            <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{currentActivity.playersInQueue}</div>
            <div className="text-purple-300 text-sm">In Queue</div>
          </div>
          <div className="bg-purple-800/20 rounded-lg p-4 text-center border border-purple-600/50">
            <Gamepad2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{currentActivity.matchesInProgress}</div>
            <div className="text-purple-300 text-sm">Matches Active</div>
          </div>
          <div className="bg-purple-800/20 rounded-lg p-4 text-center border border-purple-600/50">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{currentActivity.averageWaitTime}</div>
            <div className="text-purple-300 text-sm">Avg Wait Time</div>
          </div>
        </div>

        {/* Discord Activities */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-green-400" />
            <span>Recent Discord Activities</span>
          </h4>
          <div className="space-y-3">
            {discordActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {activity.user.split('#')[0].charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{activity.user}</div>
                    <div className="text-gray-300 text-xs">{activity.status}</div>
                    <div className="text-gray-400 text-xs">{activity.details}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-transparent text-xs mb-1">
                    {activity.game}
                  </Badge>
                  <div className="text-gray-400 text-xs">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rich Presence Status */}
        <div className="bg-purple-800/20 rounded-lg p-4 border border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-semibold">Rich Presence Active</div>
              <div className="text-purple-300 text-sm">
                Your status is visible to Discord friends
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Online</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}