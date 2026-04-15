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

export interface DualSolution {
  rowIndex: number;
  k1Ranking: string[] | null;
  k1SumValue: number | null;
  k1MaxAtK1: number | null;
  k1FoundGen: number | null;
  k2Ranking: string[] | null;
  k2MaxValue: number | null;
  k2SumAtK2: number | null;
  k2FoundGen: number | null;
}

export interface DualGAResult {
  solutions: DualSolution[];
  // K1 final best
  k1BestSum: number;
  k1BestMax: number;
  k1Ranking: string[];
  k1SolCount: number;   // кількість знайдених унікальних розв'язків К1
  // K2 final best
  k2BestMax: number;
  k2BestSum: number;
  k2Ranking: string[];
  k2SolCount: number;   // кількість знайдених унікальних розв'язків К2
}

// ----------------------------------------------------------------
// Heuristics — UNCHANGED
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
// Seeded LCG
// ----------------------------------------------------------------
function makeLCG(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// ----------------------------------------------------------------
// Hamming distance
// ----------------------------------------------------------------
function hammingDistance(a: number[], b: number[]): number {
  let dist = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) dist++;
  return dist;
}

// ----------------------------------------------------------------
// Генерація nExperts випадкових перестановок
// ----------------------------------------------------------------
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
function seededRandomPerm(n: number, rand: () => number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// OX crossover
function crossoverOX(a: number[], b: number[], rand: () => number): number[] {
  const n = a.length;
  let p1 = Math.floor(rand() * n);
  let p2 = Math.floor(rand() * n);
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

// Insert mutation
function mutateInsert(perm: number[], rate: number, rand: () => number): number[] {
  if (rand() > rate) return perm;
  const copy = [...perm];
  const n = copy.length;
  const i = Math.floor(rand() * n);
  let j = Math.floor(rand() * n);
  while (j === i) j = Math.floor(rand() * n);
  const [el] = copy.splice(i, 1);
  copy.splice(j, 0, el);
  return copy;
}

// Турнірна селекція
function tournamentSelect(
  pop: number[][],
  fits: number[],
  k: number,
  rand: () => number
): number[] {
  let bestIdx = Math.floor(rand() * pop.length);
  for (let i = 1; i < k; i++) {
    const idx = Math.floor(rand() * pop.length);
    if (fits[idx] < fits[bestIdx]) bestIdx = idx;
  }
  return pop[bestIdx];
}

// ----------------------------------------------------------------
// Single GA run
// solutions = всі унікальні перестановки що досягли поточного оптимуму
// (нова перестановка з тим самим значенням теж записується як окремий рядок)
// ----------------------------------------------------------------
interface SingleGAResult {
  bestPerm: number[];
  bestVal: number;
  solutions: Array<{ gen: number; perm: number[]; val: number }>;
  solCount: number;
}

function runSingleGA(
  n: number,
  expertPerms: number[][],
  fitFn: (p: number[], e: number[][]) => number,
  popSize = 50,
  generations = 200,
  mutRate = 0.20,
  eliteCount = 2,
  tournamentK = 3,
  seed = 12345
): SingleGAResult {
  const rand = makeLCG(seed);

  let pop: number[][] = Array.from({ length: popSize }, () => seededRandomPerm(n, rand));

  let bestVal = Infinity;
  let bestPerm: number[] = [];
  const solutions: Array<{ gen: number; perm: number[]; val: number }> = [];
  const seenPerms = new Set<string>();

  for (let g = 0; g < generations; g++) {
    const fits = pop.map(p => fitFn(p, expertPerms));

    let minFit = Infinity;
    let minIdx = 0;
    for (let i = 0; i < fits.length; i++) {
      if (fits[i] < minFit) { minFit = fits[i]; minIdx = i; }
    }

    if (minFit < bestVal) {
      // Строго краще — новий рівень, скидаємо seen
      bestVal = minFit;
      bestPerm = [...pop[minIdx]];
      seenPerms.clear();
      const key = pop[minIdx].join(',');
      seenPerms.add(key);
      solutions.push({ gen: g + 1, perm: [...pop[minIdx]], val: minFit });
    } else if (minFit === bestVal) {
      // Та сама якість — записуємо якщо перестановка нова
      const key = pop[minIdx].join(',');
      if (!seenPerms.has(key)) {
        seenPerms.add(key);
        bestPerm = [...pop[minIdx]];
        solutions.push({ gen: g + 1, perm: [...pop[minIdx]], val: minFit });
      }
    }

    const sortedIdx = fits
      .map((f, i) => ({ f, i }))
      .sort((a, b) => a.f - b.f)
      .map(e => e.i);

    const elite = sortedIdx.slice(0, eliteCount).map(i => [...pop[i]]);

    const children: number[][] = [];
    while (children.length < popSize - eliteCount) {
      const pa = tournamentSelect(pop, fits, tournamentK, rand);
      const pb = tournamentSelect(pop, fits, tournamentK, rand);
      const child = crossoverOX(pa, pb, rand);
      children.push(mutateInsert(child, mutRate, rand));
    }

    pop = [...elite, ...children];
  }

  // Унікальні оптимальні у фінальній популяції
  const finalFits = pop.map(p => fitFn(p, expertPerms));
  const uniqueOptimal = new Set(
    pop.filter((_, i) => finalFits[i] === bestVal).map(p => p.join(','))
  ).size;

  return { bestPerm, bestVal, solutions, solCount: uniqueOptimal };
}

// ----------------------------------------------------------------
// Main export: dual-criteria GA
// 20 експертів генерують перестановки по 10 об'єктів.
// Seed для популяції — випадковий (Date.now) при кожному запуску,
// seed для експертних перестановок — фіксований (42) щоб вхідні
// дані були стабільними між запусками.
// ----------------------------------------------------------------
export function runDualCriteriaGA(
  candidates: FlowerScore[],
  targetSize = 10,
  nExperts = 20,
  expertSeed = 42
): DualGAResult {
  const pool = [...candidates]
    .sort((a, b) => b.total - a.total)
    .slice(0, targetSize);

  const n = pool.length;

  // 20 експертних перестановок — фіксований seed, щоб вхідні дані не змінювались
  const expertPerms = generateRandomPerms(n, nExperts, expertSeed);

  // Випадкові seed для популяцій — різний результат при кожному запуску
  const now = Date.now();
  const r1 = runSingleGA(n, expertPerms, fitnessSum, 50, 200, 0.20, 2, 3, now ^ 0xABCD);
  const r2 = runSingleGA(n, expertPerms, fitnessMax, 50, 200, 0.20, 2, 3, now ^ 0x1234);

  const maxRows = Math.max(r1.solutions.length, r2.solutions.length);
  const solutions: DualSolution[] = [];

  for (let i = 0; i < maxRows; i++) {
    const s1 = r1.solutions[i] ?? null;
    const s2 = r2.solutions[i] ?? null;
    solutions.push({
      rowIndex: i + 1,
      k1Ranking: s1 ? s1.perm.map(idx => pool[idx].name) : null,
      k1SumValue: s1 ? s1.val : null,
      k1MaxAtK1: s1 ? fitnessMax(s1.perm, expertPerms) : null,
      k1FoundGen: s1 ? s1.gen : null,
      k2Ranking: s2 ? s2.perm.map(idx => pool[idx].name) : null,
      k2MaxValue: s2 ? s2.val : null,
      k2SumAtK2: s2 ? fitnessSum(s2.perm, expertPerms) : null,
      k2FoundGen: s2 ? s2.gen : null,
    });
  }

  return {
    solutions,
    k1BestSum: r1.bestVal,
    k1BestMax: fitnessMax(r1.bestPerm, expertPerms),
    k1Ranking: r1.bestPerm.map(idx => pool[idx].name),
    k1SolCount: r1.solCount,
    k2BestMax: r2.bestVal,
    k2BestSum: fitnessSum(r2.bestPerm, expertPerms),
    k2Ranking: r2.bestPerm.map(idx => pool[idx].name),
    k2SolCount: r2.solCount,
  };
}

// ----------------------------------------------------------------
// Legacy export — незмінний
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

  const rand = makeLCG(Date.now() ^ 0x9999);
  let pop: number[][] = Array.from({ length: popSize }, () => seededRandomPerm(n, rand));
  const log: GenerationLog[] = [];

  const logSet = new Set<number>([
    0, 1, 2,
    ...Array.from({ length: 14 }, (_, i) => Math.round((i + 1) * generations / 15)),
    generations - 1,
  ]);

  for (let g = 0; g < generations; g++) {
    const fits = pop.map(p => fitnessSum(p, expertPerms));
    const sortedIdx = fits.map((f, i) => ({ f, i })).sort((a, b) => a.f - b.f).map(e => e.i);
    pop = sortedIdx.map(i => pop[i]);
    const sortedFits = sortedIdx.map(i => fits[i]);

    if (logSet.has(g)) {
      const best = sortedFits[0], worst = sortedFits[sortedFits.length - 1];
      const avg = sortedFits.reduce((s, f) => s + f, 0) / sortedFits.length;
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
      const pa = elite[Math.floor(rand() * elite.length)];
      const pb = elite[Math.floor(rand() * elite.length)];
      const child = crossoverOX(pa, pb, rand);
      children.push(mutateInsert(child, mutationRate, rand));
    }
    pop = [...elite, ...children];
  }

  return { result: pop[0].map(i => pool[i]), log };
}

export function capToMaxSize(scores: FlowerScore[], maxSize = 10): FlowerScore[] {
  if (scores.length <= maxSize) return scores;
  return [...scores].sort((a, b) => b.total - a.total).slice(0, maxSize);
}
