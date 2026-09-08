import {
  supabaseCollectionRepository,
  type CollectionRepository,
  type OwnedCollectionSnapshot,
} from '@/lib/repositories/collection-repository';
import { filterCollectionPlayers } from '@/lib/game';
import type { Player } from '@/lib/types';

export type ClubSection = {
  club: string;
  players: Player[];
};

export type CollectionAlbumData = {
  sections: ClubSection[];
  total: number;
  owned: number;
  ownedIds: Set<string>;
  duplicateCountsByPlayerId: Record<string, number>;
};

function buildSections(players: Player[]): ClubSection[] {
  const byClub = players.reduce<Record<string, Player[]>>((acc, player) => {
    if (!acc[player.club]) acc[player.club] = [];
    acc[player.club].push(player);
    return acc;
  }, {});

  return Object.entries(byClub)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([club, clubPlayers]) => ({ club, players: clubPlayers }));
}

function buildAlbumData(players: Player[], snapshot: OwnedCollectionSnapshot): CollectionAlbumData {
  const visiblePlayers = filterCollectionPlayers(players, snapshot.ownedIds);
  const sections = buildSections(visiblePlayers);
  const total = sections.reduce((sum, section) => sum + section.players.length, 0);
  const owned = sections.reduce(
    (sum, section) => sum + section.players.filter(player => snapshot.ownedIds.has(player.id)).length,
    0
  );

  return {
    sections,
    total,
    owned,
    ownedIds: snapshot.ownedIds,
    duplicateCountsByPlayerId: snapshot.duplicateCountsByPlayerId,
  };
}

export function createCollectionService(repository: CollectionRepository = supabaseCollectionRepository) {
  return {
    async getCollectionPlayers(): Promise<Player[]> {
      const filter = await repository.getLiveCollectionFilter();
      return repository.listCollectionPlayers(filter);
    },

    async getOwnedCollectionSnapshot(): Promise<OwnedCollectionSnapshot> {
      return repository.getOwnedCollectionSnapshot();
    },

    buildAlbumData,

    async getCollectionAlbumData(): Promise<CollectionAlbumData> {
      const [players, snapshot] = await Promise.all([
        this.getCollectionPlayers(),
        this.getOwnedCollectionSnapshot(),
      ]);
      return buildAlbumData(players, snapshot);
    },
  };
}

export const collectionService = createCollectionService();
