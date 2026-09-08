/**
 * scripts/generate-player-seed.ts
 *
 * Génère un nouveau seed SQL pour la saison 2025-26 depuis API Football.
 *
 * Ce que fait ce script :
 *   1. Récupère les 18 clubs Ligue 1 2025-26 (league=61, season=2025)
 *   2. Pour chaque club, récupère les joueurs + leurs stats de saison
 *   3. Filtre : garde uniquement les joueurs ayant joué >= 90 min cumulées
 *   4. Génère supabase/seed_ligue1_2025-26.sql avec :
 *      - image_uri = URL photo API Football
 *      - api_football_id renseigné
 *      - base_score = 50 (sera mis à jour par le backfill historique)
 *      - drop_weight calculé selon le nombre de minutes jouées
 *
 * Usage :
 *   npx tsx scripts/generate-player-seed.ts
 *
 * Prérequis :
 *   - API_FOOTBALL_KEY dans .env
 *   - npx tsx (inclus via ts-node ou tsx package)
 */

import * as fs from 'fs';
import * as path from 'path';

// Charge .env manuellement (pas de dotenv requis)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length && !key.startsWith('#')) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
}

const API_KEY    = process.env.API_FOOTBALL_KEY!;
const API_BASE   = 'https://v3.football.api-sports.io';
const LEAGUE_ID  = 61;
const SEASON     = 2025;
// Pas de filtre ici — tous les joueurs de l'effectif sont importés.
// Le filtre d'éligibilité (age > 20 OU minutes >= 1) est appliqué
// côté app au moment de l'affichage collection et du tirage en pack.

if (!API_KEY) {
  console.error('❌  API_FOOTBALL_KEY manquante dans .env');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function apiFetch<T>(endpoint: string, params: Record<string, string | number>): Promise<T> {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': API_KEY },
  });

  if (!res.ok) throw new Error(`API ${endpoint} → HTTP ${res.status}`);

  const json = await res.json() as { response: T; errors: unknown };
  if (json.errors && Object.keys(json.errors as object).length > 0) {
    throw new Error(`API erreur : ${JSON.stringify(json.errors)}`);
  }
  return json.response;
}

// Pause pour respecter le rate limit API (30 req/min)
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

/**
 * Calcule le drop_weight depuis les minutes jouées.
 * Plus un joueur joue, plus il est "droppable" (valeur 1-100).
 * Paliers : <200 min = 20, 200-500 = 40, 500-1000 = 60, 1000-2000 = 80, 2000+ = 95
 */
function calcDropWeight(minutes: number): number {
  if (minutes >= 2000) return 95;
  if (minutes >= 1000) return 80;
  if (minutes >= 500)  return 60;
  if (minutes >= 200)  return 40;
  return 20;
}

// ---------------------------------------------------------------------------
// Types API Football
// ---------------------------------------------------------------------------

interface ApiTeam {
  team: { id: number; name: string; logo: string };
}

interface ApiPlayer {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: { date: string | null; place: string | null; country: string | null };
    photo: string;
  };
  statistics: [{
    team:   { id: number; name: string };
    league: { id: number };
    games:  { appearences: number | null; minutes: number | null; position: string };
  }];
}

// ---------------------------------------------------------------------------
// Mapping position API Football → notre système
// ---------------------------------------------------------------------------

function mapPosition(pos: string): string | null {
  const map: Record<string, string> = {
    Goalkeeper: 'GK',
    Defender:   'DEF',
    Midfielder: 'MIL',
    Attacker:   'ATT',
  };
  return map[pos] ?? null;
}

// ---------------------------------------------------------------------------
// Script principal
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n🚀  Génération seed Ligue 1 saison 2025-26\n`);

  // 1. Récupère les équipes
  console.log('📋  Récupération des équipes Ligue 1...');
  const teamsRaw = await apiFetch<ApiTeam[]>('teams', { league: LEAGUE_ID, season: SEASON });

  if (!teamsRaw.length) {
    console.error('❌  Aucune équipe trouvée. Vérifie ta clé API et la saison.');
    process.exit(1);
  }

  console.log(`    ${teamsRaw.length} équipes trouvées\n`);

  const sqlLines: string[] = [];
  const stats = { total: 0, filtered: 0, clubs: 0 };

  sqlLines.push(`-- ============================================================`);
  sqlLines.push(`-- Seed Ligue 1 2025-26 — généré automatiquement depuis API Football`);
  sqlLines.push(`-- Date : ${new Date().toISOString()}`);
  sqlLines.push(`-- Filtre affichage/pack : age > 20 OU minutes >= 1 (appliqué côté app)`);
  sqlLines.push(`-- ============================================================\n`);

  sqlLines.push(`-- Nettoyage`);
  sqlLines.push(`TRUNCATE TABLE user_players CASCADE;`);
  sqlLines.push(`TRUNCATE TABLE players CASCADE;\n`);

  // Tri alphabétique des clubs pour un seed propre
  const teams = teamsRaw.sort((a, b) => a.team.name.localeCompare(b.team.name));

  for (const teamData of teams) {
    const { id: teamId, name: clubName } = teamData.team;
    console.log(`⚽  ${clubName} (ID ${teamId})...`);
    stats.clubs++;

    // 2. Récupère les joueurs du club (peut nécessiter plusieurs pages)
    let page = 1;
    const clubPlayers: ApiPlayer[] = [];

    while (true) {
      const playersPage = await apiFetch<ApiPlayer[]>('players', {
        team:   teamId,
        season: SEASON,
        page,
      });
      if (!playersPage.length) break;
      clubPlayers.push(...playersPage);
      if (playersPage.length < 20) break; // dernière page
      page++;
      await sleep(2100); // rate limit : max 30 req/min
    }

    // 3. Garde tous les joueurs ayant des stats Ligue 1 (ou dans l'effectif)
    const eligible = clubPlayers.filter(p => p.statistics.length > 0);

    stats.total    += clubPlayers.length;
    stats.filtered += eligible.length;

    console.log(`    ${clubPlayers.length} joueurs importés`);

    sqlLines.push(`-- ============================================================`);
    sqlLines.push(`-- ${clubName.toUpperCase()}`);
    sqlLines.push(`-- ============================================================`);

    // Badge club
    sqlLines.push(`INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season, api_football_id, api_football_team_id, image_uri) VALUES`);
    sqlLines.push(`('${escapeSql(clubName)}', '${escapeSql(clubName)}', NULL, 'badge', 50.00, 0, '2025-26', NULL, ${teamId}, '${teamData.team.logo}');\n`);

    if (!eligible.length) {
      console.log(`    ⚠️  Aucun joueur éligible pour ${clubName}`);
      continue;
    }

    // Tous les joueurs du club
    const playerRows = eligible.map(p => {
      const stat      = p.statistics.find(s => s.league.id === LEAGUE_ID) ?? p.statistics[0];
      const minutes   = stat?.games.minutes ?? 0;
      const position  = mapPosition(stat?.games.position ?? '');
      const weight    = calcDropWeight(minutes);
      const photo     = `https://media.api-sports.io/football/players/${p.player.id}.png`;
      const birthYear = p.player.birth?.date
        ? parseInt(p.player.birth.date.split('-')[0], 10)
        : null;

      return `  ('${escapeSql(p.player.name)}', '${escapeSql(clubName)}', ${position ? `'${position}'` : 'NULL'}, 'player', 50.00, ${weight}, '2025-26', ${p.player.id}, ${teamId}, '${photo}', ${birthYear ?? 'NULL'}, ${minutes})`;
    });

    sqlLines.push(`INSERT INTO players (name, club, position, card_type, base_score, drop_weight, season, api_football_id, api_football_team_id, image_uri, birth_year, season_minutes) VALUES`);
    sqlLines.push(playerRows.join(',\n') + ';\n');

    await sleep(2100); // rate limit entre les clubs
  }

  // Footer stats
  sqlLines.push(`-- Stats génération :`);
  sqlLines.push(`-- Clubs traités : ${stats.clubs}`);
  sqlLines.push(`-- Joueurs importés : ${stats.filtered}`);

  // Écriture du fichier
  const outputPath = path.join(__dirname, '..', 'supabase', 'seed_ligue1_2025-26.sql');
  fs.writeFileSync(outputPath, sqlLines.join('\n'), 'utf-8');

  console.log(`\n✅  Seed généré : supabase/seed_ligue1_2025-26.sql`);
  console.log(`   Clubs : ${stats.clubs}`);
  console.log(`   Joueurs importés : ${stats.filtered}`);
  console.log(`\n⚠️  Vérifie le fichier avant de l'exécuter sur Supabase !`);
  console.log(`   Ensuite lance le backfill pour calculer les vrais base_score.\n`);
}

main().catch(err => {
  console.error('❌  Erreur :', err.message);
  process.exit(1);
});
