export interface FlowerScore {
  name: string;
  gold: number;
  silver: number;
  bronze: number;
  count: number;  // gold+silver+bronze
  total: number;  // gold*3 + silver*2 + bronze
}

export const HEURISTIC_RULES: Record<string, (f: FlowerScore) => boolean> = {
  // E1: Участь в одному множинному порівнянні на 3 місці
  e1: (f) => f.gold === 0 && f.silver === 0 && f.bronze === 1,

  // E2: Участь в одному множинному порівнянні на 2 місці
  e2: (f) => f.gold === 0 && f.silver === 1 && f.bronze === 0,

  // E3: Участь в одному множинному порівнянні на 1 місці
  e3: (f) => f.gold === 1 && f.silver === 0 && f.bronze === 0,

  // E4: Участь в 2х множинних порівняннях на 3 місці
  e4: (f) => f.gold === 0 && f.silver === 0 && f.bronze === 2,

  // E5: Участь в одному на 3 місці та ще в одному на 2 місці
  e5: (f) => f.gold === 0 && f.silver === 1 && f.bronze === 1,

  // E6 (власна): Кількість участей на 2 місці перевищує кількість участей на 1 місці
  e6: (f) => f.silver > f.gold,

  // E7 (власна): Жодного разу не обраний експертами
  e7: (f) => f.count === 0,
};

export const HEURISTIC_EXPLANATIONS: Record<string, string> = {
  e1: 'Участь в одному множинному порівнянні на 3 місці (bronze=1, gold=0, silver=0).',
  e2: 'Участь в одному множинному порівнянні на 2 місці (silver=1, gold=0, bronze=0).',
  e3: 'Участь в одному множинному порівнянні на 1 місці (gold=1, silver=0, bronze=0).',
  e4: 'Участь в 2х множинних порівняннях на 3 місці (bronze=2, gold=0, silver=0).',
  e5: 'Участь в одному на 3 місці та ще в одному на 2 місці (gold=0, silver=1, bronze=1).',
  e6: 'Власна: кількість участей на 2 місці перевищує кількість участей на 1 місці (silver > gold).',
  e7: 'Власна: жодного разу не обраний експертами (count === 0).',
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

    // Якщо евристика видалить усіх — пропускаємо
    if (kept.length === 0) {
      steps.push({ step: i + 1, heurId, result: [...current], removedCount: 0 });
      continue;
    }

    current = kept;
    steps.push({ step: i + 1, heurId, result: [...current], removedCount: removed.length });

    // Мета досягнута — <= 10 об'єктів
    if (current.length <= 10) break;
  }

  return steps;
}

//  ГЕНЕТИЧНИЙ АЛГОРИТМ
type Individual = number[];

const fitness = (ind: Individual, c: FlowerScore[]) =>
  ind.reduce((s, i) => s + c[i].total, 0);

const randomInd = (n: number, size: number): Individual =>
  [...Array(n).keys()].sort(() => Math.random() - 0.5).slice(0, size);

const crossover = (
  a: Individual,
  b: Individual,
  size: number,
  total: number
): Individual => {
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
  copy[Math.floor(Math.random() * copy.length)] =
    avail[Math.floor(Math.random() * avail.length)];
  return copy;
};

export function runGeneticAlgorithm(
  candidates: FlowerScore[],
  targetSize = 10,
  opts = { popSize: 30, generations: 100, mutationRate: 0.1, eliteCount: 6 }
): FlowerScore[] {
  if (candidates.length <= targetSize)
    return [...candidates].sort((a, b) => b.total - a.total);

  const { popSize, generations, mutationRate, eliteCount } = opts;
  let pop: Individual[] = Array.from({ length: popSize }, () =>
    randomInd(candidates.length, targetSize)
  );

  for (let g = 0; g < generations; g++) {
    pop.sort((a, b) => fitness(b, candidates) - fitness(a, candidates));
    const elite = pop.slice(0, eliteCount);
    const children: Individual[] = [];
    while (children.length < popSize - eliteCount) {
      const a = elite[Math.floor(Math.random() * elite.length)];
      const b = elite[Math.floor(Math.random() * elite.length)];
      children.push(
        mutate(
          crossover(a, b, targetSize, candidates.length),
          candidates.length,
          mutationRate
        )
      );
    }
    pop = [...elite, ...children];
  }

  pop.sort((a, b) => fitness(b, candidates) - fitness(a, candidates));
  return pop[0].map(i => candidates[i]).sort((a, b) => b.total - a.total);
}

export function capToMaxSize(scores: FlowerScore[], maxSize = 10): FlowerScore[] {
  if (scores.length <= maxSize) return scores;
  return [...scores].sort((a, b) => b.total - a.total).slice(0, maxSize);
}
