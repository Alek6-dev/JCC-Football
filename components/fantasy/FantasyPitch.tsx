import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

const pitchSource = require('@/assets/images/fantasy-pitch-stade-premium-bg.webp');

export default function FantasyPitch() {
  return (
    <Image
      source={pitchSource}
      contentFit="cover"
      priority="high"
      recyclingKey="fantasy-pitch-stade-premium"
      style={StyleSheet.absoluteFill}
    />
  );
}
