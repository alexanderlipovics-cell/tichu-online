import { supabase, isSupabaseConfigured } from '../db/supabase.js';

/**
 * JWT Auth Middleware für Express
 * Validiert Supabase JWT Token
 */
export async function authenticateToken(req, res, next) {
  if (!isSupabaseConfigured()) {
    // Im Development ohne Supabase: Skip Auth
    req.user = { id: 'dev-user', username: 'dev' };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Kein Token bereitgestellt' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({ error: 'Ungültiger Token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(403).json({ error: 'Token-Validierung fehlgeschlagen' });
  }
}

/**
 * Optional Auth - setzt req.user wenn Token vorhanden, aber blockiert nicht
 */
export async function optionalAuth(req, res, next) {
  if (!isSupabaseConfigured()) {
    req.user = null;
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    req.user = user || null;
  } catch (error) {
    req.user = null;
  }

  next();
}

