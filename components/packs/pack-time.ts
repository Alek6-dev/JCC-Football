import type { PackStatus } from '@/components/packs/types';

export const PACK_RECHARGE_SECONDS = 10 * 60 * 60;

export function normalizePackStatus(raw: any): PackStatus {
  return {
    remaining: Number(raw?.remaining ?? 0),
    max: Number(raw?.max ?? 2),
    nextPackAt: raw?.next_pack_at ?? raw?.nextPackAt ?? null,
    secondsUntilNext: Number(raw?.seconds_until_next ?? raw?.secondsUntilNext ?? 0),
    rechargeProgress: Math.max(0, Math.min(1, Number(raw?.recharge_progress ?? raw?.rechargeProgress ?? 1))),
  };
}

export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
}

export function getLiveRechargeStatus(status: PackStatus, nowMs: number): PackStatus {
  if (!status.nextPackAt || status.remaining >= status.max) return status;

  const nextMs = new Date(status.nextPackAt).getTime();
  const secondsUntilNext = Math.max(0, Math.ceil((nextMs - nowMs) / 1000));
  const rechargeProgress = Math.max(0, Math.min(1, 1 - secondsUntilNext / PACK_RECHARGE_SECONDS));

  return {
    ...status,
    secondsUntilNext,
    rechargeProgress,
  };
}
