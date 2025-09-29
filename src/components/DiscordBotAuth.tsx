/**
 * Discord Bot Authentication Component
 * Handles Discord OAuth2 integration for bot functionality
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bot, Users, MessageSquare, Shield, CheckCircle, ExternalLink } from 'lucide-react';

export const DiscordBotAuth: React.FC = () => {
  const discordBotInviteUrl = "https://discord.com/oauth2/authorize?client_id=1422066214666244227&permissions=550158526548&integration_type=0&scope=bot+applications.commands";
  
  const botFeatures = [
    {
      icon: Users,
      title: "Lobby Management",
      description: "Create and manage TUG lobbies directly from Discord"
    },
    {
      icon: MessageSquare,
      title: "Matchmaking Commands",
      description: "Use slash commands to queue for matches and check status"
    },
    {
      icon: Shield,
      title: "ELO Tracking",
      description: "Automatic ELO updates and leaderboard integration"
    }
  ];

  const handleInviteBot = () => {
    window.open(discordBotInviteUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-800/30 border-indigo-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          <span>Discord Bot Integration</span>
          <Badge variant="default" className="bg-green-600">
            Available
          </Badge>
        </CardTitle>
        <CardDescription className="text-indigo-200">
          Enhance your TUG Lobbies experience with our Discord bot for seamless matchmaking and lobby management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bot Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {botFeatures.map((feature, index) => (
            <div key={index} className="bg-indigo-800/30 rounded-lg p-4 border border-indigo-600/50">
              <feature.icon className="w-8 h-8 text-indigo-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
              <p className="text-indigo-200 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bot Permissions */}
        <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-600">
          <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Bot Permissions</span>
          </h4>
          <div className="space-y-2 text-sm text-indigo-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Read and send messages in channels</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Use slash commands</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Manage roles for ELO rankings</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Create and manage voice channels</span>
            </div>
          </div>
        </div>

        {/* Invite Button */}
        <div className="text-center">
          <Button 
            onClick={handleInviteBot}
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 text-lg"
            size="lg"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Invite TUG Bot to Your Server
          </Button>
          <p className="text-indigo-300 text-sm mt-3">
            The bot will be added to your Discord server with all necessary permissions
          </p>
        </div>

        {/* Setup Instructions */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">Getting Started</h4>
          <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
            <li>Click the invite button above</li>
            <li>Select your Discord server from the dropdown</li>
            <li>Review and approve the required permissions</li>
            <li>Use <code className="bg-gray-700 px-2 py-1 rounded">/help</code> in your server to see available commands</li>
            <li>Connect your StarCraft II account using <code className="bg-gray-700 px-2 py-1 rounded">/link_account</code></li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};