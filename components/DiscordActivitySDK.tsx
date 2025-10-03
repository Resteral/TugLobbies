/**
 * Discord Activity SDK Integration Component
 * Production-ready Discord Embedded App SDK integration with optional backend auth exchange.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity as ActivityIcon,
  Users,
  Gamepad2,
  ExternalLink,
  Info,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

/**
 * Props for DiscordActivitySDK
 */
interface DiscordActivitySDKProps {
  /** Discord Application Client ID (from Developer Portal) */
  clientId?: string;
}

/**
 * Global type declarations for Discord SDK
 */
declare global {
  interface Window {
    DiscordSDK?: any;
    __discordApp?: boolean;
  }
}

/**
 * Detects if the app is likely running inside the Discord client as an embedded app
 */
function detectDiscordEnvironment(): boolean {
  const ua = navigator.userAgent || '';
  return /Discord/i.test(ua) || Boolean(window.__discordApp);
}

/**
 * Utility wait/pause function
 */
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build a sample activity payload suitable for Discord Rich Presence
 */
function buildTestActivity(lobbyName: string, gameType: string, playerCount: number, maxPlayers: number) {
  const startTimestamp = Math.floor(Date.now() / 1000);
  return {
    details: `Lobby: ${lobbyName}`,
    state: `${gameType} • ${playerCount}/${maxPlayers}`,
    timestamps: { start: startTimestamp },
    assets: {
      large_text: 'TUG Lobbies',
    },
    party: {
      size: [playerCount, maxPlayers],
    },
  };
}

/**
 * Exchange an OAuth code with our backend endpoint and return the token response.
 */
async function exchangeCodeWithBackend(code: string, redirectUri?: string) {
  const resp = await fetch('/api/discord/exchange-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      redirectUri:
        redirectUri ||
        (typeof window !== 'undefined' ? `${window.location.origin}/discord` : 'http://localhost:3000/discord'),
    }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.message || 'Backend exchange failed');
  }
  return resp.json();
}

/**
 * DiscordActivitySDK Component
 * Handles SDK load, environment detection, authorization attempt, and activity update
 */
export function DiscordActivitySDK({ clientId = '1422066214666244227' }: DiscordActivitySDKProps) {
  const [envInDiscord, setEnvInDiscord] = useState(false);
  const [sdkLoading, setSdkLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Initializing...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [discordSdk, setDiscordSdk] = useState<any>(null);
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  /**
   * Compute badge color based on state
   */
  const badgeClass = useMemo(() => {
    if (sdkLoading) return 'bg-gradient-to-r from-blue-500 to-cyan-600';
    if (errorMsg) return 'bg-gradient-to-r from-red-500 to-rose-600';
    if (sdkReady) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    return 'bg-gray-600';
  }, [sdkLoading, errorMsg, sdkReady]);

  useEffect(() => {
    const inDiscord = detectDiscordEnvironment();
    setEnvInDiscord(inDiscord);
    loadSdk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Dynamically load the Discord SDK, then initialize
   */
  const loadSdk = async () => {
    try {
      setSdkLoading(true);
      setStatusMsg('Loading Discord SDK...');
      setErrorMsg(null);

      if (typeof window.DiscordSDK === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://embed.discordapp.net/sdk/1';
        script.async = true;
        script.onload = () => {
          initializeSdk().catch((err) => {
            console.error('SDK initialize error:', err);
            setErrorMsg('Initialization failed');
            setSdkLoading(false);
          });
        };
        script.onerror = () => {
          setErrorMsg('Failed to load Discord SDK script');
          setSdkLoading(false);
        };
        document.head.appendChild(script);
      } else {
        await initializeSdk();
      }
    } catch (err) {
      console.error('SDK load error:', err);
      setErrorMsg('Initialization failed');
      setSdkLoading(false);
    }
  };

  /**
   * Create SDK instance, wait ready, and try to authorize
   */
  const initializeSdk = async () => {
    setStatusMsg('Creating SDK instance...');
    const sdk = new window.DiscordSDK(clientId);
    setDiscordSdk(sdk);

    setStatusMsg('Waiting for SDK ready...');
    await sdk.ready();
    setSdkReady(true);
    setStatusMsg('SDK ready');

    // Attempt authorization if inside Discord
    setAuthAttempted(true);
    if (detectDiscordEnvironment()) {
      try {
        setStatusMsg('Authorizing...');
        const result = await sdk.commands.authorize({
          client_id: clientId,
          response_type: 'code',
          prompt: 'none',
          scope: ['identify', 'applications.commands', 'activities.write', 'rpc.activities.write'],
        });

        if (result?.code) {
          setAuthorized(false);
          setAuthCode(result.code);
          setStatusMsg('Authorized (code received). Use backend to authenticate.');
        } else {
          setAuthorized(false);
          setStatusMsg('Authorization returned no code. Check OAuth settings.');
        }
      } catch (authErr) {
        console.error('Authorization error:', authErr);
        setErrorMsg('Authorization failed. Ensure this runs inside Discord and your app is configured.');
      }
    } else {
      setStatusMsg('SDK ready. Open inside Discord to enable Activities.');
    }

    setSdkLoading(false);
  };

  /**
   * Complete authentication by exchanging the code on backend and authenticating the SDK session.
   */
  const completeBackendAuth = async () => {
    if (!discordSdk || !authCode) {
      setErrorMsg('No authorization code to exchange');
      return;
    }
    try {
      setStatusMsg('Exchanging code on backend...');
      const tokens = await exchangeCodeWithBackend(authCode);
      if (!tokens?.access_token) {
        throw new Error('No access_token returned');
      }
      setAccessToken(tokens.access_token);

      setStatusMsg('Authenticating SDK...');
      await discordSdk.commands.authenticate({ access_token: tokens.access_token });
      setAuthorized(true);
      setErrorMsg(null);
      setStatusMsg('SDK authenticated via backend');
    } catch (err: any) {
      console.error('Complete auth failed:', err);
      setErrorMsg(err?.message || 'Complete auth failed');
    }
  };

  /**
   * Update activity in Discord (Rich Presence)
   */
  const updateActivity = async (activityData: {
    lobbyName: string;
    gameType: string;
    playerCount: number;
    maxPlayers: number;
  }) => {
    if (!discordSdk || !sdkReady) {
      setErrorMsg('SDK not ready');
      return;
    }

    try {
      setStatusMsg('Updating activity...');
      const activity = buildTestActivity(
        activityData.lobbyName,
        activityData.gameType,
        activityData.playerCount,
        activityData.maxPlayers
      );

      await discordSdk.commands.setActivity({ activity });
      setStatusMsg('Activity updated successfully!');
      setErrorMsg(null);
    } catch (err) {
      console.error('Activity update error:', err);
      setErrorMsg('Activity update failed. Ensure you are inside Discord and authorized.');
    }
  };

  /**
   * Simulate a typical game lobby activity update with sample values
   */
  const simulateActivityUpdate = async () => {
    await updateActivity({
      lobbyName: 'TUG Lobby',
      gameType: 'Zealot Hockey 4v4',
      playerCount: 6,
      maxPlayers: 8,
    });
  };

  /**
   * Render a contextual status icon for SDK lifecycle
   */
  const getStatusIcon = () => {
    if (sdkLoading) return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
    if (errorMsg) return <XCircle className="w-5 h-5 text-red-400" />;
    if (sdkReady) return <CheckCircle className="w-5 h-5 text-green-400" />;
    return <Info className="w-5 h-5 text-gray-400" />;
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 via-indigo-900/40 to-blue-800/30 border-purple-700/60 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
            <ActivityIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <span>Discord Activity SDK</span>
              <Badge className={badgeClass}>
                {sdkLoading && 'Connecting...'}
                {!sdkLoading && errorMsg && 'Error'}
                {!sdkLoading && !errorMsg && sdkReady && 'Connected'}
              </Badge>
            </div>
            <p className="text-purple-200 mt-1">
              Real-time activity integration for Discord rich presence
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Panel */}
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <div className="text-white font-medium">SDK Status</div>
                <div className="text-gray-400 text-sm">{statusMsg}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">Client ID: {clientId}</div>
          </div>

          {!envInDiscord && (
            <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/40 text-yellow-200 text-sm">
              This page is running in a normal browser. Activities require running inside the Discord client as an
              Embedded App.
              <a
                className="inline-flex items-center ml-2 underline decoration-yellow-400"
                href="https://discord.com/developers/applications"
                target="_blank"
                rel="noreferrer"
              >
                Open Developer Portal
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          )}
        </div>

        {/* Ready Features */}
        {sdkReady && (
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

        {/* Activity Controls */}
        {sdkReady && (
          <div className="space-y-3">
            <div className="text-white font-medium">Activity Controls</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={simulateActivityUpdate}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <ActivityIcon className="w-4 h-4 mr-2" />
                Test: Update Activity
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open('https://discord.com/developers/applications', '_blank')}
                className="bg-transparent border-purple-600 text-purple-300 hover:bg-purple-600 hover:text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Configure App in Discord
              </Button>

              {authCode && !authorized && (
                <Button
                  onClick={completeBackendAuth}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Complete Auth (Backend)
                </Button>
              )}
            </div>

            {!authorized && authAttempted && (
              <div className="text-xs text-purple-200/80">
                Tip: We received an OAuth code. Click &quot;Complete Auth (Backend)&quot; to exchange it and authenticate
                this session, then update activities.
              </div>
            )}

            {authorized && (
              <div className="inline-flex items-center text-emerald-300 text-sm">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Authenticated with Discord{accessToken ? ' • token active' : ''}.
              </div>
            )}
          </div>
        )}

        {/* Integration Note */}
        <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-xl p-4 border border-amber-600/30">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-amber-300 font-medium text-sm">Dynamic SDK Load</div>
              <div className="text-amber-200/80 text-xs">
                SDK loads at runtime. Client ID: 1422066214666244227 is configured.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DiscordActivitySDK;
