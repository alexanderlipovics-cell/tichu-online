import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * User Database Queries
 */

/**
 * Erstellt oder aktualisiert einen User
 */
export async function upsertUser(userData) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase nicht konfiguriert - User wird nicht gespeichert');
    return { data: userData, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      avatar_url: userData.avatar_url,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Holt User nach ID
 */
export async function getUserById(userId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

/**
 * Holt User nach Username
 */
export async function getUserByUsername(username) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  return { data, error };
}

/**
 * Aktualisiert ELO-Rating
 */
export async function updateEloRating(userId, newRating) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .update({ elo_rating: newRating })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

/**
 * Holt Freundesliste
 */
export async function getFriends(userId) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      friend:users!friendships_friend_id_fkey(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'accepted');

  return { data, error };
}

/**
 * Fügt Freundschaftsanfrage hinzu
 */
export async function addFriendship(userId, friendId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('friendships')
    .insert({
      user_id: userId,
      friend_id: friendId,
      status: 'pending'
    })
    .select()
    .single();

  return { data, error };
}

