import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import type { PackDesign } from '@/components/packs/pack-designs';

type Props = {
  design: PackDesign;
  width: number;
  disabled?: boolean;
  onPress?: () => void;
};

export default function LayeredPack({ design, width, disabled = false, onPress }: Props) {
  const shine = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const height = width / design.aspectRatio;

  useEffect(() => {
    if (!design.masterSource) {
      Animated.loop(
        Animated.timing(shine, { toValue: 1, duration: 3400, useNativeDriver: true })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [design.masterSource, pulse, shine]);

  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.68, 1] });
  const shineTranslate = shine.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.24, width * 0.24] });

  return (
    <Pressable
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        { width, height },
        pressed && !disabled && { transform: [{ scale: 0.985 }] },
      ]}
    >
      {design.masterSource ? (
        <Image source={design.masterSource} style={styles.visual} contentFit="contain" cachePolicy="memory-disk" />
      ) : (
        design.layers.map(layer => {
          const animatedStyle =
            layer.animated === 'shine'
              ? { opacity: layer.opacity ?? 1, transform: [{ translateX: shineTranslate }] }
              : layer.animated === 'pulse'
                ? { opacity: pulseOpacity }
                : { opacity: layer.opacity ?? 1 };

          return (
            <Animated.View key={layer.id} style={[StyleSheet.absoluteFill, animatedStyle]}>
              <Image source={layer.source} style={styles.visual} contentFit="contain" cachePolicy="memory-disk" />
            </Animated.View>
          );
        })
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  visual: {
    width: '100%',
    height: '100%',
  },
});
