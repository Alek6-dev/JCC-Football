/**
 * Bareme fantasy JCC Football.
 *
 * C'est le fichier a modifier quand tu veux tester l'equilibrage du jeu.
 * Le moteur dans `lib/scoring.ts` lit ces valeurs et les applique.
 */
export const SCORING_CONFIG = {
  participation: {
    starter: 3,
    fullGameBonus: 0.5,
    subEntered: 1,
    fullGameMinutes: 90,
  },

  attack: {
    goal: 20,
    penaltyScored: 20,
    shotOnTarget: 4,
    assist: 12,
    keyPass: 4,
    cross: 2,
    dribbleSuccess: 2,
    foulDrawn: 1,
    penaltyWon: 5,
  },

  defense: {
    tackle: 3,
    interception: 3,
    clearance: 1,
    shotBlocked: 4,
    duelWon: 1,
    duelLost: -1,
    dribblePast: -1,
  },

  goalkeeper: {
    save: 4,
    penaltySaved: 15,
    goalConceded: -5,
  },

  sanctions: {
    foulCommitted: -2,
    yellowCard: -5,
    redCard: -20,
    penaltyCommitted: -12,
    penaltyMissed: -10,
  },

  // Index 0 = <50%, puis 50-54, 55-59, ..., 95-100.
  passAccuracy: [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10],

  collective: {
    result: {
      win: 5,
      draw: 2,
      loss: 0,
    },
    goalsScored: [-1, 0, 1, 3, 6],
    goalsConceded: [3, 0.5, -0.5, -1.5, -3],
  },
} as const;
