-- Tichu Online Database Schema
-- Für Supabase PostgreSQL

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  elo_rating INTEGER DEFAULT 1000,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  tichu_calls_made INTEGER DEFAULT 0,
  tichu_calls_won INTEGER DEFAULT 0,
  grand_tichu_calls_made INTEGER DEFAULT 0,
  grand_tichu_calls_won INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friends Table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Games Table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team1_player1 UUID REFERENCES users(id),
  team1_player2 UUID REFERENCES users(id),
  team2_player1 UUID REFERENCES users(id),
  team2_player2 UUID REFERENCES users(id),
  team1_score INTEGER NOT NULL DEFAULT 0,
  team2_score INTEGER NOT NULL DEFAULT 0,
  rounds_played INTEGER NOT NULL DEFAULT 0,
  winner_team INTEGER CHECK (winner_team IN (1, 2)),
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Rounds Table
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  team1_round_score INTEGER NOT NULL DEFAULT 0,
  team2_round_score INTEGER NOT NULL DEFAULT 0,
  tichu_caller UUID REFERENCES users(id),
  tichu_success BOOLEAN,
  grand_tichu_caller UUID REFERENCES users(id),
  grand_tichu_success BOOLEAN,
  first_out UUID REFERENCES users(id),
  double_win BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_games_team1_player1 ON games(team1_player1);
CREATE INDEX IF NOT EXISTS idx_games_team2_player1 ON games(team2_player1);
CREATE INDEX IF NOT EXISTS idx_rounds_game_id ON rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_users_elo_rating ON users(elo_rating DESC);

-- Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für users.updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

