import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import PlayerCard from '@/components/PlayerCard';
import type { Rarity } from '@/components/PlayerCard';
import type { DrawnCard } from '@/components/packs/types';
import { getBoostedScore, getRarity } from '@/lib/game';

const RARITY_BACK_ACCENT: Record<Rarity, string> = {
  common: '#3a3a3a',
  typic: '#85D096',
  rare: '#5C96D8',
  epic: '#9B59D0',
  legend: '#E4BC66',
};

const RARITY_REVEAL_BG: Record<Rarity, string> = {
  common: '#0D0D0E',
  typic: '#080E0A',
  rare: '#07090F',
  epic: '#0B0710',
  legend: '#100900',
};

function CardBack({ rarity, width, height }: { rarity: Rarity; width: number; height: number }) {
  const accent = RARITY_BACK_ACCENT[rarity];
  return (
    <View style={{ width, height, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: accent + '55', backgroundColor: '#0d0d0d' }}>
      <LinearGradient colors={['#1a1a1a', '#080808']} style={StyleSheet.absoluteFill} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: width * 0.22, opacity: 0.1 }}>⚽</Text>
        <Text style={{ color: '#ffffff0d', fontSize: width * 0.07, fontWeight: '900', letterSpacing: 4, marginTop: 6 }}>JCC</Text>
      </View>
      <View style={{ height: 6, backgroundColor: accent + '99' }} />
    </View>
  );
}

type Props = {
  pack: DrawnCard[];
  cardIndex: number;
  onNext: () => void;
};

export default function PackRevealScreen({ pack, cardIndex, onNext }: Props) {
  const { height } = useWindowDimensions();
  const cardH = Math.min(height * 0.62, 500);
  const cardW = cardH * (528 / 783);
  const dragX = useRef(new Animated.Value(0)).current;
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  useEffect(() => {
    Animated.spring(dragX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }).start();
  }, [cardIndex, dragX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5,
      onPanResponderMove: (_, gs) => { dragX.setValue(gs.dx); },
      onPanResponderRelease: (_, gs) => {
        const isTap = Math.abs(gs.dx) < 10 && Math.abs(gs.dy) < 10;
        if (isTap) {
          onNextRef.current();
        } else {
          Animated.spring(dragX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }).start();
        }
      },
    })
  ).current;

  const currentCard = pack[cardIndex];
  const stackBehind = pack.slice(cardIndex + 1);
  const currentRarity = getRarity(currentCard.duplicateCount);
  const bgColor = RARITY_REVEAL_BG[currentRarity];
  const progress = `${cardIndex + 1} / ${pack.length}`;

  const rotateZ = dragX.interpolate({
    inputRange: [-160, 0, 160],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });
  const scaleX = dragX.interpolate({
    inputRange: [-160, -40, 0, 40, 160],
    outputRange: [0.93, 0.98, 1, 0.98, 0.93],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>
      <Text style={styles.progress}>{progress}</Text>

      <Animated.View
        style={{ width: cardW, height: cardH, overflow: 'visible', transform: [{ rotateZ }, { scaleX }], touchAction: 'none' } as any}
        {...panResponder.panHandlers}
      >
        {stackBehind.slice(0, 4).reverse().map((card, revIdx) => {
          const depthIdx = stackBehind.length - revIdx;
          const backOffsetX = dragX.interpolate({
            inputRange: [-160, 0, 160],
            outputRange: [depthIdx * 16, 0, -depthIdx * 16],
            extrapolate: 'clamp',
          });
          const backRotateZ = dragX.interpolate({
            inputRange: [-160, 0, 160],
            outputRange: [`${depthIdx * 3}deg`, '0deg', `${-(depthIdx * 3)}deg`],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={`back-${cardIndex + depthIdx}`}
              style={{ position: 'absolute', left: 0, top: 0, zIndex: 5 - depthIdx, transform: [{ translateX: backOffsetX }, { rotateZ: backRotateZ }] }}
            >
              <CardBack rarity={getRarity(card.duplicateCount)} width={cardW} height={cardH} />
            </Animated.View>
          );
        })}

        <View style={{ position: 'absolute', left: 0, top: 0, zIndex: 10 }}>
          <PlayerCard
            name={currentCard.name}
            club={currentCard.club}
            position={currentCard.position}
            rarity={currentRarity}
            baseScore={currentCard.base_score}
            boostedScore={getBoostedScore(currentCard.base_score, currentCard.duplicateCount)}
            imageUri={currentCard.card_art_uri ?? currentCard.image_uri ?? undefined}
            imageVariant={currentCard.card_art_uri ? 'artwork' : 'portrait'}
            width={cardW}
            height={cardH}
          />
        </View>
      </Animated.View>

      <Text style={styles.hint}>
        {cardIndex < pack.length - 1 ? 'tape · glisse pour voir le pack' : 'tape pour continuer'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
  },
  progress: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    position: 'absolute',
    top: 56,
  },
  hint: {
    color: 'rgba(255,255,255,0.18)',
    fontSize: 11,
    letterSpacing: 1,
  },
});
