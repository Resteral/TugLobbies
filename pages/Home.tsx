/**
 * Home page
 * Provides a welcoming hero, key entrances, and a Discord SDK preview for quick verification.
 */

import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Trophy, Swords, Gamepad2, LayoutDashboard, MessageSquare, Calendar, Rocket } from 'lucide-react';
import DiscordActivitySDK from '../components/DiscordActivitySDK';

/**
 * Simple feature card for Home quick links.
 */
function FeatureCard(props: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link to={props.to} className="block group">
      <Card className="h-full transition-colors bg-slate-900/40 border-slate-700/60 group-hover:border-purple-500/60">
        <CardHeader className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center">
            {props.icon}
          </div>
          <CardTitle className="text-white">{props.title}</CardTitle>
          <CardDescription className="text-slate-300">{props.description}</CardDescription>
          {props.badge && <Badge className="bg-purple-600/70">{props.badge}</Badge>}
        </CardHeader>
      </Card>
    </Link>
  );
}

/**
 * Home component with hero, actions, and quick entrances.
 */
export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Hockey Imagery */}
      <section className="relative">
        <div className="absolute inset-0 opacity-25">
          <img src="https://pub-cdn.sider.ai/u/U005HEVRO98/web-coder/68da03bcb54d8be52a93b613/resource/f50665ab-8c5f-47a2-96c4-230727291c56.jpg" className="object-cover w-full h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-purple-900/70 to-slate-900" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-12">
          <div className="inline-flex items-center mb-5 rounded-full border border-purple-700/40 bg-purple-900/30 px-3 py-1 text-sm text-purple-200 animate-pulse">
            <Rocket className="w-4 h-4 mr-2" />
            Welcome to TUG Hockey Lobbies
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Tournaments, Matchmaking, Markets — for Hockey Fans
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Host drafts, analyze stats, and share live Discord activity. Bet on matches and settle markets from results.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Open Dashboard
              </Button>
            </Link>
            <Link to="/tournaments">
              <Button variant="outline" className="border-purple-500 text-purple-200 hover:bg-purple-700/40">
                <Trophy className="w-4 h-4 mr-2" />
                Browse Tournaments
              </Button>
            </Link>
            <Link to="/discord">
              <Button variant="outline" className="border-indigo-500 text-indigo-200 hover:bg-indigo-700/40">
                <MessageSquare className="w-4 h-4 mr-2" />
                Discord Integration
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Matchmaking and Markets */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-semibold">Live Matchmaking</div>
              <Badge className="bg-blue-600/80">Hockey</Badge>
            </div>
            {/* Compact Queue Visual */}
            <div className="relative rounded-lg overflow-hidden">
              <img src="https://pub-cdn.sider.ai/u/U005HEVRO98/web-coder/68da03bcb54d8be52a93b613/resource/9c4720d6-7baf-4fd5-be04-6cfad17eaffc.jpg" className="object-cover w-full h-32" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-purple-900/40" />
              <div className="absolute bottom-2 left-3 right-3 text-slate-200 text-sm">
                Queue up now and get matched with similar ELO players.
              </div>
            </div>
            <div className="mt-3">
              {/* Light inline call-to-action */}
              <Link to="/dashboard">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Open Queue</Button>
              </Link>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-semibold">Open Markets</div>
              <Badge className="bg-emerald-600/80">Live</Badge>
            </div>
            {/* Mini markets hero */}
            <div className="relative rounded-lg overflow-hidden">
              <img src="https://pub-cdn.sider.ai/u/U005HEVRO98/web-coder/68da03bcb54d8be52a93b613/resource/c5843f54-6850-4d28-933e-2a01987df48e.jpg" className="object-cover w-full h-32" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-emerald-900/30" />
              <div className="absolute bottom-2 left-3 right-3 text-slate-200 text-sm">
                Pick your winner and settle via CSV results after the game.
              </div>
            </div>
            <div className="mt-3">
              <Link to="/dashboard">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">View Markets</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Entrances + Live Panels */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            to="/tournaments"
            icon={<Trophy className="w-5 h-5" />}
            title="Tournaments"
            description="Create, seed, and run events with rich player data."
            badge="Organizer"
          />
          <FeatureCard
            to="/host"
            icon={<Swords className="w-5 h-5" />}
            title="Host a Draft"
            description="Spin up a lobby or draft room with a few clicks."
            badge="Live"
          />
          <FeatureCard
            to="/discord"
            icon={<Gamepad2 className="w-5 h-5" />}
            title="Discord Activity"
            description="Update presence and invite players seamlessly."
            badge="SDK"
          />
        </div>
      </section>

      {/* Discord SDK Preview */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <Card className="bg-slate-900/50 border-slate-700/60">
            <CardHeader>
              <CardTitle className="text-white">Get Started</CardTitle>
              <p className="text-slate-300">
                Use the quick actions to jump into core workflows. Configure your Discord app to enable Activities.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-700/80">Tip</Badge>
                <span className="text-slate-200 text-sm">
                  Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET on your deployment platform.
                </span>
              </div>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                <li>Authorize inside Discord, then complete auth via backend.</li>
                <li>Update Activity to broadcast lobby status.</li>
                <li>Share your lobby link in Discord.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Live SDK Card */}
          <div>
            <DiscordActivitySDK clientId="1422066214666244227" />
          </div>
        </div>
      </section>
    </div>
  );
}
