import { ScrollView, StyleSheet, Text, View } from 'react-native';

import PlayerCard, { type Rarity } from '@/components/PlayerCard';

const RARITIES: Rarity[] = ['common', 'typic', 'rare', 'epic', 'legend'];

export default function CardPreview() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>Preview disponible en développement uniquement.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.row}>
        {RARITIES.map((rarity) => (
          <View key={rarity} style={styles.item}>
            <PlayerCard
              name="Alex Martin"
              club="Lyon"
              position="Attacker"
              rarity={rarity}
              baseScore={91.2}
              width={260}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  blocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
  },
  blockedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  container: {
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 18,
  },
  item: {
    alignItems: 'center',
  },
});
