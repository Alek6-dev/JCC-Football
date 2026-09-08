import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';

import HomeHub from '@/components/home/HomeHub';
import { ligue1FreePackDesign } from '@/components/packs/pack-designs';
import { getLiveRechargeStatus } from '@/components/packs/pack-time';
import PackRevealScreen from '@/components/packs/PackRevealScreen';
import PackSelectScreen from '@/components/packs/PackSelectScreen';
import PackSummaryScreen from '@/components/packs/PackSummaryScreen';
import type { DrawnCard, PackStatus } from '@/components/packs/types';
import { useAuth } from '@/lib/auth-context';
import { packService } from '@/lib/services/pack-service';
import type { Player } from '@/lib/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<Player[]>([]);
  const [packStatus, setPackStatus] = useState<PackStatus>({
    remaining: 0,
    max: 2,
    nextPackAt: null,
    secondsUntilNext: 0,
    rechargeProgress: 1,
  });
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [pack, setPack] = useState<DrawnCard[]>([]);
  const [cardIndex, setCardIndex] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showPackSelect, setShowPackSelect] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const livePackStatus = getLiveRechargeStatus(packStatus, nowMs);
  const freePacks = livePackStatus.remaining;
  const maxDailyPacks = livePackStatus.max;

  async function refreshPackStatus() {
    const status = await packService.getPackStatus();
    setPackStatus(status);
  }

  useEffect(() => {
    if (ligue1FreePackDesign.masterSource) {
      Asset.fromModule(ligue1FreePackDesign.masterSource as number).downloadAsync().catch(() => {});
    }
    packService.loadPackCatalog().then(setCatalog).catch(() => setCatalog([]));
    refreshPackStatus();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!packStatus.nextPackAt || livePackStatus.secondsUntilNext > 0) return;
    refreshPackStatus();
  }, [livePackStatus.secondsUntilNext, packStatus.nextPackAt]);

  async function savePackToCollection(cards: DrawnCard[]) {
    if (!user) return;
    try {
      await packService.saveDrawnPackToCollection(cards);
    } catch {
      setSaveError(true);
    }
  }

  async function openPack() {
    if (catalog.length === 0 || freePacks <= 0) return;
    setSaveError(false);

    const remaining = await packService.useFreePack();
    if (remaining === -1) {
      await refreshPackStatus();
      return;
    }
    await refreshPackStatus();

    const drawnWithPrev = await packService.drawPackForReveal(catalog);

    setPack(drawnWithPrev);
    setShowPackSelect(false);
    setCardIndex(0);
    savePackToCollection(drawnWithPrev);
  }

  if (showSummary && pack.length > 0) {
    return (
      <PackSummaryScreen
        pack={pack}
        onDone={() => { setShowSummary(false); setPack([]); }}
      />
    );
  }

  if (cardIndex !== null && pack[cardIndex]) {
    return (
      <PackRevealScreen
        pack={pack}
        cardIndex={cardIndex}
        onNext={() => {
          if (cardIndex < pack.length - 1) {
            setCardIndex(cardIndex + 1);
          } else {
            setCardIndex(null);
            setShowSummary(true);
          }
        }}
      />
    );
  }

  if (showPackSelect) {
    return (
      <PackSelectScreen
        freePacks={freePacks}
        maxDailyPacks={maxDailyPacks}
        onOpen={openPack}
        onBack={() => setShowPackSelect(false)}
      />
    );
  }

  return (
    <HomeHub
      packStatus={livePackStatus}
      freePacks={freePacks}
      catalogReady={catalog.length > 0}
      saveError={saveError}
      onOpenPack={() => setShowPackSelect(true)}
    />
  );
}
