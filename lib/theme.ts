// Palette centralisée — thème clair pour hub/collection, sombre pour révélation
export const T = {
  // Backgrounds light (hub, collection, sélection pack)
  bgLight: '#EDF1F8',
  bgCard: '#FFFFFF',
  bgDim: '#DDE4EF',

  // Texte
  text: '#0D1421',
  textSub: '#5A6780',
  textMuted: '#9BA8BE',

  // Accentuation principale
  green: '#22C55E',
  greenDark: '#16A34A',
  greenFaint: '#EDFBF2',

  // Bordures
  border: '#E0E7F0',

  // Backgrounds sombres (révélation, récap)
  bgDark: '#08090A',

  // Raretés (inchangées)
  rarityCommon: '#b0b0b0',
  rarityTypic: '#85D096',
  rarityRare: '#5C96D8',
  rarityEpic: '#9B59D0',
  rarityLegend: '#E4BC66',
} as const;
