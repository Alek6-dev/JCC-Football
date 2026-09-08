import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import CollectionSlot from '@/components/CollectionSlot';
import PlayerCard from '@/components/PlayerCard';
import { getBoostedScore, getRarity } from '@/lib/game';
import { collectionService, type ClubSection } from '@/lib/services/collection-service';
import { T } from '@/lib/theme';
import type { Player } from '@/lib/types';

const HORIZONTAL_PADDING = 16;
const GRID_PADDING = 10;
const GAP = 8;
const COLUMNS = 4;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

export default function CollectionScreen() {
  const [sections, setSections] = useState<ClubSection[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [ownedDuplicates, setOwnedDuplicates] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [owned, setOwned] = useState(0);
  const [openClub, setOpenClub] = useState<string | null>(null);
  const [focusedPlayer, setFocusedPlayer] = useState<Player | null>(null);
  const [focusedDuplicates, setFocusedDuplicates] = useState(1);
  const { width } = useWindowDimensions();

  const gridWidth = width - HORIZONTAL_PADDING * 2 - GRID_PADDING * 2;
  const slotSize = Math.floor((gridWidth - GAP * (COLUMNS - 1)) / COLUMNS);

  useFocusEffect(
    useCallback(() => {
      collectionService.getCollectionAlbumData()
        .then(data => {
          setSections(data.sections);
          setOwnedIds(data.ownedIds);
          setOwnedDuplicates(data.duplicateCountsByPlayerId);
          setTotal(data.total);
          setOwned(data.owned);
        });
    }, [])
  );

  function toggleClub(club: string) {
    setOpenClub(prev => (prev === club ? null : club));
  }

  function handleSlotPress(player: Player) {
    if (!ownedIds.has(player.id)) return;
    setFocusedPlayer(player);
    setFocusedDuplicates(ownedDuplicates[player.id] ?? 1);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>

        <View style={styles.header}>
          <Text style={styles.title}>Collection</Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{owned} / {total}</Text>
          </View>
        </View>

        {sections.map(section => {
          const isOpen = openClub === section.club;
          const clubOwned = section.players.filter(p => ownedIds.has(p.id)).length;
          const isComplete = clubOwned === section.players.length && section.players.length > 0;
          const progressPct = section.players.length > 0 ? clubOwned / section.players.length : 0;
          const rows = chunkArray(section.players, COLUMNS);

          return (
            <View key={section.club} style={styles.clubBlock}>
              <Pressable
                style={[styles.clubBar, isOpen && styles.clubBarOpen]}
                onPress={() => toggleClub(section.club)}
              >
                {/* Ligne principale : nom + compteur + chevron */}
                <View style={styles.clubBarTop}>
                  <Text style={styles.clubName}>{section.club.toUpperCase()}</Text>
                  <View style={styles.clubRight}>
                    {isComplete && (
                      <View style={styles.completeBadge}>
                        <Text style={styles.completeBadgeText}>✓ Complet</Text>
                      </View>
                    )}
                    <Text style={styles.clubCounter}>{clubOwned}/{section.players.length}</Text>
                    <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>›</Text>
                  </View>
                </View>

                {/* Barre de progression */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progressPct * 100}%` as any,
                        backgroundColor: isComplete ? T.green : T.rarityRare,
                      },
                    ]}
                  />
                </View>
              </Pressable>

              {isOpen && (
                <View style={styles.grid}>
                  {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                      {row.map(player => (
                        <Pressable key={player.id} onPress={() => handleSlotPress(player)}>
                          <CollectionSlot
                            cardCode={player.club_letter && player.club_card_number
                              ? `${player.club_letter}-${player.club_card_number}`
                              : `#${player.club_card_number ?? '?'}`}
                            club={player.club}
                            name={player.name}
                            position={player.position}
                            baseScore={player.base_score}
                            rarity={ownedIds.has(player.id) ? getRarity(ownedDuplicates[player.id] ?? 1) : undefined}
                            owned={ownedIds.has(player.id)}
                            duplicateCount={ownedDuplicates[player.id] ?? 1}
                            imageUri={ownedIds.has(player.id) ? player.card_art_uri ?? player.image_uri ?? undefined : undefined}
                            imageVariant={player.card_art_uri ? 'artwork' : 'portrait'}
                            collectionStatus={player.collection_status}
                            size={slotSize}
                          />
                        </Pressable>
                      ))}
                      {row.length < COLUMNS &&
                        Array.from({ length: COLUMNS - row.length }).map((_, i) => (
                          <View key={`empty-${i}`} style={{ width: slotSize }} />
                        ))}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

      </ScrollView>

      {/* Card zoom modal */}
      <Modal
        visible={!!focusedPlayer}
        transparent
        animationType="fade"
        onRequestClose={() => setFocusedPlayer(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setFocusedPlayer(null)}>
          <Pressable onPress={() => {}}>
            {focusedPlayer && (() => {
              const cardWidth = Math.round(width * 0.75);
              const cardHeight = Math.round(cardWidth * (783 / 528));
              const rarity = getRarity(focusedDuplicates);
              return (
                <PlayerCard
                  name={focusedPlayer.name}
                  club={focusedPlayer.club}
                  position={focusedPlayer.position}
                  rarity={rarity}
                  baseScore={focusedPlayer.base_score}
                  boostedScore={getBoostedScore(focusedPlayer.base_score ?? 0, focusedDuplicates)}
                  imageUri={focusedPlayer.card_art_uri ?? focusedPlayer.image_uri ?? undefined}
                  imageVariant={focusedPlayer.card_art_uri ? 'artwork' : 'portrait'}
                  width={cardWidth}
                  height={cardHeight}
                />
              );
            })()}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bgLight,
  },
  list: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: T.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  counterBadge: {
    backgroundColor: T.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
  },
  counterText: {
    color: T.textSub,
    fontSize: 13,
    fontWeight: '700',
  },
  clubBlock: {
    marginBottom: 4,
  },
  clubBar: {
    backgroundColor: T.bgCard,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: T.border,
    gap: 8,
  },
  clubBarOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: 'transparent',
  },
  clubBarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubName: {
    color: T.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  clubRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completeBadge: {
    backgroundColor: T.greenFaint,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: T.green + '44',
  },
  completeBadgeText: {
    color: T.green,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  clubCounter: {
    color: T.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    color: T.textMuted,
    fontSize: 18,
    fontWeight: '300',
    transform: [{ rotate: '90deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '-90deg' }],
  },
  progressTrack: {
    height: 3,
    backgroundColor: T.bgDim,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  grid: {
    backgroundColor: T.bgCard,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: T.border,
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: GRID_PADDING,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
    marginBottom: GAP,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
