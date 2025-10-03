/**
 * Discord Commands Component - Enhanced UI/UX
 * Displays available bot commands and their usage
 * Structured for easy integration with real Discord.js slash commands
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { MessageSquare, Users, Gamepad2, BarChart3, User, Settings, Zap } from 'lucide-react'

export default function DiscordCommands() {
  const commandCategories = [
    {
      name: 'Queue Management',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      commands: [
        {
          name: '/queue join',
          description: 'Join matchmaking queue',
          usage: '/queue join [1v1|2v2|3v3|4v4]',
          example: '/queue join 4v4',
          permissions: ['Everyone']
        },
        {
          name: '/queue leave',
          description: 'Leave current queue',
          usage: '/queue leave',
          example: '/queue leave',
          permissions: ['Everyone']
        },
        {
          name: '/queue status',
          description: 'Check queue status',
          usage: '/queue status',
          example: '/queue status',
          permissions: ['Everyone']
        }
      ]
    },
    {
      name: 'Lobby System',
      icon: Gamepad2,
      color: 'from-green-500 to-emerald-500',
      commands: [
        {
          name: '/lobby create',
          description: 'Create a new game lobby',
          usage: '/lobby create [game_type] [draft_type]',
          example: '/lobby create 2v2 snake',
          permissions: ['Everyone']
        },
        {
          name: '/lobby join',
          description: 'Join an existing lobby',
          usage: '/lobby join [lobby_id]',
          example: '/lobby join abc123',
          permissions: ['Everyone']
        },
        {
          name: '/lobby list',
          description: 'List active lobbies',
          usage: '/lobby list',
          example: '/lobby list',
          permissions: ['Everyone']
        }
      ]
    },
    {
      name: 'Player Stats',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500',
      commands: [
        {
          name: '/stats view',
          description: 'View player statistics',
          usage: '/stats view [player_name]',
          example: '/stats view ZealotMaster',
          permissions: ['Everyone']
        },
        {
          name: '/stats leaderboard',
          description: 'Show ELO leaderboard',
          usage: '/stats leaderboard [game_type]',
          example: '/stats leaderboard zealot-hockey',
          permissions: ['Everyone']
        },
        {
          name: '/stats compare',
          description: 'Compare two players',
          usage: '/stats compare [player1] [player2]',
          example: '/stats compare Player1 Player2',
          permissions: ['Everyone']
        }
      ]
    },
    {
      name: 'Profile & Settings',
      icon: User,
      color: 'from-orange-500 to-amber-500',
      commands: [
        {
          name: '/profile show',
          description: 'Display your profile',
          usage: '/profile show',
          example: '/profile show',
          permissions: ['Everyone']
        },
        {
          name: '/profile link',
          description: 'Link Discord account',
          usage: '/profile link',
          example: '/profile link',
          permissions: ['Everyone']
        },
        {
          name: '/settings notifications',
          description: 'Configure notifications',
          usage: '/settings notifications [on|off]',
          example: '/settings notifications on',
          permissions: ['Everyone']
        }
      ]
    }
  ]

  const getPermissionBadge = (permissions: string[]) => {
    if (permissions.includes('Admin')) {
      return <Badge className="bg-red-600 text-xs">Admin</Badge>
    } else if (permissions.includes('Moderator')) {
      return <Badge className="bg-yellow-600 text-xs">Moderator</Badge>
    } else {
      return <Badge className="bg-green-600 text-xs">Everyone</Badge>
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-gray-600 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <span>Discord Bot Commands</span>
            <p className="text-gray-400 mt-1">
              Complete list of available slash commands for the TUG Lobbies bot
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Start */}
        <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-xl p-4 border border-blue-600/30">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-blue-300 font-medium text-sm">Quick Start</div>
              <div className="text-blue-200/80 text-xs">
                Type <code className="bg-blue-900/50 px-1 rounded">/</code> in any channel to see available commands
              </div>
            </div>
          </div>
        </div>

        {/* Command Categories */}
        {commandCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center`}>
                <category.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{category.name}</h3>
                <div className="text-gray-400 text-sm">
                  {category.commands.length} commands available
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.commands.map((command, commandIndex) => (
                <div 
                  key={commandIndex}
                  className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <code className="text-white font-mono text-sm bg-gray-700/50 px-2 py-1 rounded">
                      {command.name}
                    </code>
                    {getPermissionBadge(command.permissions)}
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">
                    {command.description}
                  </p>

                  <div className="space-y-2">
                    <div>
                      <div className="text-gray-400 text-xs font-medium mb-1">Usage:</div>
                      <code className="text-blue-300 text-xs font-mono bg-blue-900/20 px-2 py-1 rounded block">
                        {command.usage}
                      </code>
                    </div>
                    
                    <div>
                      <div className="text-gray-400 text-xs font-medium mb-1">Example:</div>
                      <code className="text-green-300 text-xs font-mono bg-green-900/20 px-2 py-1 rounded block">
                        {command.example}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Integration Ready Note */}
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-600/30">
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-green-300 font-medium text-sm">Slash Command Ready</div>
              <div className="text-green-200/80 text-xs">
                Command structure is ready for Discord.js slash command registration
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}