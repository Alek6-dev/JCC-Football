import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import HomeBackground from '@/components/home/HomeBackground';
import LayeredPack from '@/components/packs/LayeredPack';
import { ligue1FreePackDesign } from '@/components/packs/pack-designs';
import PackRechargeInventory from '@/components/packs/PackRechargeInventory';
import type { PackStatus } from '@/components/packs/types';

type Props = {
  packStatus: PackStatus;
  freePacks: number;
  catalogReady: boolean;
  saveError: boolean;
  onOpenPack: () => void;
};

export default function HomeHub({ packStatus, freePacks, catalogReady, saveError, onOpenPack }: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const packWidth = Math.min(width * 0.56, 218);
  const canOpen = catalogReady && freePacks > 0;

  return (
    <View style={styles.screen}>
      <HomeBackground />

      <View style={styles.header}>
        <Text style={styles.appName}>JCC Football</Text>
        <Pressable
          onPress={() => router.push('/(tabs)/collection')}
          style={({ pressed }) => [styles.collectionButton, pressed && { transform: [{ scale: 0.97 }] }]}
        >
          <View style={styles.collectionIcon}>
            <View style={styles.collectionIconInner} />
          </View>
          <Text style={styles.collectionText}>Collection</Text>
          <Text style={styles.collectionChevron}>›</Text>
        </Pressable>
      </View>

      <View style={styles.packSection}>
        <View style={[styles.packStage, { width: packWidth * 1.28, height: (packWidth / ligue1FreePackDesign.aspectRatio) * 1.04 }]}>
          <LayeredPack
            design={ligue1FreePackDesign}
            width={packWidth}
            onPress={() => { if (canOpen) onOpenPack(); }}
            disabled={!canOpen}
          />
        </View>

        <PackRechargeInventory status={packStatus} />

        {saveError && <Text style={styles.errorText}>Erreur de sauvegarde du pack</Text>}
        <Pressable
          style={({ pressed }) => [
            styles.openBtn,
            !canOpen && styles.openBtnDisabled,
            pressed && canOpen && { transform: [{ scale: 0.985 }] },
          ]}
          onPress={() => { if (canOpen) onOpenPack(); }}
          disabled={!canOpen}
        >
          <LinearGradient
            colors={['#31DEC8', '#4B8FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.openBtnGradient}
          >
            <Text style={styles.openBtnText}>OUVRIR UN PACK</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F6FA',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    width: '100%',
    paddingTop: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  collectionButton: {
    height: 38,
    borderRadius: 19,
    paddingLeft: 13,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: '#DDE8F2',
    shadowColor: '#0A1A2C',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 4,
  },
  collectionIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EAF7F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionIconInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#31BFAF',
  },
  collectionText: {
    color: '#102033',
    fontSize: 12,
    fontWeight: '900',
  },
  collectionChevron: {
    color: '#7E8DA1',
    fontSize: 18,
    fontWeight: '900',
  },
  packSection: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginTop: 24,
    zIndex: 1,
  },
  packStage: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'transparent',
  },
  openBtn: {
    width: 274,
    borderRadius: 29,
    overflow: 'hidden',
    shadowColor: '#31DEC8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.44,
    shadowRadius: 11,
    elevation: 8,
  },
  openBtnDisabled: {
    opacity: 0.35,
  },
  openBtnGradient: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openBtnText: {
    color: '#061321',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#e05555',
    fontSize: 12,
  },
});
