export type FormationId = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1' | '3-4-3';

export type FormationSlot = {
  id: string;
  label: string;
  x: number;
  y: number;
};

type FormationLine = {
  id: string;
  y: number;
  labels: string[];
  x?: number[];
};

const FORMATIONS: Record<FormationId, FormationLine[]> = {
  '4-3-3': [
    { id: 'attack', y: 23, labels: ['AG', 'BU', 'AD'] },
    { id: 'midfield', y: 43, labels: ['MC', 'MC', 'MC'] },
    { id: 'defense', y: 64, labels: ['DG', 'DC', 'DC', 'DD'] },
    { id: 'goalkeeper', y: 88, labels: ['G'], x: [50] },
  ],
  '4-4-2': [
    { id: 'attack', y: 24, labels: ['BU', 'BU'], x: [38, 62] },
    { id: 'midfield', y: 44, labels: ['MG', 'MC', 'MC', 'MD'] },
    { id: 'defense', y: 64, labels: ['DG', 'DC', 'DC', 'DD'] },
    { id: 'goalkeeper', y: 88, labels: ['G'], x: [50] },
  ],
  '3-5-2': [
    { id: 'attack', y: 24, labels: ['BU', 'BU'], x: [38, 62] },
    { id: 'midfield', y: 45, labels: ['MG', 'MC', 'MOC', 'MC', 'MD'] },
    { id: 'defense', y: 65, labels: ['DC', 'DC', 'DC'], x: [28, 50, 72] },
    { id: 'goalkeeper', y: 88, labels: ['G'], x: [50] },
  ],
  '4-2-3-1': [
    { id: 'attack', y: 22, labels: ['BU'], x: [50] },
    { id: 'attacking-midfield', y: 38, labels: ['AG', 'MOC', 'AD'] },
    { id: 'midfield', y: 53, labels: ['MDC', 'MDC'], x: [38, 62] },
    { id: 'defense', y: 68, labels: ['DG', 'DC', 'DC', 'DD'] },
    { id: 'goalkeeper', y: 88, labels: ['G'], x: [50] },
  ],
  '3-4-3': [
    { id: 'attack', y: 23, labels: ['AG', 'BU', 'AD'] },
    { id: 'midfield', y: 45, labels: ['MG', 'MC', 'MC', 'MD'] },
    { id: 'defense', y: 65, labels: ['DC', 'DC', 'DC'], x: [28, 50, 72] },
    { id: 'goalkeeper', y: 88, labels: ['G'], x: [50] },
  ],
};

export const FORMATION_IDS = Object.keys(FORMATIONS) as FormationId[];

export function getFormationSlots(formation: FormationId): FormationSlot[] {
  return FORMATIONS[formation].flatMap((line) => {
    const xPositions = line.x ?? distributeX(line.labels.length);

    return line.labels.map((label, index) => ({
      id: `${formation}-${line.id}-${index}`,
      label,
      x: xPositions[index],
      y: line.y,
    }));
  });
}

function distributeX(count: number) {
  if (count === 1) return [50];
  if (count === 2) return [35, 65];
  if (count === 3) return [24, 50, 76];
  if (count === 4) return [12, 37, 63, 88];
  if (count === 5) return [10, 30, 50, 70, 90];

  const gap = 80 / Math.max(count - 1, 1);
  return Array.from({ length: count }, (_, index) => 10 + gap * index);
}
