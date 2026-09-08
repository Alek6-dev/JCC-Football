import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BREAKDOWN_LABELS,
  RESULT_LABEL,
  type AdminPlayer,
  type ApiFootballResult,
  type PlayerScore,
} from './types';

type AdminPlayerDetailModalProps = {
  player: AdminPlayer;
  scores: PlayerScore[];
  scoresLoading: boolean;
  expandedMatchday: number | null;
  apiFootballData: ApiFootballResult | null;
  apiFootballLoading: boolean;
  apiFootballError: string;
  onToggleMatchday: (matchday: number) => void;
  onFetchApiFootball: () => void;
  onClose: () => void;
};

export function AdminPlayerDetailModal({
  player: p,
  scores,
  scoresLoading,
  expandedMatchday,
  apiFootballData,
  apiFootballLoading,
  apiFootballError,
  onToggleMatchday,
  onFetchApiFootball,
  onClose,
}: AdminPlayerDetailModalProps) {
  const isBase50 = p.base_score === 50;
  const avgFromScores = scores.length
    ? Math.round((scores.reduce((sum, s) => sum + Number(s.performance_score), 0) / scores.length) * 10) / 10
    : null;
  const delta = avgFromScores !== null ? avgFromScores - p.base_score : null;

  return (
    <View style={modalStyles.root}>
      <View style={modalStyles.header}>
        <View style={modalStyles.headerLeft}>
          <Text style={modalStyles.playerName}>{p.name}</Text>
          <Text style={modalStyles.playerMeta}>{p.club} · {p.position}</Text>
        </View>
        <Pressable onPress={onClose} style={modalStyles.closeBtn}>
          <Text style={modalStyles.closeBtnText}>×</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={modalStyles.body}>
        <SectionTitle>Identité technique</SectionTitle>
        <View style={modalStyles.grid}>
          <InfoRow label="id (Supabase)" value={p.id} mono />
          <InfoRow label="api_football_id" value={p.api_football_id ?? '—'} />
          <InfoRow label="api_football_team_id" value={p.api_football_team_id ?? '—'} />
          <InfoRow label="card_type" value={p.card_type} />
          <InfoRow label="collection_status" value={p.collection_status} />
          <InfoRow label="season" value={p.season} />
          <InfoRow label="birth_year" value={p.birth_year ?? '—'} />
          <InfoRow label="season_minutes" value={p.season_minutes} />
          <InfoRow label="drop_weight" value={p.drop_weight} />
          <InfoRow label="club_letter" value={p.club_letter ?? '—'} />
          <InfoRow label="club_card_number" value={p.club_card_number ?? '—'} />
        </View>

        <SectionTitle>Diagnostic scoring</SectionTitle>
        <View style={modalStyles.grid}>
          <InfoRow label="base_score actuel" value={p.base_score.toFixed(1)} valueColor={isBase50 ? '#e05c5c' : '#d6d6d6'} bold />
          <InfoRow label="Scores en DB" value={scoresLoading ? '…' : scores.length} />
          {!scoresLoading && (
            <>
              <InfoRow label="Moyenne réelle" value={avgFromScores ?? '—'} />
              <InfoRow label="Min" value={p.min_score ?? '—'} />
              <InfoRow label="Max" value={p.max_score ?? '—'} />
              {delta !== null && (
                <InfoRow
                  label="Δ base_score vs réel"
                  value={delta.toFixed(1)}
                  valueColor={Math.abs(delta) > 5 ? '#e0a050' : '#4caf50'}
                />
              )}
            </>
          )}
        </View>

        {isBase50 && scores.length > 0 && (
          <View style={modalStyles.alertBox}>
            <Text style={modalStyles.alertText}>
              {'⚠ base_score=50 mais '}{scores.length}{' score(s) en DB (moy. '}{avgFromScores}{"). Le backfill ne s'est pas appliqué."}
            </Text>
          </View>
        )}
        {isBase50 && scores.length === 0 && p.season_minutes > 0 && (
          <View style={modalStyles.alertBox}>
            <Text style={modalStyles.alertText}>
              ⚠ base_score=50 et 0 score en DB malgré {p.season_minutes} minutes jouées. Trou de données API Football probable.
            </Text>
          </View>
        )}
        {p.base_score === 0 && p.season_minutes > 0 && (
          <View style={modalStyles.alertBox}>
            <Text style={modalStyles.alertText}>
              ⚠ 0 score en DB malgré {p.season_minutes} minutes jouées.
            </Text>
          </View>
        )}

        <SectionTitle>Historique scores ({scores.length} journées)</SectionTitle>
        {scoresLoading && <Text style={modalStyles.emptyMsg}>Chargement…</Text>}
        {!scoresLoading && scores.length === 0 && (
          <Text style={modalStyles.emptyMsg}>Aucun score calculé en base.</Text>
        )}
        {!scoresLoading && scores.map(score => (
          <ScoreRow
            key={score.matchday}
            score={score}
            expanded={expandedMatchday === score.matchday}
            onToggle={() => onToggleMatchday(score.matchday)}
          />
        ))}

        <SectionTitle>Données API Football</SectionTitle>
        {!p.api_football_id ? (
          <Text style={modalStyles.emptyMsg}>{"Pas d'api_football_id — impossible de vérifier."}</Text>
        ) : (
          <>
            <Pressable style={modalStyles.fetchBtn} onPress={onFetchApiFootball} disabled={apiFootballLoading}>
              <Text style={modalStyles.fetchBtnText}>
                {apiFootballLoading ? 'Chargement API Football…' : 'Vérifier via API Football'}
              </Text>
            </Pressable>
            {apiFootballError ? <Text style={modalStyles.errorMsg}>{apiFootballError}</Text> : null}
            {apiFootballData && (
              <>
                <InfoRow label="Résultats API" value={apiFootballData.results} />
                {apiFootballData.results === 0 ? (
                  <View style={modalStyles.alertBox}>
                    <Text style={modalStyles.alertText}>
                      {"✗ Aucune donnée retournée par API Football pour cet ID. Le joueur n'existe pas ou la saison est vide."}
                    </Text>
                  </View>
                ) : (
                  <ApiFootballStats data={apiFootballData} />
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ScoreRow({
  score,
  expanded,
  onToggle,
}: {
  score: PlayerScore;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={scoreRowStyles.wrap}>
      <Pressable onPress={onToggle} style={scoreRowStyles.header}>
        <View>
          <Text style={scoreRowStyles.title}>J{score.matchday}</Text>
          <Text style={scoreRowStyles.meta}>
            {RESULT_LABEL[score.team_result]} · {score.team_goals_scored}–{score.team_goals_conceded}
          </Text>
        </View>
        <Text style={[scoreRowStyles.score, { color: Number(score.performance_score) >= 50 ? '#4caf50' : '#e0a050' }]}>
          {Number(score.performance_score).toFixed(1)}
        </Text>
        <Text style={scoreRowStyles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded && (
        <View style={scoreRowStyles.breakdown}>
          {Object.entries(score.breakdown ?? {}).length === 0 && (
            <Text style={scoreRowStyles.noBreakdown}>Pas de détail disponible.</Text>
          )}
          {Object.entries(score.breakdown ?? {}).map(([key, value]) => (
            <View key={key} style={scoreRowStyles.breakdownRow}>
              <Text style={scoreRowStyles.breakdownLabel}>{BREAKDOWN_LABELS[key] ?? key}</Text>
              <Text style={[scoreRowStyles.breakdownValue, { color: Number(value) >= 0 ? '#d6d6d6' : '#e05c5c' }]}>
                {Number(value) > 0 ? '+' : ''}{Number(value).toFixed(1)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function ApiFootballStats({ data }: { data: ApiFootballResult }) {
  const first = data.response[0];
  if (!first) return null;
  const stats = first.statistics[0];
  if (!stats) return null;

  return (
    <View style={modalStyles.grid}>
      <InfoRow label="Nom API" value={first.player.name} />
      <InfoRow label="Apparitions" value={stats.games.appearences ?? '—'} />
      <InfoRow label="Minutes" value={stats.games.minutes ?? '—'} />
      <InfoRow label="Note moy." value={stats.games.rating ?? '—'} />
      <InfoRow label="Buts" value={stats.goals.total ?? 0} />
      <InfoRow label="Passes déc." value={stats.goals.assists ?? 0} />
      <InfoRow label="Tirs cadrés" value={stats.shots.on ?? 0} />
      <InfoRow label="Passes clés" value={stats.passes.key ?? 0} />
      <InfoRow label="Précision passes" value={stats.passes.accuracy ?? '—'} />
      <InfoRow label="Tacles" value={stats.tackles.total ?? 0} />
      <InfoRow label="Interceptions" value={stats.tackles.interceptions ?? 0} />
      <InfoRow label="Duels gagnés" value={stats.duels.won ?? 0} />
      <InfoRow label="Dribbles réussis" value={stats.dribbles.success ?? 0} />
      <InfoRow label="Cartons jaunes" value={stats.cards.yellow ?? 0} />
      <InfoRow label="Cartons rouges" value={stats.cards.red ?? 0} />
      {stats.penalty.saved !== null && (
        <InfoRow label="Penalty arrêtés" value={stats.penalty.saved} />
      )}
    </View>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <View style={sectionStyles.wrap}>
      <Text style={sectionStyles.text}>{children}</Text>
    </View>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
  valueColor,
  bold = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text
        style={[
          infoStyles.value,
          mono && infoStyles.mono,
          valueColor ? { color: valueColor } : null,
          bold ? { fontWeight: '900' } : null,
        ]}
        numberOfLines={mono ? 1 : undefined}
      >
        {String(value)}
      </Text>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 28,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerLeft: { flex: 1 },
  playerName: { color: '#fff', fontSize: 28, fontWeight: '900' },
  playerMeta: { color: '#666', fontSize: 18, marginTop: 4 },
  closeBtn: { padding: 10 },
  closeBtnText: { color: '#777', fontSize: 26 },
  body: { paddingHorizontal: 28, paddingBottom: 72 },
  grid: { gap: 0 },
  alertBox: {
    marginTop: 14,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e05c5c33',
    backgroundColor: '#1a0d0d',
  },
  alertText: { color: '#e05c5c', fontSize: 16, lineHeight: 23 },
  emptyMsg: { color: '#555', fontSize: 17, fontStyle: 'italic', paddingVertical: 16 },
  fetchBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  fetchBtnText: { color: '#000', fontSize: 17, fontWeight: '800' },
  errorMsg: { color: '#e05c5c', fontSize: 17, marginTop: 10 },
});

const scoreRowStyles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 14,
    backgroundColor: '#101010',
  },
  title: { color: '#fff', fontSize: 17, fontWeight: '800' },
  meta: { color: '#666', fontSize: 14, marginTop: 2 },
  score: { marginLeft: 'auto', fontSize: 18, fontWeight: '900' },
  chevron: { color: '#555', fontSize: 14 },
  breakdown: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#0d0d0d' },
  noBreakdown: { color: '#555', fontStyle: 'italic' },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#151515',
  },
  breakdownLabel: { color: '#aaa', fontSize: 15 },
  breakdownValue: { fontSize: 15, fontWeight: '800' },
});

const sectionStyles = StyleSheet.create({
  wrap: {
    paddingTop: 28,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    marginBottom: 4,
  },
  text: { color: '#fff', fontSize: 19, fontWeight: '900' },
});

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#141414',
  },
  label: { color: '#666', fontSize: 16 },
  value: { color: '#d6d6d6', fontSize: 16, maxWidth: '60%', textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 13, color: '#999' },
});
