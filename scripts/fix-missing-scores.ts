/**
 * scripts/fix-missing-scores.ts
 *
 * Calcule un base_score approximatif depuis les stats agrégées API Football
 * pour les joueurs avec base_score=50 et 0 score en DB malgré des minutes jouées.
 *
 * Usage :
 *   npx tsx scripts/fix-missing-scores.ts              # dry-run
 *   npx tsx scripts/fix-missing-scores.ts --apply      # applique les base_score calculés
 *   npx tsx scripts/fix-missing-scores.ts --zero       # inclut aussi la mise à 0 des joueurs sans données API
 *   npx tsx scripts/fix-missing-scores.ts --apply --zero
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { SCORING_CONFIG } from '../lib/scoring';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const LEAGUE_ID  = 61;
const SEASON     = 2025;
const SEASON_LABEL = '2025-26';
const API_DELAY_MS = 300; // évite le rate-limit API Football

const apply = process.argv.includes('--apply');
const includeZero = process.argv.includes('--zero');

console.log(`Mode : ${apply ? '⚡ APPLY' : '👁  DRY-RUN'}${includeZero ? ' + --zero' : ''}`);
if (!apply) console.log('(Ajouter --apply pour modifier la DB)\n');

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

function getSupabase() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Variables EXPO_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquantes');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function apiFetch(playerId: number): Promise<ApiPlayerSeason | null> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) throw new Error('Variable API_FOOTBALL_KEY manquante');

  const url = new URL('https://v3.football.api-sports.io/players');
  url.searchParams.set('id', String(playerId));
  url.searchParams.set('season', String(SEASON));
  url.searchParams.set('league', String(LEAGUE_ID));

  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': apiKey },
  });
  const json = await res.json() as { response: ApiPlayerSeason[] };
  return json.response?.[0] ?? null;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Types API Football (/players saison agrégée)
// ---------------------------------------------------------------------------

interface ApiPlayerSeason {
  player: { id: number; name: string };
  statistics: {
    games: { appearences: number | null; minutes: number | null };
    goals: { total: number | null; assists: number | null; saves: number | null };
    shots: { on: number | null };
    passes: { total: number | null; key: number | null; accuracy: string | null };
    tackles: { total: number | null; interceptions: number | null; blocks: number | null };
    duels: { total: number | null; won: number | null };
    dribbles: { success: number | null; past: number | null };
    fouls: { drawn: number | null; committed: number | null };
    cards: { yellow: number; red: number };
    penalty: { won: number | null; scored: number; missed: number; saved: number | null; commited: number | null };
  }[];
}

// ---------------------------------------------------------------------------
// Calcul du score depuis stats agrégées de saison
// Retourne un score "par match" estimé (pas de bonus collectif per-match)
// ---------------------------------------------------------------------------

function calcBaseScoreFromSeasonStats(data: ApiPlayerSeason): number {
  const s = data.statistics[0];
  if (!s) return 0;

  const apps = s.games.appearences ?? 1;
  if (apps === 0) return 0;

  const cfg = SCORING_CONFIG;

  function perMatch(val: number | null | undefined): number {
    return (val ?? 0) / apps;
  }

  let score = 0;

  // --- Participation (suppose titulaire pour simplifier) ---
  const avgMinutes = (s.games.minutes ?? 0) / apps;
  score += cfg.participation.starter;
  if (avgMinutes >= cfg.participation.fullGameMinutes) {
    score += cfg.participation.fullGameBonus;
  }

  // --- Attaque ---
  score += perMatch(s.goals.total)         * cfg.attack.goal;
  score += perMatch(s.goals.assists)       * cfg.attack.assist;
  score += perMatch(s.shots.on)            * cfg.attack.shotOnTarget;
  score += perMatch(s.passes.key)          * cfg.attack.keyPass;
  score += perMatch(s.dribbles.success)    * cfg.attack.dribbleSuccess;
  score += perMatch(s.fouls.drawn)         * cfg.attack.foulDrawn;
  score += perMatch(s.penalty.won)         * cfg.attack.penaltyWon;

  // --- Défense / duels ---
  score += perMatch(s.tackles.total)       * cfg.defense.tackle;
  score += perMatch(s.tackles.interceptions) * cfg.defense.interception;
  score += perMatch(s.tackles.blocks)      * cfg.defense.shotBlocked;

  const duelsWon  = perMatch(s.duels.won);
  const duelsLost = Math.max(0, perMatch(s.duels.total) - duelsWon);
  score += duelsWon  * cfg.defense.duelWon;
  score += duelsLost * cfg.defense.duelLost;
  score += perMatch(s.dribbles.past) * cfg.defense.dribblePast;

  // --- Gardien ---
  score += perMatch(s.goals.saves)         * cfg.goalkeeper.save;
  score += perMatch(s.penalty.saved)       * cfg.goalkeeper.penaltySaved;

  // --- Sanctions ---
  score += perMatch(s.fouls.committed)     * cfg.sanctions.foulCommitted;
  score += perMatch(s.cards.yellow)        * cfg.sanctions.yellowCard;
  score += perMatch(s.cards.red)           * cfg.sanctions.redCard;
  score += perMatch(s.penalty.commited)    * cfg.sanctions.penaltyCommitted;
  score += perMatch(s.penalty.missed)      * cfg.sanctions.penaltyMissed;

  // --- Précision des passes ---
  // Dans l'endpoint /players agrégé, accuracy est déjà un % (ex: "82")
  const accuracyRaw = parseFloat(s.passes.accuracy ?? '0');
  if (!isNaN(accuracyRaw) && accuracyRaw > 0) {
    const palierIndex = accuracyRaw < 50
      ? 0
      : Math.min(Math.floor((accuracyRaw - 50) / 5) + 1, cfg.passAccuracy.length - 1);
    score += cfg.passAccuracy[palierIndex];
  }

  // --- Bonus collectif estimé (neutre : ~2.5 pts de moyenne Ligue 1) ---
  // win ~40% (×5=2) + draw ~25% (×2=0.5) + loss ~35% (×0=0) ≈ 2.5 pts résultat
  // buts marqués/encaissés ~ neutre sur moyenne
  score += 2.5;

  return Math.round(score * 100) / 100;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const supabase = getSupabase();

  // 1. Charger tous les joueurs base_score=50 avec minutes jouées
  const { data: players, error } = await supabase
    .from('players')
    .select('id, name, club, position, api_football_id, api_football_team_id, season_minutes')
    .eq('card_type', 'player')
    .eq('season', SEASON_LABEL)
    .eq('base_score', 50)
    .gte('season_minutes', 1)
    .order('club')
    .order('name');

  if (error) throw new Error(error.message);
  if (!players?.length) { console.log('Aucun joueur à corriger.'); return; }

  console.log(`${players.length} joueurs avec base_score=50 et season_minutes>=1\n`);

  // 2. Vérifier lesquels ont 0 score en DB
  const { data: scoreCounts } = await supabase
    .rpc('admin_score_stats', { p_season: SEASON_LABEL });

  const scoreCountMap = new Map<string, number>();
  for (const row of scoreCounts ?? []) {
    scoreCountMap.set(row.player_id, Number(row.score_count));
  }

  const targets = players.filter(p => (scoreCountMap.get(p.id) ?? 0) === 0);
  console.log(`→ ${targets.length} ont aussi 0 score en DB (cibles du script)\n`);
  console.log('─'.repeat(80));

  const results = {
    fixed:   [] as { name: string; club: string; oldScore: number; newScore: number }[],
    zeroed:  [] as { name: string; club: string; reason: string }[],
    skipped: [] as { name: string; club: string; reason: string }[],
  };

  for (const player of targets) {
    if (!player.api_football_id) {
      results.skipped.push({ name: player.name, club: player.club, reason: 'pas d\'api_football_id' });
      continue;
    }

    await sleep(API_DELAY_MS);

    let data: ApiPlayerSeason | null = null;
    try {
      data = await apiFetch(player.api_football_id);
    } catch (err) {
      results.skipped.push({ name: player.name, club: player.club, reason: `erreur API: ${err}` });
      continue;
    }

    const apps = data?.statistics?.[0]?.games?.appearences ?? 0;

    if (!data || apps === 0) {
      // Groupe A : pas de données API Football
      const reason = `aucune donnée API Football (${player.season_minutes} min en DB)`;
      console.log(`⚠  ${player.name.padEnd(28)} ${player.club.padEnd(22)} → ${reason}`);

      if (includeZero) {
        if (apply) {
          await supabase
            .from('players')
            .update({ base_score: 0, season_minutes: 0 })
            .eq('id', player.id);
        }
        results.zeroed.push({ name: player.name, club: player.club, reason });
      } else {
        results.skipped.push({ name: player.name, club: player.club, reason: reason + ' (utiliser --zero pour corriger)' });
      }
      continue;
    }

    // Groupe B : données trouvées → calcul
    const newScore = calcBaseScoreFromSeasonStats(data);
    const minutes  = data.statistics[0].games.minutes ?? 0;

    console.log(`✓  ${player.name.padEnd(28)} ${player.club.padEnd(22)} ${apps} matchs / ${minutes} min → base_score: 50 → ${newScore}`);

    if (apply) {
      await supabase
        .from('players')
        .update({ base_score: newScore })
        .eq('api_football_id', player.api_football_id)
        .eq('season', SEASON_LABEL);
    }
    results.fixed.push({ name: player.name, club: player.club, oldScore: 50, newScore });
  }

  // 3. Résumé
  console.log('\n' + '─'.repeat(80));
  console.log(`\nRésumé :`);
  console.log(`  ✓ Corrigés (base_score calculé) : ${results.fixed.length}`);
  console.log(`  ⚠ Mis à 0 (pas de données API)  : ${results.zeroed.length}`);
  console.log(`  — Ignorés                        : ${results.skipped.length}`);

  if (results.skipped.length) {
    console.log('\nIgnorés :');
    for (const s of results.skipped) {
      console.log(`  - ${s.name} (${s.club}) : ${s.reason}`);
    }
  }

  if (!apply) {
    console.log('\n→ Aucune modification en DB (dry-run). Ajouter --apply pour appliquer.');
  } else {
    console.log('\n→ DB mise à jour.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
