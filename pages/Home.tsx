/**
 * Home page
 * Presents a welcoming hero with quick entrances to Dashboard and Discord integration.
 */

import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowRight, Gamepad2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router';

/**
 * Component: Home
 * Minimal, high-contrast hero with clear CTAs.
 */
export default function Home() {
  const features = [
    { title: 'Matchmaking', desc: 'Queue for games and manage lobbies.', icon: <Gamepad2 className="w-5 h-5" /> },
    { title: 'Tournaments', desc: 'Host and compete in events.', icon: <ArrowRight className="w-5 h-5" /> },
    { title: 'Discord', desc: 'Rich presence and bot commands.', icon: <MessageCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block rounded-full px-3 py-1 text-xs border border-purple-500/50 bg-purple-900/20 text-purple-200">
              TUG Lobbies
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
              Competitive StarCraft II Lobbies & Tournaments
            </h1>
            <p className="mt-4 text-purple-200/90">
              Create lobbies, join queues, and showcase your presence on Discord with rich activity updates.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Enter Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Link to="/discord">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-transparent border-blue-600 text-blue-300 hover:bg-blue-600 hover:text-white"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Discord Setup
                </Button>
              </Link>
            </div>
          </div>

          <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {features.map((f) => (
                  <div key={f.title} className="rounded-xl p-4 bg-slate-800/40 border border-slate-700/60">
                    <div className="text-indigo-300">{f.icon}</div>
                    <div className="mt-2 font-semibold">{f.title}</div>
                    <div className="text-sm text-slate-300/80">{f.desc}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 overflow-hidden rounded-xl border border-slate-700/60">
                <img src="https://pub-cdn.sider.ai/u/U005HEVRO98/web-coder/68da03bcb54d8be52a93b613/resource/e5875d0a-02f0-4e78-8f0e-3007a5e960c0.jpg" className="object-cover w-full h-56" alt="Arena" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}