import type { Player } from '@/lib/types';

export type DrawnCard = Player & {
  duplicateCount: number;
  prevDuplicateCount: number;
};

export type PackStatus = {
  remaining: number;
  max: number;
  nextPackAt: string | null;
  secondsUntilNext: number;
  rechargeProgress: number;
};
