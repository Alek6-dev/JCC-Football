/**
 * scripts/backfill-scores.ts
 *
 * Calcule les scores fantasy pour tous les matchdays déjà joués
 * de la saison 2025-26, et met à jour le base_score de chaque joueur
 * avec sa moyenne de performance réelle.
 *
 * Usage :
 *   npx tsx scripts/backfill-scores.ts
 *
 * Ce que fait ce script :
 *   1. Récupère tous les matchs Ligue 1 2025-26 terminés
 *   2. Pour chaque match, fetch les stats joueurs
 *   3. Calcule le score fantasy avec notre barème
 *   4. Stocke dans matchday_player_stats + matchday_player_scores
 *   5. Met à jour base_score = moyenne des performances sur la saison
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Charge .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length && !key.startsWith('#')) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
}

const API_KEY      = process.env.API_FOOTBALL_KEY!;
const API_BASE     = 'https://v3.football.api-sports.io';
const LEAGUE_ID    = 61;
const SEASON       = 2025;
const SEASON_LABEL = '2025-26';

if (!API_KEY) { console.error('❌  API_FOOTBALL_KEY manquante'); process.exit(1); }
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) { console.error('❌  SUPABASE_SERVICE_ROLE_KEY manquante'); process.exit(1); }

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// API Football helpers
// ---------------------------------------------------------------------------

async function apiFetch<T>(endpoint: string, params: Record<string, string | number>): Promise<T> {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), { headers: { 'x-apisports-key': API_KEY } });
  if (!res.ok) throw new Error(`API ${endpoint} → HTTP ${res.status}`);
  const json = await res.json() as { response: T; errors: unknown };
  if (json.errors && Object.keys(json.errors as object).length > 0) {
    throw new Error(`API erreur : ${JSON.stringify(json.errors)}`);
  }
  return json.response;
}

interface ApiFixture {
  fixture: { id: number; status: { short: string } };
  league:  { round: string };
  teams: {
    home: { id: number; winner: boolean | null };
    away: { id: number; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
}

interface ApiPlayerStats {
  team: { id: number };
  players: Array<{
    player: { id: number; name: string };
    statistics: [{
      games:    { minutes: number | null; substitute: boolean; position: string };
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

// ---------------------------------------------------------------------------
// Barème (dupliqué ici pour éviter les problèmes d'import de path alias)
// ---------------------------------------------------------------------------

const SCORING_CONFIG = {
  participation: { starter: 3, fullGameBonus: 0.5, subEntered: 1, fullGameMinutes: 90 },
  attack:   { goal: 20, shotOnTarget: 4, assist: 12, keyPass: 4, dribbleSuccess: 2, foulDrawn: 1, penaltyWon: 5 },
  defense:  { tackle: 3, interception: 3, shotBlocked: 4, duelWon: 1, duelLost: -1, dribblePast: -1 },
  goalkeeper: { save: 4, penaltySaved: 15, goalConceded: -5 },
  sanctions:  { foulCommitted: -2, yellowCard: -5, redCard: -20, penaltyCommitted: -12, penaltyMissed: -10 },
  passAccuracy: [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10],
  collective: {
    result:         { win: 5, draw: 2, loss: 0 },
    goalsScored:    [-1, 0, 1, 3, 6],
    goalsConceded:  [3, 0.5, -0.5, -1.5, -3],
  },
};

function calcPassAccuracy(accurate: number, total: number): number {
  if (total === 0) return 0;
  const pct = (accurate / total) * 100;
  const idx = pct < 50 ? 0 : Math.min(Math.floor((pct - 50) / 5) + 1, 10);
  return SCORING_CONFIG.passAccuracy[idx];
}

function calcTeamGoalPts(goals: number, table: number[]): number {
  if (goals < table.length) return table[goals];
  let pts = table[table.length - 1];
  for (let i = 0; i < goals - (table.length - 1); i++) pts *= 2;
  return pts;
}

function n(v: number | null | undefined): number { return v ?? 0; }

function calcScore(s: ApiPlayerStats['players'][0]['statistics'][0], teamGoals: number, teamConceded: number, result: 'win'|'draw'|'loss') {
  const cfg = SCORING_CONFIG;
  let score = 0;
  const breakdown: Record<string, number> = {};
  const add = (k: string, v: number) => { if (v) { breakdown[k] = (breakdown[k] ?? 0) + v; score += v; } };

  if (n(s.games.minutes) > 0) {
    if (!s.games.substitute) {
      add('starter', cfg.participation.starter);
      if (n(s.games.minutes) >= cfg.participation.fullGameMinutes) add('fullGameBonus', cfg.participation.fullGameBonus);
    } else {
      add('subEntered', cfg.participation.subEntered);
    }
  }

  add('goals',           n(s.goals.total)        * cfg.attack.goal);
  add('assists',         n(s.goals.assists)       * cfg.attack.assist);
  add('shotsOn',         n(s.shots.on)            * cfg.attack.shotOnTarget);
  add('keyPasses',       n(s.passes.key)          * cfg.attack.keyPass);
  add('dribblesSuccess', n(s.dribbles.success)    * cfg.attack.dribbleSuccess);
  add('foulDrawn',       n(s.fouls.drawn)         * cfg.attack.foulDrawn);
  add('penaltyWon',      n(s.penalty.won)         * cfg.attack.penaltyWon);
  add('tackles',         n(s.tackles.total)       * cfg.defense.tackle);
  add('interceptions',   n(s.tackles.interceptions) * cfg.defense.interception);
  add('blocks',          n(s.tackles.blocks)      * cfg.defense.shotBlocked);
  add('duelsWon',        n(s.duels.won)           * cfg.defense.duelWon);
  add('duelsLost',       Math.max(0, n(s.duels.total) - n(s.duels.won)) * cfg.defense.duelLost);
  add('dribblesPast',    n(s.dribbles.past)       * cfg.defense.dribblePast);
  add('saves',           n(s.goals.saves)         * cfg.goalkeeper.save);
  add('goalsConcededGK', n(s.goals.conceded)      * cfg.goalkeeper.goalConceded);
  add('penaltySaved',    n(s.penalty.saved)       * cfg.goalkeeper.penaltySaved);
  add('foulsCommitted',  n(s.fouls.committed)     * cfg.sanctions.foulCommitted);
  add('yellowCards',     n(s.cards.yellow)        * cfg.sanctions.yellowCard);
  add('redCards',        n(s.cards.red)           * cfg.sanctions.redCard);
  add('penaltyCommitted',n(s.penalty.commited)    * cfg.sanctions.penaltyCommitted);
  add('penaltyMissed',   n(s.penalty.missed)      * cfg.sanctions.penaltyMissed);
  add('passAccuracy',    calcPassAccuracy(s.passes.accuracy ? parseInt(s.passes.accuracy) : 0, n(s.passes.total)));
  add('resultBonus',     cfg.collective.result[result]);
  add('teamGoalsScored', calcTeamGoalPts(teamGoals, cfg.collective.goalsScored));
  add('teamGoalsConceded', calcTeamGoalPts(teamConceded, cfg.collective.goalsConceded));

  return { score: Math.round(score * 100) / 100, breakdown };
}

// ---------------------------------------------------------------------------
// Script principal
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n🚀  Backfill scores Ligue 1 2025-26\n');

  // 1. Tous les matchs terminés de la saison
  console.log('📋  Récupération des matchs terminés...');
  const fixtures = await apiFetch<ApiFixture[]>('fixtures', {
    league: LEAGUE_ID, season: SEASON, status: 'FT',
  });

  if (!fixtures.length) {
    console.log('❌  Aucun match terminé trouvé.');
    return;
  }

  // Groupe par journée
  const byMatchday = new Map<number, ApiFixture[]>();
  for (const f of fixtures) {
    const match = f.league.round.match(/Regular Season - (\d+)/);
    if (!match) continue;
    const md = parseInt(match[1]);
    if (!byMatchday.has(md)) byMatchday.set(md, []);
    byMatchday.get(md)!.push(f);
  }

  const matchdays = [...byMatchday.keys()].sort((a, b) => a - b);
  console.log(`    ${fixtures.length} matchs sur ${matchdays.length} journées (J${matchdays[0]} → J${matchdays[matchdays.length - 1]})\n`);

  const stats = { processed: 0, skipped: 0, errors: 0, matchedByName: 0, matchedByIdOnly: 0, unmatched: 0 };

  // Charge tous les joueurs en mémoire pour éviter une requête DB par joueur
  console.log('🗄️   Chargement des joueurs en mémoire...');
  const { data: allPlayers } = await supabase
    .from('players')
    .select('id, name, api_football_id, api_football_team_id, season_minutes')
    .eq('card_type', 'player')
    .eq('season', SEASON_LABEL);

  // Map 1 : (api_football_id|api_football_team_id) → player.id  [prioritaire]
  const byApiIdAndTeam = new Map<string, string>();
  // Map 2 : (name|api_football_team_id) → player.id             [fallback nom]
  const byNameAndTeam  = new Map<string, string>();
  // Map 3 : api_football_id → player.id le plus de minutes      [dernier recours]
  const byApiIdBest    = new Map<number, { id: string; minutes: number }>();

  for (const p of allPlayers ?? []) {
    if (p.api_football_id != null && p.api_football_team_id != null) {
      byApiIdAndTeam.set(`${p.api_football_id}|${p.api_football_team_id}`, p.id);
    }
    if (p.api_football_team_id != null) {
      byNameAndTeam.set(`${p.name}|${p.api_football_team_id}`, p.id);
    }
    if (p.api_football_id != null) {
      const existing = byApiIdBest.get(p.api_football_id);
      if (!existing || p.season_minutes > existing.minutes) {
        byApiIdBest.set(p.api_football_id, { id: p.id, minutes: p.season_minutes });
      }
    }
  }
  console.log(`    ${allPlayers?.length ?? 0} joueurs chargés\n`);

  for (const matchday of matchdays) {
    const mdFixtures = byMatchday.get(matchday)!;
    console.log(`⚽  Journée ${matchday} (${mdFixtures.length} matchs)...`);

    for (const fixture of mdFixtures) {
      const fid       = fixture.fixture.id;
      const homeId    = fixture.teams.home.id;
      const homeGoals = fixture.goals.home ?? 0;
      const awayGoals = fixture.goals.away ?? 0;
      const homeWon   = fixture.teams.home.winner;
      const awayWon   = fixture.teams.away.winner;

      // 2. Stats joueurs du match
      let rawTeams: ApiPlayerStats[];
      try {
        rawTeams = await apiFetch<ApiPlayerStats[]>('fixtures/players', { fixture: fid });
        await sleep(2100); // rate limit
      } catch (e) {
        console.log(`    ⚠️  Match ${fid} ignoré : ${(e as Error).message}`);
        stats.errors++;
        continue;
      }

      for (const teamData of rawTeams) {
        const isHome          = teamData.team.id === homeId;
        const teamGoals       = isHome ? homeGoals : awayGoals;
        const teamConceded    = isHome ? awayGoals : homeGoals;
        const teamResult: 'win'|'draw'|'loss' =
          (isHome ? homeWon : awayWon) === true  ? 'win'  :
          (isHome ? homeWon : awayWon) === false ? 'loss' : 'draw';

        for (const playerData of teamData.players) {
          const s = playerData.statistics[0];
          if (!s || n(s.games.minutes) === 0) { stats.skipped++; continue; }

          // 3. Matching joueur — 3 niveaux, tous en mémoire (pas de requête DB)
          let playerId =
            // Niveau 1 : api_football_id + team_id exact
            byApiIdAndTeam.get(`${playerData.player.id}|${teamData.team.id}`);

          if (!playerId) {
            // Niveau 2 : nom + team_id (robuste si api_football_id différent entre endpoints)
            playerId = byNameAndTeam.get(`${playerData.player.name}|${teamData.team.id}`);
            if (playerId) stats.matchedByName++;
          }

          if (!playerId) {
            // Niveau 3 : api_football_id seul, prend le joueur avec le plus de minutes
            // (joueur en prêt retourné sous team_id du club d'origine par API Football)
            playerId = byApiIdBest.get(playerData.player.id)?.id;
            if (playerId) stats.matchedByIdOnly++;
          }

          if (!playerId) { stats.unmatched++; continue; }
          const player = { id: playerId };

          // 4. Sauvegarde stats brutes
          await supabase.from('matchday_player_stats').upsert({
            player_id: player.id, api_fixture_id: fid, matchday, season: SEASON_LABEL,
            raw_stats: s,
            minutes_played: n(s.games.minutes), is_substitute: s.games.substitute,
            goals: n(s.goals.total), assists: n(s.goals.assists), shots_on: n(s.shots.on),
            key_passes: n(s.passes.key), passes_total: n(s.passes.total),
            passes_accurate: s.passes.accuracy ? parseInt(s.passes.accuracy) : 0,
            tackles: n(s.tackles.total), interceptions: n(s.tackles.interceptions),
            blocks: n(s.tackles.blocks), duels_total: n(s.duels.total), duels_won: n(s.duels.won),
            dribbles_success: n(s.dribbles.success), dribbles_past: n(s.dribbles.past),
            fouls_drawn: n(s.fouls.drawn), fouls_committed: n(s.fouls.committed),
            yellow_cards: n(s.cards.yellow), red_cards: n(s.cards.red),
            saves: n(s.goals.saves), goals_conceded: n(s.goals.conceded),
            penalty_won: n(s.penalty.won), penalty_committed: n(s.penalty.commited),
            penalty_scored: n(s.penalty.scored), penalty_missed: n(s.penalty.missed),
            penalty_saved: n(s.penalty.saved),
          }, { onConflict: 'player_id,api_fixture_id' });

          // 5. Calcule et sauvegarde le score
          const { score, breakdown } = calcScore(s, teamGoals, teamConceded, teamResult);

          await supabase.from('matchday_player_scores').upsert({
            player_id: player.id, matchday, season: SEASON_LABEL,
            performance_score: score, breakdown,
            team_goals_scored: teamGoals, team_goals_conceded: teamConceded,
            team_result: teamResult, calculated_at: new Date().toISOString(),
          }, { onConflict: 'player_id,matchday,season' });

          stats.processed++;
        }
      }
    }

    console.log(`    ✓ J${matchday} terminée`);
  }

  // 6. Met à jour base_score = moyenne des performances
  // Agrégation par api_football_id (pas player_id) pour que les joueurs en prêt
  // aient le même base_score sur leurs deux cartes (club prêteur + club emprunteur)
  console.log('\n📊  Mise à jour des base_score...');

  // Map player_id → api_football_id
  const { data: playersList } = await supabase
    .from('players')
    .select('id, api_football_id')
    .eq('card_type', 'player')
    .eq('season', SEASON_LABEL);

  const playerIdToApiId = new Map<string, number | null>();
  for (const p of playersList ?? []) {
    playerIdToApiId.set(p.id, p.api_football_id);
  }

  // Tous les scores de la saison
  const { data: allScores } = await supabase
    .from('matchday_player_scores')
    .select('player_id, performance_score')
    .eq('season', SEASON_LABEL);

  // Groupe par api_football_id
  const byApiId = new Map<number, number[]>();
  for (const s of allScores ?? []) {
    const apiId = playerIdToApiId.get(s.player_id);
    if (!apiId) continue;
    if (!byApiId.has(apiId)) byApiId.set(apiId, []);
    byApiId.get(apiId)!.push(s.performance_score);
  }

  // Met à jour TOUTES les entrées players avec le même api_football_id
  let updated = 0;
  for (const [apiId, scores] of byApiId) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    await supabase
      .from('players')
      .update({ base_score: Math.round(avg * 100) / 100 })
      .eq('api_football_id', apiId)
      .eq('season', SEASON_LABEL);
    updated++;
  }

  console.log(`    ${updated} joueurs mis à jour\n`);
  console.log(`✅  Backfill terminé`);
  console.log(`   Scores calculés    : ${stats.processed}`);
  console.log(`   Ignorés (0 min)    : ${stats.skipped}`);
  console.log(`   Matched par nom    : ${stats.matchedByName}`);
  console.log(`   Matched par ID seul: ${stats.matchedByIdOnly}`);
  console.log(`   Non matchés        : ${stats.unmatched}`);
  console.log(`   Erreurs API        : ${stats.errors}\n`);
}

main().catch(err => {
  console.error('❌  Erreur :', err.message);
  process.exit(1);
});
