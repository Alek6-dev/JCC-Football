import { supabase } from '@/lib/supabase';
import type { CardCollection, Player, Season } from '@/lib/types';

type CollectionWithSeason = CardCollection & {
  seasons: Season | null;
};

export type LiveCollection = CardCollection & {
  season: Season;
};

export type CollectionFilter = {
  collectionId: string | null;
  season: string;
};

export type OwnedCollectionSnapshot = {
  ownedIds: Set<string>;
  duplicateCountsByPlayerId: Record<string, number>;
};

export interface CollectionRepository {
  getLiveCollection(): Promise<LiveCollection | null>;
  getLiveCollectionFilter(): Promise<CollectionFilter>;
  listCollectionPlayers(filter: CollectionFilter): Promise<Player[]>;
  getOwnedCollectionSnapshot(): Promise<OwnedCollectionSnapshot>;
  getDuplicateCounts(playerIds: string[]): Promise<Record<string, number>>;
  addToCollection(playerId: string, duplicateCountToAdd: number): Promise<void>;
}

function mapLiveCollection(row: CollectionWithSeason): LiveCollection | null {
  if (!row.seasons) return null;

  return {
    id: row.id,
    season_id: row.season_id,
    code: row.code,
    name: row.name,
    type: row.type,
    is_primary: row.is_primary,
    pack_enabled: row.pack_enabled,
    archive_pack_enabled: row.archive_pack_enabled,
    season: row.seasons,
  };
}

export const supabaseCollectionRepository: CollectionRepository = {
  async getLiveCollection() {
    const { data, error } = await supabase
      .from('collections')
      .select('*, seasons!inner(*)')
      .eq('is_primary', true)
      .eq('seasons.status', 'live')
      .maybeSingle();

    if (error || !data) return null;
    return mapLiveCollection(data as CollectionWithSeason);
  },

  async getLiveCollectionFilter() {
    const liveCollection = await this.getLiveCollection();
    return {
      collectionId: liveCollection?.id ?? null,
      season: liveCollection?.season.season ?? '2025-26',
    };
  },

  async listCollectionPlayers(filter) {
    let query = supabase
      .from('players')
      .select('*')
      .eq('card_type', 'player')
      .order('club', { ascending: true })
      .limit(1000);

    query = filter.collectionId
      ? query.eq('collection_id', filter.collectionId)
      : query.eq('season', filter.season);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Player[];
  },

  async getOwnedCollectionSnapshot() {
    const { data, error } = await supabase
      .from('user_players')
      .select('player_id, duplicate_count');

    if (error) throw error;

    const rows = data ?? [];
    return {
      ownedIds: new Set(rows.map(row => row.player_id)),
      duplicateCountsByPlayerId: rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.player_id] = row.duplicate_count;
        return acc;
      }, {}),
    };
  },

  async getDuplicateCounts(playerIds) {
    if (playerIds.length === 0) return {};

    const { data, error } = await supabase
      .from('user_players')
      .select('player_id, duplicate_count')
      .in('player_id', playerIds);

    if (error) throw error;

    return (data ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.player_id] = row.duplicate_count;
      return acc;
    }, {});
  },

  async addToCollection(playerId, duplicateCountToAdd) {
    const { error } = await supabase.rpc('add_to_collection', {
      p_player_id: playerId,
      p_add_count: duplicateCountToAdd,
    });

    if (error) throw error;
  },
};
