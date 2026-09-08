/**
 * GET /api/admin/player-scores?playerId=<uuid> — Vercel Serverless Function
 *
 * Retourne l'historique complet des scores d'un joueur avec breakdown détaillé.
 * Protégé par header X-Admin-Token (= SCORING_ADMIN_SECRET).
 */

export const config = { runtime: 'edge' };

import { createClient } from '@supabase/supabase-js';

function validateAdminToken(request: Request): boolean {
  const incoming = request.headers.get('X-Admin-Token') ?? '';
  const expected = process.env.SCORING_ADMIN_SECRET ?? '';
  if (!expected || incoming.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= incoming.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function getServiceClient() {
  return createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Méthode non autorisée' }, { status: 405 });
  }

  if (!validateAdminToken(request)) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const url = new URL(request.url);
  const playerId = url.searchParams.get('playerId');
  if (!playerId) {
    return Response.json({ error: 'Paramètre playerId manquant' }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: scores, error } = await supabase
    .from('matchday_player_scores')
    .select(
      'matchday, season, performance_score, breakdown, ' +
      'team_goals_scored, team_goals_conceded, team_result, calculated_at'
    )
    .eq('player_id', playerId)
    .order('matchday', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(scores ?? []);
}
