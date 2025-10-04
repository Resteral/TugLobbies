/**
 * Home page
 * Purpose: Presentable landing hero for tuglobbies.com that works in Discord Activities.
 * - Shows TUG logo prominently
 * - Clear CTAs into Dashboard (Lobbies), Tournaments, and Discord page
 * - Responsive, high-contrast, lightweight
 */

import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import EmbeddedHeader from '../components/common/EmbeddedHeader';
import BrandLogo from '../components/common/BrandLogo';
import { Trophy, Gamepad2, MessageSquare } from 'lucide-react';

/**
 * Home component
 * Minimal, beautiful hero that guides users to next actions.
 */
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Compact header shows automatically when embedded */}
      <EmbeddedHeader />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Logo + headline */}
          <div>
            <BrandLogo size="lg" withText className="mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Competitive Lobbies, Long‑Running Leagues, and Smart Stats
            </h1>
            <p className="mt-4 text-slate-200 max-w-prose">
              TUG Lobbies powers Zealot Hockey matchmaking, persistent tournaments that can last months,
              and a modern Discord Activities experience—so your progress is right where you left it.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700"
                title="Go to Lobbies"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Enter Lobbies
              </Button>
              <Button
                onClick={() => navigate('/tournaments')}
                variant="outline"
                className="bg-transparent border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                title="Create or manage tournaments"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Tournaments
              </Button>
              <Button
                onClick={() => navigate('/discord')}
                variant="outline"
                className="bg-transparent border-indigo-600 text-indigo-300 hover:bg-indigo-600 hover:text-white"
                title="Discord Activities readiness"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Discord
              </Button>
            </div>
          </div>

          {/* Right: Visuals */}
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-slate-700">
                {/* Hero visual uses local logo for reliability */}
                <img src="/logo.png" alt="TUG logo" className="w-full h-40 object-contain bg-slate-900" />
              </div>
              <div className="rounded-xl border border-slate-700 p-4 flex flex-col justify-between bg-gradient-to-br from-blue-900/30 to-slate-900/50">
                <div>
                  <div className="text-sm text-blue-300">Public 4v4</div>
                  <div className="text-white font-semibold">Auto-start at 8</div>
                </div>
                <div className="text-xs text-slate-300">Balanced by ELO</div>
              </div>
              <div className="rounded-xl border border-slate-700 p-4 flex flex-col justify-between bg-gradient-to-br from-purple-900/30 to-slate-900/50">
                <div>
                  <div className="text-sm text-purple-300">Pro 4v4 (Pool)</div>
                  <div className="text-white font-semibold">Starts on votes</div>
                </div>
                <div className="text-xs text-slate-300">Draft from pool</div>
              </div>
              <div className="rounded-xl border border-slate-700 p-4 bg-slate-900/60">
                <div className="text-sm text-amber-300 mb-1">Long‑running leagues</div>
                <div className="text-xs text-slate-300">Owner buy‑ins, salary caps, persistent storage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick section: why TUG */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/60">
            <div className="text-white font-semibold">Discord‑ready</div>
            <div className="text-slate-300 text-sm mt-1">
              Works seamlessly in Discord Activities with compact UI and state persistence.
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/60">
            <div className="text-white font-semibold">Persistent tournaments</div>
            <div className="text-slate-300 text-sm mt-1">
              Leagues last months. Your data stays saved so you can return anytime.
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/60">
            <div className="text-white font-semibold">Owner buy‑ins</div>
            <div className="text-slate-300 text-sm mt-1">
              Manage buy‑ins per team owner with simple, reliable local persistence.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
