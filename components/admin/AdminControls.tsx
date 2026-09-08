import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { FilterOption } from './types';

export function StatPill({ label, value, color = '#555' }: { label: string; value: number; color?: string }) {
  return (
    <View style={statStyles.pill}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

export function FilterSelect({
  label,
  value,
  width,
  isOpen,
  options,
  badge,
  onToggle,
  onSelect,
}: {
  label?: string;
  value: string;
  width: number;
  isOpen: boolean;
  options: FilterOption[];
  badge?: string;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={[selectStyles.filterField, isOpen && selectStyles.filterFieldOpen, { width }]}>
      {label ? <Text style={selectStyles.filterLabel}>{label}</Text> : null}
      <Pressable style={[selectStyles.box, selectStyles.filterBox]} onPress={onToggle}>
        <Text style={selectStyles.value} numberOfLines={1}>{value}</Text>
        {badge ? (
          <View style={selectStyles.badge}>
            <Text style={selectStyles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        <MaterialCommunityIcons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#cfd4d6" />
      </Pressable>

      {isOpen ? (
        <View style={[selectStyles.menu, { width, top: label ? 61 : 43 }]}>
          <ScrollView style={selectStyles.menuScroll} nestedScrollEnabled>
            {options.map(option => {
              const active = option.label === value || option.value === value;
              return (
                <Pressable
                  key={option.value}
                  style={[selectStyles.option, active && selectStyles.optionActive]}
                  onPress={() => onSelect(option.value)}
                >
                  <Text style={[selectStyles.optionText, active && selectStyles.optionTextActive]} numberOfLines={1}>
                    {option.label}
                  </Text>
                  {active ? <MaterialCommunityIcons name="check" size={16} color="#55df69" /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const statStyles = StyleSheet.create({
  pill: {
    width: 96,
    height: 64,
    borderWidth: 1,
    borderColor: '#20262a',
    backgroundColor: '#151a1d',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 24, fontWeight: '900', marginTop: 2 },
  label: { color: '#c4c8ca', fontSize: 12, fontWeight: '600' },
});

const selectStyles = StyleSheet.create({
  box: {
    height: 36,
    borderWidth: 1,
    borderColor: '#343b41',
    backgroundColor: '#101417',
    borderRadius: 5,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  value: { flex: 1, minWidth: 0, color: '#f0f4f5', fontSize: 14, fontWeight: '500' },
  badge: {
    backgroundColor: '#0e431e',
    borderWidth: 1,
    borderColor: '#1d7932',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: '#67ec78', fontSize: 11, fontWeight: '900' },
  filterField: { gap: 7, position: 'relative', zIndex: 1 },
  filterFieldOpen: { zIndex: 50 },
  filterLabel: { color: '#b8bec1', fontSize: 13, fontWeight: '500' },
  filterBox: { height: 35 },
  menu: {
    position: 'absolute',
    left: 0,
    maxHeight: 230,
    borderWidth: 1,
    borderColor: '#343b41',
    backgroundColor: '#101417',
    borderRadius: 5,
    overflow: 'hidden',
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  menuScroll: { maxHeight: 230 },
  option: {
    minHeight: 36,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#20262a',
    gap: 8,
  },
  optionActive: { backgroundColor: '#162b1e' },
  optionText: { flex: 1, color: '#e5e9eb', fontSize: 13, fontWeight: '500' },
  optionTextActive: { color: '#55df69', fontWeight: '800' },
});
