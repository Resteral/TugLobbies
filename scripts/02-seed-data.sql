-- Seed data for Zealot Hockey League

-- Insert sample players with varying ELO ratings
INSERT INTO players (username, display_name, email, elo_rating, games_played, wins, losses, goals, assists, saves, position) VALUES
('zealot_captain', 'Alex "Zealot" Johnson', 'alex@zealothockey.com', 1850, 45, 32, 13, 89, 67, 0, 'Forward'),
('ice_sniper', 'Sarah "Sniper" Chen', 'sarah@zealothockey.com', 1820, 42, 28, 14, 95, 45, 0, 'Forward'),
('wall_keeper', 'Mike "Wall" Rodriguez', 'mike@zealothockey.com', 1780, 38, 25, 13, 12, 8, 234, 'Goalie'),
('speed_demon', 'Jake "Speed" Thompson', 'jake@zealothockey.com', 1750, 40, 24, 16, 67, 78, 0, 'Forward'),
('iron_defense', 'Emma "Iron" Wilson', 'emma@zealothockey.com', 1720, 35, 22, 13, 23, 56, 0, 'Defense'),
('puck_wizard', 'Chris "Wizard" Lee', 'chris@zealothockey.com', 1690, 33, 19, 14, 45, 89, 0, 'Forward'),
('net_guardian', 'Taylor "Guardian" Brown', 'taylor@zealothockey.com', 1680, 31, 18, 13, 8, 12, 198, 'Goalie'),
('blade_runner', 'Jordan "Blade" Davis', 'jordan@zealothockey.com', 1650, 29, 16, 13, 34, 67, 0, 'Defense'),
('power_play', 'Sam "Power" Martinez', 'sam@zealothockey.com', 1620, 27, 15, 12, 56, 34, 0, 'Forward'),
('ice_breaker', 'Casey "Breaker" Anderson', 'casey@zealothockey.com', 1590, 25, 13, 12, 29, 45, 0, 'Defense'),
('goal_machine', 'Riley "Machine" Garcia', 'riley@zealothockey.com', 1560, 23, 12, 11, 67, 23, 0, 'Forward'),
('stick_handler', 'Morgan "Handler" White', 'morgan@zealothockey.com', 1530, 21, 10, 11, 34, 56, 0, 'Forward'),
('rink_master', 'Avery "Master" Johnson', 'avery@zealothockey.com', 1500, 19, 9, 10, 23, 67, 0, 'Defense'),
('puck_hunter', 'Quinn "Hunter" Miller', 'quinn@zealothockey.com', 1470, 17, 8, 9, 45, 34, 0, 'Forward'),
('ice_storm', 'Sage "Storm" Taylor', 'sage@zealothockey.com', 1440, 15, 7, 8, 34, 45, 0, 'Forward');

-- Insert a sample tournament
INSERT INTO tournaments (name, description, tournament_type, max_teams, entry_fee, prize_pool, status, start_date, end_date, registration_deadline) VALUES
('Zealot Winter Championship 2025', 'The ultimate 4v4 hockey tournament featuring the best players in the league', 'bracket', 16, 50.00, 800.00, 'upcoming', '2025-02-15 18:00:00+00', '2025-02-16 22:00:00+00', '2025-02-10 23:59:59+00');

-- Insert a sample auction league
INSERT INTO auction_leagues (name, description, budget_cap, max_teams, draft_date, season_start, season_end, status) VALUES
('Zealot Spring Auction League', 'Draft your dream team through our auction system', 1000, 8, '2025-03-01 19:00:00+00', '2025-03-08 18:00:00+00', '2025-04-30 22:00:00+00', 'setup');

-- Add all players to the auction league player pool
INSERT INTO player_pool (league_id, player_id, base_price)
SELECT 
    (SELECT id FROM auction_leagues WHERE name = 'Zealot Spring Auction League'),
    id,
    CASE 
        WHEN elo_rating >= 1800 THEN 200
        WHEN elo_rating >= 1700 THEN 150
        WHEN elo_rating >= 1600 THEN 100
        WHEN elo_rating >= 1500 THEN 75
        ELSE 50
    END
FROM players;
