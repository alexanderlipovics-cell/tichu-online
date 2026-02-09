import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials nicht gefunden. Setze SUPABASE_URL und SUPABASE_KEY in .env');
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Prüft ob Supabase konfiguriert ist
 */
export function isSupabaseConfigured() {
  return supabase !== null;
}

