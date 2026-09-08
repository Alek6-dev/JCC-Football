/**
 * POST /api/scoring/calculate — Vercel Serverless Function
 *
 * Calcule les scores pour une journée spécifique.
 * Body JSON : { matchday: number, season?: string }
 *
 * Optimisations : appels API Football en parallèle, upsert batch, base_score via RPC.
 * Protégé par X-Admin-Secret.
 */

export const config = { runtime: 'edge' };

import { createClient } from '@supabase/supabase-js';
import { calculatePlayerScore, type TeamResult } from '../../lib/scoring';

const LEAGUE_ID    = 61;
const SEASON       = 2025;
const SEASON_LABEL = '2025-26';
const API_BASE     = 'https://v3.football.api-sports.io';

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Variable manquante : ${key}`);
  return val;
}

function getServiceClient() {
  return createClient(
    requireEnv('EXPO_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false } }
  );
}

function validateAdminSecret(request: Request): boolean {
  const incoming = request.headers.get('X-Admin-Secret') ?? '';
  const expected = process.env.SCORING_ADMIN_SECRET ?? '';
  if (!expected) throw new Error('SCORING_ADMIN_SECRET non défini');
  if (incoming.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= incoming.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

async function apiFetch<T>(endpoint: string, params: Record<string, string | number>): Promise<T> {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': requireEnv('API_FOOTBALL_KEY') },
    cache: 'no-store' as RequestCache,
  });
  const json = await res.json() as { response: T };
  return json.response;
}

interface ApiFixture {
  fixture: { id: number; status: { short: string } };
  teams:   { home: { id: number; winner: boolean | null }; away: { id: number; winner: boolean | null } };
  goals:   { home: number | null; away: number | null };
}

interface ApiFixturePlayer {
  team: { id: number };
  players: Array<{
    player: { id: number; name: string };
    statistics: [{
      games:    { minutes: number | null; substitute: boolean };
      shots:    { on: number | null };
      goals:    { total: number | null; conceded: number | null; assists: number | null; saves: number | null };
      passes:   { total: number | null; key: number | null; accuracy: string | null };
      tackles:  { total: number | null; blocks: number | null; interceptions: number | null };
      duels:    { total: number | null; won: number | null };
      dribbles: { success: number | null; past: number | null };
      fouls:    { drawn: number | null; committed: number | null };
      cards:    { yellow: number; red: number };
      penalty:  { won: number | null; commited: number | null; scored: number; missed: number; saved: number | null };
    }];
  }>;
}

async function fetchFixtureStats(fixtureId: number) {
  const raw = await apiFetch<ApiFixturePlayer[]>('fixtures/players', { fixture: fixtureId });
  const n = (v: number | null | undefined) => v ?? 0;
  const result: Array<{
    apiPlayerId: number; apiPlayerName: string; teamId: number;
    minutesPlayed: number; isSubstitute: boolean;
    goals: number; assists: number; shotsOn: number; keyPasses: number;
    passesTotal: number; passesAccurate: number;
    tackles: number; interceptions: number; blocks: number;
    duelsTotal: number; duelsWon: number;
    dribblesSuccess: number; dribblesPast: number;
    foulsDrawn: number; foulsCommitted: number;
    yellowCards: number; redCards: number;
    saves: number; goalsConceded: number;
    penaltyWon: number; penaltyCommitted: number;
    penaltyScored: number; penaltyMissed: number; penaltySaved: number;
  }> = [];

  for (const team of raw ?? []) {
    for (const p of team.players) {
      const s = p.statistics[0];
      if (!s || n(s.games.minutes) === 0) continue;
      result.push({
        apiPlayerId:      p.player.id,
        apiPlayerName:    p.player.name,
        teamId:           team.team.id,
        minutesPlayed:    n(s.games.minutes),
        isSubstitute:     s.games.substitute,
        goals:            n(s.goals.total),
        assists:          n(s.goals.assists),
        shotsOn:          n(s.shots.on),
        keyPasses:        n(s.passes.key),
        passesTotal:      n(s.passes.total),
        passesAccurate:   s.passes.accuracy ? parseInt(s.passes.accuracy) : 0,
        tackles:          n(s.tackles.total),
        interceptions:    n(s.tackles.interceptions),
        blocks:           n(s.tackles.blocks),
        duelsTotal:       n(s.duels.total),
        duelsWon:         n(s.duels.won),
        dribblesSuccess:  n(s.dribbles.success),
        dribblesPast:     n(s.dribbles.past),
        foulsDrawn:       n(s.fouls.drawn),
        foulsCommitted:   n(s.fouls.committed),
        yellowCards:      n(s.cards.yellow),
        redCards:         n(s.cards.red),
        saves:            n(s.goals.saves),
        goalsConceded:    n(s.goals.conceded),
        penaltyWon:       n(s.penalty.won),
        penaltyCommitted: n(s.penalty.commited),
        penaltyScored:    n(s.penalty.scored),
        penaltyMissed:    n(s.penalty.missed),
        penaltySaved:     n(s.penalty.saved),
      });
    }
  }
  return result;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Méthode non autorisée' }, { status: 405 });
  }

  try {
    if (!validateAdminSecret(request)) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }

  let body: { matchday?: unknown; season?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const matchday = Number(body.matchday);
  if (!Number.isInteger(matchday) || matchday < 1 || matchday > 38) {
    return Response.json({ error: 'matchday doit être un entier entre 1 et 38' }, { status: 400 });
  }

  const season = typeof body.season === 'string' ? body.season : SEASON_LABEL;
  const supabase = getServiceClient();
  const results = { processed: 0, skipped: 0, errors: [] as string[] };

  try {
    // 1. Joueurs en mémoire (matching 3 niveaux)
    const { data: allPlayersData } = await supabase
      .from('players')
      .select('id, name, api_football_id, api_football_team_id, season_minutes')
      .eq('card_type', 'player')
      .eq('season', season);

    const byApiIdAndTeam = new Map<string, string>();
    const byNameAndTeam  = new Map<string, string>();
    const byApiIdBest    = new Map<number, { id: string; minutes: number }>();

    for (const p of allPlayersData ?? []) {
      if (p.api_football_id != null && p.api_football_team_id != null)
        byApiIdAndTeam.set(`${p.api_football_id}|${p.api_football_team_id}`, p.id);
      if (p.api_football_team_id != null)
        byNameAndTeam.set(`${p.name}|${p.api_football_team_id}`, p.id);
      if (p.api_football_id != null) {
        const existing = byApiIdBest.get(p.api_football_id);
        if (!existing || p.season_minutes > existing.minutes)
          byApiIdBest.set(p.api_football_id, { id: p.id, minutes: p.season_minutes });
      }
    }

    // 2. Matchs de la journée
    const fixtures = await apiFetch<ApiFixture[]>('fixtures', {
      league: LEAGUE_ID, season: SEASON, round: `Regular Season - ${matchday}`,
    });

    const finishedFixtures = fixtures.filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture.status.short));
    results.skipped = fixtures.length - finishedFixtures.length;

    if (!finishedFixtures.length) {
      return Response.json({ message: `Aucun match terminé pour la journée ${matchday}`, ...results });
    }

    // 3. Stats joueurs en parallèle (tous les matchs simultanément)
    const fixtureStats = await Promise.all(
      finishedFixtures.map(async fixture => ({
        fixture,
        playerStats: await fetchFixtureStats(fixture.fixture.id),
      }))
    );

    // 4. Construction des rows de score en mémoire
    const scoreRows: object[] = [];
    const now = new Date().toISOString();

    for (const { fixture, playerStats } of fixtureStats) {
      const homeTeamId = fixture.teams.home.id;
      const homeGoals  = fixture.goals.home ?? 0;
      const awayGoals  = fixture.goals.away ?? 0;
      const homeWon    = fixture.teams.home.winner;
      const awayWon    = fixture.teams.away.winner;

      for (const stats of playerStats) {
        const isHome            = stats.teamId === homeTeamId;
        const teamGoalsScored   = isHome ? homeGoals : awayGoals;
        const teamGoalsConceded = isHome ? awayGoals : homeGoals;
        const teamResult: TeamResult =
          (isHome ? homeWon : awayWon) === true  ? 'win'  :
          (isHome ? homeWon : awayWon) === false ? 'loss' : 'draw';

        const playerId =
          byApiIdAndTeam.get(`${stats.apiPlayerId}|${stats.teamId}`) ??
          byNameAndTeam.get(`${stats.apiPlayerName}|${stats.teamId}`) ??
          byApiIdBest.get(stats.apiPlayerId)?.id;

        if (!playerId) continue;

        const { score, breakdown } = calculatePlayerScore(stats, teamGoalsScored, teamGoalsConceded, teamResult);
        scoreRows.push({
          player_id:           playerId,
          matchday,
          season,
          performance_score:   score,
          breakdown,
          team_goals_scored:   teamGoalsScored,
          team_goals_conceded: teamGoalsConceded,
          team_result:         teamResult,
          calculated_at:       now,
        });
      }
    }

    // 5. Upsert batch (1 seul appel DB)
    if (scoreRows.length > 0) {
      const { error: upsertError } = await supabase
        .from('matchday_player_scores')
        .upsert(scoreRows, { onConflict: 'player_id,matchday,season' });

      if (upsertError) {
        return Response.json({ error: upsertError.message }, { status: 500 });
      }
      results.processed = scoreRows.length;
    }

    // 6. Recalcul base_score via RPC (1 seul appel SQL)
    await supabase.rpc('recalculate_base_scores', { p_season: season });

    return Response.json({ message: `Journée ${matchday} calculée`, season, ...results });

  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
