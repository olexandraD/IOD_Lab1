export interface FlowerScore {
  name: string;
  gold: number;
  silver: number;
  bronze: number;
  count: number;  // gold+silver+bronze (для евристик)
  total: number;  // gold*3 + silver*2 + bronze (для ГА)
}
export const HEURISTIC_RULES: Record<string, (f: FlowerScore) => boolean> = {
  // E1: участь рівно в 1 порівнянні на 3 місці (методичка)
  e1: (f) => f.gold === 0 && f.silver === 0 && f.bronze === 1,

  // E2: участь рівно в 1 порівнянні на 2 місці (методичка)
  e2: (f) => f.gold === 0 && f.silver === 1 && f.bronze === 0,

  // E3: участь рівно в 1 порівнянні на 1 місці (методичка)
  e3: (f) => f.gold === 1 && f.silver === 0 && f.bronze === 0,

  // E4: участь рівно в 2 порівняннях на 3 місці (методичка)
  e4: (f) => f.gold === 0 && f.silver === 0 && f.bronze === 2,

  // E5: рівно 1 раз на 3 місці + рівно 1 раз на 2 місці (методичка)
  e5: (f) => f.gold === 0 && f.silver === 1 && f.bronze === 1,

  // E6: менше 3 голосів загалом — власна
  e6: (f) => (f.gold + f.silver + f.bronze) < 3,

  // E7: без золота і не більше 2 голосів загалом — власна
  e7: (f) => f.gold === 0 && (f.gold + f.silver + f.bronze) <= 2,
};

export const HEURISTIC_EXPLANATIONS: Record<string, string> = {
  e1: 'Видаляємо квітки з участю рівно 1 раз на 3 місці (bronze=1, gold=0, silver=0).',
  e2: 'Видаляємо квітки з участю рівно 1 раз на 2 місці (silver=1, gold=0, bronze=0).',
  e3: 'Видаляємо квітки з участю рівно 1 раз на 1 місці (gold=1, silver=0, bronze=0).',
  e4: 'Видаляємо квітки з участю рівно 2 рази на 3 місці (bronze=2, gold=0, silver=0).',
  e5: 'Видаляємо квітки з участю 1 раз на 3 місці і 1 раз на 2 місці (gold=0, silver=1, bronze=1).',
  e6: 'Видаляємо квітки з менш ніж 3 голосами загалом (власна).',
  e7: 'Видаляємо квітки без золота і не більше 2 голосів загалом (власна).',
};

export function applyHeuristic(
  scores: FlowerScore[],
  heurId: string
): { kept: FlowerScore[]; removed: FlowerScore[] } {
  const rule = HEURISTIC_RULES[heurId];
  if (!rule) return { kept: scores, removed: [] };
  const kept = scores.filter(f => !rule(f));
  const removed = scores.filter(f => rule(f));
  return { kept, removed };
}

export function applyHeuristicsSequentially(
  scores: FlowerScore[],
  heurIds: string[]
): { step: number; heurId: string; result: FlowerScore[]; removedCount: number }[] {
  const steps: { step: number; heurId: string; result: FlowerScore[]; removedCount: number }[] = [];
  let current = [...scores];

  for (let i = 0; i < heurIds.length; i++) {
    // Ціль досягнута — зупиняємось
    if (current.length <= 10) break;

    const heurId = heurIds[i];
    const { kept, removed } = applyHeuristic(current, heurId);

    // Не застосовуємо якщо видалить усіх
    if (kept.length === 0) {
      steps.push({ step: i + 1, heurId, result: [...current], removedCount: 0 });
      continue;
    }

    current = kept;
    steps.push({ step: i + 1, heurId, result: [...current], removedCount: removed.length });
  }

  return steps;
}

// ── Генетичний алгоритм ──────
type Individual = number[];

const fitness = (ind: Individual, c: FlowerScore[]) => ind.reduce((s, i) => s + c[i].total, 0);

const randomInd = (n: number, size: number): Individual =>
  [...Array(n).keys()].sort(() => Math.random() - 0.5).slice(0, size);

const crossover = (a: Individual, b: Individual, size: number, total: number): Individual => {
  const child = new Set<number>();
  let i = 0, j = 0;
  while (child.size < size && (i < a.length || j < b.length)) {
    if (i < a.length && Math.random() > 0.5) child.add(a[i]);
    if (j < b.length && Math.random() > 0.5) child.add(b[j]);
    i++; j++;
  }
  for (let k = 0; child.size < size && k < total; k++) child.add(k);
  return Array.from(child).slice(0, size);
};

const mutate = (ind: Individual, total: number, rate: number): Individual => {
  if (Math.random() > rate) return ind;
  const copy = [...ind];
  const avail = [...Array(total).keys()].filter(i => !copy.includes(i));
  if (!avail.length) return copy;
  copy[Math.floor(Math.random() * copy.length)] = avail[Math.floor(Math.random() * avail.length)];
  return copy;
};

export function runGeneticAlgorithm(
  candidates: FlowerScore[],
  targetSize = 10,
  opts = { popSize: 30, generations: 100, mutationRate: 0.1, eliteCount: 6 }
): FlowerScore[] {
  if (candidates.length <= targetSize) return [...candidates].sort((a, b) => b.total - a.total);
  const { popSize, generations, mutationRate, eliteCount } = opts;
  let pop: Individual[] = Array.from({ length: popSize }, () => randomInd(candidates.length, targetSize));
  for (let g = 0; g < generations; g++) {
    pop.sort((a, b) => fitness(b, candidates) - fitness(a, candidates));
    const elite = pop.slice(0, eliteCount);
    const children: Individual[] = [];
    while (children.length < popSize - eliteCount) {
      const a = elite[Math.floor(Math.random() * elite.length)];
      const b = elite[Math.floor(Math.random() * elite.length)];
      children.push(mutate(crossover(a, b, targetSize, candidates.length), candidates.length, mutationRate));
    }
    pop = [...elite, ...children];
  }
  return pop[0].map(i => candidates[i]).sort((a, b) => b.total - a.total);
}

export function capToMaxSize(scores: FlowerScore[], maxSize = 10): FlowerScore[] {
  if (scores.length <= maxSize) return scores;
  return [...scores]
    .sort((a, b) => b.total - a.total)
    .slice(0, maxSize);
}
