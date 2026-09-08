import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  COLLECTION_STATUS_COLOR,
  COLLECTION_STATUS_LABEL,
  type AdminPlayer,
  type CollectionStatus,
} from './types';

type ClubGroup = {
  club: string;
  players: AdminPlayer[];
  problemCount: number;
  active: number;
  total: number;
};

type AdminPlayersTableProps = {
  clubs: ClubGroup[];
  openClub: string | null;
  selectedPlayerId: string | null;
  onToggleClub: (club: string) => void;
  onOpenPlayer: (player: AdminPlayer) => void;
  onStatusChange: (playerId: string, status: CollectionStatus) => void;
};

export function AdminPlayersTable({
  clubs,
  openClub,
  selectedPlayerId,
  onToggleClub,
  onOpenPlayer,
  onStatusChange,
}: AdminPlayersTableProps) {
  return (
    <ScrollView contentContainerStyle={styles.list}>
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeadText, styles.colPosition]}>Poste</Text>
          <Text style={[styles.tableHeadText, styles.colPlayer]}>Nom du joueur</Text>
          <Text style={[styles.tableHeadText, styles.colMinutes]}>Minutes</Text>
          <Text style={[styles.tableHeadText, styles.colRecent]}>Derniers matchs</Text>
          <Text style={[styles.tableHeadText, styles.colScore]}>Base score</Text>
          <Text style={[styles.tableHeadText, styles.colActions]}>Statut collection</Text>
          <Text style={[styles.tableHeadText, styles.colHealth]}>Score</Text>
        </View>

        {clubs.length === 0 ? (
          <Text style={styles.emptyText}>Aucun joueur ne correspond aux filtres.</Text>
        ) : null}

        {clubs.map(({ club, players, problemCount, active, total }) => {
          const isOpen = openClub === club;
          return (
            <View key={club}>
              <Pressable
                style={[styles.clubBar, isOpen && styles.clubBarOpen]}
                onPress={() => onToggleClub(club)}
              >
                <View style={styles.clubBarLeft}>
                  <MaterialCommunityIcons name={isOpen ? 'chevron-down' : 'chevron-right'} size={22} color="#d8dddf" />
                  <Text style={styles.clubName}>{club.toUpperCase()}</Text>
                </View>
                <View style={styles.clubBarRight}>
                  <Text style={styles.clubCount}>{active} / {total}</Text>
                  {problemCount > 0 ? (
                    <MaterialCommunityIcons name="alert" size={20} color="#ffcc31" />
                  ) : (
                    <View style={styles.greenDot} />
                  )}
                </View>
              </Pressable>

              {isOpen ? (
                <View style={styles.playerList}>
                  {players.map(player => (
                    <PlayerRow
                      key={player.id}
                      player={player}
                      compact
                      selected={selectedPlayerId === player.id}
                      onPress={() => onOpenPlayer(player)}
                      onStatusChange={(status) => onStatusChange(player.id, status)}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function PlayerRow({
  player: p,
  selected,
  compact,
  onPress,
  onStatusChange,
}: {
  player: AdminPlayer;
  selected?: boolean;
  compact?: boolean;
  onPress: () => void;
  onStatusChange: (status: CollectionStatus) => void;
}) {
  const isScore50 = p.base_score === 50;
  const statusLabel = isScore50 ? 'DÉFAUT' : 'OK';
  const statusColor = isScore50 ? '#e05c5c' : '#4caf50';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [rowStyles.row, compact && rowStyles.rowCompact, selected && rowStyles.selected, pressed && rowStyles.pressed]}>
      <View style={rowStyles.posTag}>
        <Text style={rowStyles.posText}>{p.position}</Text>
      </View>
      <Text style={rowStyles.name} numberOfLines={1}>{p.name}</Text>
      <Text style={[rowStyles.cell, { color: p.season_minutes === 0 ? '#555' : '#d8dde0' }]}>
        {p.season_minutes}
      </Text>
      <View style={rowStyles.latestMatchdays}>
        {p.latest_matchdays?.length ? p.latest_matchdays.map(matchday => (
          <View key={matchday} style={[rowStyles.matchChip, isScore50 && rowStyles.matchChipWarn]}>
            <Text style={rowStyles.matchChipText}>J{matchday}</Text>
          </View>
        )) : (
          <Text style={rowStyles.latestMatchdaysEmpty}>-</Text>
        )}
      </View>
      <Text style={[rowStyles.baseScore, { color: isScore50 ? '#ff744a' : '#d8dde0' }]}>
        {p.base_score.toFixed(1)}
      </Text>
      <View style={rowStyles.statusGroup}>
        {(['active', 'hidden', 'legacy'] as CollectionStatus[]).map(status => {
          const active = p.collection_status === status;
          const color = COLLECTION_STATUS_COLOR[status];
          return (
            <Pressable
              key={status}
              onPress={(event) => {
                event.stopPropagation?.();
                if (!active) onStatusChange(status);
              }}
              style={[
                rowStyles.statusBtn,
                active && { backgroundColor: color + '22', borderColor: color + '88' },
              ]}
            >
              <Text style={[rowStyles.statusBtnText, active && { color }]}>
                {COLLECTION_STATUS_LABEL[status]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[rowStyles.badge, { backgroundColor: statusColor + '22', borderColor: statusColor + '55' }]}>
        <Text style={[rowStyles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 0, flexGrow: 1 },
  tableCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: '#2b3237',
    backgroundColor: '#11161a',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: 18,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#30363b',
    backgroundColor: '#11161a',
  },
  tableHeadText: { color: '#aab0b3', fontSize: 12, fontWeight: '500' },
  colPosition: { width: 34 },
  colPlayer: { width: 160 },
  colMinutes: { width: 70, textAlign: 'left' },
  colRecent: { width: 136 },
  colScore: { width: 74, textAlign: 'left' },
  colActions: { width: 206 },
  colHealth: { width: 48, textAlign: 'center' },
  emptyText: { color: '#444', textAlign: 'center', padding: 52, fontSize: 18 },
  clubBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#30363b',
    backgroundColor: '#151a1d',
  },
  clubBarOpen: { backgroundColor: '#1a1f22' },
  clubBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clubName: { color: '#f2f5f6', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  clubBarRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  clubCount: { color: '#e2e6e8', fontSize: 14, fontWeight: '500' },
  greenDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#55df69' },
  playerList: { backgroundColor: '#11161a' },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#252a2d',
    gap: 14,
  },
  rowCompact: { minHeight: 44 },
  pressed: { backgroundColor: '#1b2023' },
  selected: { backgroundColor: '#171d20' },
  posTag: {
    width: 34,
    height: 25,
    backgroundColor: '#161b1f',
    borderWidth: 1,
    borderColor: '#343a40',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posText: { color: '#d9dee1', fontSize: 12, fontWeight: '700' },
  name: { width: 160, color: '#f0f3f4', fontSize: 14, fontWeight: '600' },
  cell: { fontSize: 14, width: 70, textAlign: 'left', fontWeight: '500' },
  latestMatchdays: {
    width: 136,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
  },
  latestMatchdaysEmpty: { color: '#666', fontWeight: '700' },
  matchChip: {
    minWidth: 36,
    height: 26,
    borderWidth: 1,
    borderColor: '#343b41',
    backgroundColor: '#11161a',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchChipWarn: { borderColor: '#71352d' },
  matchChipText: { color: '#dce1e3', fontSize: 12, fontWeight: '600' },
  baseScore: { width: 74, fontSize: 14, fontWeight: '500', textAlign: 'left' },
  badge: {
    width: 48,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 12, fontWeight: '900' },
  statusGroup: { flexDirection: 'row', gap: 9, width: 206 },
  statusBtn: {
    minWidth: 55,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#343a40',
    backgroundColor: '#171b1f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnText: { color: '#b1b6b8', fontSize: 12, fontWeight: '800' },
});
