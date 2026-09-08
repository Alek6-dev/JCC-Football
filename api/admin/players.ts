/**
 * GET/PATCH /api/admin/players - Vercel Serverless Function
 *
 * GET returns all players enriched with scoring stats.
 * PATCH updates one player's editorial collection_status.
 * Protected by X-Admin-Token (= SCORING_ADMIN_SECRET).
 */

export const config = { runtime: 'edge' };

import { createClient } from '@supabase/supabase-js';

type CollectionStatus = 'active' | 'hidden' | 'legacy';

const COLLECTION_STATUSES = new Set<CollectionStatus>(['active', 'hidden', 'legacy']);
const DEFAULT_SEASON = '2025-26';

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

async function fetchScoreMatchdays(supabase: ReturnType<typeof getServiceClient>, season: string) {
  const pageSize = 1000;
  const rows: { player_id: string; matchday: number }[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('matchday_player_scores')
      .select('player_id, matchday')
      .eq('season', season)
      .range(from, from + pageSize - 1);

    if (error) throw error;

    rows.push(...((data ?? []) as { player_id: string; matchday: number }[]));
    if (!data || data.length < pageSize) break;
  }

  return rows;
}

async function updateCollectionStatus(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null) as { playerId?: string; collectionStatus?: CollectionStatus } | null;
  const playerId = body?.playerId;
  const collectionStatus = body?.collectionStatus;

  if (!playerId || !collectionStatus || !COLLECTION_STATUSES.has(collectionStatus)) {
    return Response.json({ error: 'playerId ou collectionStatus invalide' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('players')
    .update({ collection_status: collectionStatus })
    .eq('id', playerId)
    .select('id, collection_status')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

async function getLiveSeason(supabase: ReturnType<typeof getServiceClient>) {
  const { data } = await supabase.rpc('get_live_season').maybeSingle();
  return typeof data === 'string' ? data : DEFAULT_SEASON;
}

async function getSeasonList(supabase: ReturnType<typeof getServiceClient>) {
  const { data, error } = await supabase
    .from('seasons')
    .select('id, season, name, status, starts_on, ends_on')
    .order('season', { ascending: false });

  if (error) {
    return [{ id: DEFAULT_SEASON, season: DEFAULT_SEASON, name: 'Ligue 1 2025-26', status: 'live', starts_on: null, ends_on: null }];
  }

  return data ?? [];
}

async function getCollectionList(supabase: ReturnType<typeof getServiceClient>, season: string) {
  const { data, error } = await supabase
    .from('collections')
    .select('id, season_id, code, name, type, is_primary, pack_enabled, archive_pack_enabled, seasons!inner(season)')
    .eq('seasons.season', season)
    .order('is_primary', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    return [];
  }

  return data ?? [];
}

async function getPlayers(request: Request): Promise<Response> {
  const supabase = getServiceClient();
  const url = new URL(request.url);
  const requestedSeason = url.searchParams.get('season');
  const requestedCollectionId = url.searchParams.get('collectionId');
  const liveSeason = await getLiveSeason(supabase);
  const season = requestedSeason || liveSeason;
  const collections = await getCollectionList(supabase, season);
  const selectedCollection = collections.find(c => c.id === requestedCollectionId)
    ?? collections.find(c => c.is_primary)
    ?? collections[0]
    ?? null;

  let playersQuery = supabase
    .from('players')
    .select(
      'id, name, club, position, card_type, base_score, drop_weight, ' +
      'season_minutes, birth_year, api_football_id, api_football_team_id, ' +
      'club_letter, club_card_number, image_uri, card_art_uri, collection_status, season, collection_id'
    )
    .eq('season', season);

  if (selectedCollection) {
    playersQuery = playersQuery.eq('collection_id', selectedCollection.id);
  }

  let { data: players, error: playersError } = await playersQuery
    .order('club', { ascending: true })
    .order('name', { ascending: true })
    .limit(2000);

  if (playersError && playersError.message.includes('collection_id')) {
    const retry = await supabase
      .from('players')
      .select(
        'id, name, club, position, card_type, base_score, drop_weight, ' +
        'season_minutes, birth_year, api_football_id, api_football_team_id, ' +
        'club_letter, club_card_number, image_uri, card_art_uri, collection_status, season'
      )
      .eq('season', season)
      .order('club', { ascending: true })
      .order('name', { ascending: true })
      .limit(2000);
    players = retry.data;
    playersError = retry.error;
  }

  if (playersError) {
    return Response.json({ error: playersError.message }, { status: 500 });
  }

  const { data: scoreStats, error: scoresError } = await supabase
    .rpc('admin_score_stats', { p_season: season });

  if (scoresError) {
    return Response.json({ error: scoresError.message }, { status: 500 });
  }

  const statsMap: Record<string, { score_count: number; avg_score: number | null; min_score: number | null; max_score: number | null }> = {};
  for (const row of scoreStats ?? []) {
    statsMap[row.player_id] = {
      score_count: Number(row.score_count),
      avg_score: row.avg_score !== null ? Number(row.avg_score) : null,
      min_score: row.min_score !== null ? Number(row.min_score) : null,
      max_score: row.max_score !== null ? Number(row.max_score) : null,
    };
  }

  let scoreMatchdays: { player_id: string; matchday: number }[];
  try {
    scoreMatchdays = await fetchScoreMatchdays(supabase, season);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur chargement journees';
    return Response.json({ error: message }, { status: 500 });
  }

  const latestMatchdaysMap: Record<string, number[]> = {};
  for (const row of scoreMatchdays) {
    if (!latestMatchdaysMap[row.player_id]) latestMatchdaysMap[row.player_id] = [];
    latestMatchdaysMap[row.player_id].push(Number(row.matchday));
  }

  type PlayerRecord = { id: string } & Record<string, unknown>;
  const playerRows = (players ?? []) as unknown as PlayerRecord[];

  const result = playerRows.map(p => {
    const s = statsMap[p.id];
    return {
      ...p,
      collection_id: p.collection_id ?? null,
      collection_status: p.collection_status === 'archived' ? 'legacy' : p.collection_status,
      score_count: s?.score_count ?? 0,
      avg_score: s?.avg_score ?? null,
      min_score: s?.min_score ?? null,
      max_score: s?.max_score ?? null,
      latest_matchdays: latestMatchdaysMap[p.id]
        ? [...new Set(latestMatchdaysMap[p.id])].sort((a, b) => b - a).slice(0, 3).sort((a, b) => a - b)
        : [],
    };
  });

  const seasons = await getSeasonList(supabase);

  return Response.json({
    players: result,
    seasons,
    collections,
    liveSeason,
    selectedSeason: season,
    selectedCollectionId: selectedCollection?.id ?? null,
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (!validateAdminToken(request)) {
    return Response.json({ error: 'Non autorise' }, { status: 401 });
  }

  if (request.method === 'GET') return getPlayers(request);
  if (request.method === 'PATCH') return updateCollectionStatus(request);

  return Response.json({ error: 'Methode non autorisee' }, { status: 405 });
}
