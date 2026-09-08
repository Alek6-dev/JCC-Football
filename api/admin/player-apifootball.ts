/**
 * GET /api/admin/player-apifootball?apiFootballId=<number> — Vercel Serverless Function
 *
 * Proxy vers API Football — stats agrégées de saison d'un joueur.
 * Protégé par header X-Admin-Token (= SCORING_ADMIN_SECRET).
 */

export const config = { runtime: 'edge' };

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

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Méthode non autorisée' }, { status: 405 });
  }

  if (!validateAdminToken(request)) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const url = new URL(request.url);
  const apiFootballId = url.searchParams.get('apiFootballId');
  if (!apiFootballId || isNaN(Number(apiFootballId))) {
    return Response.json({ error: 'Paramètre apiFootballId manquant ou invalide' }, { status: 400 });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return Response.json({ error: 'API_FOOTBALL_KEY manquante' }, { status: 500 });
  }

  const apiUrl = new URL('https://v3.football.api-sports.io/players');
  apiUrl.searchParams.set('id', apiFootballId);
  apiUrl.searchParams.set('season', '2025');
  apiUrl.searchParams.set('league', '61');

  try {
    const response = await fetch(apiUrl.toString(), {
      headers: { 'x-apisports-key': apiKey },
      cache: 'no-store',
    });

    if (!response.ok) {
      return Response.json({ error: `API Football a répondu ${response.status}` }, { status: 502 });
    }

    return Response.json(await response.json());
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Erreur réseau' },
      { status: 502 }
    );
  }
}
