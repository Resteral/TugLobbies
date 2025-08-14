-- Zealot Hockey League Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE auth.users;

-- Players table with ELO ratings and profiles
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    elo_rating INTEGER DEFAULT 1200,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    position VARCHAR(20) DEFAULT 'Forward', -- Forward, Defense, Goalie
    avatar_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table for 4v4 drafts
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    captain_id UUID REFERENCES players(id) ON DELETE SET NULL,
    tournament_id UUID,
    league_id UUID,
    team_type VARCHAR(20) DEFAULT 'draft', -- draft, auction, tournament
    color VARCHAR(7) DEFAULT '#FF6B35', -- hex color
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members junction table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    position VARCHAR(20),
    is_captain BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, player_id)
);

-- Tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    tournament_type VARCHAR(20) DEFAULT 'bracket', -- bracket, round_robin, swiss
    max_teams INTEGER DEFAULT 16,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    prize_pool DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, active, completed, cancelled
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES players(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auction leagues table
CREATE TABLE auction_leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    budget_cap INTEGER DEFAULT 1000, -- auction budget per team
    max_teams INTEGER DEFAULT 12,
    draft_date TIMESTAMP WITH TIME ZONE,
    season_start TIMESTAMP WITH TIME ZONE,
    season_end TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'setup', -- setup, drafting, active, completed
    created_by UUID REFERENCES players(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player pool for auction leagues
CREATE TABLE player_pool (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES auction_leagues(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    base_price INTEGER DEFAULT 50,
    current_bid INTEGER DEFAULT 0,
    winning_team_id UUID REFERENCES teams(id),
    is_available BOOLEAN DEFAULT true,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(league_id, player_id)
);

-- Games/Matches table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id),
    league_id UUID REFERENCES auction_leagues(id),
    team1_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    team2_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    team1_score INTEGER DEFAULT 0,
    team2_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, live, completed, cancelled
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    game_type VARCHAR(20) DEFAULT '4v4', -- 4v4, 3v3, etc
    duration_minutes INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game events for real-time scoring (goals, assists, saves, etc)
CREATE TABLE game_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL, -- goal, assist, save, penalty, etc
    event_time INTEGER NOT NULL, -- seconds into the game
    description TEXT,
    recorded_by UUID REFERENCES players(id), -- who recorded this event
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Draft events for tracking draft picks
CREATE TABLE draft_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id),
    league_id UUID REFERENCES auction_leagues(id),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    pick_number INTEGER,
    round_number INTEGER,
    draft_type VARCHAR(20) DEFAULT 'snake', -- snake, auction, random
    bid_amount INTEGER, -- for auction drafts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time subscriptions for live updates
CREATE TABLE live_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id)
);

-- Create indexes for better performance
CREATE INDEX idx_players_elo ON players(elo_rating DESC);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_teams_captain ON teams(captain_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_scheduled ON games(scheduled_at);
CREATE INDEX idx_game_events_game ON game_events(game_id);
CREATE INDEX idx_game_events_player ON game_events(player_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_player ON team_members(player_id);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_subscriptions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow authenticated users to read, players can update their own data)
CREATE POLICY "Allow read access to all authenticated users" ON players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users to update their own profile" ON players FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own profile" ON players FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow read access to teams" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow captains to update their teams" ON teams FOR UPDATE TO authenticated USING (
    captain_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);

CREATE POLICY "Allow read access to tournaments" ON tournaments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to games" ON games FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to game events" ON game_events FOR SELECT TO authenticated USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE auction_leagues;
ALTER PUBLICATION supabase_realtime ADD TABLE player_pool;
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;
ALTER PUBLICATION supabase_realtime ADD TABLE draft_events;
ALTER PUBLICATION supabase_realtime ADD TABLE live_subscriptions;
