/**
 * Discord Commands Reference Component
 * Shows available bot commands and their usage
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MessageSquare, Users, Trophy, User, Settings } from 'lucide-react';

export const DiscordCommands: React.FC = () => {
  const commandCategories = [
    {
      icon: Users,
      title: "Lobby Commands",
      commands: [
        {
          command: "/lobby create",
          description: "Create a new TUG lobby",
          usage: "/lobby create [game_type]",
          example: "/lobby create zealot-hockey"
        },
        {
          command: "/lobby join",
          description: "Join an existing lobby",
          usage: "/lobby join [lobby_id]",
          example: "/lobby join 12345"
        },
        {
          command: "/lobby list",
          description: "Show active lobbies",
          usage: "/lobby list",
          example: "/lobby list"
        },
        {
          command: "/lobby leave",
          description: "Leave current lobby",
          usage: "/lobby leave",
          example: "/lobby leave"
        }
      ]
    },
    {
      icon: Trophy,
      title: "Matchmaking Commands",
      commands: [
        {
          command: "/queue join",
          description: "Join matchmaking queue",
          usage: "/queue join [game_type]",
          example: "/queue join 3v3-hockey"
        },
        {
          command: "/queue leave",
          description: "Leave matchmaking queue",
          usage: "/queue leave",
          example: "/queue leave"
        },
        {
          command: "/queue status",
          description: "Check queue status",
          usage: "/queue status",
          example: "/queue status"
        },
        {
          command: "/stats",
          description: "View your statistics",
          usage: "/stats [player]",
          example: "/stats @PlayerName"
        }
      ]
    },
    {
      icon: User,
      title: "Account Commands",
      commands: [
        {
          command: "/link_account",
          description: "Link your StarCraft II account",
          usage: "/link_account [account_id]",
          example: "/link_account 1-S2-1-6820063"
        },
        {
          command: "/profile",
          description: "View your profile",
          usage: "/profile",
          example: "/profile"
        },
        {
          command: "/leaderboard",
          description: "View ELO leaderboard",
          usage: "/leaderboard [game_type]",
          example: "/leaderboard zealot-hockey"
        }
      ]
    },
    {
      icon: Settings,
      title: "Utility Commands",
      commands: [
        {
          command: "/help",
          description: "Show help information",
          usage: "/help [command]",
          example: "/help lobby"
        },
        {
          command: "/ping",
          description: "Check bot latency",
          usage: "/ping",
          example: "/ping"
        },
        {
          command: "/invite",
          description: "Get bot invite link",
          usage: "/invite",
          example: "/invite"
        }
      ]
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <span>Discord Bot Commands</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Complete reference of all available slash commands for the TUG Lobbies Discord bot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {commandCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="border-b border-gray-700 pb-6 last:border-b-0 last:pb-0">
            <div className="flex items-center space-x-2 mb-4">
              <category.icon className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">{category.title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.commands.map((cmd, cmdIndex) => (
                <div key={cmdIndex} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-blue-400 font-mono text-sm bg-gray-900 px-2 py-1 rounded">
                      {cmd.command}
                    </code>
                    <Badge variant="secondary" className="bg-blue-600 text-xs">
                      Slash Command
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{cmd.description}</p>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-gray-400">Usage: </span>
                      <code className="text-green-400 bg-gray-900 px-1 py-0.5 rounded">
                        {cmd.usage}
                      </code>
                    </div>
                    <div>
                      <span className="text-gray-400">Example: </span>
                      <code className="text-yellow-400 bg-gray-900 px-1 py-0.5 rounded">
                        {cmd.example}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Start Guide */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600">
          <h4 className="font-semibold text-white mb-3">Quick Start Guide</h4>
          <div className="text-sm text-blue-200 space-y-2">
            <p>1. Invite the bot to your server using the invite link above</p>
            <p>2. Use <code className="bg-blue-800 px-1 py-0.5 rounded">/link_account</code> to connect your StarCraft II account</p>
            <p>3. Join matchmaking with <code className="bg-blue-800 px-1 py-0.5 rounded">/queue join zealot-hockey</code></p>
            <p>4. Create lobbies with <code className="bg-blue-800 px-1 py-0.5 rounded">/lobby create</code> for custom matches</p>
            <p>5. Check your stats with <code className="bg-blue-800 px-1 py-0.5 rounded">/stats</code></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};