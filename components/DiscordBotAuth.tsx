/**
 * Discord Bot Authentication Component - Enhanced UI/UX
 * Handles bot invitation and authentication flow
 * Structured for future real Discord bot integration
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ExternalLink, Bot, Users, MessageSquare, MessageCircle, Shield, Zap, CheckCircle, RefreshCw } from 'lucide-react'
import { discordService } from '../services/discord-service'

export default function DiscordBotAuth() {
  const [isInviting, setIsInviting] = useState(false)
  const [botStatus, setBotStatus] = useState<'offline' | 'connecting' | 'online'>('offline')

  const handleInviteBot = async () => {
    setIsInviting(true)
    setBotStatus('connecting')
    
    // Simulate bot connection process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setBotStatus('online')
      
      // In real implementation, this would redirect to Discord OAuth
      const inviteUrl = discordService.getBotInviteUrl()
      window.open(inviteUrl, '_blank')
    } catch (error) {
      console.error('Error inviting bot:', error)
      setBotStatus('offline')
    } finally {
      setIsInviting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'connecting': return 'bg-yellow-500 animate-pulse'
      default: return 'bg-red-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Connected'
      case 'connecting': return 'Connecting...'
      default: return 'Offline'
    }
  }

  const botFeatures = [
    {
      icon: MessageSquare,
      title: 'Slash Commands',
      description: 'Use /queue, /stats, /profile in any channel',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Automated team creation and balancing',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Moderation',
      description: 'Auto-moderation and spam protection',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Instant match notifications and alerts',
      color: 'from-orange-500 to-amber-500'
    }
  ]

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-gray-600 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <span>Discord Bot Setup</span>
              <Badge className={getStatusColor(botStatus)}>
                {getStatusText(botStatus)}
              </Badge>
            </div>
            <CardDescription className="text-gray-400 mt-1">
              Add the TUG Lobbies bot to your Discord server for enhanced features
            </CardDescription>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bot Status Card */}
        <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-xl p-4 border border-blue-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(botStatus)}`} />
              <div>
                <div className="text-white font-medium">TUG Lobbies Bot</div>
                <div className="text-blue-300 text-sm">
                  {botStatus === 'online' 
                    ? 'Ready to accept commands' 
                    : botStatus === 'connecting'
                    ? 'Establishing connection...'
                    : 'Invite bot to get started'
                  }
                </div>
              </div>
            </div>
            <Button
              onClick={handleInviteBot}
              disabled={isInviting || botStatus === 'online'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300"
            >
              {isInviting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : botStatus === 'online' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Connected
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Invite Bot
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Bot Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {botFeatures.map((feature, index) => (
            <div 
              key={index}
              className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{feature.title}</div>
                  <div className="text-gray-400 text-xs">{feature.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Command Examples */}
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-600/30">
          <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 text-purple-400" />
            <span>Available Commands</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <code className="text-purple-300 text-sm font-mono">/queue join 4v4</code>
              <div className="text-gray-400 text-xs mt-1">Join 4v4 matchmaking queue</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <code className="text-purple-300 text-sm font-mono">/stats player_name</code>
              <div className="text-gray-400 text-xs mt-1">View player statistics</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <code className="text-purple-300 text-sm font-mono">/lobby create 2v2</code>
              <div className="text-gray-400 text-xs mt-1">Create a new 2v2 lobby</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <code className="text-purple-300 text-sm font-mono">/profile show</code>
              <div className="text-gray-400 text-xs mt-1">Display your profile</div>
            </div>
          </div>
        </div>

        {/* Integration Ready Note */}
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-600/30">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-green-300 font-medium text-sm">Ready for Real Integration</div>
              <div className="text-green-200/80 text-xs">
                Bot authentication system is structured for easy Discord.js integration
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}