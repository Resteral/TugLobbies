/** 
 * QuickLobbyQueue Component
 * Purpose: Reusable, compact matchmaking queue panel for quick play on the dashboard.
 * - Supports:
 *   - Public (count): fixed 4v4 drafted, starts when 8 players are present.
 *   - Pro (votes): larger player pool (unlimited), starts when N players vote to start.
 * - Join/leave, see player count and queue time, vote to start (pro), and start match when conditions are met.
 * - Purely client-side demo logic; replace with backend sockets/matchmaking when available.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import ProVotePanel from './ProVotePanel';
import { Users, Clock, Play, X, Sparkles, ShieldCheck } from 'lucide-react';

/** 
 * Queue player display info used within the queue panel.
 */
interface QueuePlayer {
  id: string;
  name: string;
  elo: number;
  joinedAt: number; // epoch ms
}

/** 
 * Props for QuickLobbyQueue.
 */
interface QuickLobbyQueueProps {
  /** Stable identifier if you need to track multiple queues */
  lobbyId: string;
  /** Title of the queue panel, e.g., "Public Matchmaking" */
  title: string;
  /** Optional description shown under the title */
  description?: string;
  /** Max players; omit for unlimited (pro) */
  maxPlayers?: number;
  /** Minimum players required to start; defaults to maxPlayers or 2 for unlimited (count mode) */
  minToStart?: number;
  /** Start rule: by player count (public) or by votes (pro) */
  startMode?: 'count' | 'votes';
  /** Number of votes required to start (pro) */
  votesToStart?: number;
  /** Accent color keyword for subtle styling variations */
  accentColor?: 'blue' | 'purple' | 'green' | 'yellow';
  /** Optional label to show draft format (e.g., '4v4 drafted') */
  draftLabel?: string;
}

/**
 * Compute a readable mm:ss string for elapsed seconds.
 */
function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Get accent utility classes by keyword.
 */
function getAccent(color: NonNullable<QuickLobbyQueueProps['accentColor']> = 'blue') {
  switch (color) {
    case 'purple':
      return {
        ring: 'border-purple-700',
        headIcon: 'text-purple-300',
        chip: 'bg-purple-600',
        bg: 'from-purple-900/30 to-slate-800/40',
        progressBg: 'bg-purple-950',
      };
    case 'green':
      return {
        ring: 'border-green-700',
        headIcon: 'text-green-300',
        chip: 'bg-green-600',
        bg: 'from-green-900/30 to-slate-800/40',
        progressBg: 'bg-green-950',
      };
    case 'yellow':
      return {
        ring: 'border-yellow-700',
        headIcon: 'text-yellow-300',
        chip: 'bg-yellow-600',
        bg: 'from-yellow-900/30 to-slate-800/40',
        progressBg: 'bg-yellow-950',
      };
    default:
      return {
        ring: 'border-blue-700',
        headIcon: 'text-blue-300',
        chip: 'bg-blue-600',
        bg: 'from-blue-900/30 to-slate-800/40',
        progressBg: 'bg-blue-950',
      };
  }
}

/**
 * QuickLobbyQueue
 * Compact panel enabling a user to join a queue and start a match once threshold is met.
 */
export const QuickLobbyQueue: React.FC<QuickLobbyQueueProps> = ({
  lobbyId,
  title,
  description,
  maxPlayers,
  minToStart,
  startMode = 'count',
  votesToStart = 5,
  accentColor = 'blue',
  draftLabel = '4v4 drafted',
}) => {
  const [isJoined, setIsJoined] = useState(false);
  const [players, setPlayers] = useState<QueuePlayer[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);

  // Voting state (for pro lobbies)
  const [voters, setVoters] = useState<string[]>([]);
  const userId = `${lobbyId}-you`;
  const isUnlimited = typeof maxPlayers !== 'number';

  // Final start threshold based on mode
  const startThreshold = useMemo<number>(() => {
    if (startMode === 'votes') return votesToStart ?? 5;
    if (typeof minToStart === 'number') return minToStart;
    return typeof maxPlayers === 'number' ? maxPlayers : 2;
  }, [startMode, votesToStart, minToStart, maxPlayers]);

  const canStart = startMode === 'votes' ? voters.length >= startThreshold : players.length >= startThreshold;
  const progress = !isUnlimited && maxPlayers! > 0 ? Math.min(100, (players.length / maxPlayers!) * 100) : 0;

  const accent = getAccent(accentColor);

  // Timer for queue elapsed while joined
  useEffect(() => {
    let t: any;
    if (isJoined) {
      t = setInterval(() => setElapsed((s) => s + 1), 1000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [isJoined]);

  // Handle vote toggle and simulated joiners via window events (demo only)
  useEffect(() => {
    function onToggleVote(e: Event) {
      const ce = e as CustomEvent<{ lobbyId: string; voterId: string }>;
      if (!ce.detail || ce.detail.lobbyId !== lobbyId) return;
      const { voterId } = ce.detail;
      setVoters((prev) => (prev.includes(voterId) ? prev.filter((id) => id !== voterId) : [...prev, voterId]));
    }
    function onSimJoiner(e: Event) {
      const ce = e as CustomEvent<{ lobbyId: string }>;
      if (!ce.detail || ce.detail.lobbyId !== lobbyId) return;
      const id = `${lobbyId}-sim-${Math.random().toString(36).slice(2, 7)}`;
      setPlayers((prev) => [
        ...prev,
        { id, name: 'Player ' + id.slice(-3).toUpperCase(), elo: 1500 + Math.floor(Math.random() * 200) - 100, joinedAt: Date.now() },
      ]);
    }
    window.addEventListener('pro-vote:toggle', onToggleVote as EventListener);
    window.addEventListener('pro-vote:simulate-joiner', onSimJoiner as EventListener);
    return () => {
      window.removeEventListener('pro-vote:toggle', onToggleVote as EventListener);
      window.removeEventListener('pro-vote:simulate-joiner', onSimJoiner as EventListener);
    };
  }, [lobbyId]);

  /**
   * Join the queue as "You".
   */
  const handleJoin = () => {
    if (isJoined) return;
    setMatchMessage(null);
    const me: QueuePlayer = {
      id: userId,
      name: 'You',
      elo: 1500,
      joinedAt: Date.now(),
    };
    setPlayers((prev) => {
      const exists = prev.some((p) => p.id === me.id);
      const next = exists ? prev : [...prev, me];
      return next;
    });
    setIsJoined(true);
    setElapsed(0);
  };

  /**
   * Leave the queue and reset state related to this user.
   */
  const handleLeave = () => {
    setIsJoined(false);
    setElapsed(0);
    setMatchMessage(null);
    setVoters((prev) => prev.filter((id) => id !== userId));
    setPlayers((prev) => prev.filter((p) => p.id !== userId));
  };

  /**
   * Start match when threshold satisfied; shows a confirmation message.
   * In a real app, this would call backend matchmaking.
   */
  const handleStart = () => {
    if (!canStart) return;
    const count = players.length;
    const capText = typeof maxPlayers === 'number' ? `${count}/${maxPlayers}` : `${count} players`;
    setMatchMessage(
      startMode === 'votes'
        ? `Pro lobby started with ${capText}. Drafting 4v4 from pool.`
        : `Match started: ${capText}. Teams will be balanced by ELO.`
    );
    // Reset the queue but keep the message for confirmation
    setIsJoined(false);
    setElapsed(0);
    setVoters([]);
    setPlayers([]);
  };

  return (
    <Card className={`bg-gradient-to-br ${accent.bg} ${accent.ring}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {isUnlimited ? <ShieldCheck className={`w-5 h-5 ${accent.headIcon}`} /> : <Users className={`w-5 h-5 ${accent.headIcon}`} />}
          <span>{title}</span>
          <Badge className={accent.chip}>{isUnlimited ? 'Unlimited' : `Max ${maxPlayers}`}</Badge>
        </CardTitle>
        {description && <CardDescription className="text-slate-300">{description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Queue status */}
        <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-200">
              <Clock className="w-4 h-4 text-slate-300" />
              <span className="font-medium">Queue Time</span>
            </div>
            <div className="text-slate-300 font-mono">{formatElapsed(elapsed)}</div>
          </div>

          {!isUnlimited && (
            <>
              <Progress value={progress} className={`h-2 ${accent.progressBg}`} />
              <div className="flex justify-between text-xs text-slate-300 mt-2">
                <span>
                  {players.length}/{maxPlayers} players
                </span>
                <span>Start at {startThreshold}</span>
              </div>
            </>
          )}

          {isUnlimited && (
            <div className="flex justify-between text-xs text-slate-300">
              <span>{players.length} players in lobby</span>
              <span>{startMode === 'votes' ? `Votes to start ${startThreshold}` : `Start at ${startThreshold}+`}</span>
            </div>
          )}
        </div>

        {/* Players preview */}
        <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-200 text-sm font-semibold">Players</div>
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              {players.length}
            </Badge>
          </div>

          {players.length > 0 ? (
            <div className="space-y-2 max-h-36 overflow-auto pr-1">
              {players.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-slate-800/40 rounded px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white text-xs font-bold">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-slate-100 text-sm font-medium">{p.name}</div>
                      <div className="text-slate-400 text-xs">ELO {p.elo}</div>
                    </div>
                  </div>
                  <div className="text-slate-400 text-xs">{Math.max(0, Math.floor((Date.now() - p.joinedAt) / 1000))}s</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-4">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-60" />
              <p>No players yet</p>
              <p className="text-xs">Join to get things started</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Draft format chip */}
          {draftLabel && <div className="text-xs text-slate-300">Format: {draftLabel}</div>}

          {!isJoined ? (
            <Button onClick={handleJoin} className={`${accent.chip} hover:opacity-90`} title="Join the queue">
              <Play className="w-4 h-4 mr-2" />
              Join Queue
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={handleLeave}
                variant="outline"
                className="flex-1 bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                title="Leave the queue"
              >
                <X className="w-4 h-4 mr-2" />
                Leave Queue
              </Button>

              {/* Start button is governed by mode */}
              <Button
                onClick={handleStart}
                disabled={!canStart}
                className={`flex-1 ${canStart ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 cursor-not-allowed'}`}
                title={
                  startMode === 'votes'
                    ? canStart
                      ? 'Start scrim'
                      : `Need ${startThreshold} votes to start`
                    : canStart
                      ? 'Start match'
                      : `Need ${startThreshold} players to start`
                }
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isUnlimited ? 'Start Scrim' : 'Start Match'}
              </Button>
            </div>
          )}

          {/* Pro vote UI or public notice */}
          {startMode === 'votes' ? (
            <div className="space-y-2">
              <ProVotePanel lobbyId={lobbyId} isJoined={isJoined} players={players} votesToStart={votesToStart ?? 5} />
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>
                  Votes: <span className="text-green-300 font-semibold">{voters.length}</span> / {votesToStart}
                </span>
                <span className="text-slate-400">Scrim starts when {votesToStart} players vote</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Match auto-starts when player count is {startThreshold}.</div>
          )}
        </div>

        {/* Match started message */}
        {matchMessage && <div className="bg-green-900/30 border border-green-700 rounded p-3 text-sm text-green-200">{matchMessage}</div>}
      </CardContent>
    </Card>
  );
};
