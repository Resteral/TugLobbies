/**
 * Tournaments page
 * Purpose: Persistent tournament create/list/manage with in-page detail view.
 * Notes:
 * - No new routes; avoid route switching (visible rule).
 * - Persists a rich tournament list so leagues can last months.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import EmbeddedHeader from '../components/common/EmbeddedHeader';
import { TournamentCreator } from '../components/tournaments/TournamentCreator';
import { TournamentManager } from '../components/tournaments/TournamentManager';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CardDescription } from '../components/common/CardDescription';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Trophy, Users, Clock, Plus } from 'lucide-react';
import type { Tournament } from '../types/tournament-types';
import { safeGetItem, safeParseJSON, safeSetItem } from '../lib/utils';

const STORAGE_KEY = 'tug.rich.tournaments.v1';

export default function Tournaments() {
  const navigate = useNavigate();
  const [list, setList] = useState<Tournament[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => list.find((t) => t.id === selectedId) || null, [list, selectedId]);

  // Load from storage
  useEffect(() => {
    const raw = safeGetItem(STORAGE_KEY);
    const data = safeParseJSON<Tournament[]>(raw, []);
    setList(data);
  }, []);

  // Persist changes
  useEffect(() => {
    safeSetItem(STORAGE_KEY, JSON.stringify(list));
  }, [list]);

  const createTournament = (t: Omit<Tournament, 'id'>) => {
    const item: Tournament = { ...t, id: `t_${Date.now()}` };
    setList((prev) => [item, ...prev]);
    setSelectedId(item.id);
  };

  const updateTournament = (t: Tournament) => {
    setList((prev) => prev.map((x) => (x.id === t.id ? t : x)));
  };

  const deleteTournament = (id: string) => {
    setList((prev) => prev.filter((x) => x.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <EmbeddedHeader />
      <div className="max-w-7xl mx-auto p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tournaments</h1>
            <p className="text-purple-200">Create, manage, and revisit long-running leagues</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/dashboard')} className="bg-purple-600 hover:bg-purple-700">
              Dashboard
            </Button>
            <Button
              onClick={() => setSelectedId(null)}
              variant="outline"
              className="bg-transparent border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Tournament
            </Button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: create or manage */}
          <div className="lg:col-span-2 space-y-6">
            {!selected ? (
              <Card className="bg-slate-800/30 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Create Tournament
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Supports auction/snake drafts, team owners, and buy-ins
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TournamentCreator
                    onSubmit={createTournament}
                    onCancel={() => setSelectedId(null)}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/30 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">{selected.name}</CardTitle>
                  <CardDescription className="text-purple-200">
                    Manage draft, players, and long-running league settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TournamentManager
                    tournament={selected}
                    onUpdate={updateTournament}
                    onDelete={deleteTournament}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: list of tournaments */}
          <div className="space-y-3">
            <Card className="bg-slate-800/30 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Your Tournaments</CardTitle>
                <CardDescription className="text-purple-200">
                  {list.length > 0 ? 'Select one to manage' : 'No tournaments yet'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {list.length === 0 ? (
                  <div className="text-center py-8 text-purple-200">
                    <div className="text-6xl mb-2">🏒</div>
                    <div>Create your first tournament to get started.</div>
                  </div>
                ) : (
                  list.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={
                        'w-full text-left p-3 rounded border transition-colors ' +
                        (selectedId === t.id
                          ? 'bg-purple-600/20 border-purple-500'
                          : 'bg-slate-900/40 border-slate-700 hover:bg-slate-700/60')
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">{t.name}</div>
                          <div className="text-xs text-purple-300">
                            {t.format} • {t.draftType} draft
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-600">
                            <Users className="w-3 h-3 mr-1 inline" />
                            {t.currentPlayers}/{t.maxPlayers}
                          </Badge>
                          <div className="text-xs text-slate-300 flex items-center gap-1 justify-end mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(t.startDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
