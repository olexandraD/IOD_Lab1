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

export const HEURISTIC_RULES: Record<string, (f: FlowerScore) => boolean> = {
  e1: (f) => f.gold === 0 && f.silver === 0 && f.bronze === 1,
  e2: (f) => f.gold === 0 && f.silver === 1 && f.bronze === 0,
  e3: (f) => f.gold === 1 && f.silver === 0 && f.bronze === 0,
  e4: (f) => f.gold === 0 && f.silver === 0 && f.bronze === 2,
  e5: (f) => f.gold === 0 && f.silver === 1 && f.bronze === 1,
  e6: (f) => f.gold === 0 && f.silver === 0 && f.bronze >= 1,
  e7: (f) => f.silver > f.gold,
};

export const HEURISTIC_EXPLANATIONS: Record<string, string> = {
  e1: "Участь в одному множинному порівнянні на 3 місці (bronze=1, gold=0, silver=0).",
  e2: "Участь в одному множинному порівнянні на 2 місці (silver=1, gold=0, bronze=0).",
  e3: "Участь в одному множинному порівнянні на 1 місці (gold=1, silver=0, bronze=0).",
  e4: "Участь в 2х множинних порівняннях на 3 місці (bronze=2, gold=0, silver=0).",
  e5: "Участь в одному на 3 місці та ще в одному на 2 місці (gold=0, silver=1, bronze=1).",
  e6: "Власна: жодного разу не обраний вище 3-го місця (silver=0, gold=0, bronze>=1).",
  e7: "Власна: кількість 2-х місць перевищує кількість 1-х (silver > gold).",
};

export function applyHeuristic(
  scores: FlowerScore[],
  heurId: string
): { kept: FlowerScore[]; removed: FlowerScore[] } {
  const rule = HEURISTIC_RULES[heurId];
  if (!rule) return { kept: scores, removed: [] };
  return {
    kept:    scores.filter(f => !rule(f)),
    removed: scores.filter(f =>  rule(f)),
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

type Permutation = number[];

function kendallDistance(a: number[], b: number[]): number {
  const posB: Record<number, number> = {};
  b.forEach((el, idx) => { posB[el] = idx; });
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      const ai = a[i], aj = a[j];
      if (posB[ai] === undefined || posB[aj] === undefined) continue;
      if (posB[ai] > posB[aj]) dist++;
    }
  }
  return dist;
}

function buildExpertRankings(candidates: FlowerScore[]): number[][] {
  const expertRankings: number[][] = [];
  const indices = candidates.map((_, i) => i);

  candidates.forEach((flower, idx) => {
    for (let g = 0; g < flower.gold; g++) {
      const ranking = [idx, ...indices.filter(i => i !== idx)
        .sort((a, b) => candidates[b].total - candidates[a].total)];
      expertRankings.push(ranking);
    }
    for (let s = 0; s < flower.silver; s++) {
      const rest = indices.filter(i => i !== idx)
        .sort((a, b) => candidates[b].total - candidates[a].total);
      const top1 = rest[0];
      const others = rest.slice(1);
      expertRankings.push([top1, idx, ...others]);
    }
    for (let b2 = 0; b2 < flower.bronze; b2++) {
      const rest = indices.filter(i => i !== idx)
        .sort((a, b) => candidates[b].total - candidates[a].total);
      const top2 = rest.slice(0, 2);
      const others = rest.slice(2);
      expertRankings.push([...top2, idx, ...others]);
    }
  });

  if (expertRankings.length === 0) {
    expertRankings.push([...indices]);
  }

  return expertRankings;
}

function gaFitness(
  perm: Permutation,
  expertRankings: number[][],
  w1 = 0.5,
  w2 = 0.5
): number {
  let sumDist = 0;
  let maxDist = 0;
  for (const exp of expertRankings) {
    const d = kendallDistance(perm, exp);
    sumDist += d;
    if (d > maxDist) maxDist = d;
  }
  return w1 * sumDist + w2 * maxDist;
}

function randomPerm(n: number): Permutation {
  return [...Array(n).keys()].sort(() => Math.random() - 0.5);
}

function crossoverOX(a: Permutation, b: Permutation): Permutation {
  const n = a.length;
  const [p1, p2] = [
    Math.floor(Math.random() * n),
    Math.floor(Math.random() * n),
  ].sort((x, y) => x - y);

  const child = new Array(n).fill(-1);
  for (let i = p1; i <= p2; i++) child[i] = a[i];

  let bIdx = 0;
  for (let i = 0; i < n; i++) {
    if (child[i] !== -1) continue;
    while (child.includes(b[bIdx])) bIdx++;
    child[i] = b[bIdx++];
  }
  return child;
}

function mutateSwap(perm: Permutation, rate: number): Permutation {
  if (Math.random() > rate) return perm;
  const copy = [...perm];
  const i = Math.floor(Math.random() * copy.length);
  const j = Math.floor(Math.random() * copy.length);
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

export function runGeneticAlgorithm(
  candidates: FlowerScore[],
  targetSize = 10,
  opts = { popSize: 40, generations: 150, mutationRate: 0.15, eliteCount: 8 }
): { result: FlowerScore[]; log: GenerationLog[] } {
  if (candidates.length <= targetSize) {
    return {
      result: [...candidates].sort((a, b) => b.total - a.total),
      log: [],
    };
  }

  const pool = [...candidates]
    .sort((a, b) => b.total - a.total)
    .slice(0, targetSize);

  const expertRankings = buildExpertRankings(pool);
  const n = pool.length;
  const { popSize, generations, mutationRate, eliteCount } = opts;

  let pop: Permutation[] = Array.from({ length: popSize }, () => randomPerm(n));
  const log: GenerationLog[] = [];

  const logSet = new Set<number>([
    0, 1, 2,
    ...Array.from({ length: 14 }, (_, i) => Math.round((i + 1) * generations / 15)),
    generations - 1,
  ]);

  for (let g = 0; g < generations; g++) {
    pop.sort((a, b) => gaFitness(a, expertRankings) - gaFitness(b, expertRankings));

    if (logSet.has(g)) {
      const fitnesses = pop.map(p => gaFitness(p, expertRankings));
      const best = fitnesses[0];
      const worst = fitnesses[fitnesses.length - 1];
      const avg = fitnesses.reduce((s, f) => s + f, 0) / fitnesses.length;
      log.push({
        generation: g + 1,
        bestFitness: Math.round(best * 10) / 10,
        avgFitness: Math.round(avg * 10) / 10,
        worstFitness: Math.round(worst * 10) / 10,
        bestRanking: pop[0].slice(0, 5).map(i => pool[i].name).join(' > '),
      });
    }

    const elite = pop.slice(0, eliteCount);
    const children: Permutation[] = [];
    while (children.length < popSize - eliteCount) {
      const parentA = elite[Math.floor(Math.random() * elite.length)];
      const parentB = elite[Math.floor(Math.random() * elite.length)];
      children.push(mutateSwap(crossoverOX(parentA, parentB), mutationRate));
    }
    pop = [...elite, ...children];
  }

  pop.sort((a, b) => gaFitness(a, expertRankings) - gaFitness(b, expertRankings));

  return {
    result: pop[0].map(i => pool[i]),
    log,
  };
}

export function capToMaxSize(scores: FlowerScore[], maxSize = 10): FlowerScore[] {
  if (scores.length <= maxSize) return scores;
  return [...scores].sort((a, b) => b.total - a.total).slice(0, maxSize);
}
