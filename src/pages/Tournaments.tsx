/**
 * Tournaments page showing active and upcoming tournaments
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trophy, Calendar, Users, DollarSign, Clock, Play, UserPlus } from 'lucide-react';
import { getTournaments, registerForTournament } from '../utils/tournament-storage';

interface Tournament {
  id: string;
  name: string;
  gameType: string;
  format: 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss';
  status: 'registration' | 'live' | 'completed' | 'upcoming';
  prizePool: number;
  entryFee: number;
  maxPlayers: number;
  currentPlayers: number;
  startDate: string;
  endDate: string;
  organizer: string;
  description: string;
  rules: string[];
}

export default function Tournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Load tournaments from storage
    const loadTournaments = async () => {
      const tournamentsData = await getTournaments();
      setTournaments(tournamentsData);
    };
    loadTournaments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-600';
      case 'registration': return 'bg-blue-600';
      case 'upcoming': return 'bg-yellow-600';
      case 'completed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'Live';
      case 'registration': return 'Registration Open';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const getFormatText = (format: string) => {
    switch (format) {
      case 'single-elimination': return 'Single Elimination';
      case 'double-elimination': return 'Double Elimination';
      case 'round-robin': return 'Round Robin';
      case 'swiss': return 'Swiss System';
      case 'league': return 'League Season';
      default: return format;
    }
  };

  const getGameTypeDisplay = (tournament: Tournament) => {
    if (tournament.gameType === 'custom' && tournament.gameTypeCustom) {
      return tournament.gameTypeCustom;
    }
    
    switch (tournament.gameType) {
      case 'zealot-hockey': return 'Zealot Hockey';
      case '1v1-sc2': return 'SC2 1v1';
      case '2v2-sc2': return 'SC2 2v2';
      case '4v4-sc2': return 'SC2 4v4';
      default: return tournament.gameType;
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (activeTab === 'all') return true;
    return tournament.status === activeTab;
  });

  const handleRegister = async (tournamentId: string) => {
    try {
      const success = await registerForTournament(tournamentId, 'current-user-id');
      if (success) {
        // Reload tournaments to get updated player counts
        const updatedTournaments = await getTournaments();
        setTournaments(updatedTournaments);
        alert('Successfully registered for the tournament!');
      } else {
        alert('Unable to register. Tournament may be full.');
      }
    } catch (error) {
      console.error('Error registering for tournament:', error);
      alert('Error registering for tournament. Please try again.');
    }
  };

  const handleViewBracket = (tournamentId: string) => {
    navigate(`/brackets/${tournamentId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Tournaments</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Compete in organized tournaments with prize pools, live brackets, and professional matchmaking.
          </p>
        </div>

        {/* Tournament Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-5 bg-slate-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
              All Tournaments
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-green-600">
              <Play className="w-4 h-4 mr-2" />
              Live
            </TabsTrigger>
            <TabsTrigger value="registration" className="data-[state=active]:bg-blue-600">
              <UserPlus className="w-4 h-4 mr-2" />
              Registration
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-yellow-600">
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-gray-600">
              <Trophy className="w-4 h-4 mr-2" />
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTournaments.map(tournament => (
            <Card key={tournament.id} className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-white text-xl">{tournament.name}</CardTitle>
                  <Badge className={getStatusColor(tournament.status)}>
                    {getStatusText(tournament.status)}
                  </Badge>
                </div>
                <CardDescription className="text-gray-400">
                  {tournament.description}
                </CardDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="bg-transparent border-blue-500 text-blue-400">
                    {getGameTypeDisplay(tournament)}
                  </Badge>
                  <Badge variant="outline" className="bg-transparent border-purple-500 text-purple-400">
                    {getFormatText(tournament.format)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tournament Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">${tournament.prizePool} Prize Pool</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">{tournament.currentPlayers}/{tournament.maxPlayers} Players</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">{new Date(tournament.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">{getFormatText(tournament.format)}</span>
                  </div>
                </div>

                {/* Entry Fee */}
                <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">
                      Entry Fee: {tournament.entryFee === 0 ? 'Free' : `$${tournament.entryFee}`}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Organized by: {tournament.organizer}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {tournament.status === 'registration' && (
                    <Button 
                      onClick={() => handleRegister(tournament.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register Now
                    </Button>
                  )}
                  {tournament.status === 'live' && (
                    <Button 
                      onClick={() => handleViewBracket(tournament.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch Live
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleViewBracket(tournament.id)}
                    variant="outline"
                    className="bg-transparent border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                  >
                    View Bracket
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTournaments.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Tournaments Found</h3>
              <p className="text-gray-400">
                There are no tournaments matching your current filter. Check back later for new events!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}