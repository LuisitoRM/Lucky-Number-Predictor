export type LotteryType = "baloto" | "revancha" | "powerball";

export interface LotteryConfig {
  n: number;
  maxMain: number;
  maxSpec: number;
  sumRange: [number, number];
}

export const LOTTERY_CONFIG: Record<LotteryType, LotteryConfig> = {
  baloto: { n: 5, maxMain: 43, maxSpec: 16, sumRange: [82, 137] },
  revancha: { n: 5, maxMain: 43, maxSpec: 16, sumRange: [82, 137] },
  powerball: { n: 5, maxMain: 69, maxSpec: 26, sumRange: [130, 221] },
};

function weightedChoice(numbers: number[], weights: number[], count: number): number[] {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const normalised = weights.map((w) => w / totalWeight);
  const result: number[] = [];
  const available = [...numbers];
  const availableWeights = [...normalised];

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let cumulative = 0;
    let idx = 0;
    for (let j = 0; j < availableWeights.length; j++) {
      cumulative += availableWeights[j];
      if (rand <= cumulative) {
        idx = j;
        break;
      }
    }
    result.push(available[idx]);
    available.splice(idx, 1);
    availableWeights.splice(idx, 1);
    const newTotal = availableWeights.reduce((a, b) => a + b, 0);
    for (let k = 0; k < availableWeights.length; k++) {
      availableWeights[k] /= newTotal;
    }
  }
  return result;
}

export interface PredictionInput {
  rows: Array<{ n1: number; n2: number; n3: number; n4: number; n5: number }>;
  tipo: LotteryType;
}

export interface PredictionResult {
  numeros: number[];
  especial: number;
  suma: number;
  sumaEnRangoValido: boolean;
  validSimulations: number;
  totalSimulations: number;
  basedOnDraws: number;
  metodologia: string;
}

export function runPrediction({ rows, tipo }: PredictionInput): PredictionResult {
  const cfg = LOTTERY_CONFIG[tipo];
  const ITERATIONS = 10000;

  const mainRange = Array.from({ length: cfg.maxMain }, (_, i) => i + 1);

  const counts: Record<number, number> = {};
  for (const num of mainRange) counts[num] = 1;

  for (const row of rows) {
    for (const num of [row.n1, row.n2, row.n3, row.n4, row.n5]) {
      if (num >= 1 && num <= cfg.maxMain) {
        counts[num] = (counts[num] ?? 1) + 1;
      }
    }
  }

  const weights = mainRange.map((n) => counts[n] ?? 1);

  const validCombos: string[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const pick = weightedChoice(mainRange, weights, cfg.n);
    const sum = pick.reduce((a, b) => a + b, 0);
    if (sum >= cfg.sumRange[0] && sum <= cfg.sumRange[1]) {
      validCombos.push(pick.sort((a, b) => a - b).join(","));
    }
  }

  let numeros: number[];
  if (validCombos.length === 0) {
    numeros = weightedChoice(mainRange, weights, cfg.n).sort((a, b) => a - b);
  } else {
    const freq: Record<string, number> = {};
    for (const combo of validCombos) {
      freq[combo] = (freq[combo] ?? 0) + 1;
    }
    const best = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    numeros = best.split(",").map(Number);
  }

  const suma = numeros.reduce((a, b) => a + b, 0);
  const especial = Math.floor(Math.random() * cfg.maxSpec) + 1;

  return {
    numeros,
    especial,
    suma,
    sumaEnRangoValido: suma >= cfg.sumRange[0] && suma <= cfg.sumRange[1],
    validSimulations: validCombos.length,
    totalSimulations: ITERATIONS,
    basedOnDraws: rows.length,
    metodologia: `Neural-MonteCarlo-v1.0 (${tipo}) | ${rows.length} sorteos | ${validCombos.length}/${ITERATIONS} simulaciones válidas`,
  };
}
