import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

const NAV_ITEMS = [
  { label: 'Collections', icon: 'layers-outline' },
  { label: 'Joueurs', icon: 'account-outline' },
  { label: 'Scoring', icon: 'chart-bar' },
  { label: 'Card Art', icon: 'image-outline' },
  { label: 'Archives', icon: 'archive-outline' },
  { label: 'Settings', icon: 'cog-outline' },
];

export function AdminSidebar() {
  return (
    <View style={styles.sidebar}>
      <View style={styles.brandBlock}>
        <View style={styles.shield}>
          <Text style={styles.shieldText}>JCC</Text>
        </View>
        <Text style={styles.brandMark}>ADMIN JCC</Text>
      </View>

      <View style={styles.navList}>
        {NAV_ITEMS.map(item => (
          <View key={item.label} style={[styles.navItem, item.label === 'Joueurs' && styles.navItemActive]}>
            <MaterialCommunityIcons
              name={item.icon as any}
              size={21}
              color={item.label === 'Joueurs' ? '#55df69' : '#c3c8c4'}
              style={styles.navIcon}
            />
            <Text style={[styles.navText, item.label === 'Joueurs' && styles.navTextActive]}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sidebarFooter}>
        <Text style={styles.versionText}>v1.0.0</Text>
        <MaterialCommunityIcons name="chevron-double-left" size={18} color="#a6aca8" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    borderRightWidth: 1,
    borderRightColor: '#30363b',
    backgroundColor: '#0b0f12',
    paddingTop: 28,
    paddingHorizontal: 8,
  },
  brandBlock: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 14,
    marginBottom: 34,
  },
  shield: {
    width: 34,
    height: 34,
    borderWidth: 2,
    borderColor: '#d8dddf',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldText: { color: '#d8dddf', fontSize: 9, fontWeight: '900' },
  brandMark: { color: '#f6f8f9', fontSize: 24, fontWeight: '900', letterSpacing: 0 },
  navList: { gap: 8 },
  navItem: { height: 54, paddingHorizontal: 18, borderRadius: 5, flexDirection: 'row', alignItems: 'center' },
  navIcon: { width: 26, marginRight: 14 },
  navItemActive: { backgroundColor: '#162b1e' },
  navText: { color: '#f0f3f4', fontSize: 15, fontWeight: '500' },
  navTextActive: { color: '#55df69', fontWeight: '700' },
  sidebarFooter: {
    marginTop: 'auto',
    height: 58,
    borderTopWidth: 1,
    borderTopColor: '#30363b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  versionText: { color: '#aab0b3', fontSize: 12 },
});
