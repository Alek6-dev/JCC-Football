/**
 * scripts/import-card-art.ts
 *
 * Uploads optimized local WebP card artworks to Supabase Storage and updates
 * players.card_art_uri. Default mode is dry-run.
 *
 * Usage:
 *   npm run import-card-art -- --club "Paris Saint Germain"
 *   npm run import-card-art -- --club "Paris Saint Germain" --apply
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

type CollectionStatus = 'active' | 'hidden' | 'legacy';
type CardType = 'player' | 'coach' | 'badge';

type PlayerRow = {
  id: string;
  name: string;
  club: string;
  card_type: CardType;
  collection_status: CollectionStatus;
  season: string;
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

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function slugify(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'unknown';
}

function getSupabase() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Variables EXPO_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquantes.');
  return createClient(url, key, { auth: { persistSession: false } });
}

function listWebpFiles(inputDir: string): string[] {
  if (!fs.existsSync(inputDir)) return [];
  return fs.readdirSync(inputDir)
    .filter(file => path.extname(file).toLowerCase() === '.webp')
    .map(file => path.join(inputDir, file));
}

function normalizedFileName(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath));
  return normalizeText(base.replace(/^\d+\s*[.)-]\s*/, ''));
}

function candidateNames(player: PlayerRow): Set<string> {
  const full = normalizeText(player.name);
  const tokens = full.split(' ').filter(Boolean);
  const candidates = new Set<string>([full]);

  if (tokens.length > 1) {
    const last = tokens[tokens.length - 1];
    const withoutInitial = tokens[0].length === 1 ? tokens.slice(1).join(' ') : full;
    candidates.add(withoutInitial);
    candidates.add(last);
    candidates.add(`${tokens[0][0]} ${last}`);
    if (last.length >= 4) candidates.add(last.slice(0, 5));
    if (last.length >= 6) candidates.add(last.slice(0, 6));
  }

  return candidates;
}

function findMatch(filePath: string, players: PlayerRow[]): PlayerRow | null {
  const fileName = normalizedFileName(filePath);
  const exact = players.filter(player => candidateNames(player).has(fileName));
  if (exact.length === 1) return exact[0];

  const contains = players.filter(player => {
    const candidates = candidateNames(player);
    return [...candidates].some(candidate => (
      candidate.length >= 4 && (fileName.includes(candidate) || candidate.includes(fileName))
    ));
  });

  return contains.length === 1 ? contains[0] : null;
}

async function ensureBucket(bucket: string) {
  const supabase = getSupabase();
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(error.message);
  if (buckets?.some(b => b.name === bucket)) return;

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: ['image/webp'],
  });
  if (createError) throw new Error(createError.message);
}

async function main() {
  loadEnv();

  const club = argValue('--club');
  if (!club) throw new Error('Usage: npm run import-card-art -- --club "Paris Saint Germain" [--apply]');

  const season = argValue('--season') ?? '2025-26';
  const bucket = argValue('--bucket') ?? 'card-art';
  const clubSlug = slugify(club);
  const inputDir = argValue('--input-dir') ?? path.join('generated', 'card-art-app', clubSlug);
  const apply = process.argv.includes('--apply');
  const includeHidden = process.argv.includes('--include-hidden');

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('players')
    .select('id, name, club, card_type, collection_status, season')
    .eq('club', club)
    .eq('season', season)
    .in('card_type', ['player', 'coach']);
  if (error) throw new Error(error.message);

  const players = ((data ?? []) as PlayerRow[])
    .filter(p => includeHidden || p.collection_status === 'active');
  const files = listWebpFiles(inputDir);

  console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Club: ${club} | Season: ${season} | Bucket: ${bucket}`);
  console.log(`Input: ${inputDir}`);
  console.log(`${files.length} WebP file(s), ${players.length} DB target(s)\n`);

  const matches = files.map(file => ({ file, player: findMatch(file, players) }));

  for (const match of matches) {
    console.log(`${path.basename(match.file)} -> ${match.player ? match.player.name : 'NON TROUVÉ'}`);
  }

  if (!apply) {
    console.log('\nAucune modification. Ajoute --apply pour uploader et mettre à jour card_art_uri.');
    return;
  }

  await ensureBucket(bucket);

  for (const match of matches) {
    if (!match.player) continue;

    const fileName = `${slugify(match.player.name)}.webp`;
    const storagePath = `${season}/${clubSlug}/${fileName}`;
    const bytes = fs.readFileSync(match.file);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, bytes, {
        contentType: 'image/webp',
        upsert: true,
      });
    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    const { error: updateError } = await supabase
      .from('players')
      .update({ card_art_uri: urlData.publicUrl })
      .eq('id', match.player.id);
    if (updateError) throw new Error(updateError.message);

    console.log(`OK ${match.player.name} -> ${storagePath}`);
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
