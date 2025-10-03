import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Trophy, ArrowLeft, Plus, Users } from 'lucide-react';
import { TournamentCreator } from '../components/tournaments/TournamentCreator';
import { TournamentManager } from '../components/tournaments/TournamentManager';
import { Tournament } from '../types/tournament-types';

export default function TournamentHost() {
  const navigate = useNavigate();
  const [showTournamentCreator, setShowTournamentCreator] = useState(false);
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);

  const handleCreateTournament = (tournamentData: Omit<Tournament, 'id'>) => {
    const newTournament: Tournament = {
      ...tournamentData,
      id: `tournament-${Date.now()}`,
      players: [
        {
          id: 'user-team',
          name: 'Your Team',
          teamId: 'user-team',
          budget: tournamentData.leagueSettings?.salaryCap || 1000,
          draftedPlayers: []
        }
      ]
    };
    
    setActiveTournaments(prev => [...prev, newTournament]);
    setShowTournamentCreator(false);
  };

  const handleUpdateTournament = (updatedTournament: Tournament) => {
    setActiveTournaments(prev => 
      prev.map(tournament => 
        tournament.id === updatedTournament.id ? updatedTournament : tournament
      )
    );
  };

  const handleDeleteTournament = (tournamentId: string) => {
    setActiveTournaments(prev => 
      prev.filter(tournament => tournament.id !== tournamentId)
    );
  };

  const handleCancelCreate = () => {
    setShowTournamentCreator(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Tournament Host
            </h1>
            <p className="text-purple-200 mt-2">
              Create and manage tournaments with auction drafts, snake drafts, and leagues
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => navigate('/tournaments')}
              variant="outline"
              className="bg-transparent border-purple-600 text-purple-300 hover:bg-purple-600 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tournaments
            </Button>
            <Button 
              onClick={() => setShowTournamentCreator(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Tournament
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {showTournamentCreator ? (
          <TournamentCreator 
            onSubmit={handleCreateTournament}
            onCancel={handleCancelCreate}
          />
        ) : (
          <div className="space-y-6">
            {/* Active Tournaments */}
            {activeTournaments.length > 0 ? (
              <Card className="bg-slate-800/30 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span>Your Active Tournaments ({activeTournaments.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTournaments.map((tournament) => (
                      <Card key={tournament.id} className="bg-slate-700/50 border-purple-500/30 hover:border-purple-400/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-lg">
                              {tournament.name}
                            </CardTitle>
                            <Badge className={
                              tournament.draftType === 'auction' ? 'bg-yellow-600' :
                              tournament.draftType === 'snake' ? 'bg-blue-600' : 'bg-green-600'
                            }>
                              {tournament.draftType}
                            </Badge>
                          </div>
                          <CardDescription className="text-purple-200">
                            {tournament.gameType} • {tournament.format}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-purple-300">Players:</span>
                              <span className="text-white">
                                <Users className="w-4 h-4 inline mr-1" />
                                {tournament.currentPlayers}/{tournament.maxPlayers}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-300">Prize Pool:</span>
                              <span className="text-yellow-400">${tournament.prizePool}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-300">Status:</span>
                              <Badge variant="outline" className="bg-transparent text-green-400 border-green-500">
                                {tournament.status}
                              </Badge>
                            </div>
                          </div>
                          <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                            Manage Tournament
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/30 border-purple-500/20">
                <CardContent className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">No Tournaments Created</h3>
                  <p className="text-purple-200 mb-6 max-w-md mx-auto">
                    Create your first tournament to start organizing matches with auction drafts, snake drafts, or league systems.
                  </p>
                  <Button 
                    onClick={() => setShowTournamentCreator(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Tournament
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/30 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-blue-400" />
                    <span>Auction Drafts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200 text-sm">
                    Bid on players with virtual currency in real-time auctions. Manage your budget and build your dream team through strategic bidding.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-green-400" />
                    <span>Snake Drafts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200 text-sm">
                    Traditional snake draft format with reverse order each round. Perfect for balanced team building and strategic player selection.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span>League Systems</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200 text-sm">
                    Full league management with seasons, team owners, salary caps, and buy-in systems. Perfect for long-term competitive play.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
