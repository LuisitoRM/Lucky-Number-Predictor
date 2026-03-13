export type LotteryType = "baloto" | "revancha" | "powerball";

export interface LotteryConfig {
  n: number;
  maxMain: number;
  maxSpec: number;
  sumRange: [number, number];
}

export const LOTTERY_CONFIG: Record<LotteryType, LotteryConfig> = {
  baloto:    { n: 5, maxMain: 43, maxSpec: 16, sumRange: [82, 137] },
  revancha:  { n: 5, maxMain: 43, maxSpec: 16, sumRange: [82, 137] },
  powerball: { n: 5, maxMain: 69, maxSpec: 26, sumRange: [130, 221] },
};

/**
 * Selects `count` unique numbers from `numbers[]` using weighted sampling
 * without replacement. Weights are re-normalised after each draw.
 *
 * Bug fix v2: defaults idx to last element when floating-point drift causes
 * cumulative sum to fall short of rand (was silently biasing toward index 0).
 */
function weightedChoice(numbers: number[], weights: number[], count: number): number[] {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const normalised = weights.map((w) => w / totalWeight);

  const result: number[] = [];
  const available = [...numbers];
  const availableWeights = [...normalised];

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let cumulative = 0;
    let idx = availableWeights.length - 1;
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
    if (newTotal > 0) {
      for (let k = 0; k < availableWeights.length; k++) {
        availableWeights[k] /= newTotal;
      }
    }
  }
  return result;
}

export interface PredictionInput {
  rows: Array<{
    n1: number; n2: number; n3: number; n4: number; n5: number;
    especial: number;
  }>;
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
  hotNumbers: number[];
  coldNumbers: number[];
  gapEspecial: number;
}

const RECENCY_DECAY = 0.997;
const ITERATIONS = 50_000;

export function runPrediction({ rows, tipo }: PredictionInput): PredictionResult {
  const cfg = LOTTERY_CONFIG[tipo];

  const mainRange = Array.from({ length: cfg.maxMain }, (_, i) => i + 1);
  const specRange  = Array.from({ length: cfg.maxSpec  }, (_, i) => i + 1);

  const mainCounts: Record<number, number> = {};
  const specCounts: Record<number, number> = {};
  for (const n of mainRange) mainCounts[n] = 1;
  for (const n of specRange)  specCounts[n] = 1;

  let totalEven = 0;
  let totalOdd  = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const decay = Math.pow(RECENCY_DECAY, i);

    for (const num of [row.n1, row.n2, row.n3, row.n4, row.n5]) {
      if (num >= 1 && num <= cfg.maxMain) {
        mainCounts[num] += decay;
        if (num % 2 === 0) totalEven += decay;
        else               totalOdd  += decay;
      }
    }

    if (row.especial >= 1 && row.especial <= cfg.maxSpec) {
      specCounts[row.especial] += decay;
    }
  }

  const mainWeights = mainRange.map((n) => mainCounts[n]);
  const specWeights = specRange.map((n) => specCounts[n]);

  const totalParidad = totalEven + totalOdd;
  const targetEven   = Math.round((totalEven / totalParidad) * cfg.n);

  const decadeSize = Math.ceil(cfg.maxMain / 4);
  const maxPerDecade = Math.ceil(cfg.n * 0.7);

  const validCombos: string[] = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const pick = weightedChoice(mainRange, mainWeights, cfg.n);
    const sum  = pick.reduce((a, b) => a + b, 0);

    if (sum < cfg.sumRange[0] || sum > cfg.sumRange[1]) continue;

    const evenCount = pick.filter((n) => n % 2 === 0).length;
    if (Math.abs(evenCount - targetEven) > 1) continue;

    const decadeCounts: Record<number, number> = {};
    let exceedsDecade = false;
    for (const n of pick) {
      const decade = Math.floor((n - 1) / decadeSize);
      decadeCounts[decade] = (decadeCounts[decade] ?? 0) + 1;
      if (decadeCounts[decade] > maxPerDecade) { exceedsDecade = true; break; }
    }
    if (exceedsDecade) continue;

    validCombos.push(pick.sort((a, b) => a - b).join(","));
  }

  let numeros: number[];

  if (validCombos.length === 0) {
    numeros = weightedChoice(mainRange, mainWeights, cfg.n).sort((a, b) => a - b);
  } else {
    const freq: Record<string, number> = {};
    for (const combo of validCombos) {
      freq[combo] = (freq[combo] ?? 0) + 1;
    }
    const topPool = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([combo]) => combo);
    const chosen = topPool[Math.floor(Math.random() * topPool.length)];
    numeros = chosen.split(",").map(Number);
  }

  const suma     = numeros.reduce((a, b) => a + b, 0);
  const especial = weightedChoice(specRange, specWeights, 1)[0];

  const avgMain = (mainWeights.reduce((a, b) => a + b, 0)) / mainRange.length;
  const hotNumbers  = mainRange
    .filter((n) => mainCounts[n] > avgMain * 1.15)
    .sort((a, b) => mainCounts[b] - mainCounts[a])
    .slice(0, 8);
  const coldNumbers = mainRange
    .filter((n) => mainCounts[n] < avgMain * 0.85)
    .sort((a, b) => mainCounts[a] - mainCounts[b])
    .slice(0, 8);

  let gapEspecial = 0;
  for (const row of rows) {
    if (row.especial === especial) break;
    gapEspecial++;
  }

  return {
    numeros,
    especial,
    suma,
    sumaEnRangoValido: suma >= cfg.sumRange[0] && suma <= cfg.sumRange[1],
    validSimulations:  validCombos.length,
    totalSimulations:  ITERATIONS,
    basedOnDraws:      rows.length,
    metodologia: `Neural-MonteCarlo-v2.0 (${tipo}) | ${rows.length} sorteos | decay=${RECENCY_DECAY} | par/impar + décadas | ${validCombos.length}/${ITERATIONS} sim. válidas`,
    hotNumbers,
    coldNumbers,
    gapEspecial,
  };
}
