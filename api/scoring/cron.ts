/**
 * GET /api/scoring/cron — Vercel Serverless Function
 *
 * Détecte les journées terminées non encore calculées et lance le calcul.
 * Optimisations : appels API Football en parallèle, upsert batch, base_score via RPC.
 * Protégé par CRON_SECRET (header Authorization: Bearer <secret>).
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
  league:  { round: string };
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
  if (request.method !== 'GET') {
    return Response.json({ error: 'Méthode non autorisée' }, { status: 405 });
  }

  const auth = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const supabase = getServiceClient();

  try {
    // 1. Toutes les journées terminées côté API Football
    const allFixtures = await apiFetch<ApiFixture[]>('fixtures', {
      league: LEAGUE_ID, season: SEASON, status: 'FT',
    });

    const completedMatchdays = new Set<number>();
    for (const f of allFixtures) {
      const match = f.league.round.match(/Regular Season - (\d+)/);
      if (match) completedMatchdays.add(parseInt(match[1]));
    }

    // 2. Journées déjà calculées en DB
    const { data: alreadyDone } = await supabase
      .from('matchday_player_scores')
      .select('matchday')
      .eq('season', SEASON_LABEL)
      .limit(20000);

    const donMatchdays = new Set((alreadyDone ?? []).map(r => r.matchday));
    const toCalculate = [...completedMatchdays].filter(md => !donMatchdays.has(md)).sort((a, b) => a - b);

    if (!toCalculate.length) {
      return Response.json({ message: 'Aucune nouvelle journée à calculer' });
    }

    // 3. Joueurs en mémoire (matching 3 niveaux)
    const { data: allPlayersData } = await supabase
      .from('players')
      .select('id, name, api_football_id, api_football_team_id, season_minutes')
      .eq('card_type', 'player')
      .eq('season', SEASON_LABEL);

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

    const results = { calculated: [] as number[], errors: [] as string[] };
    const now = new Date().toISOString();

    for (const matchday of toCalculate) {
      try {
        // 4. Fixtures de la journée
        const fixtures = await apiFetch<ApiFixture[]>('fixtures', {
          league: LEAGUE_ID, season: SEASON, round: `Regular Season - ${matchday}`,
        });

        const finishedFixtures = fixtures.filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture.status.short));
        if (!finishedFixtures.length) continue;

        // 5. Stats joueurs en parallèle pour tous les matchs de la journée
        const fixtureStats = await Promise.all(
          finishedFixtures.map(async fixture => ({
            fixture,
            playerStats: await fetchFixtureStats(fixture.fixture.id),
          }))
        );

        // 6. Construction des rows en mémoire
        const scoreRows: object[] = [];

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
              season:              SEASON_LABEL,
              performance_score:   score,
              breakdown,
              team_goals_scored:   teamGoalsScored,
              team_goals_conceded: teamGoalsConceded,
              team_result:         teamResult,
              calculated_at:       now,
            });
          }
        }

        // 7. Upsert batch (1 seul appel DB par journée)
        if (scoreRows.length > 0) {
          const { error: upsertError } = await supabase
            .from('matchday_player_scores')
            .upsert(scoreRows, { onConflict: 'player_id,matchday,season' });

          if (upsertError) throw new Error(upsertError.message);
        }

        results.calculated.push(matchday);
      } catch (err) {
        results.errors.push(`J${matchday}: ${(err as Error).message}`);
      }
    }

    // 8. Recalcul base_score via RPC (1 seul appel SQL pour toute la saison)
    if (results.calculated.length > 0) {
      await supabase.rpc('recalculate_base_scores', { p_season: SEASON_LABEL });
    }

    return Response.json({ message: 'Calcul terminé', ...results });

  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
