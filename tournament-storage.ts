/**
 * Tournament storage utility for managing tournament data with localStorage persistence
 */

export interface Tournament {
  id: string;
  name: string;
  gameType: string;
  gameTypeCustom?: string; // For custom game types
  format: 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss' | 'league';
  status: 'registration' | 'live' | 'completed' | 'upcoming' | 'drafting';
  prizePool: number;
  entryFee: number;
  maxPlayers: number;
  currentPlayers: number;
  startDate: string;
  endDate: string;
  organizer: string;
  description: string;
  rules: string[];
  draftType?: 'auction' | 'snake' | 'random';
  maxTeams?: number;
  buyInEnabled?: boolean;
  buyInAmount?: number;
  teamOwnersEnabled?: boolean;
  seasonStart?: string;
  seasonEnd?: string;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  player1Id: string;
  player2Id: string;
  player1Score?: number;
  player2Score?: number;
  winnerId?: string;
  status: 'scheduled' | 'live' | 'completed';
  startTime?: string;
  estimatedDuration?: number;
}

export interface TeamOwner {
  id: string;
  name: string;
  teamName: string;
  buyInPaid: boolean;
  budget: number;
  roster: string[];
}

// Storage keys
const TOURNAMENTS_KEY = 'tug-lobbies-tournaments';
const MATCHES_KEY = 'tug-lobbies-tournament-matches';
const TEAM_OWNERS_KEY = 'tug-lobbies-team-owners';

// Initialize default tournaments if none exist
const initializeDefaultTournaments = (): Tournament[] => [
  {
    id: 'zealot-championship',
    name: 'Zealot Hockey Championship',
    gameType: 'zealot-hockey',
    format: 'double-elimination',
    status: 'live',
    prizePool: 500,
    entryFee: 0,
    maxPlayers: 32,
    currentPlayers: 28,
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    organizer: 'TUG Lobbies',
    description: 'The premier Zealot Hockey tournament featuring the best players in the community.',
    rules: ['Best of 3 until finals', 'Best of 5 for grand finals']
  },
  {
    id: 'sc2-open',
    name: 'SC2 1v1 Open',
    gameType: '1v1-sc2',
    format: 'single-elimination',
    status: 'registration',
    prizePool: 250,
    entryFee: 5,
    maxPlayers: 64,
    currentPlayers: 42,
    startDate: '2024-01-20',
    endDate: '2024-01-21',
    organizer: 'StarCraft Community',
    description: 'Weekly StarCraft II 1v1 tournament open to all skill levels.',
    rules: ['Best of 1 until quarterfinals', 'Best of 3 from quarterfinals']
  },
  {
    id: 'weekly-hockey',
    name: 'Zealot Hockey Weekly',
    gameType: 'zealot-hockey',
    format: 'single-elimination',
    status: 'upcoming',
    prizePool: 100,
    entryFee: 0,
    maxPlayers: 16,
    currentPlayers: 0,
    startDate: '2024-01-25',
    endDate: '2024-01-25',
    organizer: 'TUG Lobbies',
    description: 'Weekly community tournament for Zealot Hockey enthusiasts.',
    rules: ['Best of 3 throughout', 'Random map selection']
  }
];

// Initialize default matches
const initializeDefaultMatches = (): TournamentMatch[] => [
  // Zealot Championship matches
  { 
    id: 'm1', 
    tournamentId: 'zealot-championship', 
    round: 1, 
    matchNumber: 1, 
    player1Id: 'p1', 
    player2Id: 'p2', 
    player1Score: 2, 
    player2Score: 0, 
    winnerId: 'p1', 
    status: 'completed' 
  },
  { 
    id: 'm2', 
    tournamentId: 'zealot-championship', 
    round: 1, 
    matchNumber: 2, 
    player1Id: 'p3', 
    player2Id: 'p4', 
    player1Score: 2, 
    player2Score: 1, 
    winnerId: 'p3', 
    status: 'completed' 
  },
  { 
    id: 'm3', 
    tournamentId: 'zealot-championship', 
    round: 2, 
    matchNumber: 1, 
    player1Id: 'p1', 
    player2Id: 'p3', 
    status: 'live', 
    startTime: '2024-01-20T19:00:00Z', 
    estimatedDuration: 45 
  }
];

// Initialize default team owners
const initializeDefaultTeamOwners = (): TeamOwner[] => [
  {
    id: 'owner-1',
    name: 'John Smith',
    teamName: 'Thunder Strikers',
    buyInPaid: true,
    budget: 500,
    roster: []
  },
  {
    id: 'owner-2',
    name: 'Sarah Johnson',
    teamName: 'Ice Breakers',
    buyInPaid: false,
    budget: 500,
    roster: []
  }
];

// Helper functions for localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

// Initialize storage if empty
const initializeStorage = () => {
  const currentTournaments = getFromStorage(TOURNAMENTS_KEY, []);
  if (currentTournaments.length === 0) {
    setToStorage(TOURNAMENTS_KEY, initializeDefaultTournaments());
  }

  const currentMatches = getFromStorage(MATCHES_KEY, []);
  if (currentMatches.length === 0) {
    setToStorage(MATCHES_KEY, initializeDefaultMatches());
  }

  const currentTeamOwners = getFromStorage(TEAM_OWNERS_KEY, []);
  if (currentTeamOwners.length === 0) {
    setToStorage(TEAM_OWNERS_KEY, initializeDefaultTeamOwners());
  }
};

// Initialize on import
initializeStorage();

export const getTournaments = async (): Promise<Tournament[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const tournaments = getFromStorage(TOURNAMENTS_KEY, []);
      resolve([...tournaments]);
    }, 100);
  });
};

export const getTournamentById = async (id: string): Promise<Tournament | null> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const tournaments = getFromStorage(TOURNAMENTS_KEY, []);
      const tournament = tournaments.find((t: Tournament) => t.id === id);
      resolve(tournament || null);
    }, 100);
  });
};

export const getTournamentMatches = async (tournamentId: string): Promise<TournamentMatch[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const matches = getFromStorage(MATCHES_KEY, []);
      const tournamentMatches = matches.filter((m: TournamentMatch) => m.tournamentId === tournamentId);
      resolve([...tournamentMatches]);
    }, 100);
  });
};

export const createTournament = async (tournamentData: Omit<Tournament, 'id'>): Promise<Tournament> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const tournaments = getFromStorage(TOURNAMENTS_KEY, []);
      
      // Handle custom game type logic
      const finalGameType = tournamentData.gameType === 'custom' 
        ? tournamentData.gameTypeCustom || 'Custom Game'
        : tournamentData.gameType;
      
      const newTournament: Tournament = {
        ...tournamentData,
        gameType: finalGameType,
        id: `tournament-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      const updatedTournaments = [...tournaments, newTournament];
      setToStorage(TOURNAMENTS_KEY, updatedTournaments);
      
      resolve(newTournament);
    }, 100);
  });
};

export const updateTournament = async (tournament: Tournament): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const tournaments = getFromStorage(TOURNAMENTS_KEY, []);
      const index = tournaments.findIndex((t: Tournament) => t.id === tournament.id);
      if (index !== -1) {
        tournaments[index] = tournament;
        setToStorage(TOURNAMENTS_KEY, tournaments);
      }
      resolve();
    }, 100);
  });
};

export const registerForTournament = async (tournamentId: string, playerId: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const tournaments = getFromStorage(TOURNAMENTS_KEY, []);
      const tournament = tournaments.find((t: Tournament) => t.id === tournamentId);
      if (tournament && tournament.currentPlayers < tournament.maxPlayers) {
        tournament.currentPlayers++;
        setToStorage(TOURNAMENTS_KEY, tournaments);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 100);
  });
};

export const updateMatchResult = async (matchId: string, player1Score: number, player2Score: number, winnerId: string): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const matches = getFromStorage(MATCHES_KEY, []);
      const match = matches.find((m: TournamentMatch) => m.id === matchId);
      if (match) {
        match.player1Score = player1Score;
        match.player2Score = player2Score;
        match.winnerId = winnerId;
        match.status = 'completed';
        setToStorage(MATCHES_KEY, matches);
      }
      resolve();
    }, 100);
  });
};

export const getTeamOwners = async (): Promise<TeamOwner[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const teamOwners = getFromStorage(TEAM_OWNERS_KEY, []);
      resolve([...teamOwners]);
    }, 100);
  });
};

export const createTeamOwner = async (ownerData: Omit<TeamOwner, 'id'>): Promise<TeamOwner> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const teamOwners = getFromStorage(TEAM_OWNERS_KEY, []);
      const newOwner: TeamOwner = {
        ...ownerData,
        id: `owner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      const updatedOwners = [...teamOwners, newOwner];
      setToStorage(TEAM_OWNERS_KEY, updatedOwners);
      
      resolve(newOwner);
    }, 100);
  });
};

export const updateTeamOwner = async (owner: TeamOwner): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const teamOwners = getFromStorage(TEAM_OWNERS_KEY, []);
      const index = teamOwners.findIndex((o: TeamOwner) => o.id === owner.id);
      if (index !== -1) {
        teamOwners[index] = owner;
        setToStorage(TEAM_OWNERS_KEY, teamOwners);
      }
      resolve();
    }, 100);
  });
};

export const deleteTeamOwner = async (ownerId: string): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const teamOwners = getFromStorage(TEAM_OWNERS_KEY, []);
      const updatedOwners = teamOwners.filter((o: TeamOwner) => o.id !== ownerId);
      setToStorage(TEAM_OWNERS_KEY, updatedOwners);
      resolve();
    }, 100);
  });
};