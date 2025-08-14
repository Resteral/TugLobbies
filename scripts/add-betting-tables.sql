-- Create betting tables for game wagering
CREATE TABLE IF NOT EXISTS game_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL,
  bettor_name TEXT NOT NULL,
  bet_amount INTEGER NOT NULL,
  bet_type TEXT NOT NULL, -- 'team1_win', 'team2_win', 'over_total', 'under_total'
  bet_target TEXT, -- team name or total score
  odds DECIMAL(4,2) DEFAULT 2.00,
  potential_payout INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'won', 'lost', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create betting balances table
CREATE TABLE IF NOT EXISTS player_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT UNIQUE NOT NULL,
  balance INTEGER DEFAULT 1000, -- Starting balance of 1000 credits
  total_wagered INTEGER DEFAULT 0,
  total_won INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_bets_game_id ON game_bets(game_id);
CREATE INDEX IF NOT EXISTS idx_game_bets_bettor ON game_bets(bettor_name);
CREATE INDEX IF NOT EXISTS idx_player_balances_name ON player_balances(player_name);

-- Insert default balances for existing players
INSERT INTO player_balances (player_name, balance)
SELECT DISTINCT player_name, 1000
FROM players
WHERE player_name NOT IN (SELECT player_name FROM player_balances)
ON CONFLICT (player_name) DO NOTHING;
