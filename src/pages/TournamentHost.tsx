/**
 * Tournament Host Page
 * Advanced tournament and league creation with custom game types
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { 
  Trophy, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  Plus, 
  Edit, 
  Trash, 
  Crown,
  Gavel,
  Building,
  UserPlus,
  Settings,
  Gamepad2,
  ChevronDown
} from 'lucide-react';
import { createTournament, getTournaments, Tournament, TeamOwner } from '../utils/tournament-storage';

export default function TournamentHost() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create');
  const [hostedTournaments, setHostedTournaments] = useState<Tournament[]>([]);
  
  // New tournament form state
  const [newTournament, setNewTournament] = useState({
    name: '',
    gameType: 'zealot-hockey',
    gameTypeCustom: '',
    format: 'single-elimination' as 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss' | 'league',
    draftType: 'auction' as 'auction' | 'snake',
    prizePool: 500,
    entryFee: 0,
    maxTeams: 8,
    buyInEnabled: false,
    buyInAmount: 100,
    teamOwnersEnabled: false,
    seasonStart: '',
    seasonEnd: '',
    description: '',
    rules: ''
  });

  // Host information
  const [hostInfo, setHostInfo] = useState({
    name: 'TUG Lobbies',
    email: 'host@tuglobbies.com',
    organization: 'TUG Gaming Community'
  });

  // Draft settings
  const [draftSettings, setDraftSettings] = useState({
    auctionBudget: 500,
    snakeOrder: 'elo',
    draftTimeLimit: 60,
    autoPickEnabled: true
  });

  // League settings
  const [leagueSettings, setLeagueSettings] = useState({
    regularSeasonWeeks: 8,
    playoffTeams: 4,
    matchesPerWeek: 1,
    tiebreakerRules: 'head-to-head'
  });

  // Team owners
  const [teamOwners, setTeamOwners] = useState<TeamOwner[]>([
    {
      id: 'owner-1',
      name: 'John Smith',
      teamName: 'Thunder Strikers',
      buyInPaid: true,
      budget: 500,
      roster: []
    }
  ]);

  // Dropdown states
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showDraftTypeDropdown, setShowDraftTypeDropdown] = useState(false);
  const [showGameTypeDropdown, setShowGameTypeDropdown] = useState(false);

  const formatOptions = [
    { id: 'single-elimination', name: 'Single Elimination' },
    { id: 'double-elimination', name: 'Double Elimination' },
    { id: 'round-robin', name: 'Round Robin' },
    { id: 'swiss', name: 'Swiss System' },
    { id: 'league', name: 'League Season' }
  ];

  const draftTypeOptions = [
    { id: 'auction', name: 'Auction Draft' },
    { id: 'snake', name: 'Snake Draft' }
  ];

  const gameTypeOptions = [
    { id: 'zealot-hockey', name: 'Zealot Hockey' },
    { id: '1v1-sc2', name: 'SC2 1v1' },
    { id: '2v2-sc2', name: 'SC2 2v2' },
    { id: '4v4-sc2', name: 'SC2 4v4' },
    { id: 'custom', name: 'Custom Game' }
  ];

  useEffect(() => {
    // Load tournaments from storage
    const loadTournaments = async () => {
      const tournaments = await getTournaments();
      setHostedTournaments(tournaments);
    };
    loadTournaments();
  }, []);

  const handleCreateTournament = async () => {
    try {
      const tournamentData = {
        name: newTournament.name,
        gameType: newTournament.gameType,
        gameTypeCustom: newTournament.gameTypeCustom,
        format: newTournament.format,
        status: 'registration' as const,
        prizePool: newTournament.prizePool,
        entryFee: newTournament.entryFee,
        maxPlayers: newTournament.maxTeams * (newTournament.gameType.includes('sc2') ? 1 : 6), // Estimate players
        currentPlayers: 0,
        startDate: newTournament.seasonStart || new Date().toISOString().split('T')[0],
        endDate: newTournament.seasonEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        organizer: hostInfo.name,
        description: newTournament.description,
        rules: newTournament.rules.split('\n').filter(rule => rule.trim()),
        draftType: newTournament.draftType,
        maxTeams: newTournament.maxTeams,
        buyInEnabled: newTournament.buyInEnabled,
        buyInAmount: newTournament.buyInAmount,
        teamOwnersEnabled: newTournament.teamOwnersEnabled
      };

      const createdTournament = await createTournament(tournamentData);
      
      // Reload tournaments
      const tournaments = await getTournaments();
      setHostedTournaments(tournaments);
      
      // Reset form
      setNewTournament({
        name: '',
        gameType: 'zealot-hockey',
        gameTypeCustom: '',
        format: 'single-elimination',
        draftType: 'auction',
        prizePool: 500,
        entryFee: 0,
        maxTeams: 8,
        buyInEnabled: false,
        buyInAmount: 100,
        teamOwnersEnabled: false,
        seasonStart: '',
        seasonEnd: '',
        description: '',
        rules: ''
      });

      alert('Tournament created successfully!');
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Error creating tournament. Please try again.');
    }
  };

  const addTeamOwner = () => {
    const newOwner: TeamOwner = {
      id: `owner-${Date.now()}`,
      name: '',
      teamName: '',
      buyInPaid: false,
      budget: 500,
      roster: []
    };
    setTeamOwners([...teamOwners, newOwner]);
  };

  const removeTeamOwner = (id: string) => {
    setTeamOwners(teamOwners.filter(owner => owner.id !== id));
  };

  const updateTeamOwner = (id: string, field: string, value: any) => {
    setTeamOwners(teamOwners.map(owner => 
      owner.id === id ? { ...owner, [field]: value } : owner
    ));
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

  const getFormatDisplay = (format: string) => {
    return formatOptions.find(f => f.id === format)?.name || format;
  };

  const getDraftTypeDisplay = (draftType: string) => {
    return draftTypeOptions.find(d => d.id === draftType)?.name || draftType;
  };

  const getGameTypeDisplayName = (gameType: string) => {
    return gameTypeOptions.find(g => g.id === gameType)?.name || gameType;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Tournament Host</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Create and manage professional tournaments, leagues, and draft systems with custom game types.
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </TabsTrigger>
            <TabsTrigger value="hosted" className="data-[state=active]:bg-purple-600">
              <Trophy className="h-4 w-4 mr-2" />
              My Tournaments
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
              <Settings className="h-4 w-4 mr-2" />
              Host Settings
            </TabsTrigger>
          </TabsList>

          {/* Create Tournament Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Tournament Creation Form */}
              <div className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Basic Information</CardTitle>
                    <CardDescription className="text-gray-400">
                      Set up the foundation of your tournament or league
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium">Tournament Name</label>
                      <Input
                        value={newTournament.name}
                        onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                        placeholder="e.g., Zealot Hockey Championship"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium">Game Type</label>
                      <div className="relative">
                        <Button
                          onClick={() => setShowGameTypeDropdown(!showGameTypeDropdown)}
                          variant="outline"
                          className="bg-transparent w-full justify-between border-slate-600 text-white"
                        >
                          {getGameTypeDisplayName(newTournament.gameType)}
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        {showGameTypeDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-10">
                            {gameTypeOptions.map(gameType => (
                              <button
                                key={gameType.id}
                                onClick={() => {
                                  setNewTournament({...newTournament, gameType: gameType.id});
                                  setShowGameTypeDropdown(false);
                                }}
                                className="w-full p-3 text-left hover:bg-slate-700 border-b border-slate-700 last:border-b-0 text-white"
                              >
                                {gameType.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {newTournament.gameType === 'custom' && (
                        <Input
                          value={newTournament.gameTypeCustom}
                          onChange={(e) => setNewTournament({...newTournament, gameTypeCustom: e.target.value})}
                          placeholder="Enter custom game name"
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">Format</label>
                        <div className="relative">
                          <Button
                            onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                            variant="outline"
                            className="bg-transparent w-full justify-between border-slate-600 text-white"
                          >
                            {getFormatDisplay(newTournament.format)}
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          {showFormatDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-10">
                              {formatOptions.map(format => (
                                <button
                                  key={format.id}
                                  onClick={() => {
                                    setNewTournament({...newTournament, format: format.id as any});
                                    setShowFormatDropdown(false);
                                  }}
                                  className="w-full p-3 text-left hover:bg-slate-700 border-b border-slate-700 last:border-b-0 text-white"
                                >
                                  {format.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">Draft Type</label>
                        <div className="relative">
                          <Button
                            onClick={() => setShowDraftTypeDropdown(!showDraftTypeDropdown)}
                            variant="outline"
                            className="bg-transparent w-full justify-between border-slate-600 text-white"
                          >
                            {getDraftTypeDisplay(newTournament.draftType)}
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          {showDraftTypeDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-10">
                              {draftTypeOptions.map(draftType => (
                                <button
                                  key={draftType.id}
                                  onClick={() => {
                                    setNewTournament({...newTournament, draftType: draftType.id as any});
                                    setShowDraftTypeDropdown(false);
                                  }}
                                  className="w-full p-3 text-left hover:bg-slate-700 border-b border-slate-700 last:border-b-0 text-white"
                                >
                                  {draftType.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">Prize Pool ($)</label>
                        <Input
                          type="number"
                          value={newTournament.prizePool}
                          onChange={(e) => setNewTournament({...newTournament, prizePool: parseInt(e.target.value) || 0})}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">Entry Fee ($)</label>
                        <Input
                          type="number"
                          value={newTournament.entryFee}
                          onChange={(e) => setNewTournament({...newTournament, entryFee: parseInt(e.target.value) || 0})}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium">Max Teams</label>
                      <Input
                        type="number"
                        value={newTournament.maxTeams}
                        onChange={(e) => setNewTournament({...newTournament, maxTeams: parseInt(e.target.value) || 0})}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Settings */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Advanced Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure league options and team management
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newTournament.buyInEnabled}
                        onChange={(e) => setNewTournament({...newTournament, buyInEnabled: e.target.checked})}
                        className="rounded border-slate-600 bg-slate-700"
                      />
                      <label className="text-white text-sm">Enable Buy-In System</label>
                    </div>

                    {newTournament.buyInEnabled && (
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">Buy-In Amount ($)</label>
                        <Input
                          type="number"
                          value={newTournament.buyInAmount}
                          onChange={(e) => setNewTournament({...newTournament, buyInAmount: parseInt(e.target.value) || 0})}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newTournament.teamOwnersEnabled}
                        onChange={(e) => setNewTournament({...newTournament, teamOwnersEnabled: e.target.checked})}
                        className="rounded border-slate-600 bg-slate-700"
                      />
                      <label className="text-white text-sm">Enable Team Owner System</label>
                    </div>

                    {newTournament.format === 'league' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-white text-sm font-medium">Season Start</label>
                            <Input
                              type="date"
                              value={newTournament.seasonStart}
                              onChange={(e) => setNewTournament({...newTournament, seasonStart: e.target.value})}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-white text-sm font-medium">Season End</label>
                            <Input
                              type="date"
                              value={newTournament.seasonEnd}
                              onChange={(e) => setNewTournament({...newTournament, seasonEnd: e.target.value})}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Description & Rules */}
              <div className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Tournament Description</CardTitle>
                    <CardDescription className="text-gray-400">
                      Describe your tournament to attract participants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={newTournament.description}
                      onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
                      placeholder="Describe the tournament format, rules, and what makes it special..."
                      className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Tournament Rules</CardTitle>
                    <CardDescription className="text-gray-400">
                      List the rules and regulations (one per line)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={newTournament.rules}
                      onChange={(e) => setNewTournament({...newTournament, rules: e.target.value})}
                      placeholder="Best of 3 matches
No map restrictions
Standard ELO rules apply
..."
                      className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                    />
                  </CardContent>
                </Card>

                {/* Create Button */}
                <Button 
                  onClick={handleCreateTournament}
                  disabled={!newTournament.name || (newTournament.gameType === 'custom' && !newTournament.gameTypeCustom)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  Create Tournament
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Hosted Tournaments Tab */}
          <TabsContent value="hosted">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">My Hosted Tournaments</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your active and upcoming tournaments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <Trophy className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{hostedTournaments.length}</div>
                      <div className="text-gray-400 text-sm">Total Tournaments</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {hostedTournaments.reduce((sum, t) => sum + (t.maxTeams || t.maxPlayers / 6), 0)}
                      </div>
                      <div className="text-gray-400 text-sm">Total Teams</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        ${hostedTournaments.reduce((sum, t) => sum + t.prizePool, 0)}
                      </div>
                      <div className="text-gray-400 text-sm">Total Prize Pool</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {hostedTournaments.filter(t => t.status === 'live').length}
                      </div>
                      <div className="text-gray-400 text-sm">Active Now</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tournament List */}
                <div className="space-y-4">
                  {hostedTournaments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No tournaments hosted yet. Create your first tournament!</p>
                    </div>
                  ) : (
                    hostedTournaments.map((tournament) => (
                      <div key={tournament.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="text-white font-semibold">{tournament.name}</div>
                            <div className="text-gray-400 text-sm">
                              {tournament.maxTeams || Math.floor(tournament.maxPlayers / 6)} teams • ${tournament.prizePool} prize • {tournament.draftType || 'standard'} draft
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                              {getGameTypeDisplay(tournament)} • {tournament.format.replace('-', ' ')}
                            </div>
                          </div>
                          <Badge className={
                            tournament.status === 'drafting' ? 'bg-yellow-600' :
                            tournament.status === 'registration' ? 'bg-blue-600' :
                            tournament.status === 'live' ? 'bg-green-600' : 'bg-gray-600'
                          }>
                            {tournament.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="bg-transparent border-blue-600 text-blue-400 hover:bg-blue-600">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            onClick={() => navigate(`/brackets/${tournament.id}`)}
                            variant="outline" 
                            size="sm" 
                            className="bg-transparent border-green-600 text-green-400 hover:bg-green-600"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Host Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Host Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure your tournament host profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Host Information</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">Host Name</label>
                        <Input
                          value={hostInfo.name}
                          onChange={(e) => setHostInfo({...hostInfo, name: e.target.value})}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">Email</label>
                        <Input
                          value={hostInfo.email}
                          onChange={(e) => setHostInfo({...hostInfo, email: e.target.value})}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">Organization</label>
                        <Input
                          value={hostInfo.organization}
                          onChange={(e) => setHostInfo({...hostInfo, organization: e.target.value})}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Draft Settings</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">Auction Budget</label>
                        <Input
                          type="number"
                          value={draftSettings.auctionBudget}
                          onChange={(e) => setDraftSettings({...draftSettings, auctionBudget: parseInt(e.target.value) || 0})}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">Draft Time Limit (seconds)</label>
                        <Input
                          type="number"
                          value={draftSettings.draftTimeLimit}
                          onChange={(e) => setDraftSettings({...draftSettings, draftTimeLimit: parseInt(e.target.value) || 0})}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={draftSettings.autoPickEnabled}
                          onChange={(e) => setDraftSettings({...draftSettings, autoPickEnabled: e.target.checked})}
                          className="rounded border-slate-600 bg-slate-700"
                        />
                        <label className="text-white text-sm">Enable Auto-Pick</label>
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="bg-purple-600 hover:bg-purple-700">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}