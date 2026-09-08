/**
 * scripts/populate-team-ids.ts
 *
 * Remplit la colonne api_football_team_id sur la table players
 * en fetchant la liste des équipes Ligue 1 depuis API Football
 * et en les associant aux clubs existants en DB.
 *
 * À lancer UNE FOIS après la migration migration_team_id.sql.
 *
 * Usage :
 *   npx tsx scripts/populate-team-ids.ts
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

const API_KEY   = process.env.API_FOOTBALL_KEY!;
const API_BASE  = 'https://v3.football.api-sports.io';
const LEAGUE_ID = 61;
const SEASON    = 2025;

if (!API_KEY) { console.error('❌  API_FOOTBALL_KEY manquante'); process.exit(1); }
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) { console.error('❌  SUPABASE_SERVICE_ROLE_KEY manquante'); process.exit(1); }

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function apiFetch<T>(endpoint: string, params: Record<string, string | number>): Promise<T> {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), { headers: { 'x-apisports-key': API_KEY } });
  if (!res.ok) throw new Error(`API ${endpoint} → HTTP ${res.status}`);
  const json = await res.json() as { response: T };
  return json.response;
}

async function main() {
  console.log('\n🚀  Remplissage api_football_team_id\n');

  // 1. Récupère les équipes depuis API Football
  const teams = await apiFetch<{ team: { id: number; name: string } }[]>('teams', {
    league: LEAGUE_ID, season: SEASON,
  });

  console.log(`📋  ${teams.length} équipes trouvées depuis API Football :\n`);
  for (const t of teams.sort((a, b) => a.team.name.localeCompare(b.team.name))) {
    console.log(`    [${t.team.id}] ${t.team.name}`);
  }

  // 2. Récupère les clubs distincts en DB
  const { data: dbClubs, error } = await supabase
    .from('players')
    .select('club')
    .eq('season', '2025-26')
    .is('api_football_team_id', null);

  if (error) throw error;
  const distinctClubs = [...new Set((dbClubs ?? []).map(r => r.club))];

  console.log(`\n🗄️   ${distinctClubs.length} clubs en DB sans api_football_team_id\n`);

  let matched = 0;
  let unmatched: string[] = [];

  for (const clubName of distinctClubs) {
    // Matching : cherche le team dont le nom contient le club DB ou vice versa
    const team = teams.find(t =>
      t.team.name.toLowerCase().includes(clubName.toLowerCase()) ||
      clubName.toLowerCase().includes(t.team.name.toLowerCase())
    );

    if (!team) {
      unmatched.push(clubName);
      continue;
    }

    const { error: updateErr } = await supabase
      .from('players')
      .update({ api_football_team_id: team.team.id })
      .eq('club', clubName)
      .eq('season', '2025-26');

    if (updateErr) {
      console.error(`    ❌  Erreur update ${clubName} : ${updateErr.message}`);
    } else {
      console.log(`    ✓  "${clubName}" → team ID ${team.team.id} (${team.team.name})`);
      matched++;
    }
  }

  if (unmatched.length) {
    console.log(`\n⚠️  Clubs non matchés automatiquement (à corriger manuellement) :`);
    for (const club of unmatched) {
      console.log(`    - "${club}"`);
    }
    console.log(`\n   Commande SQL pour corriger manuellement :`);
    console.log(`   UPDATE players SET api_football_team_id = <ID> WHERE club = '<NOM>' AND season = '2025-26';`);
  }

  console.log(`\n✅  ${matched}/${distinctClubs.length} clubs mis à jour\n`);
}

main().catch(err => {
  console.error('❌  Erreur :', err.message);
  process.exit(1);
});
