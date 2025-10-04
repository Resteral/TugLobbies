/**
 * DiscordIntegration page
 * Purpose: Present a clear status and guidance for running inside Discord Activities,
 * while providing quick entrances to lobbies and rankings.
 */

import React from 'react';
import { useNavigate } from 'react-router';
import { useDiscordActivity } from '../hooks/useDiscordActivity';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CardDescription } from '../components/common/CardDescription';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Blocks, Rocket, ShieldCheck, ExternalLink } from 'lucide-react';

/**
 * DiscordIntegration page component
 * Displays environment status and instructions to use the app within Discord Activities.
 */
export default function DiscordIntegration() {
  const { isDiscordActivity, guildId, channelId, userId, isEmbedded, userAgent } = useDiscordActivity();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Discord Activities Integration
          </h1>
          <Badge className={isDiscordActivity ? 'bg-green-600' : 'bg-slate-700'}>
            {isDiscordActivity ? 'Activities Ready' : 'Web Ready'}
          </Badge>
        </div>

        <Card className="bg-slate-800/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              Status Check
            </CardTitle>
            <CardDescription className="text-purple-200">
              Environment detection is best-effort without the official SDK.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/40 rounded p-3 border border-slate-700/60">
                <div className="text-slate-300 text-sm">Running in Discord</div>
                <div className={`text-lg font-semibold ${isDiscordActivity ? 'text-green-400' : 'text-slate-300'}`}>
                  {isDiscordActivity ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="bg-slate-900/40 rounded p-3 border border-slate-700/60">
                <div className="text-slate-300 text-sm">Embedded (iframe)</div>
                <div className="text-lg font-semibold text-blue-300">{isEmbedded ? 'Yes' : 'No'}</div>
              </div>
              <div className="bg-slate-900/40 rounded p-3 border border-slate-700/60">
                <div className="text-slate-300 text-sm">User Agent</div>
                <div className="text-xs text-slate-400 break-all">{userAgent || '—'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/30 rounded p-3 border border-slate-700/50">
                <div className="text-slate-300 text-sm">Guild ID</div>
                <div className="text-white font-mono text-sm">{guildId || '—'}</div>
              </div>
              <div className="bg-slate-900/30 rounded p-3 border border-slate-700/50">
                <div className="text-slate-300 text-sm">Channel ID</div>
                <div className="text-white font-mono text-sm">{channelId || '—'}</div>
              </div>
              <div className="bg-slate-900/30 rounded p-3 border border-slate-700/50">
                <div className="text-slate-300 text-sm">User ID</div>
                <div className="text-white font-mono text-sm">{userId || '—'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-purple-400" />
              How to Use in Discord Activities
            </CardTitle>
            <CardDescription className="text-purple-200">
              Launch TUG Lobbies as an embedded Activity in your server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal list-inside space-y-2 text-slate-200">
              <li>Add the web app URL https://tuglobbies.com as your Activity source (per your bot/app setup).</li>
              <li>Open a Voice Channel and choose "Activities", then pick your app or a custom Activity.</li>
              <li>Ensure the URL includes parameters like <span className="font-mono">?activity=true&guild_id=...&channel_id=...</span> for better context.</li>
              <li>Use Lobbies → Pro 4v4 to manage larger player pools and vote to start a scrim.</li>
            </ol>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/dashboard')}>
                <Blocks className="w-4 h-4 mr-2" />
                Open Lobbies
              </Button>
              <Button variant="outline" className="border-purple-600 text-purple-300 hover:bg-purple-700/20" onClick={() => navigate('/dashboard')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Rankings (Dashboard)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
