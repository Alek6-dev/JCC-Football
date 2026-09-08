import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FilterSelect, StatPill } from './AdminControls';
import type { FilterDropdown, FilterOption } from './types';

type AdminHeaderProps = {
  selectedSeason: string;
  liveSeason: string;
  selectedSeasonLabel: string;
  selectedCollectionLabel: string;
  seasonOptions: FilterOption[];
  collectionOptions: FilterOption[];
  openFilter: FilterDropdown | null;
  total: number;
  active: number;
  hidden: number;
  legacy: number;
  score50: number;
  noScore: number;
  onToggleFilter: (filter: FilterDropdown) => void;
  onSelectSeason: (season: string) => void;
  onSelectCollection: (collectionId: string | null) => void;
  onRefresh: () => void;
};

export function AdminHeader({
  selectedSeason,
  liveSeason,
  selectedSeasonLabel,
  selectedCollectionLabel,
  seasonOptions,
  collectionOptions,
  openFilter,
  total,
  active,
  hidden,
  legacy,
  score50,
  noScore,
  onToggleFilter,
  onSelectSeason,
  onSelectCollection,
  onRefresh,
}: AdminHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeftControls}>
        <View style={styles.headerSelectGroup}>
          <Text style={styles.selectLabel}>Saison</Text>
          <FilterSelect
            value={selectedSeasonLabel}
            width={178}
            isOpen={openFilter === 'season'}
            options={seasonOptions}
            badge={selectedSeason === liveSeason ? 'LIVE' : undefined}
            onToggle={() => onToggleFilter('season')}
            onSelect={onSelectSeason}
          />
        </View>

        <View style={styles.headerSelectGroup}>
          <Text style={styles.selectLabel}>Collection</Text>
          <FilterSelect
            value={selectedCollectionLabel}
            width={220}
            isOpen={openFilter === 'collection'}
            options={collectionOptions}
            onToggle={() => onToggleFilter('collection')}
            onSelect={(value) => onSelectCollection(value || null)}
          />
        </View>
      </View>

      <View style={styles.statBar}>
        <StatPill label="Total" value={total} />
        <StatPill label="Active" value={active} color="#58e26a" />
        <StatPill label="Hidden" value={hidden} color="#cdd0d2" />
        <StatPill label="Legacy" value={legacy} color="#ffc438" />
        <StatPill label="Score = 50" value={score50} color="#ff744a" />
        <StatPill label="0 score" value={noScore} color="#ff686e" />
        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <MaterialCommunityIcons name="refresh" size={18} color="#d5dadd" />
          <Text style={styles.refreshText}>Rafraîchir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 92,
    paddingHorizontal: 26,
    borderBottomWidth: 1,
    borderBottomColor: '#30363b',
    backgroundColor: '#0d1114',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 80,
    overflow: 'visible',
  },
  headerLeftControls: { flexDirection: 'row', gap: 24, alignItems: 'center', zIndex: 90 },
  headerSelectGroup: { gap: 5, zIndex: 90 },
  selectLabel: { color: '#b8bec1', fontSize: 12, fontWeight: '500' },
  statBar: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  refreshBtn: {
    height: 38,
    marginLeft: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#343b41',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#101417',
  },
  refreshText: { color: '#eef2f3', fontSize: 13, fontWeight: '500' },
});
