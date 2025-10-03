/**
 * Discord Integration Component - Enhanced UI/UX
 * Main interface for Discord account linking and bot features
 * Structured for easy future integration with real Discord API
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  MessageCircle, 
  Bot, 
  Users, 
  MessageSquare, 
  Link, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Shield,
  Zap,
  Bell,
  RefreshCw
} from 'lucide-react'
import { discordOAuth } from '../services/discord-oauth'
import { discordService } from '../services/discord-service'
import { DiscordActivitySDK } from './DiscordActivitySDK'

/**
 * Props for DiscordIntegration component
 */
interface DiscordIntegrationProps {
  /** Current player's ID */
  playerId: string
  /** Current player's display name */
  playerName: string
}

/**
 * DiscordIntegration
 * Provides account linking flow, feature overview, and a testable SDK card.
 */
export const DiscordIntegration: React.FC<DiscordIntegrationProps> = ({
  playerId,
  playerName
}) => {
  const [isLinked, setIsLinked] = useState(false)
  const [discordUser, setDiscordUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [connectionSteps, setConnectionSteps] = useState([
    { id: 1, name: 'Authentication', status: 'pending', description: 'Connect to Discord OAuth' },
    { id: 2, name: 'Permissions', status: 'pending', description: 'Grant bot access' },
    { id: 3, name: 'Profile Sync', status: 'pending', description: 'Sync player data' },
    { id: 4, name: 'Ready', status: 'pending', description: 'Integration complete' }
  ])

  useEffect(() => {
    checkDiscordLink()
  }, [playerId])

  /**
   * Check if Discord is already linked for this player
   */
  const checkDiscordLink = async () => {
    try {
      const user = await discordService.getDiscordUser(playerId)
      if (user) {
        setDiscordUser(user)
        setIsLinked(true)
        // Update steps to show completed state
        setConnectionSteps(steps => 
          steps.map(step => ({ ...step, status: 'completed' }))
        )
      }
    } catch (error) {
      console.error('Error checking Discord link:', error)
    }
  }

  /**
   * Start the mock linking flow with visual step-by-step updates
   */
  const handleLinkDiscord = async () => {
    setLoading(true)
    try {
      // Simulate connection steps with delays
      setConnectionSteps(steps => 
        steps.map(step => step.id === 1 ? { ...step, status: 'in-progress' } : step)
      )
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setConnectionSteps(steps => 
        steps.map(step => step.id === 1 ? { ...step, status: 'completed' } : step)
      )
      
      setConnectionSteps(steps => 
        steps.map(step => step.id === 2 ? { ...step, status: 'in-progress' } : step)
      )
      
      await new Promise(resolve => setTimeout(resolve, 800))
      setConnectionSteps(steps => 
        steps.map(step => step.id === 2 ? { ...step, status: 'completed' } : step)
      )
      
      // Mock OAuth flow
      discordOAuth.startOAuthFlow()
    } catch (error) {
      console.error('Error starting Discord OAuth:', error)
      setConnectionSteps(steps => 
        steps.map(step => ({ ...step, status: 'error' }))
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Unlink the Discord account (mock)
   */
  const handleUnlinkDiscord = async () => {
    setLoading(true)
    try {
      // In a real app, you would call an API to unlink
      setIsLinked(false)
      setDiscordUser(null)
      setConnectionSteps(steps => 
        steps.map(step => ({ ...step, status: 'pending' }))
      )
    } catch (error) {
      console.error('Error unlinking Discord:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Simulate a data sync progress bar
   */
  const simulateSync = () => {
    setSyncProgress(0)
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  /**
   * Render icon based on connection step status
   */
  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'in-progress':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-500" />
    }
  }

  /**
   * Get text color for step status
   */
  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'in-progress': return 'text-blue-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-pink-800/30 border-indigo-700/60 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <span>Discord Account Integration</span>
              <Badge variant={isLinked ? "default" : "secondary"} className={
                isLinked ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gray-600"
              }>
                {isLinked ? "Connected" : "Not Connected"}
              </Badge>
            </div>
            <p className="text-indigo-200 mt-1">
              Link your Discord account to enable rich presence, bot commands, and cross-platform features
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status with Steps */}
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {isLinked ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <div className="text-white font-semibold">
                  {isLinked ? "Discord Account Linked" : "Discord Not Connected"}
                </div>
                <div className="text-gray-400 text-sm">
                  {isLinked 
                    ? `Connected as ${discordUser?.username}#${discordUser?.discriminator}`
                    : "Link your Discord account to unlock features"
                  }
                </div>
              </div>
            </div>
            {isLinked ? (
              <Button 
                onClick={handleUnlinkDiscord}
                variant="outline"
                disabled={loading}
                className="bg-transparent border-red-600/60 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
              >
                Unlink Account
              </Button>
            ) : (
              <Button 
                onClick={handleLinkDiscord}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                <Link className="w-4 h-4 mr-2" />
                {loading ? "Connecting..." : "Link Discord"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Connection Steps */}
          <div className="space-y-3">
            {connectionSteps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-3">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <div className={`text-sm font-medium ${getStepColor(step.status)}`}>
                    {step.name}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {step.description}
                  </div>
                </div>
                {index < connectionSteps.length - 1 && (
                  <div className="w-6 h-px bg-gray-600 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-4 text-center border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-1">Bot Commands</h4>
            <p className="text-blue-300 text-sm">Use /queue commands in Discord</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-4 text-center border border-green-600/30 hover:border-green-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-1">Rich Presence</h4>
            <p className="text-green-300 text-sm">Show match status to friends</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl p-4 text-center border border-purple-600/30 hover:border-purple-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-1">Cross-Platform</h4>
            <p className="text-purple-300 text-sm">Sync across all devices</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 rounded-xl p-4 text-center border border-orange-600/30 hover:border-orange-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-1">Notifications</h4>
            <p className="text-orange-300 text-sm">Real-time match alerts</p>
          </div>
        </div>

        {/* Sync Progress */}
        {isLinked && (
          <div className="bg-gradient-to-br from-indigo-800/20 to-purple-800/20 rounded-xl p-4 border border-indigo-600/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <div className="text-white font-medium">Data Sync Status</div>
              </div>
              <Button 
                onClick={simulateSync}
                size="sm"
                variant="outline"
                className="bg-transparent border-indigo-500 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <Zap className="w-3 h-3 mr-1" />
                Sync Now
              </Button>
            </div>
            <Progress value={syncProgress} className="h-2 bg-indigo-900/50" />
            <div className="flex justify-between text-sm text-indigo-300 mt-2">
              <span>Profile Data &amp; Match History</span>
              <span>{syncProgress}%</span>
            </div>
          </div>
        )}

        {/* Benefits List */}
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
          <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Linked Account Benefits</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-green-900/20 border border-green-800/30">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-green-300 text-sm">Receive match notifications in Discord</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-blue-300 text-sm">Show your current match status to friends</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-purple-900/20 border border-purple-800/30">
              <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-purple-300 text-sm">Use bot commands for quick queue management</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-orange-900/20 border border-orange-800/30">
              <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span className="text-orange-300 text-sm">Sync your profile across web and Discord</span>
            </div>
          </div>
        </div>

        {/* Discord Activity SDK Integration */}
        <DiscordActivitySDK clientId="1422066214666244227" />

        {/* Future Integration Note */}
        <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-xl p-4 border border-yellow-600/30">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-yellow-300 font-medium text-sm">Ready for Real Integration</div>
              <div className="text-yellow-200/80 text-xs">
                This component is structured for easy integration with real Discord API when upgraded
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}