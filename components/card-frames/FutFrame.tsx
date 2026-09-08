import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import type { Rarity } from '@/components/PlayerCard';

type RarityTheme = {
  gradient: [string, string, string];
  accent: string;
  border: string;
  glow: string;
};

const THEME: Record<Rarity, RarityTheme> = {
  common: {
    gradient: ['#2e2e2e', '#1c1c1c', '#111111'],
    accent: '#b0b0b0',
    border: '#444444',
    glow: 'rgba(180,180,180,0.08)',
  },
  typic: {
    gradient: ['#1a3020', '#0f2016', '#070f0a'],
    accent: '#85D096',
    border: '#3a6a48',
    glow: 'rgba(133,208,150,0.15)',
  },
  rare: {
    gradient: ['#0f2040', '#091428', '#050a18'],
    accent: '#5C96D8',
    border: '#2a5080',
    glow: 'rgba(92,150,216,0.18)',
  },
  epic: {
    gradient: ['#20103c', '#130826', '#080412'],
    accent: '#9B59D0',
    border: '#4a2068',
    glow: 'rgba(155,89,208,0.2)',
  },
  legend: {
    gradient: ['#2e1e02', '#1c1200', '#0e0900'],
    accent: '#E4BC66',
    border: '#7a5a18',
    glow: 'rgba(228,188,102,0.25)',
  },
};

const MAX_STARS = 5;
const RARITY_STARS: Record<Rarity, number> = {
  common: 1,
  typic:  2,
  rare:   3,
  epic:   4,
  legend: 5,
};

// Boosted score visible seulement à partir de typic (rarity level 2+)
const RARITY_SHOWS_BOOST: Record<Rarity, boolean> = {
  common: false,
  typic:  true,
  rare:   true,
  epic:   true,
  legend: true,
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

export default function FutFrame({
  name,
  club,
  position,
  rarity,
  baseScore,
  boostedScore,
  imageUri,
  imageVariant = 'portrait',
  width,
  height,
}: Props) {
  const theme = THEME[rarity];
  const filledStars = RARITY_STARS[rarity];
  const parts = name.trim().split(' ');
  const firstName = parts.length > 1 ? parts[0] : null;
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : name;
  const showBoost = RARITY_SHOWS_BOOST[rarity] && boostedScore !== undefined && boostedScore !== baseScore;

  const s = makeStyles(width, height, theme);

  return (
    <View style={s.card}>
      {/* Background gradient */}
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Diagonal shine overlay */}
      <LinearGradient
        colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top glow */}
      <LinearGradient
        colors={[theme.glow, 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={s.header}>

        {/* Gauche : étoiles + score boosté (typic+) */}
        <View style={s.headerLeft}>
          <View style={s.stars}>
            {Array.from({ length: MAX_STARS }, (_, i) => (
              <Text key={i} style={i < filledStars ? s.starFilled : s.starEmpty}>★</Text>
            ))}
          </View>
          <Text style={[s.boostedScore, !showBoost && { opacity: 0 }]}>
            {boostedScore !== undefined ? boostedScore.toFixed(1) : baseScore !== undefined ? baseScore.toFixed(1) : '—'}
          </Text>
        </View>

        {/* Droite : club + position */}
        <View style={s.headerRight}>
          <Text style={s.headerClub} numberOfLines={1}>{club.toUpperCase()}</Text>
          <Text style={s.headerPosition}>{position.toUpperCase()}</Text>
        </View>

      </View>

      {/* Illustration */}
      <View style={s.illustration}>
        {imageUri ? (
          <View style={s.imageWrap}>
            <Image
              source={{ uri: imageUri }}
              style={imageVariant === 'artwork' ? s.artworkImage : s.playerImage}
              contentFit={imageVariant === 'artwork' ? 'cover' : 'contain'}
            />
          </View>
        ) : (
          <View style={s.placeholder}>
            <Text style={s.placeholderIcon}>⚽</Text>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Footer : prénom + nom + score de base */}
      <View style={s.footer}>
        {firstName && (
          <Text style={s.playerFirstName} numberOfLines={1}>{firstName.toUpperCase()}</Text>
        )}
        <Text style={s.playerName} numberOfLines={1}>{lastName.toUpperCase()}</Text>
        {baseScore !== undefined && (
          <Text style={s.baseScore}>{baseScore.toFixed(1)}</Text>
        )}
      </View>
    </View>
  );
}

function makeStyles(width: number, height: number, theme: RarityTheme) {
  const r = width / 200;

  return StyleSheet.create({
    card: {
      width,
      height,
      borderRadius: 12 * r,
      borderWidth: 1.5,
      borderColor: theme.border,
      overflow: 'hidden',
      backgroundColor: theme.gradient[2],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 14 * r,
      paddingTop: 10 * r,
      paddingBottom: 10 * r,
    },
    headerLeft: {
      alignItems: 'flex-start',
      gap: 4 * r,
    },
    stars: {
      flexDirection: 'row',
      gap: 1,
    },
    starFilled: {
      color: theme.accent,
      fontSize: 11 * r,
    },
    starEmpty: {
      color: 'rgba(255,255,255,0.15)',
      fontSize: 11 * r,
    },
    boostedScore: {
      fontSize: 16 * r,
      fontWeight: '800',
      color: theme.accent,
      letterSpacing: 0.5,
    },
    headerRight: {
      alignItems: 'flex-end',
      gap: 3 * r,
    },
    headerClub: {
      fontSize: 10 * r,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.55)',
      letterSpacing: 1.5,
      maxWidth: width * 0.45,
    },
    headerPosition: {
      fontSize: 11 * r,
      fontWeight: '700',
      color: theme.accent,
      letterSpacing: 1.5,
    },
    illustration: {
      marginHorizontal: 8 * r,
      marginTop: 0,
      height: Math.min(height * 0.4, (width - 16 * r) * (9 / 16)),
      borderRadius: 7 * r,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: '#070707',
    },
    imageWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playerImage: {
      width: '62%' as unknown as number,
      height: '75%' as unknown as number,
      mixBlendMode: 'multiply' as any,
    },
    artworkImage: {
      width: '100%' as unknown as number,
      height: '100%' as unknown as number,
    },
    placeholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderIcon: {
      fontSize: 40 * r,
      opacity: 0.4,
    },
    divider: {
      height: 1,
      marginHorizontal: 14 * r,
      marginTop: 7 * r,
      backgroundColor: theme.border,
      opacity: 0.6,
    },
    footer: {
      paddingHorizontal: 14 * r,
      paddingTop: 8 * r,
      alignItems: 'center',
      gap: 2 * r,
    },
    playerFirstName: {
      fontSize: 11 * r,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.5)',
      letterSpacing: 2,
    },
    playerName: {
      fontSize: 18 * r,
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 2,
    },
    baseScore: {
      fontSize: 26 * r,
      fontWeight: '900',
      color: '#ffffff',
      letterSpacing: 1,
    },
  });
}
