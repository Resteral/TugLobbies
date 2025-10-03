/**
 * Discord Integration Page
 * Complete Discord SDK setup and integration guide
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { 
  Bot, 
  MessageCircle, 
  Settings, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Code,
  Shield,
  Users,
  Gamepad2,
  Zap,
  ArrowRight
} from 'lucide-react'
import DiscordBotAuth from '../components/DiscordBotAuth'
import DiscordCommands from '../components/DiscordCommands'
import { DiscordActivitySDK } from '../components/DiscordActivitySDK'

/**
 * DiscordIntegration page
 * Shows a guided setup, SDK status, and bot capabilities.
 */
export default function DiscordIntegration() {
  const [setupProgress, setSetupProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)
  const [sdkStatus, setSdkStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const setupSteps = [
    {
      id: 1,
      title: 'Create Discord Application',
      description: 'Set up your Discord app in the Developer Portal',
      status: 'completed',
      action: 'https://discord.com/developers/applications'
    },
    {
      id: 2,
      title: 'Configure OAuth2',
      description: 'Add redirect URIs and OAuth2 scopes',
      status: 'completed',
      action: 'https://discord.com/developers/applications'
    },
    {
      id: 3,
      title: 'Enable Activities',
      description: 'Enable Rich Presence and Activities in your app',
      status: 'in-progress',
      action: 'https://discord.com/developers/applications'
    },
    {
      id: 4,
      title: 'Invite Bot',
      description: 'Add bot to your Discord server',
      status: 'pending',
      action: 'https://discord.com/developers/applications'
    },
    {
      id: 5,
      title: 'Configure SDK',
      description: 'Set up Discord Activity SDK',
      status: 'pending',
      action: '#sdk-config'
    }
  ]

  useEffect(() => {
    // Simulate setup progress
    const timer = setInterval(() => {
      setSetupProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 10
      })
    }, 500)

    return () => clearInterval(timer)
  }, [])

  /**
   * Returns an icon for a given step status
   */
  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'in-progress':
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
    }
  }

  /**
   * Returns a text color class for a given step status
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Discord Integration Setup
          </h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Complete guide to integrate Discord SDK for Activities, Rich Presence, and bot commands
          </p>
        </div>

        {/* Setup Progress */}
        <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/40 border-indigo-700/60 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-3">
              <Settings className="w-6 h-6 text-indigo-400" />
              <span>Setup Progress</span>
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600">
                {setupProgress}% Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={setupProgress} className="h-3 bg-indigo-900/50" />
            
            {/* Setup Steps */}
            <div className="space-y-4">
              {setupSteps.map((step) => (
                <div key={step.id} className="flex items-center space-x-4 p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${getStepColor(step.status)}`}>
                      {step.title}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {step.description}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                    onClick={() => window.open(step.action, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - SDK Configuration */}
          <div className="space-y-6">
            {/* Discord Activity SDK */}
            <DiscordActivitySDK clientId={(import.meta as any)?.env?.VITE_DISCORD_CLIENT_ID ?? '1422066214666244227'} />

            {/* SDK Configuration Guide */}
            <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-800/30 border-blue-700/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-3">
                  <Code className="w-6 h-6 text-blue-400" />
                  <span>SDK Configuration</span>
                </CardTitle>
                <p className="text-blue-200">
                  Essential Discord SDK setup for Activities
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                  <h4 className="text-white font-semibold mb-3">Required Scopes</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2 p-2 rounded bg-blue-900/20">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300">activities.read</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded bg-blue-900/20">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300">activities.write</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded bg-blue-900/20">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300">bot</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded bg-blue-900/20">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300">applications.commands</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                  <h4 className="text-white font-semibold mb-3">Quick Start Code</h4>
                  <pre className="bg-black/50 rounded p-3 text-xs text-green-300 overflow-x-auto">
{`// Initialize Discord SDK
const discordSdk = new DiscordSDK('YOUR_CLIENT_ID');

// Wait for SDK ready
await discordSdk.ready();

// Set activity
await discordSdk.commands.setActivity({
  details: "In Tournament Lobby",
  state: "Zealot Hockey 4v4",
  startTimestamp: Date.now()
});`}
                  </pre>
                </div>

                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-600/30">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-green-300 font-medium text-sm">Ready for Production</div>
                      <div className="text-green-200/80 text-xs">
                        SDK structure is complete. Replace mock client ID with your real Discord Application ID.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bot Setup */}
          <div className="space-y-6">
            {/* Bot Authentication */}
            <DiscordBotAuth />

            {/* Discord Commands */}
            <DiscordCommands />

            {/* Integration Benefits */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-800/30 border-purple-700/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-purple-400" />
                  <span>Integration Benefits</span>
                </CardTitle>
                <p className="text-purple-200">
                  What you get with Discord integration
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-purple-800/20 rounded-lg border border-purple-700/50">
                    <Users className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Rich Presence</div>
                      <div className="text-purple-300 text-sm">Show match status to Discord friends</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-800/20 rounded-lg border border-purple-700/50">
                    <Gamepad2 className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Activity Join</div>
                      <div className="text-purple-300 text-sm">Friends can join your matches directly</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-800/20 rounded-lg border border-purple-700/50">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Slash Commands</div>
                      <div className="text-purple-300 text-sm">Manage queues and stats from Discord</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-800/20 rounded-lg border border-purple-700/50">
                    <Bot className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Cross-Platform</div>
                      <div className="text-purple-300 text-sm">Sync across web and Discord</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-600/30">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Integrate with Discord?
          </h2>
          <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
            Follow the setup steps above to enable Discord Activities, Rich Presence, and bot commands for your tournament platform.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => window.open('https://discord.com/developers/applications', '_blank')}
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Open Discord Developer Portal
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
