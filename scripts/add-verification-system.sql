-- Add verified field to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- Add unique constraint on player names (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS players_name_unique_idx ON players (LOWER(name));

-- Add unique constraint on starcraft_account_id if it doesn't exist
ALTER TABLE players ADD COLUMN IF NOT EXISTS starcraft_account_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS players_starcraft_id_unique_idx ON players (starcraft_account_id);

-- Create admin verification function (only you can call this)
CREATE OR REPLACE FUNCTION grant_verification(player_name TEXT, admin_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Replace 'your-secret-admin-key' with your actual admin key
  IF admin_key != 'zealot-admin-2024' THEN
    RETURN FALSE;
  END IF;
  
  UPDATE players 
  SET verified = TRUE 
  WHERE LOWER(name) = LOWER(player_name);
  
  RETURN FOUND;
END;
$$;

-- Create function to revoke verification
CREATE OR REPLACE FUNCTION revoke_verification(player_name TEXT, admin_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF admin_key != 'zealot-admin-2024' THEN
    RETURN FALSE;
  END IF;
  
  UPDATE players 
  SET verified = FALSE 
  WHERE LOWER(name) = LOWER(player_name);
  
  RETURN FOUND;
END;
$$;
