/**
 * Discord Activity SDK Integration Component
 * Handles dynamic loading and initialization of Discord SDK for rich presence and activities.
 * - Safely loads SDK script
 * - Subscribes to join/spectate events
 * - Exposes a simulated activity update
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, RefreshCw, Activity, Users, Gamepad2 } from 'lucide-react';
import { discordService } from '../services/discord-service';
import { DISCORD_APP_ID } from '../config/discord';

interface DiscordActivitySDKProps {
  /** Discord Application Client ID (Activities enabled) */
  clientId?: string;
}

declare global {
  interface Window {
    DiscordSDK: any;
  }
}

/**
 * Component: DiscordActivitySDK
 * Renders status and provides a demo update for Discord Activity.
 */
export const DiscordActivitySDK: React.FC<DiscordActivitySDKProps> = ({
  clientId = DISCORD_APP_ID,
}) => {
  const [sdkStatus, setSdkStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [discordSdk, setDiscordSdk] = useState<any>(null);
  const [activityStatus, setActivityStatus] = useState<string>('Initializing...');

  useEffect(() => {
    initializeDiscordSDK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Load and initialize Discord SDK
   */
  const initializeDiscordSDK = async () => {
    try {
      setActivityStatus('Loading Discord SDK...');
      if (typeof window.DiscordSDK === 'undefined') {
        setActivityStatus('SDK not found, loading script...');
        const script = document.createElement('script');
        script.src = 'https://embed.discordapp.net/sdk/1';
        script.async = true;
        script.onload = () => handleSDKLoaded();
        script.onerror = () => {
          setSdkStatus('error');
          setActivityStatus('Failed to load Discord SDK');
        };
        document.head.appendChild(script);
      } else {
        handleSDKLoaded();
      }
    } catch (error) {
      console.error('Error initializing Discord SDK:', error);
      setSdkStatus('error');
      setActivityStatus('Initialization failed');
    }
  };

  /**
   * Called when the SDK script is loaded
   */
  const handleSDKLoaded = async () => {
    try {
      setActivityStatus('Creating SDK instance...');
      const sdk = new window.DiscordSDK(clientId);
      setDiscordSdk(sdk);

      setActivityStatus('Waiting for SDK ready...');
      await sdk.ready();

      setSdkStatus('ready');
      setActivityStatus('Discord Activity ready!');

      setupActivityCommands(sdk);
      console.log('Discord Activity SDK initialized successfully!');
    } catch (error) {
      console.error('Error setting up Discord SDK:', error);
      setSdkStatus('error');
      setActivityStatus('SDK setup failed');
    }
  };

  /**
   * Subscribe to Activity events (join, spectate)
   */
  const setupActivityCommands = (sdk: any) => {
    // Handle join requests from Discord
    sdk.subscribe('ACTIVITY_JOIN', (data: any) => {
      console.log('User joined via Discord:', data);
      // Redirect to your lobby or trigger join logic
      const lobbyId = data?.lobbyId || '';
      if (lobbyId) {
        window.location.hash = `#/lobbies?join=${encodeURIComponent(lobbyId)}`;
      }
    });

    // Handle spectate requests
    sdk.subscribe('ACTIVITY_SPECTATE', (data: any) => {
      console.log('User spectating via Discord:', data);
      // Implement spectate logic if needed
    });
  };

  /**
   * Update Discord activity via SDK commands
   */
  const updateActivity = async (activityData: {
    lobbyName: string;
    gameType: string;
    playerCount: number;
    maxPlayers: number;
  }) => {
    if (!discordSdk) return;
    try {
      setActivityStatus('Updating activity...');
      const activity = discordService.generateLobbyActivity(
        activityData.lobbyName,
        activityData.gameType,
        activityData.playerCount,
        activityData.maxPlayers
      );

      // Replace with real SDK command in production
      await discordSdk.commands.setActivity(activity);

      setActivityStatus('Activity updated successfully!');
    } catch (error) {
      console.error('Error updating activity:', error);
      setActivityStatus('Activity update failed');
    }
  };

  /**
   * Quick demo: Update with a sample lobby
   */
  const simulateActivityUpdate = () => {
    updateActivity({
      lobbyName: 'Open Lobby',
      gameType: 'Zealot Hockey 4v4',
      playerCount: 6,
      maxPlayers: 8,
    });
  };

  const getStatusIcon = () => {
    switch (sdkStatus) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (sdkStatus) {
      case 'ready':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-600';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 via-indigo-900/40 to-blue-800/30 border-purple-700/60 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <span>Discord Activity SDK</span>
              <Badge className={getStatusColor()}>
                {sdkStatus === 'ready' && 'Connected'}
                {sdkStatus === 'error' && 'Error'}
                {sdkStatus === 'loading' && 'Connecting...'}
              </Badge>
            </div>
            <CardDescription className="text-purple-200 mt-1">
              Real-time activity integration for Discord rich presence
            </CardDescription>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <div className="text-white font-medium">SDK Status</div>
                <div className="text-gray-400 text-sm">{activityStatus}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">Client ID: {clientId}</div>
          </div>

          {sdkStatus === 'ready' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-green-900/20 rounded-lg p-3 border border-green-800/30">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 text-sm">Commands Ready</span>
                </div>
              </div>
              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-800/30">
                <div className="flex items-center space-x-2">
                  <Gamepad2 className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 text-sm">Activities Ready</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Controls */}
        {sdkStatus === 'ready' && (
          <div className="space-y-3">
            <div className="text-white font-medium">Activity Controls</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={simulateActivityUpdate}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Activity className="w-4 h-4 mr-2" />
                Update Activity
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-purple-600 text-purple-300 hover:bg-purple-600 hover:text-white"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Join Activity
              </Button>
            </div>
          </div>
        )}

        {/* SDK Information */}
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
          <div className="text-white font-medium mb-3">SDK Features</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-indigo-900/20">
              <CheckCircle className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-300">Rich Presence</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-purple-900/20">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300">Activity Commands</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-blue-900/20">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300">Real-time Updates</span>
            </div>
          </div>
        </div>

        {/* Integration Note */}
        <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-xl p-4 border border-amber-600/30">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-amber-300 font-medium text-sm">Dynamic SDK Load</div>
              <div className="text-amber-200/80 text-xs">
                SDK loads dynamically when component mounts. Replace mock client ID with your real Discord
                Application ID.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};