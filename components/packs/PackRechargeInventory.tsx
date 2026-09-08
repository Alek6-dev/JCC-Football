import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { formatCountdown } from '@/components/packs/pack-time';
import { ligue1FreePackDesign } from '@/components/packs/pack-designs';
import type { PackStatus } from '@/components/packs/types';

export default function PackRechargeInventory({ status }: { status: PackStatus }) {
  const cappedMax = Math.min(status.max, 2);
  const cappedRemaining = Math.min(status.remaining, cappedMax);
  const isFull = cappedRemaining >= cappedMax;
  const progress = isFull ? 1 : status.rechargeProgress;
  const knobLeft = `${Math.max(0, Math.min(1, progress)) * 100}%` as `${number}%`;

  return (
    <View style={[styles.card, isFull && styles.cardFull]}>
      <View style={[styles.packSlots, isFull && styles.packSlotsFull]}>
        {Array.from({ length: cappedMax }, (_, i) => {
          const isFilled = i < cappedRemaining;
          return (
            <View key={i} style={[styles.packSlot, isFilled && styles.packSlotFilled]}>
              {isFilled ? (
                <Image source={ligue1FreePackDesign.masterSource} style={styles.slotPackImage} contentFit="contain" cachePolicy="memory-disk" />
              ) : (
                <View style={styles.packSlotCutout} />
              )}
            </View>
          );
        })}
      </View>

      {!isFull && (
        <View style={styles.gauge}>
          <View style={styles.gaugeTopRow}>
            <View style={styles.track}>
              <LinearGradient
                colors={['#F3B0C8', '#BFDDF9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.fill, { width: knobLeft }]}
              />
              <View style={[styles.knob, { left: knobLeft }]}>
                <Image source={ligue1FreePackDesign.masterSource} style={styles.knobPack} contentFit="contain" cachePolicy="memory-disk" />
              </View>
            </View>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.clockIcon}>◷</Text>
            <Text style={styles.text}>{formatCountdown(status.secondsUntilNext)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 274,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  cardFull: {
    width: 104,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: '#DDE8F2',
    shadowColor: '#0A1A2C',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 4,
  },
  packSlots: {
    position: 'absolute',
    left: 11,
    top: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  packSlotsFull: {
    position: 'relative',
    left: undefined,
    top: undefined,
    gap: 8,
  },
  packSlot: {
    width: 20,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F0F7',
    borderWidth: 1,
    borderColor: '#D7E4EF',
    overflow: 'hidden',
  },
  packSlotFilled: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  packSlotCutout: {
    width: 10,
    height: 19,
    borderRadius: 3,
    backgroundColor: '#D5E1EB',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -1, height: -1 },
    shadowOpacity: 0.9,
    shadowRadius: 1,
  },
  slotPackImage: {
    width: 20,
    height: 34,
  },
  gauge: {
    width: 154,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: '#DDE8F2',
    shadowColor: '#0A1A2C',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 4,
  },
  gaugeTopRow: {
    height: 13,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5EEF7',
    overflow: 'visible',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 2,
  },
  knob: {
    position: 'absolute',
    top: -11,
    width: 18,
    height: 30,
    marginLeft: -9,
    borderRadius: 5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobPack: {
    width: 18,
    height: 30,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  clockIcon: {
    color: '#7C899B',
    fontSize: 10,
    fontWeight: '900',
  },
  text: {
    color: '#102033',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.1,
  },
});
