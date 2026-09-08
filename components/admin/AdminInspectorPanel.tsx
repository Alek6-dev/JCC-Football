import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  COLLECTION_STATUS_COLOR,
  COLLECTION_STATUS_LABEL,
  RESULT_LABEL,
  type AdminPlayer,
  type CollectionStatus,
  type PlayerScore,
} from './types';

type InspectorPanelProps = {
  player: AdminPlayer;
  scores: PlayerScore[];
  scoresLoading: boolean;
  apiFootballError: string;
  onOpenFull: () => void;
  onClose: () => void;
};

export function AdminInspectorPanel({
  player,
  scores,
  scoresLoading,
  apiFootballError,
  onOpenFull,
  onClose,
}: InspectorPanelProps) {
  const avg = scores.length
    ? Math.round((scores.reduce((sum, s) => sum + Number(s.performance_score), 0) / scores.length) * 10) / 10
    : null;
  const statusColor = COLLECTION_STATUS_COLOR[player.collection_status];
  const recentScores = scores.slice(0, 3);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Fiche joueur</Text>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={22} color="#c6cccf" />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={styles.bigPosTag}>
            <Text style={styles.bigPosText}>{player.position}</Text>
          </View>
          <View style={styles.identityText}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{player.name}</Text>
              <View style={[styles.statusBadge, { borderColor: statusColor + '66', backgroundColor: statusColor + '18' }]}>
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>{COLLECTION_STATUS_LABEL[player.collection_status]}</Text>
              </View>
            </View>
            <Text style={styles.meta}>{player.club.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <InspectorInfo label="ID Joueur (DB)" value={player.id} mono />
          <InspectorInfo label="API Football ID" value={player.api_football_id ?? '-'} />
          <InspectorInfo label="Equipe API" value={`${player.club} (ID: ${player.api_football_team_id ?? '-'})`} />
          <InspectorInfo label="Age" value={player.birth_year ? `${new Date().getFullYear() - player.birth_year} (${player.birth_year})` : '-'} />
          <InspectorInfo label="Minutes saison" value={player.season_minutes} />
          <InspectorInfo label="Base score" value={player.base_score.toFixed(1)} />
          <View style={styles.statusLine}>
            <Text style={styles.infoLabel}>Statut collection</Text>
            <View style={styles.statusButtons}>
              {(['active', 'hidden', 'legacy'] as CollectionStatus[]).map(status => (
                <View key={status} style={[styles.statusChoice, player.collection_status === status && { borderColor: COLLECTION_STATUS_COLOR[status] + '88', backgroundColor: COLLECTION_STATUS_COLOR[status] + '22' }]}>
                  <Text style={[styles.statusChoiceText, player.collection_status === status && { color: COLLECTION_STATUS_COLOR[status] }]}>
                    {COLLECTION_STATUS_LABEL[status]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.sectionTight}>
          <Text style={styles.sectionTitle}>Derniers matchs</Text>
          <View style={styles.matchHeader}>
            <Text style={styles.matchHead}>Journée</Text>
            <Text style={styles.matchHead}>Résultat</Text>
            <Text style={styles.matchHead}>Minutes</Text>
            <Text style={[styles.matchHead, styles.matchScore]}>Score</Text>
          </View>
          {(scoresLoading ? [] : recentScores).map(score => (
            <View key={score.matchday} style={styles.matchRow}>
              <Text style={styles.matchCell}>J{score.matchday}</Text>
              <Text style={[styles.matchCell, score.team_result === 'win' ? styles.win : score.team_result === 'draw' ? styles.draw : styles.loss]}>
                {RESULT_LABEL[score.team_result]}
              </Text>
              <Text style={styles.matchCell}>90</Text>
              <Text style={[styles.matchCell, styles.matchScore, { color: score.performance_score >= 0 ? '#55df69' : '#ff744a' }]}>
                {Number(score.performance_score).toFixed(1)}
              </Text>
            </View>
          ))}
          {!scoresLoading && recentScores.length === 0 ? (
            <Text style={styles.emptySmall}>Aucun score récent.</Text>
          ) : null}
          <Pressable style={styles.allMatchesBtn} onPress={onOpenFull}>
            <Text style={styles.allMatchesText}>Voir tous les matchs ({player.score_count})</Text>
            <MaterialCommunityIcons name="open-in-new" size={15} color="#aeb4b7" />
          </Pressable>
        </View>

        <View style={styles.sectionTight}>
          <Text style={styles.sectionTitle}>Diagnostics scores</Text>
          <InspectorInfo label="Nombre de matchs scorés" value={`${player.score_count} / ${player.score_count || '-'}`} valueColor="#55df69" />
          <InspectorInfo label="Moyenne par match" value={avg ?? '-'} />
          <InspectorInfo label="Score min" value={player.min_score ?? '-'} />
          <InspectorInfo label="Score max" value={player.max_score ?? '-'} />
          <InspectorInfo label="Score = 50" value={player.base_score === 50 ? 'Oui' : 'Non'} />
          <InspectorInfo label="Score = 0" value={player.base_score === 0 ? 'Oui' : 'Non'} />
          <InspectorInfo label="Dernier score calculé" value={scores[0]?.calculated_at ? new Date(scores[0].calculated_at).toLocaleDateString('fr-FR') : '-'} />
          {apiFootballError ? <Text style={styles.error}>{apiFootballError}</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

function InspectorInfo({
  label,
  value,
  valueColor = '#cfd4d6',
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  mono?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[styles.infoValue, { color: valueColor }, mono && styles.infoMono]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: 398,
    borderWidth: 1,
    borderColor: '#2b3237',
    backgroundColor: '#11161a',
    borderRadius: 6,
    padding: 14,
    alignSelf: 'stretch',
    minHeight: 0,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 5 },
  scroll: { flex: 1, minHeight: 0 },
  scrollContent: { paddingBottom: 18 },
  eyebrow: { color: '#55df69', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 20 },
  bigPosTag: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: '#4a5157',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigPosText: { color: '#dfe4e6', fontSize: 13, fontWeight: '700' },
  identityText: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: '#f4f6f7', fontSize: 20, fontWeight: '800' },
  meta: { color: '#aab0b3', fontSize: 12, fontWeight: '500', marginTop: 4 },
  statusBadge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  section: { marginTop: 20, gap: 12 },
  sectionTight: { marginTop: 18, gap: 8 },
  sectionTitle: { color: '#cfd4d6', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#2b3237', marginTop: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  infoLabel: { color: '#b2b8bb', fontSize: 13, fontWeight: '500' },
  infoValue: { flex: 1, color: '#cfd4d6', fontSize: 13, fontWeight: '500', textAlign: 'right' },
  infoMono: { fontFamily: 'monospace', fontSize: 11 },
  statusLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  statusButtons: { flexDirection: 'row', gap: 9 },
  statusChoice: {
    minWidth: 69,
    height: 30,
    borderWidth: 1,
    borderColor: '#343b41',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChoiceText: { color: '#cfd4d6', fontSize: 12, fontWeight: '700' },
  matchHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 7, borderBottomWidth: 1, borderBottomColor: '#2b3237' },
  matchHead: { flex: 1, color: '#aab0b3', fontSize: 12, fontWeight: '500' },
  matchRow: { flexDirection: 'row', alignItems: 'center', minHeight: 29, borderBottomWidth: 1, borderBottomColor: '#252b30' },
  matchCell: { flex: 1, color: '#d8dde0', fontSize: 13, fontWeight: '500' },
  matchScore: { textAlign: 'right' },
  win: { color: '#55df69' },
  draw: { color: '#ffc438' },
  loss: { color: '#ff744a' },
  emptySmall: { color: '#858d91', fontSize: 13, paddingVertical: 8 },
  allMatchesBtn: {
    height: 32,
    borderWidth: 1,
    borderColor: '#2b3237',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 3,
  },
  allMatchesText: { color: '#aeb4b7', fontSize: 12, fontWeight: '500' },
  error: { color: '#e05c5c', fontSize: 12, marginTop: 8 },
});
