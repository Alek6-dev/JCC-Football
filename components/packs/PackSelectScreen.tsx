import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import LayeredPack from '@/components/packs/LayeredPack';
import { ligue1FreePackDesign } from '@/components/packs/pack-designs';
import { T } from '@/lib/theme';

type Props = {
  freePacks: number;
  maxDailyPacks: number;
  onOpen: () => void;
  onBack: () => void;
};

export default function PackSelectScreen({ freePacks, maxDailyPacks, onOpen, onBack }: Props) {
  const { width, height } = useWindowDimensions();
  const packSize = Math.min(width * 0.58, 260);
  const packAnim = useRef(new Animated.Value(0)).current;
  const isOpening = useRef(false);

  const translateY = packAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.55] });
  const scale = packAnim.interpolate({ inputRange: [0, 0.35, 1], outputRange: [1, 1.08, 0.75] });
  const packOpacity = packAnim.interpolate({ inputRange: [0, 0.55, 1], outputRange: [1, 1, 0] });
  const flashOpacity = packAnim.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0, 0, 1] });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 8,
    onPanResponderRelease: (_, gs) => {
      if (gs.dy < -50 && !isOpening.current) {
        isOpening.current = true;
        Animated.timing(packAnim, { toValue: 1, duration: 380, useNativeDriver: true }).start(() => {
          onOpen();
        });
      }
    },
  })).current;

  return (
    <LinearGradient colors={['#07111D', '#102B32', '#07111D']} style={styles.screen}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>×</Text>
      </Pressable>

      <View style={styles.packsRow}>
        {Array.from({ length: maxDailyPacks }, (_, i) => (
          <View key={i} style={[styles.dot, i < freePacks ? styles.dotFull : styles.dotEmpty]} />
        ))}
        <Text style={styles.packsLabel}>{freePacks} / {maxDailyPacks} packs</Text>
      </View>

      <View style={styles.packArea} {...panResponder.panHandlers}>
        <Animated.View style={{ transform: [{ translateY }, { scale }], opacity: packOpacity }}>
          <LayeredPack design={ligue1FreePackDesign} width={packSize} />
        </Animated.View>
      </View>

      <Text style={styles.hint}>Glisse vers le haut pour ouvrir</Text>

      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#ffffff', opacity: flashOpacity }]} pointerEvents="none" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 48,
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.bgDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: T.textSub,
    fontSize: 14,
    fontWeight: '600',
  },
  packsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotFull: { backgroundColor: T.green },
  dotEmpty: { backgroundColor: T.bgDim },
  packsLabel: {
    color: T.textSub,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  packArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  hint: {
    color: T.textMuted,
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
