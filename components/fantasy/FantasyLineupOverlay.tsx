import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FORMATION_IDS, FormationId, getFormationSlots } from '@/components/fantasy/formations';
import LineupSlot from '@/components/fantasy/LineupSlot';

export default function FantasyLineupOverlay() {
  const [formation, setFormation] = useState<FormationId>('4-3-3');
  const [showFormationMenu, setShowFormationMenu] = useState(false);
  const { width, height } = useWindowDimensions();
  const boardWidth = Math.min(width, 430);
  const boardHeight = height;
  const sideInset = (width - boardWidth) / 2;
  const starters = useMemo(() => getFormationSlots(formation), [formation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.board, { width: boardWidth, height: boardHeight, marginLeft: sideInset }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowFormationMenu((value) => !value)}
          style={styles.formationButton}
        >
          <Text style={styles.formationLabel}>DISPOSITIF</Text>
          <Text style={styles.formationValue}>{formation}</Text>
        </Pressable>

        {showFormationMenu && (
          <View style={styles.formationMenu}>
            {FORMATION_IDS.map((formationId) => (
              <Pressable
                key={formationId}
                accessibilityRole="button"
                onPress={() => {
                  setFormation(formationId);
                  setShowFormationMenu(false);
                }}
                style={[styles.formationOption, formationId === formation && styles.formationOptionActive]}
              >
                <Text style={[styles.formationOptionText, formationId === formation && styles.formationOptionTextActive]}>
                  {formationId}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.pitchLayer} pointerEvents="box-none">
          {starters.map((slot) => (
            <LineupSlot
              key={slot.id}
              label={slot.label}
              size="starter"
              style={[
                styles.starterSlot,
                {
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.benchPanel}>
          <View style={styles.benchHeader}>
            <Text style={styles.benchTitle}>REMPLACANTS</Text>
            <Text style={styles.benchCount}>7/7</Text>
          </View>
          <View style={styles.benchSlots}>
            {Array.from({ length: 7 }, (_, index) => (
              <LineupSlot key={index} size="bench" style={styles.benchSlot} />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    ...StyleSheet.absoluteFillObject,
  },
  board: {
    position: 'relative',
  },
  formationButton: {
    position: 'absolute',
    top: 18,
    left: 18,
    minWidth: 96,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(2, 8, 10, 0.54)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  formationLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  formationValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
    marginTop: 1,
  },
  formationMenu: {
    position: 'absolute',
    top: 86,
    left: 18,
    width: 118,
    padding: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(2, 8, 10, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    zIndex: 20,
  },
  formationOption: {
    height: 31,
    paddingHorizontal: 9,
    borderRadius: 6,
    justifyContent: 'center',
  },
  formationOptionActive: {
    backgroundColor: 'rgba(228, 188, 102, 0.18)',
  },
  formationOptionText: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 15,
    fontWeight: '900',
  },
  formationOptionTextActive: {
    color: '#E4BC66',
  },
  pitchLayer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    bottom: 250,
  },
  starterSlot: {
    marginLeft: -27,
    marginTop: -36,
  },
  benchPanel: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 138,
    height: 87,
    paddingHorizontal: 10,
    paddingTop: 8,
    borderRadius: 7,
    backgroundColor: 'rgba(3, 10, 13, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  benchHeader: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  benchTitle: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.1,
  },
  benchCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  benchSlots: {
    height: 54,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  benchSlot: {
    position: 'relative',
  },
});
