import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Statistik Database Queries
 */

/**
 * Speichert ein beendetes Spiel
 */
export async function saveGame(gameData) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase nicht konfiguriert - Spiel wird nicht gespeichert');
    return { data: gameData, error: null };
  }

  const { data, error } = await supabase
    .from('games')
    .insert({
      team1_player1: gameData.team1_player1,
      team1_player2: gameData.team1_player2,
      team2_player1: gameData.team2_player1,
      team2_player2: gameData.team2_player2,
      team1_score: gameData.team1_score,
      team2_score: gameData.team2_score,
      rounds_played: gameData.rounds_played,
      winner_team: gameData.winner_team,
      duration_seconds: gameData.duration_seconds,
      finished_at: new Date().toISOString()
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Speichert eine Runde
 */
export async function saveRound(roundData) {
  if (!isSupabaseConfigured()) {
    return { data: roundData, error: null };
  }

  const { data, error } = await supabase
    .from('rounds')
    .insert({
      game_id: roundData.game_id,
      round_number: roundData.round_number,
      team1_round_score: roundData.team1_round_score,
      team2_round_score: roundData.team2_round_score,
      tichu_caller: roundData.tichu_caller,
      tichu_success: roundData.tichu_success,
      grand_tichu_caller: roundData.grand_tichu_caller,
      grand_tichu_success: roundData.grand_tichu_success,
      first_out: roundData.first_out,
      double_win: roundData.double_win
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Aktualisiert Spieler-Statistiken nach Spielende
 */
export async function updatePlayerStats(userId, stats) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      games_played: stats.games_played,
      games_won: stats.games_won,
      tichu_calls_made: stats.tichu_calls_made,
      tichu_calls_won: stats.tichu_calls_won,
      grand_tichu_calls_made: stats.grand_tichu_calls_made,
      grand_tichu_calls_won: stats.grand_tichu_calls_won
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

/**
 * Holt Spiel-Historie für einen User
 */
export async function getGameHistory(userId, limit = 20) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .or(`team1_player1.eq.${userId},team1_player2.eq.${userId},team2_player1.eq.${userId},team2_player2.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Holt Leaderboard (Top ELO)
 */
export async function getLeaderboard(limit = 100) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url, elo_rating, games_played, games_won')
    .order('elo_rating', { ascending: false })
    .limit(limit);

  return { data, error };
}

