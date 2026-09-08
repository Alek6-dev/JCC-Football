import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import PlayerCard from '@/components/PlayerCard';
import type { Rarity } from '@/components/PlayerCard';
import type { DrawnCard } from '@/components/packs/types';
import { getBoostedScore, getRarity } from '@/lib/game';
import { T } from '@/lib/theme';

const SUMMARY_RARITY_ACCENT: Record<Rarity, string> = {
  common: '#b0b0b0',
  typic: '#85D096',
  rare: '#5C96D8',
  epic: '#9B59D0',
  legend: '#E4BC66',
};

const DUP_THRESHOLDS = [1, 2, 5, 10, 20];

function getSegmentProgress(count: number): number {
  if (count <= 1) return 0;
  if (count >= 20) return 1;
  const nextIdx = DUP_THRESHOLDS.findIndex(t => t > count);
  const prev = DUP_THRESHOLDS[nextIdx - 1];
  const next = DUP_THRESHOLDS[nextIdx];
  return (count - prev) / (next - prev);
}

function getSegmentInfo(count: number): { next: number } | null {
  if (count >= 20) return null;
  const nextIdx = DUP_THRESHOLDS.findIndex(t => t > count);
  return { next: DUP_THRESHOLDS[nextIdx] };
}

function AnimatedSummaryCard({ card, cardW, cardH, delay }: {
  card: DrawnCard;
  cardW: number;
  cardH: number;
  delay: number;
}) {
  const newTotal = card.prevDuplicateCount + card.duplicateCount;
  const newRarity = getRarity(newTotal);
  const isNew = card.prevDuplicateCount === 0;
  const prevRarity = !isNew ? getRarity(card.prevDuplicateCount) : newRarity;
  const upgraded = !isNew && prevRarity !== newRarity;
  const accent = SUMMARY_RARITY_ACCENT[newRarity];
  const barFrom = upgraded ? 0 : getSegmentProgress(card.prevDuplicateCount);
  const barTo = getSegmentProgress(newTotal);
  const barAnim = useRef(new Animated.Value(barFrom)).current;
  const upgradeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(barAnim, { toValue: barTo, duration: 1600, useNativeDriver: false }),
        ...(upgraded ? [Animated.timing(upgradeOpacity, {
          toValue: 1, duration: 1000, delay: 400, useNativeDriver: false,
        })] : []),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [barAnim, barTo, delay, upgradeOpacity, upgraded]);

  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const segmentInfo = getSegmentInfo(newTotal);
  const cardProps = {
    name: card.name,
    club: card.club,
    position: card.position,
    baseScore: card.base_score,
    imageUri: card.card_art_uri ?? card.image_uri ?? undefined,
    imageVariant: card.card_art_uri ? 'artwork' as const : 'portrait' as const,
    width: cardW,
    height: cardH,
  };

  return (
    <View style={styles.cardWrap}>
      <View style={{ width: cardW, height: cardH }}>
        {upgraded && (
          <Animated.View style={[StyleSheet.absoluteFill, {
            opacity: upgradeOpacity.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          }]}>
            <PlayerCard {...cardProps} rarity={prevRarity} boostedScore={getBoostedScore(card.base_score, card.prevDuplicateCount)} />
          </Animated.View>
        )}
        <Animated.View style={[StyleSheet.absoluteFill, upgraded ? { opacity: upgradeOpacity } : {}]}>
          <PlayerCard {...cardProps} rarity={newRarity} boostedScore={getBoostedScore(card.base_score, newTotal)} />
        </Animated.View>
      </View>

      <View style={[styles.gaugeArea, { width: cardW }]}>
        {isNew ? (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NOUVEAU</Text>
          </View>
        ) : (
          <>
            <View style={styles.gaugeTrack}>
              <Animated.View style={[styles.gaugeFill, { width: barWidth, backgroundColor: accent }]} />
            </View>
            <Text style={[styles.gaugeLabel, { color: accent + 'aa' }]}>
              {segmentInfo ? `${newTotal} / ${segmentInfo.next}` : 'MAX'}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

export default function PackSummaryScreen({ pack, onDone }: { pack: DrawnCard[]; onDone: () => void }) {
  const { width } = useWindowDimensions();
  const cardW = Math.floor((width - 32 - 16) / 3);
  const cardH = Math.floor(cardW * (783 / 528));

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>RÉCAP DU PACK</Text>

      <View style={styles.row}>
        {pack.slice(0, 3).map((card, i) => (
          <AnimatedSummaryCard key={card.id} card={card} cardW={cardW} cardH={cardH} delay={i * 300} />
        ))}
      </View>
      <View style={[styles.row, styles.rowCentered]}>
        {pack.slice(3, 5).map((card, i) => (
          <AnimatedSummaryCard key={card.id} card={card} cardW={cardW} cardH={cardH} delay={(i + 3) * 150} />
        ))}
      </View>

      <Pressable onPress={onDone} style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.85 }]}>
        <LinearGradient colors={[T.green, T.greenDark]} style={styles.doneBtnGradient}>
          <Text style={styles.doneBtnText}>CONTINUER</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: T.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  title: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  rowCentered: {
    justifyContent: 'center',
  },
  cardWrap: {
    alignItems: 'center',
    gap: 6,
  },
  gaugeArea: {
    alignItems: 'center',
    gap: 4,
    minHeight: 22,
  },
  gaugeTrack: {
    width: '100%',
    height: 4,
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
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#85D09618',
    borderWidth: 1,
    borderColor: '#85D09666',
  },
  newBadgeText: {
    color: '#85D096',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  doneBtn: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  doneBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
