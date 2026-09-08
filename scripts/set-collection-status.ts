/**
 * scripts/set-collection-status.ts
 *
 * Applies an editorial active/hidden selection for one club.
 * The input file contains one player name per line. Matching is accent and
 * case insensitive, but names must otherwise match the DB display name.
 *
 * Usage:
 *   npm run collection-status -- --club "Paris Saint Germain" --file ./psg-active.txt
 *   npm run collection-status -- --club "Paris Saint Germain" --file ./psg-active.txt --apply
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

type PlayerRow = {
  id: string;
  name: string;
  club: string;
  collection_status: 'active' | 'hidden' | 'legacy';
};

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function argValue(name: string): string | undefined {
  const prefixed = `${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefixed));
  if (inline) return inline.slice(prefixed.length);
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function getSupabase() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Variables EXPO_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquantes.');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function main() {
  loadEnv();
  const club = argValue('--club');
  const file = argValue('--file');
  const season = argValue('--season') ?? '2025-26';
  const apply = process.argv.includes('--apply');

  if (!club || !file) {
    throw new Error('Usage: npm run collection-status -- --club "Paris Saint Germain" --file ./psg-active.txt [--apply]');
  }
  if (!fs.existsSync(file)) throw new Error(`Fichier introuvable: ${file}`);

  const wantedNames = fs.readFileSync(file, 'utf-8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
  const wanted = new Set(wantedNames.map(normalize));

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('players')
    .select('id, name, club, collection_status')
    .eq('club', club)
    .eq('season', season)
    .eq('card_type', 'player')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);

  const players = (data ?? []) as PlayerRow[];
  const dbNames = new Set(players.map(p => normalize(p.name)));
  const missing = wantedNames.filter(name => !dbNames.has(normalize(name)));
  const active = players.filter(p => wanted.has(normalize(p.name)));
  const hidden = players.filter(p => !wanted.has(normalize(p.name)));

  console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`${club} (${season})`);
  console.log(`Actifs: ${active.length} | Masqués: ${hidden.length}`);

  if (missing.length) {
    console.log('\nNoms non trouvés dans la DB:');
    for (const name of missing) console.log(`- ${name}`);
  }

  console.log('\nPasser en active:');
  for (const p of active) console.log(`- ${p.name}`);

  console.log('\nPasser en hidden:');
  for (const p of hidden) console.log(`- ${p.name}`);

  if (!apply) {
    console.log('\nAucune modification DB. Ajoute --apply pour appliquer.');
    return;
  }

  const { error: hideError } = await supabase
    .from('players')
    .update({ collection_status: 'hidden' })
    .eq('club', club)
    .eq('season', season)
    .eq('card_type', 'player');
  if (hideError) throw new Error(hideError.message);

  if (active.length) {
    const { error: activeError } = await supabase
      .from('players')
      .update({ collection_status: 'active' })
      .in('id', active.map(p => p.id));
    if (activeError) throw new Error(activeError.message);
  }

  console.log('\nDB mise à jour.');
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
