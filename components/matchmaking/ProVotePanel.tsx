/**
 * ProVotePanel
 * Purpose: Voting UX for Pro lobbies that start when N players vote to start.
 * This is a local-only demo component that manages votes via parent state setters.
 */

import React, { useCallback } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ThumbsUp, UserPlus } from 'lucide-react';

/**
 * Props for ProVotePanel
 */
interface ProVotePanelProps {
  /** Lobby id (for display and unique keys) */
  lobbyId: string;
  /** Whether the current user is joined */
  isJoined: boolean;
  /** Current players in the pool */
  players: { id: string; name: string }[];
  /** Required votes to start */
  votesToStart: number;
  /** Optional callbacks passed via context (we use window events for simplicity in this demo) */
}

/**
 * We communicate with QuickLobbyQueue via window events to avoid circular dependency:
 * - 'pro-vote:toggle' with detail { lobbyId, voterId }
 * - 'pro-vote:simulate-joiner' with detail { lobbyId }
 */
export const ProVotePanel: React.FC<ProVotePanelProps> = ({
  lobbyId,
  isJoined,
  players,
  votesToStart,
}) => {
  const handleToggleVote = useCallback(() => {
    const userId = `${lobbyId}-you`;
    window.dispatchEvent(
      new CustomEvent('pro-vote:toggle', { detail: { lobbyId, voterId: userId } })
    );
  }, [lobbyId]);

  const handleAddJoiner = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('pro-vote:simulate-joiner', { detail: { lobbyId } })
    );
  }, [lobbyId]);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Badge className="bg-purple-600">Pro lobby</Badge>
        <span className="text-slate-300 text-sm">Starts when 5 players vote</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleToggleVote}
          disabled={!isJoined}
          className={isJoined ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-slate-700 cursor-not-allowed'}
          title={isJoined ? 'Vote to start' : 'Join first to vote'}
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          Vote to Start
        </Button>

        {/* Demo helper: quickly add pool players to visualize votes */}
        <Button
          variant="outline"
          onClick={handleAddJoiner}
          className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
          title="Add a simulated player to the pool"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Player
        </Button>

        <Badge variant="outline" className="border-purple-600 text-purple-200">
          Pool {players.length}
        </Badge>
        <Badge variant="outline" className="border-green-600 text-green-200">
          Needed {votesToStart}
        </Badge>
      </div>
    </div>
  );
};

export default ProVotePanel;
