import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import type { Rarity } from '@/components/PlayerCard';

const FRAME_SOURCE: Record<Rarity, number> = {
  common: require('../../assets/card-frames/holographic/base-frame.webp'),
  typic: require('../../assets/card-frames/holographic/typic-frame.webp'),
  rare: require('../../assets/card-frames/holographic/rare-frame.webp'),
  epic: require('../../assets/card-frames/holographic/epic-frame.webp'),
  legend: require('../../assets/card-frames/holographic/legend-frame.webp'),
};

const FRAME_WIDTH = 528;
const FRAME_HEIGHT = 783;

const RARITY_LABEL: Record<Rarity, string> = {
  common: 'BASE',
  typic: 'TYPIC',
  rare: 'RARE',
  epic: 'EPIC',
  legend: 'LEGEND',
};

const RARITY_ACCENT: Record<Rarity, string> = {
  common: '#c8c8c8',
  typic: '#85D096',
  rare: '#5C96D8',
  epic: '#9B59D0',
  legend: '#E4BC66',
};

type ZoneAdjustment = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontSize?: number;
};

type FrameAdjustment = {
  rarity?: ZoneAdjustment;
  artwork?: ZoneAdjustment;
  score?: ZoneAdjustment;
  club?: ZoneAdjustment;
  name?: ZoneAdjustment;
  position?: ZoneAdjustment;
};

// Reglages fins par rarete, en pixels sur le template source 528x783.
// BASE et TYPIC sont les references actuelles, donc on les laisse a zero.
// Exemple: score: { x: 2, y: -1 } deplace uniquement le score de 2px a droite et 1px vers le haut.
const FRAME_ADJUSTMENTS: Record<Rarity, FrameAdjustment> = {
  common: {  
  rarity: {x: 1, y: -1},
  score: { y: 4 },
  club: { x: 0, y: 7 },
  name: { x: -2, fontSize: -1 },
  position: { y: 1 },
},
  typic: {
  rarity: {x: 1, y: 0},  
  score: { y: 4 },
  club: { x: -1, y: -2  },
  name: { x: -2, fontSize: -1 },
  position: { y: 1 },
},
  rare: {  
  rarity: {x: 3, y: -5},
  score: { y: 1 },
  club: { x: 1 },
  name: { x: -2, fontSize: -1 },
  position: { y: 1 },
},
  epic: {  
  rarity: {x: 2, y: 0},
  score: { y: 7 },
  club: { x: 1 },
  name: { x: -2, fontSize: -1 },
  position: { y: 1 },
},
  legend: {  
  rarity: {x: 3, y: -4},
  score: { y: 7 },
  club: { x: 1 },
  name: { x: -2, fontSize: -1 },
  position: { y: 1 },
},
};

type Props = {
  name: string;
  club: string;
  position: string;
  rarity: Rarity;
  baseScore?: number;
  boostedScore?: number;
  imageUri?: string;
  imageVariant?: 'portrait' | 'artwork';
  width: number;
  height: number;
};

function formatPosition(position: string): string {
  const p = position.trim().toLowerCase();
  if (p.includes('goal') || p === 'gk' || p === 'g') return 'GK';
  if (p.includes('def') || p === 'd') return 'DEF';
  if (p.includes('mid') || p.includes('mil') || p === 'm') return 'MIL';
  return 'ATT';
}

function getNameSize(name: string, r: number): number {
  const length = name.trim().length;
  if (length >= 24) return 16 * r;
  if (length >= 18) return 18 * r;
  if (length >= 14) return 21 * r;
  if (length >= 10) return 31 * r;
  return 42 * r;
}

export default function HoloFrame({
  name,
  club,
  position,
  rarity,
  baseScore,
  boostedScore,
  imageUri,
  imageVariant = 'artwork',
  width,
  height,
}: Props) {
  const rX = width / FRAME_WIDTH;
  const rY = height / FRAME_HEIGHT;
  const r = Math.min(rX, rY);
  const accent = RARITY_ACCENT[rarity];
  const score = baseScore ?? boostedScore;
  const s = makeStyles(width, height, rX, rY, r, accent, name, FRAME_ADJUSTMENTS[rarity]);

  return (
    <View style={s.card}>
      <Image source={FRAME_SOURCE[rarity]} style={StyleSheet.absoluteFill} contentFit="fill" />

      <Text style={s.rarity} numberOfLines={1}>
        {RARITY_LABEL[rarity]}
      </Text>

      <View style={s.artworkWindow}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={imageVariant === 'artwork' ? s.artworkImage : s.portraitImage}
            contentFit={imageVariant === 'artwork' ? 'cover' : 'contain'}
          />
        ) : (
          <Text style={s.placeholder}>⚽</Text>
        )}
      </View>

      {score !== undefined && (
        <Text style={s.score} numberOfLines={1}>
          {score.toFixed(1)}
        </Text>
      )}

      <Text style={s.club} numberOfLines={1}>
        {club.toUpperCase()}
      </Text>

      <Text style={s.name} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.62}>
        {name.toUpperCase()}
      </Text>

      <Text style={s.position} numberOfLines={1}>
        {formatPosition(position)}
      </Text>
    </View>
  );
}

function dx(value: number, adjustment: ZoneAdjustment | undefined): number {
  return value + (adjustment?.x ?? 0);
}

function dy(value: number, adjustment: ZoneAdjustment | undefined): number {
  return value + (adjustment?.y ?? 0);
}

function dw(value: number, adjustment: ZoneAdjustment | undefined): number {
  return value + (adjustment?.width ?? 0);
}

function dh(value: number, adjustment: ZoneAdjustment | undefined): number {
  return value + (adjustment?.height ?? 0);
}

function df(value: number, adjustment: ZoneAdjustment | undefined): number {
  return value + (adjustment?.fontSize ?? 0);
}

function makeStyles(
  width: number,
  height: number,
  rX: number,
  rY: number,
  r: number,
  accent: string,
  name: string,
  adjustments: FrameAdjustment
) {
  return StyleSheet.create({
    card: {
      width,
      height,
      borderRadius: 44 * r,
      overflow: 'hidden',
      backgroundColor: '#070707',
    },
    rarity: {
      position: 'absolute',
      top: dy(110, adjustments.rarity) * rY,
      left: dx(119, adjustments.rarity) * rX,
      width: dw(290, adjustments.rarity) * rX,
      color: accent,
      fontFamily: 'serif',
      fontSize: df(38, adjustments.rarity) * r,
      fontWeight: '600',
      letterSpacing: 7 * r,
      lineHeight: 48 * r,
      textAlign: 'center',
      textShadowColor: 'rgba(255,255,255,0.35)',
      textShadowOffset: { width: 0, height: 1 * r },
      textShadowRadius: 3 * r,
    },
    artworkWindow: {
      position: 'absolute',
      left: dx(43, adjustments.artwork) * rX,
      top: dy(184, adjustments.artwork) * rY,
      width: dw(430, adjustments.artwork) * rX,
      height: dh(316, adjustments.artwork) * rY,
      borderRadius: 17 * r,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#111111',
    },
    artworkImage: {
      width: '100%',
      height: '100%',
    },
    portraitImage: {
      width: '70%',
      height: '86%',
      mixBlendMode: 'multiply' as any,
    },
    placeholder: {
      color: 'rgba(255,255,255,0.18)',
      fontSize: 44 * r,
    },
    score: {
      position: 'absolute',
      top: dy(533, adjustments.score) * rY,
      left: dx(176, adjustments.score) * rX,
      width: dw(176, adjustments.score) * rX,
      color: accent,
      fontFamily: 'serif',
      fontSize: df(42, adjustments.score) * r,
      fontWeight: '500',
      lineHeight: 55 * r,
      textAlign: 'center',
      textShadowColor: 'rgba(255,255,255,0.25)',
      textShadowOffset: { width: 0, height: 1 * r },
      textShadowRadius: 2 * r,
    },
    club: {
      position: 'absolute',
      top: dy(708, adjustments.club) * rY,
      left: dx(38, adjustments.club) * rX,
      width: dw(105, adjustments.club) * rX,
      color: '#f4e7ca',
      fontFamily: 'serif',
      fontSize: df(16, adjustments.club) * r,
      fontWeight: '700',
      letterSpacing: 2 * r,
      textAlign: 'center',
    },
    name: {
      position: 'absolute',
      top: dy(652, adjustments.name) * rY,
      left: dx(112, adjustments.name) * rX,
      width: dw(300, adjustments.name) * rX,
      color: '#f6e7c4',
      fontFamily: 'serif',
      fontSize: getNameSize(name, r) + (adjustments.name?.fontSize ?? 0) * r,
      fontWeight: '700',
      letterSpacing: name.length >= 14 ? 0.4 * r : 3 * r,
      lineHeight: 54 * r,
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.7)',
      textShadowOffset: { width: 0, height: 2 * r },
      textShadowRadius: 2 * r,
    },
    position: {
      position: 'absolute',
      top: dy(650, adjustments.position) * rY,
      left: dx(401, adjustments.position) * rX,
      width: dw(74, adjustments.position) * rX,
      color: '#f6e7c4',
      fontFamily: 'serif',
      fontSize: df(23, adjustments.position) * r,
      fontWeight: '700',
      letterSpacing: 1 * r,
      textAlign: 'center',
    },
  });
}
