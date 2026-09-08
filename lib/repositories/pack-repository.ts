import { supabase } from '@/lib/supabase';

export type RawPackStatus = {
  remaining?: number;
  max?: number;
  next_pack_at?: string | null;
  nextPackAt?: string | null;
  seconds_until_next?: number;
  secondsUntilNext?: number;
  recharge_progress?: number;
  rechargeProgress?: number;
} | null;

export interface PackRepository {
  getFreePackStatus(): Promise<RawPackStatus>;
  getFreePacksRemaining(): Promise<number | null>;
  useFreePack(): Promise<number | null>;
}

export const supabasePackRepository: PackRepository = {
  async getFreePackStatus() {
    const { data, error } = await supabase.rpc('get_free_pack_status');
    if (error) return null;
    return data as RawPackStatus;
  },

  async getFreePacksRemaining() {
    const { data, error } = await supabase.rpc('get_free_packs_remaining');
    if (error) return null;
    return data;
  },

  async useFreePack() {
    const { data, error } = await supabase.rpc('use_free_pack');
    if (error) throw error;
    return data;
  },
};
