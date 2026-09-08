import {
  supabaseCollectionRepository,
  type LiveCollection,
} from '@/lib/repositories/collection-repository';

export type { LiveCollection };

export async function getLiveCollection(): Promise<LiveCollection | null> {
  return supabaseCollectionRepository.getLiveCollection();
}

export async function getLiveCollectionFilter(): Promise<{ collectionId: string | null; season: string }> {
  return supabaseCollectionRepository.getLiveCollectionFilter();
}
