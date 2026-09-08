import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminFilters } from '@/components/admin/AdminFilters';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminInspectorPanel } from '@/components/admin/AdminInspectorPanel';
import { AdminPlayerDetailModal } from '@/components/admin/AdminPlayerDetailModal';
import { AdminPlayersTable } from '@/components/admin/AdminPlayersTable';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  COLLECTION_STATUS_LABEL,
  matchesFilters,
  type AdminCollection,
  type AdminPlayer,
  type AdminPlayersResponse,
  type AdminSeason,
  type ApiFootballResult,
  type CollectionStatus,
  type FilterDropdown,
  type FilterOption,
  type FilterPosition,
  type FilterProblem,
  type FilterStatus,
  type PlayerScore,
} from '@/components/admin/types';
import { adminApiUrl } from '@/lib/admin-api';

export default function AdminScreen() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [seasons, setSeasons] = useState<AdminSeason[]>([]);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [selectedSeason, setSelectedSeason] = useState('2025-26');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [liveSeason, setLiveSeason] = useState('2025-26');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [filterClub, setFilterClub] = useState('all');
  const [filterProblem, setFilterProblem] = useState<FilterProblem>('all');
  const [filterPosition, setFilterPosition] = useState<FilterPosition>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [openFilter, setOpenFilter] = useState<FilterDropdown | null>(null);

  const [openClub, setOpenClub] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<AdminPlayer | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [expandedMatchday, setExpandedMatchday] = useState<number | null>(null);
  const [apiFootballData, setApiFootballData] = useState<ApiFootballResult | null>(null);
  const [apiFootballLoading, setApiFootballLoading] = useState(false);
  const [apiFootballError, setApiFootballError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedToken = window.sessionStorage.getItem('adminToken');
    if (!storedToken) {
      router.replace('/admin/login');
      return;
    }
    setToken(storedToken);
    loadPlayers(storedToken);
    // The initial admin bootstrap must run once after router/session resolution.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPlayers(tkn: string, season?: string, collectionId?: string | null) {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams();
      if (season) params.set('season', season);
      if (collectionId) params.set('collectionId', collectionId);
      const query = params.toString();
      const url = query ? adminApiUrl(`/api/admin/players?${query}`) : adminApiUrl('/api/admin/players');

      const res = await fetch(url, {
        headers: { 'X-Admin-Token': tkn },
      });
      if (!res.ok) {
        let errMsg = `Erreur ${res.status}`;
        try {
          const d = await res.json();
          errMsg = d.error ?? errMsg;
        } catch {
          // ignore non-JSON admin errors
        }
        throw new Error(errMsg);
      }

      const payload = await res.json() as AdminPlayersResponse | AdminPlayer[];
      if (Array.isArray(payload)) {
        setPlayers(payload);
        return;
      }
      setPlayers(payload.players);
      setSeasons(payload.seasons);
      setCollections(payload.collections ?? []);
      setLiveSeason(payload.liveSeason);
      setSelectedSeason(payload.selectedSeason);
      setSelectedCollectionId(payload.selectedCollectionId ?? null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setFilterClub('all');
    setFilterStatus('all');
    setFilterPosition('all');
    setFilterProblem('all');
    setOpenFilter(null);
  }

  function changeSeason(season: string) {
    if (season === selectedSeason) {
      setOpenFilter(null);
      return;
    }
    setSelectedSeason(season);
    setSelectedCollectionId(null);
    resetFilters();
    setOpenClub(null);
    setSelectedPlayer(null);
    loadPlayers(token, season, null);
  }

  function changeCollection(collectionId: string | null) {
    setSelectedCollectionId(collectionId);
    resetFilters();
    setOpenClub(null);
    setSelectedPlayer(null);
    loadPlayers(token, selectedSeason, collectionId);
  }

  async function openPlayerDetail(player: AdminPlayer) {
    setSelectedPlayer(player);
    setPlayerScores([]);
    setExpandedMatchday(null);
    setApiFootballData(null);
    setApiFootballError('');
    setScoresLoading(true);

    try {
      const res = await fetch(adminApiUrl(`/api/admin/player-scores?playerId=${player.id}`), {
        headers: { 'X-Admin-Token': token },
      });
      if (res.ok) {
        setPlayerScores(await res.json());
      }
    } finally {
      setScoresLoading(false);
    }
  }

  async function fetchApiFootball(apiId: number) {
    setApiFootballLoading(true);
    setApiFootballError('');
    setApiFootballData(null);
    try {
      const res = await fetch(adminApiUrl(`/api/admin/player-apifootball?apiFootballId=${apiId}`), {
        headers: { 'X-Admin-Token': token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
      setApiFootballData(data);
    } catch (err) {
      setApiFootballError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setApiFootballLoading(false);
    }
  }

  async function updateCollectionStatus(playerId: string, collectionStatus: CollectionStatus) {
    const previous = players;
    setPlayers(prev => prev.map(p => (
      p.id === playerId ? { ...p, collection_status: collectionStatus } : p
    )));

    try {
      const res = await fetch(adminApiUrl('/api/admin/players'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token,
        },
        body: JSON.stringify({ playerId, collectionStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Erreur ${res.status}`);
      }
    } catch (err) {
      setPlayers(previous);
      setLoadError(err instanceof Error ? err.message : 'Erreur de mise à jour du statut');
    }
  }

  const onlyPlayers = useMemo(
    () => players.filter(p => p.card_type === 'player'),
    [players]
  );
  const activePlayers = onlyPlayers.filter(p => p.collection_status === 'active');
  const hiddenPlayers = onlyPlayers.filter(p => p.collection_status === 'hidden');
  const legacyPlayers = onlyPlayers.filter(p => p.collection_status === 'legacy');
  const base50Players = onlyPlayers.filter(p => p.base_score === 50);
  const noScorePlayers = activePlayers.filter(p => p.score_count === 0);

  const clubs = useMemo(
    () => [...new Set(onlyPlayers.map(p => p.club))].sort(),
    [onlyPlayers]
  );
  const filteredPlayers = useMemo(
    () => onlyPlayers.filter(p => matchesFilters(p, filterClub, filterProblem, filterPosition, filterStatus)),
    [onlyPlayers, filterClub, filterProblem, filterPosition, filterStatus]
  );

  const playersByClub = useMemo(() => {
    const grouped: Record<string, AdminPlayer[]> = {};
    for (const player of filteredPlayers) {
      if (!grouped[player.club]) grouped[player.club] = [];
      grouped[player.club].push(player);
    }
    return grouped;
  }, [filteredPlayers]);

  const tableClubs = Object.keys(playersByClub).sort().map(club => {
    const allClubPlayers = onlyPlayers.filter(p => p.club === club);
    return {
      club,
      players: playersByClub[club],
      problemCount: allClubPlayers.filter(p => p.base_score === 50).length,
      active: allClubPlayers.filter(p => p.collection_status === 'active').length,
      total: allClubPlayers.length,
    };
  });

  const selectedSeasonLabel = selectedSeason === liveSeason ? `${selectedSeason} (Live)` : selectedSeason;
  const selectedCollection = collections.find(collection => collection.id === selectedCollectionId)
    ?? collections.find(collection => collection.is_primary)
    ?? collections[0]
    ?? null;
  const selectedCollectionLabel = selectedCollection?.name ?? `Ligue 1 ${selectedSeason}`;
  const selectedClubLabel = filterClub === 'all' ? 'Tous' : filterClub;
  const selectedStatusLabel = filterStatus === 'all' ? 'Tous' : COLLECTION_STATUS_LABEL[filterStatus];
  const selectedPositionLabel = filterPosition === 'all' ? 'Tous' : filterPosition;
  const selectedProblemLabel = filterProblem === 'all' ? 'Tous' : {
    base50: 'Score = 50',
    no_scores: '0 score',
    base50_no_scores: 'Score = 50 + 0',
    zero_minutes: '0 minute',
  }[filterProblem];

  const seasonOptions: FilterOption[] = seasons.length
    ? seasons.map(season => ({
      label: season.season === liveSeason ? `${season.season} (Live)` : season.season,
      value: season.season,
    }))
    : [{ label: selectedSeasonLabel, value: selectedSeason }];
  const collectionOptions: FilterOption[] = collections.length
    ? collections.map(collection => ({ label: collection.name, value: collection.id }))
    : [{ label: selectedCollectionLabel, value: selectedCollectionId ?? '' }];
  const clubOptions: FilterOption[] = [
    { label: 'Tous', value: 'all' },
    ...clubs.map(club => ({ label: club, value: club })),
  ];
  const statusOptions: FilterOption[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Hidden', value: 'hidden' },
    { label: 'Legacy', value: 'legacy' },
  ];
  const positionOptions: FilterOption[] = [
    { label: 'Tous', value: 'all' },
    { label: 'GK', value: 'GK' },
    { label: 'DEF', value: 'DEF' },
    { label: 'MIL', value: 'MIL' },
    { label: 'ATT', value: 'ATT' },
  ];
  const problemOptions: FilterOption[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Score = 50', value: 'base50' },
    { label: '0 score', value: 'no_scores' },
    { label: 'Score = 50 + 0', value: 'base50_no_scores' },
    { label: '0 minute', value: 'zero_minutes' },
  ];

  function toggleFilter(filter: FilterDropdown) {
    setOpenFilter(prev => prev === filter ? null : filter);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Chargement des joueurs…</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{loadError}</Text>
        <Pressable style={styles.retryBtn} onPress={() => loadPlayers(token, selectedSeason, selectedCollectionId)}>
          <Text style={styles.retryBtnText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AdminSidebar />

      <View style={styles.mainPane}>
        <AdminHeader
          selectedSeason={selectedSeason}
          liveSeason={liveSeason}
          selectedSeasonLabel={selectedSeasonLabel}
          selectedCollectionLabel={selectedCollectionLabel}
          seasonOptions={seasonOptions}
          collectionOptions={collectionOptions}
          openFilter={openFilter}
          total={onlyPlayers.length}
          active={activePlayers.length}
          hidden={hiddenPlayers.length}
          legacy={legacyPlayers.length}
          score50={base50Players.length}
          noScore={noScorePlayers.length}
          onToggleFilter={toggleFilter}
          onSelectSeason={changeSeason}
          onSelectCollection={changeCollection}
          onRefresh={() => loadPlayers(token, selectedSeason, selectedCollectionId)}
        />

        <AdminFilters
          openFilter={openFilter}
          selectedClubLabel={selectedClubLabel}
          selectedStatusLabel={selectedStatusLabel}
          selectedPositionLabel={selectedPositionLabel}
          selectedProblemLabel={selectedProblemLabel}
          clubOptions={clubOptions}
          statusOptions={statusOptions}
          positionOptions={positionOptions}
          problemOptions={problemOptions}
          onToggleFilter={toggleFilter}
          onSelectClub={(value) => {
            setFilterClub(value);
            setOpenClub(value === 'all' ? null : value);
            setOpenFilter(null);
          }}
          onSelectStatus={(value) => {
            setFilterStatus(value as FilterStatus);
            setOpenFilter(null);
          }}
          onSelectPosition={(value) => {
            setFilterPosition(value as FilterPosition);
            setOpenFilter(null);
          }}
          onSelectProblem={(value) => {
            setFilterProblem(value as FilterProblem);
            setOpenFilter(null);
          }}
          onReset={resetFilters}
        />

        <View style={styles.workspace}>
          <AdminPlayersTable
            clubs={tableClubs}
            openClub={openClub}
            selectedPlayerId={selectedPlayer?.id ?? null}
            onToggleClub={(club) => setOpenClub(openClub === club ? null : club)}
            onOpenPlayer={openPlayerDetail}
            onStatusChange={updateCollectionStatus}
          />
          {selectedPlayer ? (
            <AdminInspectorPanel
              player={selectedPlayer}
              scores={playerScores}
              scoresLoading={scoresLoading}
              onOpenFull={() => setDetailModalOpen(true)}
              onClose={() => setSelectedPlayer(null)}
              apiFootballError={apiFootballError}
            />
          ) : null}
        </View>
      </View>

      <Modal
        visible={detailModalOpen}
        animationType="slide"
        onRequestClose={() => setDetailModalOpen(false)}
      >
        {selectedPlayer && (
          <AdminPlayerDetailModal
            player={selectedPlayer}
            scores={playerScores}
            scoresLoading={scoresLoading}
            expandedMatchday={expandedMatchday}
            onToggleMatchday={(md) => setExpandedMatchday(prev => prev === md ? null : md)}
            apiFootballData={apiFootballData}
            apiFootballLoading={apiFootballLoading}
            apiFootballError={apiFootballError}
            onFetchApiFootball={() =>
              selectedPlayer.api_football_id && fetchApiFootball(selectedPlayer.api_football_id)
            }
            onClose={() => setDetailModalOpen(false)}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: '#0d1114' },
  centered: { flex: 1, backgroundColor: '#0d1114', justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: '#666', fontSize: 18 },
  errorText: { color: '#e05c5c', fontSize: 18, textAlign: 'center', paddingHorizontal: 40 },
  retryBtn: { backgroundColor: '#1e1e1e', paddingHorizontal: 26, paddingVertical: 14, borderRadius: 8 },
  retryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  mainPane: { flex: 1, minWidth: 0 },
  workspace: { flex: 1, flexDirection: 'row', gap: 14, paddingHorizontal: 14, paddingBottom: 12, minHeight: 0 },
});
