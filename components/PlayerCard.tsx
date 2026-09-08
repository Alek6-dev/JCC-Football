import { ActiveFrame } from '@/components/card-frames';

export type Rarity = 'common' | 'typic' | 'rare' | 'epic' | 'legend';

type Props = {
  name: string;
  club: string;
  position: string;
  rarity: Rarity;
  baseScore?: number;
  boostedScore?: number;
  imageUri?: string;
  imageVariant?: 'portrait' | 'artwork';
  width?: number;
  height?: number;
};

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = Math.round(DEFAULT_WIDTH * (783 / 528));

export default function PlayerCard({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  ...props
}: Props) {
  return <ActiveFrame width={width} height={height} {...props} />;
}
