-- TUG Lobbies Supabase Database Schema
-- Run these SQL commands in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    elo INTEGER DEFAULT 1200,
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_rate DECIMAL DEFAULT 0,
    last_played TIMESTAMPTZ DEFAULT NOW(),
    join_date TIMESTAMPTZ DEFAULT NOW(),
    game_stats JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lobbies table
CREATE TABLE IF NOT EXISTS lobbies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    game_type TEXT NOT NULL,
    players JSONB DEFAULT '[]',
    captain_ids JSONB DEFAULT '[]',
    status TEXT DEFAULT 'waiting',
    created_by TEXT NOT NULL,
    draft_type TEXT DEFAULT 'snake',
    max_players INTEGER DEFAULT 2,
    match_result TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID REFERENCES lobbies(id),
    player1_id UUID REFERENCES players(id),
    player2_id UUID REFERENCES players(id),
    player1_name TEXT,
    player2_name TEXT,
    winner_id UUID REFERENCES players(id),
    game_type TEXT,
    player1_elo_change INTEGER,
    player2_elo_change INTEGER,
    replay_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discord users table
CREATE TABLE IF NOT EXISTS discord_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) UNIQUE,
    discord_id TEXT UNIQUE NOT NULL,
    discord_username TEXT NOT NULL,
    discord_discriminator TEXT,
    discord_avatar TEXT,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE lobbies;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_elo ON players(elo);
CREATE INDEX IF NOT EXISTS idx_players_win_rate ON players(win_rate);
CREATE INDEX IF NOT EXISTS idx_lobbies_status ON lobbies(status);
CREATE INDEX IF NOT EXISTS idx_lobbies_game_type ON lobbies(game_type);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);
CREATE INDEX IF NOT EXISTS idx_discord_users_player_id ON discord_users(player_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Row Level Security Policies
-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for players (read-only for all, full access for authenticated)
CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Players can be inserted by authenticated users" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can be updated by authenticated users" ON players FOR UPDATE USING (true);

-- Policies for lobbies
CREATE POLICY "Lobbies are viewable by everyone" ON lobbies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create lobbies" ON lobbies FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update lobbies" ON lobbies FOR UPDATE USING (true);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers for updated_at
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lobbies_updated_at BEFORE UPDATE ON lobbies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discord_users_updated_at BEFORE UPDATE ON discord_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
