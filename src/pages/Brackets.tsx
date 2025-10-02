/**
 * Tournament bracket page showing live bracket progression
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Trophy, Users, Clock, Play, Eye, Crown, Download } from 'lucide-react';
import { getTournamentById, getTournamentMatches } from '../utils/tournament-storage';

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  player1: { id: string; name: string; score?: number };
  player2: { id: string; name: string; score?: number };
  winner?: string;
  status: 'scheduled' | 'live' | 'completed';
  startTime?: string;
  estimatedDuration?: number;
}

interface BracketRound {
  round: number;
  name: string;
  matches: Match[];
}

interface Tournament {
  id: string;
  name: string;
  format: string;
  status: string;
  currentRound: number;
  totalRounds: number;
  brackets: {
    upper?: BracketRound[];
    lower?: BracketRound[];
    final?: Match[];
  };
}

// Helper function to convert matches to bracket rounds
const convertMatchesToBracketRounds = (matches: any[], format: string) => {
  const rounds: any = { upper: [] };
  
  // Group matches by round
  const matchesByRound: { [round: number]: any[] } = {};
  matches.forEach((match: any) => {
    if (!matchesByRound[match.round]) {
      matchesByRound[match.round] = [];
    }
    matchesByRound[match.round].push({
      id: match.id,
      round: match.round,
      matchNumber: match.matchNumber,
      player1: { id: match.player1Id, name: `Player ${match.player1Id}` },
      player2: { id: match.player2Id, name: `Player ${match.player2Id}` },
      winner: match.winnerId,
      status: match.status,
      startTime: match.startTime,
      player1Score: match.player1Score,
      player2Score: match.player2Score
    });
  });
  
  // Create bracket rounds
  Object.keys(matchesByRound).forEach(roundNumber => {
    const roundNum = parseInt(roundNumber);
    const roundMatches = matchesByRound[roundNum];
    
    rounds.upper.push({
      round: roundNum,
      name: getRoundName(roundNum, roundMatches.length, format),
      matches: roundMatches
    });
  });
  
  return rounds;
};

const getRoundName = (round: number, matchCount: number, format: string) => {
  if (format === 'single-elimination') {
    const totalPlayers = matchCount * 2;
    switch (totalPlayers) {
      case 2: return 'Final';
      case 4: return round === 1 ? 'Semifinals' : 'Final';
      case 8: return round === 1 ? 'Quarterfinals' : round === 2 ? 'Semifinals' : 'Final';
      case 16: return round === 1 ? 'Round of 16' : round === 2 ? 'Quarterfinals' : round === 3 ? 'Semifinals' : 'Final';
      case 32: return round === 1 ? 'Round of 32' : round === 2 ? 'Round of 16' : round === 3 ? 'Quarterfinals' : round === 4 ? 'Semifinals' : 'Final';
      default: return `Round ${round}`;
    }
  }
  return `Round ${round}`;
};

export default function Brackets() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeBracket, setActiveBracket] = useState<'upper' | 'lower' | 'final'>('upper');

  useEffect(() => {
    // Mock bracket data based on tournament ID
    const mockBracketData: { [key: string]: Tournament } = {
      'zealot-championship': {
        id: 'zealot-championship',
        name: 'Zealot Hockey Championship',
        format: 'double-elimination',
        status: 'live',
        currentRound: 3,
        totalRounds: 5,
        brackets: {
          upper: [
            {
              round: 1,
              name: 'Round of 32',
              matches: [
                { id: 'm1', round: 1, matchNumber: 1, player1: { id: 'p1', name: 'ZealotMaster' }, player2: { id: 'p2', name: 'HockeyPro' }, winner: 'p1', status: 'completed', player1: { id: 'p1', name: 'ZealotMaster', score: 2 }, player2: { id: 'p2', name: 'HockeyPro', score: 0 } },
                { id: 'm2', round: 1, matchNumber: 2, player1: { id: 'p3', name: 'SC2Champ' }, player2: { id: 'p4', name: 'ProtossKing' }, winner: 'p3', status: 'completed', player1: { id: 'p3', name: 'SC2Champ', score: 2 }, player2: { id: 'p4', name: 'ProtossKing', score: 1 } },
                { id: 'm3', round: 1, matchNumber: 3, player1: { id: 'p5', name: 'TerranTactics' }, player2: { id: 'p6', name: 'ZergRush' }, winner: 'p5', status: 'completed', player1: { id: 'p5', name: 'TerranTactics', score: 2 }, player2: { id: 'p6', name: 'ZergRush', score: 0 } },
                { id: 'm4', round: 1, matchNumber: 4, player1: { id: 'p7', name: 'MicroMaster' }, player2: { id: 'p8', name: 'BuildOrder' }, winner: 'p7', status: 'completed', player1: { id: 'p7', name: 'MicroMaster', score: 2 }, player2: { id: 'p8', name: 'BuildOrder', score: 1 } },
              ]
            },
            {
              round: 2,
              name: 'Round of 16',
              matches: [
                { id: 'm5', round: 2, matchNumber: 1, player1: { id: 'p1', name: 'ZealotMaster' }, player2: { id: 'p3', name: 'SC2Champ' }, winner: 'p1', status: 'completed', player1: { id: 'p1', name: 'ZealotMaster', score: 2 }, player2: { id: 'p3', name: 'SC2Champ', score: 1 } },
                { id: 'm6', round: 2, matchNumber: 2, player1: { id: 'p5', name: 'TerranTactics' }, player2: { id: 'p7', name: 'MicroMaster' }, winner: 'p5', status: 'completed', player1: { id: 'p5', name: 'TerranTactics', score: 2 }, player2: { id: 'p7', name: 'MicroMaster', score: 0 } },
              ]
            },
            {
              round: 3,
              name: 'Quarterfinals',
              matches: [
                { id: 'm7', round: 3, matchNumber: 1, player1: { id: 'p1', name: 'ZealotMaster' }, player2: { id: 'p5', name: 'TerranTactics' }, status: 'live', startTime: '2024-01-20T19:00:00Z', estimatedDuration: 45 }
              ]
            }
          ],
          lower: [
            {
              round: 1,
              name: 'Lower Round 1',
              matches: [
                { id: 'm8', round: 1, matchNumber: 1, player1: { id: 'p2', name: 'HockeyPro' }, player2: { id: 'p4', name: 'ProtossKing' }, winner: 'p2', status: 'completed', player1: { id: 'p2', name: 'HockeyPro', score: 2 }, player2: { id: 'p4', name: 'ProtossKing', score: 1 } },
                { id: 'm9', round: 1, matchNumber: 2, player1: { id: 'p6', name: 'ZergRush' }, player2: { id: 'p8', name: 'BuildOrder' }, winner: 'p6', status: 'completed', player1: { id: 'p6', name: 'ZergRush', score: 2 }, player2: { id: 'p8', name: 'BuildOrder', score: 0 } },
              ]
            }
          ]
        }
      },
      'sc2-open': {
        id: 'sc2-open',
        name: 'SC2 1v1 Open',
        format: 'single-elimination',
        status: 'registration',
        currentRound: 0,
        totalRounds: 6,
        brackets: {
          upper: [
            {
              round: 1,
              name: 'Round of 64',
              matches: Array.from({ length: 32 }, (_, i) => ({
                id: `m${i + 1}`,
                round: 1,
                matchNumber: i + 1,
                player1: { id: `p${i * 2 + 1}`, name: `Player ${i * 2 + 1}` },
                player2: { id: `p${i * 2 + 2}`, name: `Player ${i * 2 + 2}` },
                status: 'scheduled'
              }))
            }
          ]
        }
      }
    };

    const data = mockBracketData[tournamentId || 'zealot-championship'];
    setTournament(data || null);
  }, [tournamentId]);

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-600';
      case 'completed': return 'bg-blue-600';
      case 'scheduled': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getMatchStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'Live';
      case 'completed': return 'Completed';
      case 'scheduled': return 'Scheduled';
      default: return status;
    }
  };

  const renderMatch = (match: Match) => (
    <Card key={match.id} className={`bg-slate-800 border-slate-700 ${
      match.status === 'live' ? 'border-green-500 ring-2 ring-green-500/20' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge className={getMatchStatusColor(match.status)}>
            {getMatchStatusText(match.status)}
          </Badge>
          {match.status === 'live' && (
            <div className="flex items-center text-green-400 text-sm">
              <Play className="w-3 h-3 mr-1 animate-pulse" />
              LIVE
            </div>
          )}
        </div>

        <div className="space-y-2">
          {/* Player 1 */}
          <div className={`flex items-center justify-between p-2 rounded ${
            match.winner === match.player1.id ? 'bg-green-900/30 border border-green-500/50' :
            match.status === 'live' ? 'bg-blue-900/20' : 'bg-slate-700/50'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">{match.player1.name}</span>
              {match.winner === match.player1.id && <Crown className="w-4 h-4 text-yellow-400" />}
            </div>
            {match.player1.score !== undefined && (
              <span className="text-white font-bold">{match.player1.score}</span>
            )}
          </div>

          {/* Player 2 */}
          <div className={`flex items-center justify-between p-2 rounded ${
            match.winner === match.player2.id ? 'bg-green-900/30 border border-green-500/50' :
            match.status === 'live' ? 'bg-blue-900/20' : 'bg-slate-700/50'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">{match.player2.name}</span>
              {match.winner === match.player2.id && <Crown className="w-4 h-4 text-yellow-400" />}
            </div>
            {match.player2.score !== undefined && (
              <span className="text-white font-bold">{match.player2.score}</span>
            )}
          </div>
        </div>

        {match.startTime && (
          <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(match.startTime).toLocaleTimeString()}</span>
            </div>
            {match.estimatedDuration && (
              <span>~{match.estimatedDuration}m</span>
            )}
          </div>
        )}

        {match.status === 'live' && (
          <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
            <Eye className="w-4 h-4 mr-2" />
            Watch Live
          </Button>
        )}
        
        {match.status === 'completed' && (
          <div className="flex space-x-2 mt-3">
            <Button variant="outline" className="flex-1 bg-transparent border-blue-600 text-blue-400 hover:bg-blue-600">
              <Play className="w-4 h-4 mr-2" />
              Watch Replay
            </Button>
            <Button variant="outline" className="bg-transparent border-purple-600 text-purple-400 hover:bg-purple-600">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderBracketRound = (round: BracketRound) => (
    <div key={round.round} className="space-y-4">
      <h3 className="text-white font-semibold text-lg">{round.name}</h3>
      <div className="grid gap-3">
        {round.matches.map(renderMatch)}
      </div>
    </div>
  );

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Tournament Not Found</h2>
            <p className="text-gray-400 mb-4">The tournament you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/tournaments')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tournaments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={() => navigate('/tournaments')}
            variant="outline"
            className="bg-transparent border-gray-600 hover:border-purple-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournaments
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
            <div className="flex items-center justify-center space-x-4 mt-2 text-gray-400">
              <Badge className={tournament.status === 'live' ? 'bg-green-600' : 'bg-blue-600'}>
                {tournament.status === 'live' ? 'Live' : 'Registration'}
              </Badge>
              <span>• {tournament.format.replace('-', ' ')} • Round {tournament.currentRound}/{tournament.totalRounds}</span>
            </div>
          </div>

          <div className="w-32"></div> {/* Spacer for alignment */}
        </div>

        {/* Bracket Tabs for Double Elimination */}
        {tournament.format === 'double-elimination' && (
          <Tabs value={activeBracket} onValueChange={(value: any) => setActiveBracket(value)} className="mb-8">
            <TabsList className="grid grid-cols-3 bg-slate-800">
              <TabsTrigger value="upper" className="data-[state=active]:bg-blue-600">
                Upper Bracket
              </TabsTrigger>
              <TabsTrigger value="lower" className="data-[state=active]:bg-purple-600">
                Lower Bracket
              </TabsTrigger>
              <TabsTrigger value="final" className="data-[state=active]:bg-yellow-600">
                Grand Finals
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Bracket Display */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          {tournament.format === 'double-elimination' ? (
            <TabsContent value={activeBracket} className="mt-0">
              {activeBracket === 'upper' && tournament.brackets.upper?.map(renderBracketRound)}
              {activeBracket === 'lower' && tournament.brackets.lower?.map(renderBracketRound)}
              {activeBracket === 'final' && tournament.brackets.final?.map(renderMatch)}
            </TabsContent>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tournament.brackets.upper?.map(renderBracketRound)}
            </div>
          )}
        </div>

        {/* Tournament Info */}
        <Card className="bg-slate-800 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Tournament Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Format</h4>
                <p className="text-gray-400">{tournament.format.replace('-', ' ').toUpperCase()}</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Current Progress</h4>
                <p className="text-gray-400">Round {tournament.currentRound} of {tournament.totalRounds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}