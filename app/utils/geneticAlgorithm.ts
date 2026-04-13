// ================================================================
// Genetic Algorithm for consensus ranking
// Distance metric: Hamming (number of positions that differ)
// Input: 20 randomly generated permutations of the candidate set
// Two criteria:
//   K1 — minimise SUM of Hamming distances to all 20 permutations
//   K2 — minimise MAX Hamming distance (worst-case among 20)
// ================================================================

export interface FlowerScore {
  name: string;
  gold: number;
  silver: number;
  bronze: number;
  count: number;
  total: number;
}

export interface GenerationLog {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  worstFitness: number;
  bestRanking: string;
}

// One row in the dual-criteria results table
export interface DualSolution {
  rowIndex: number;
  // K1 side — minimise sum of Hamming distances
  k1Ranking: string[] | null;
  k1SumValue: number | null;
  k1MaxAtK1: number | null;   // max Hamming dist at this K1 solution
  k1FoundGen: number | null;
  // K2 side — minimise max Hamming distance
  k2Ranking: string[] | null;
  k2MaxValue: number | null;
  k2SumAtK2: number | null;   // sum Hamming dist at this K2 solution
  k2FoundGen: number | null;
}

export interface DualGAResult {
  solutions: DualSolution[];
  // K1 final best
  k1BestSum: number;
  k1BestMax: number;
  k1Ranking: string[];
  k1FoundCount: number;   // how many times improvement was found
  k1SolCount: number;     // solutions with this value in final population
  // K2 final best
  k2BestMax: number;
  k2BestSum: number;
  k2Ranking: string[];
  k2FoundCount: number;
  k2SolCount: number;
}

// ----------------------------------------------------------------
// Heuristics — UNCHANGED from original project
// ----------------------------------------------------------------

export const HEURISTIC_RULES: Record<string, (f: FlowerScore) => boolean> = {
  e1: (f) => f.gold === 0 && f.silver === 0 && f.bronze === 1,
  e2: (f) => f.gold === 0 && f.silver === 1 && f.bronze === 0,
  e3: (f) => f.gold === 1 && f.silver === 0 && f.bronze === 0,
  e4: (f) => f.gold === 0 && f.silver === 0 && f.bronze === 2,
  e5: (f) => f.gold === 0 && f.silver === 1 && f.bronze === 1,
  e6: (f) => f.gold === 0 && f.silver === 0 && f.bronze >= 1,
  e7: (f) => f.silver > f.gold,
};

export function applyHeuristic(
  scores: FlowerScore[],
  heurId: string
): { kept: FlowerScore[]; removed: FlowerScore[] } {
  const rule = HEURISTIC_RULES[heurId];
  if (!rule) return { kept: scores, removed: [] };
  return {
    kept: scores.filter(f => !rule(f)),
    removed: scores.filter(f => rule(f)),
  };
}

export function applyHeuristicsSequentially(
  scores: FlowerScore[],
  heurIds: string[]
): { step: number; heurId: string; result: FlowerScore[]; removedCount: number }[] {
  const steps: { step: number; heurId: string; result: FlowerScore[]; removedCount: number }[] = [];
  let current = [...scores];

  for (let i = 0; i < heurIds.length; i++) {
    const heurId = heurIds[i];
    const { kept, removed } = applyHeuristic(current, heurId);

    if (kept.length === 0) {
      steps.push({ step: i + 1, heurId, result: [...current], removedCount: 0 });
      continue;
    }

    current = kept;
    steps.push({ step: i + 1, heurId, result: [...current], removedCount: removed.length });

    if (current.length <= 10) break;
  }

  return steps;
}

// ----------------------------------------------------------------
// Hamming distance — counts positions where two arrays differ
// ----------------------------------------------------------------
function hammingDistance(a: number[], b: number[]): number {
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

// ----------------------------------------------------------------
// Seeded random number generator (LCG) for reproducible permutations
// ----------------------------------------------------------------
function makeLCG(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// Generate `count` random permutations of [0..n-1] with a fixed seed
export function generateRandomPerms(n: number, count: number, seed = 42): number[][] {
  const rand = makeLCG(seed);
  const perms: number[][] = [];
  for (let k = 0; k < count; k++) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    perms.push(arr);
  }
  return perms;
}

// ----------------------------------------------------------------
// Fitness functions
// ----------------------------------------------------------------
function fitnessSum(perm: number[], expertPerms: number[][]): number {
  let sum = 0;
  for (const ep of expertPerms) sum += hammingDistance(perm, ep);
  return sum;
}

function fitnessMax(perm: number[], expertPerms: number[][]): number {
  let max = 0;
  for (const ep of expertPerms) {
    const d = hammingDistance(perm, ep);
    if (d > max) max = d;
  }
  return max;
}

// ----------------------------------------------------------------
// GA operators
// ----------------------------------------------------------------
function randomPerm(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
}

// Order crossover OX1
function crossoverOX(a: number[], b: number[]): number[] {
  const n = a.length;
  let p1 = Math.floor(Math.random() * n);
  let p2 = Math.floor(Math.random() * n);
  if (p1 > p2) [p1, p2] = [p2, p1];

  const child = new Array(n).fill(-1);
  for (let i = p1; i <= p2; i++) child[i] = a[i];

  const inChild = new Set(child.filter(x => x !== -1));
  let bIdx = 0;
  for (let i = 0; i < n; i++) {
    if (child[i] !== -1) continue;
    while (inChild.has(b[bIdx])) bIdx++;
    child[i] = b[bIdx];
    inChild.add(b[bIdx]);
    bIdx++;
  }
  return child;
}

// Swap mutation
function mutateSwap(perm: number[], rate: number): number[] {
  if (Math.random() > rate) return perm;
  const copy = [...perm];
  const i = Math.floor(Math.random() * copy.length);
  const j = Math.floor(Math.random() * copy.length);
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

// ----------------------------------------------------------------
// Single independent GA run
// Records every generation where a new best was found
// ----------------------------------------------------------------
interface SingleGAResult {
  bestPerm: number[];
  bestVal: number;
  improvements: Array<{ gen: number; perm: number[]; val: number }>;
  solCount: number;
}

function runSingleGA(
  n: number,
  expertPerms: number[][],
  fitFn: (p: number[], e: number[][]) => number,
  popSize = 80,
  generations = 200,
  mutRate = 0.10,
  eliteCount = 10
): SingleGAResult {
  let pop: number[][] = Array.from({ length: popSize }, () => randomPerm(n));

  let bestVal = Infinity;
  let bestPerm: number[] = [];
  const improvements: Array<{ gen: number; perm: number[]; val: number }> = [];

  for (let g = 0; g < generations; g++) {
    // Sort by fitness
    pop.sort((a, b) => fitFn(a, expertPerms) - fitFn(b, expertPerms));

    const curBest = fitFn(pop[0], expertPerms);
    if (curBest < bestVal) {
      bestVal = curBest;
      bestPerm = [...pop[0]];
      improvements.push({ gen: g + 1, perm: [...pop[0]], val: curBest });
    }

    // Next generation: elite + offspring
    const elite = pop.slice(0, eliteCount);
    const children: number[][] = [];
    while (children.length < popSize - eliteCount) {
      const pa = elite[Math.floor(Math.random() * elite.length)];
      const pb = elite[Math.floor(Math.random() * elite.length)];
      children.push(mutateSwap(crossoverOX(pa, pb), mutRate));
    }
    pop = [...elite, ...children];
  }

  // Count how many in final pop share the best value
  const solCount = pop.filter(p => fitFn(p, expertPerms) === bestVal).length;

  return { bestPerm, bestVal, improvements, solCount };
}

// ----------------------------------------------------------------
// Main export: dual-criteria GA
// ----------------------------------------------------------------
export function runDualCriteriaGA(
  candidates: FlowerScore[],
  targetSize = 10,
  nExperts = 20,
  seed = 42
): DualGAResult {
  // Top-N candidates by total score
  const pool = [...candidates]
    .sort((a, b) => b.total - a.total)
    .slice(0, targetSize);

  const n = pool.length;

  // 20 random permutations — same seed every run for reproducibility
  const expertPerms = generateRandomPerms(n, nExperts, seed);

  // K1: minimise sum of Hamming distances
  const r1 = runSingleGA(n, expertPerms, fitnessSum);

  // K2: minimise max Hamming distance
  const r2 = runSingleGA(n, expertPerms, fitnessMax);

  // Build table — one row per improvement (aligned by index)
  const maxRows = Math.max(r1.improvements.length, r2.improvements.length);
  const solutions: DualSolution[] = [];

  for (let i = 0; i < maxRows; i++) {
    const imp1 = r1.improvements[i] ?? null;
    const imp2 = r2.improvements[i] ?? null;

    solutions.push({
      rowIndex: i + 1,
      k1Ranking: imp1 ? imp1.perm.map(idx => pool[idx].name) : null,
      k1SumValue: imp1 ? imp1.val : null,
      k1MaxAtK1: imp1 ? fitnessMax(imp1.perm, expertPerms) : null,
      k1FoundGen: imp1 ? imp1.gen : null,
      k2Ranking: imp2 ? imp2.perm.map(idx => pool[idx].name) : null,
      k2MaxValue: imp2 ? imp2.val : null,
      k2SumAtK2: imp2 ? fitnessSum(imp2.perm, expertPerms) : null,
      k2FoundGen: imp2 ? imp2.gen : null,
    });
  }

  return {
    solutions,
    k1BestSum: r1.bestVal,
    k1BestMax: fitnessMax(r1.bestPerm, expertPerms),
    k1Ranking: r1.bestPerm.map(idx => pool[idx].name),
    k1FoundCount: r1.improvements.length,
    k1SolCount: r1.solCount,
    k2BestMax: r2.bestVal,
    k2BestSum: fitnessSum(r2.bestPerm, expertPerms),
    k2Ranking: r2.bestPerm.map(idx => pool[idx].name),
    k2FoundCount: r2.improvements.length,
    k2SolCount: r2.solCount,
  };
}

// ----------------------------------------------------------------
// Legacy export — kept so nothing else in the project breaks
// ----------------------------------------------------------------
export function runGeneticAlgorithm(
  candidates: FlowerScore[],
  targetSize = 10,
  opts = { popSize: 40, generations: 150, mutationRate: 0.15, eliteCount: 8 }
): { result: FlowerScore[]; log: GenerationLog[] } {
  const pool = [...candidates]
    .sort((a, b) => b.total - a.total)
    .slice(0, targetSize);

  if (pool.length <= 1) return { result: pool, log: [] };

  const n = pool.length;
  const expertPerms = generateRandomPerms(n, 20, 42);
  const { popSize, generations, mutationRate, eliteCount } = opts;

  let pop: number[][] = Array.from({ length: popSize }, () => randomPerm(n));
  const log: GenerationLog[] = [];

  const logSet = new Set<number>([
    0, 1, 2,
    ...Array.from({ length: 14 }, (_, i) => Math.round((i + 1) * generations / 15)),
    generations - 1,
  ]);

  for (let g = 0; g < generations; g++) {
    pop.sort((a, b) => fitnessSum(a, expertPerms) - fitnessSum(b, expertPerms));

    if (logSet.has(g)) {
      const fits = pop.map(p => fitnessSum(p, expertPerms));
      const best = fits[0];
      const worst = fits[fits.length - 1];
      const avg = fits.reduce((s, f) => s + f, 0) / fits.length;
      log.push({
        generation: g + 1,
        bestFitness: Math.round(best * 10) / 10,
        avgFitness: Math.round(avg * 10) / 10,
        worstFitness: Math.round(worst * 10) / 10,
        bestRanking: pop[0].slice(0, 5).map(i => pool[i].name).join(' > '),
      });
    }

    const elite = pop.slice(0, eliteCount);
    const children: number[][] = [];
    while (children.length < popSize - eliteCount) {
      const pa = elite[Math.floor(Math.random() * elite.length)];
      const pb = elite[Math.floor(Math.random() * elite.length)];
      children.push(mutateSwap(crossoverOX(pa, pb), mutationRate));
    }
    pop = [...elite, ...children];
  }

  return { result: pop[0].map(i => pool[i]), log };
}

export function capToMaxSize(scores: FlowerScore[], maxSize = 10): FlowerScore[] {
  if (scores.length <= maxSize) return scores;
  return [...scores].sort((a, b) => b.total - a.total).slice(0, maxSize);
}
