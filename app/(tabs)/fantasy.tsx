import { StyleSheet, View } from 'react-native';

import FantasyLineupOverlay from '@/components/fantasy/FantasyLineupOverlay';
import FantasyPitch from '@/components/fantasy/FantasyPitch';

export default function FantasyScreen() {
  return (
    <View style={styles.screen}>
      <FantasyPitch />
      <View style={styles.scrim} pointerEvents="none" />
      <FantasyLineupOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#06100D',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
});
