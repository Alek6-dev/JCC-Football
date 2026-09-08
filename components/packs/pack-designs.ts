import type { ImageSourcePropType } from 'react-native';

export type PackLayer = {
  id: string;
  source: ImageSourcePropType;
  opacity?: number;
  animated?: 'shine' | 'pulse';
};

export type PackDesign = {
  id: string;
  aspectRatio: number;
  masterSource?: ImageSourcePropType;
  layers: PackLayer[];
};

export const ligue1FreePackDesign: PackDesign = {
  id: 'ligue1-free',
  aspectRatio: 941 / 1672,
  masterSource: require('@/assets/packs/ligue1-free/pack-a-transparent-app.webp'),
  layers: [
    {
      id: 'shadow',
      source: require('@/assets/packs/ligue1-free/shadow.png'),
    },
    {
      id: 'base',
      source: require('@/assets/packs/ligue1-free/base.png'),
    },
    {
      id: 'foil',
      source: require('@/assets/packs/ligue1-free/foil.png'),
      animated: 'pulse',
    },
    {
      id: 'energy',
      source: require('@/assets/packs/ligue1-free/energy.png'),
      animated: 'pulse',
    },
    {
      id: 'shine',
      source: require('@/assets/packs/ligue1-free/shine.png'),
      opacity: 0.78,
      animated: 'shine',
    },
  ],
};
