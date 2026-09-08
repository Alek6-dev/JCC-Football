import { StyleSheet, Text, View } from 'react-native';

import PlayerCard from '@/components/PlayerCard';
import type { Rarity } from '@/components/PlayerCard';
import type { CollectionStatus } from '@/lib/types';

const RARITY_ACCENT: Record<Rarity, string> = {
  common: '#b0b0b0',
  typic: '#85D096',
  rare: '#5C96D8',
  epic: '#9B59D0',
  legend: '#E4BC66',
};

const THRESHOLDS = [1, 2, 5, 10, 20];

function getUpgradeProgress(duplicateCount: number): { progress: number; current: number; next: number } | null {
  if (duplicateCount >= 20) return null;
  const nextIdx = THRESHOLDS.findIndex(t => t > duplicateCount);
  const prev = THRESHOLDS[nextIdx - 1];
  const next = THRESHOLDS[nextIdx];
  return { progress: (duplicateCount - prev) / (next - prev), current: duplicateCount, next };
}

type Props = {
  cardCode: string;
  club?: string;
  name?: string;
  position?: string;
  baseScore?: number;
  rarity?: Rarity;
  owned: boolean;
  duplicateCount?: number;
  imageUri?: string;
  imageVariant?: 'portrait' | 'artwork';
  collectionStatus?: CollectionStatus;
  size: number;
};

export default function CollectionSlot({
  cardCode,
  club,
  name,
  position,
  baseScore,
  rarity,
  owned,
  duplicateCount = 1,
  imageUri,
  imageVariant = 'portrait',
  collectionStatus = 'active',
  size,
}: Props) {
  const cardHeight = Math.round(size * (783 / 528));
  const height = cardHeight + 20;

  if (!owned) {
    return (
      <View style={[styles.missingWrap, { width: size, height }]}>
        <View style={[styles.missingSlot, { width: size, height: cardHeight, borderRadius: 44 * (size / 528) }]}>
          <Text style={styles.missingNumber}>{cardCode}</Text>
          <Text style={styles.missingIcon}>?</Text>
        </View>
      </View>
    );
  }

  const r = rarity ?? 'common';
  const accent = RARITY_ACCENT[r];
  const upgradeInfo = getUpgradeProgress(duplicateCount);

  return (
    <View style={[styles.ownedWrap, { width: size, height }]}>
      <PlayerCard
        name={name ?? ''}
        club={club ?? cardCode}
        position={position ?? ''}
        rarity={r}
        baseScore={baseScore}
        imageUri={imageUri}
        imageVariant={imageVariant}
        width={size}
        height={cardHeight}
      />

      {collectionStatus === 'legacy' && (
        <View style={styles.legacyBadge}>
          <Text style={styles.legacyBadgeText}>LEGACY</Text>
        </View>
      )}

      {upgradeInfo ? (
        <View style={styles.gaugeRow}>
          <View style={styles.gaugeTrack}>
            <View style={[styles.gaugeFill, { width: `${upgradeInfo.progress * 100}%` as any, backgroundColor: accent }]} />
          </View>
          <Text style={[styles.gaugeLabel, { color: accent + 'aa' }]}>
            {upgradeInfo.current}/{upgradeInfo.next}
          </Text>
        </View>
      ) : (
        <Text style={[styles.maxLabel, { color: accent }]}>MAX</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ownedWrap: {
    alignItems: 'center',
    gap: 4,
  },
  missingWrap: {
    alignItems: 'center',
  },
  missingSlot: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#111111',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
  missingNumber: {
    fontSize: 8,
    fontWeight: '700',
    color: '#333333',
    alignSelf: 'flex-start',
  },
  missingIcon: {
    fontSize: 26,
    color: '#2a2a2a',
    fontWeight: '900',
  },
  legacyBadge: {
    position: 'absolute',
    left: 4,
    top: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E4BC6644',
    backgroundColor: '#E4BC6618',
  },
  legacyBadgeText: {
    color: '#E4BC66',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  gaugeRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gaugeTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 2,
  },
  gaugeLabel: {
    fontSize: 8,
    fontWeight: '700',
  },
  maxLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: -1,
  },
});
