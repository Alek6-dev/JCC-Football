import { normalizePackStatus } from '@/components/packs/pack-time';
import type { DrawnCard, PackStatus } from '@/components/packs/types';
import { drawPlayers, filterEligiblePlayers, rarityToInitialDuplicates, rollPackRarity } from '@/lib/game';
import {
  supabaseCollectionRepository,
  type CollectionRepository,
} from '@/lib/repositories/collection-repository';
import { supabasePackRepository, type PackRepository } from '@/lib/repositories/pack-repository';
import type { Player } from '@/lib/types';

export function createPackService(
  packRepository: PackRepository = supabasePackRepository,
  collectionRepository: CollectionRepository = supabaseCollectionRepository
) {
  return {
    async getPackStatus(): Promise<PackStatus> {
      const status = await packRepository.getFreePackStatus();
      if (status) return normalizePackStatus(status);

      const remaining = await packRepository.getFreePacksRemaining();
      return {
        remaining: remaining ?? 0,
        max: 2,
        nextPackAt: null,
        secondsUntilNext: 0,
        rechargeProgress: remaining && remaining > 0 ? 1 : 0,
      };
    },

    async loadPackCatalog(): Promise<Player[]> {
      const filter = await collectionRepository.getLiveCollectionFilter();
      const players = await collectionRepository.listCollectionPlayers(filter);
      return filterEligiblePlayers(players);
    },

    async useFreePack(): Promise<number | null> {
      return packRepository.useFreePack();
    },

    async drawPackForReveal(catalog: Player[], cardCount = 5): Promise<DrawnCard[]> {
      const drawn = drawPlayers(catalog, cardCount).map(player => ({
        ...player,
        duplicateCount: rarityToInitialDuplicates(rollPackRarity()),
        prevDuplicateCount: 0,
      }));

      const duplicateCounts = await collectionRepository.getDuplicateCounts(drawn.map(player => player.id));
      return drawn.map(player => ({
        ...player,
        prevDuplicateCount: duplicateCounts[player.id] ?? 0,
      }));
    },

    async saveDrawnPackToCollection(cards: DrawnCard[]): Promise<void> {
      const totals = cards.reduce<Record<string, number>>((acc, card) => {
        acc[card.id] = (acc[card.id] ?? 0) + card.duplicateCount;
        return acc;
      }, {});

      await Promise.all(
        Object.entries(totals).map(([playerId, duplicateCount]) =>
          collectionRepository.addToCollection(playerId, duplicateCount)
        )
      );
    },
  };
}

export const packService = createPackService();
