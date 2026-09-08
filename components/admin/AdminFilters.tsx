import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FilterSelect } from './AdminControls';
import type { FilterDropdown, FilterOption } from './types';

type AdminFiltersProps = {
  openFilter: FilterDropdown | null;
  selectedClubLabel: string;
  selectedStatusLabel: string;
  selectedPositionLabel: string;
  selectedProblemLabel: string;
  clubOptions: FilterOption[];
  statusOptions: FilterOption[];
  positionOptions: FilterOption[];
  problemOptions: FilterOption[];
  onToggleFilter: (filter: FilterDropdown) => void;
  onSelectClub: (value: string) => void;
  onSelectStatus: (value: string) => void;
  onSelectPosition: (value: string) => void;
  onSelectProblem: (value: string) => void;
  onReset: () => void;
};

export function AdminFilters({
  openFilter,
  selectedClubLabel,
  selectedStatusLabel,
  selectedPositionLabel,
  selectedProblemLabel,
  clubOptions,
  statusOptions,
  positionOptions,
  problemOptions,
  onToggleFilter,
  onSelectClub,
  onSelectStatus,
  onSelectPosition,
  onSelectProblem,
  onReset,
}: AdminFiltersProps) {
  return (
    <View style={styles.filterBar}>
      <View style={styles.filterRow}>
        <FilterSelect
          label="Club"
          value={selectedClubLabel}
          width={164}
          isOpen={openFilter === 'club'}
          options={clubOptions}
          onToggle={() => onToggleFilter('club')}
          onSelect={onSelectClub}
        />
        <FilterSelect
          label="Statut"
          value={selectedStatusLabel}
          width={164}
          isOpen={openFilter === 'status'}
          options={statusOptions}
          onToggle={() => onToggleFilter('status')}
          onSelect={onSelectStatus}
        />
        <FilterSelect
          label="Poste"
          value={selectedPositionLabel}
          width={164}
          isOpen={openFilter === 'position'}
          options={positionOptions}
          onToggle={() => onToggleFilter('position')}
          onSelect={onSelectPosition}
        />
        <FilterSelect
          label="Problèmes"
          value={selectedProblemLabel}
          width={164}
          isOpen={openFilter === 'problem'}
          options={problemOptions}
          onToggle={() => onToggleFilter('problem')}
          onSelect={onSelectProblem}
        />

        <Pressable style={styles.resetBtn} onPress={onReset}>
          <MaterialCommunityIcons name="refresh" size={18} color="#cfd5d8" />
          <Text style={styles.resetText}>Réinitialiser filtres</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2b3237',
    borderBottomWidth: 1,
    backgroundColor: '#11161a',
    zIndex: 20,
  },
  filterRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 24 },
  resetBtn: {
    marginLeft: 'auto',
    height: 38,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#2b3237',
    borderRadius: 5,
    backgroundColor: '#101417',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  resetText: { color: '#eef2f3', fontSize: 13, fontWeight: '500' },
});
