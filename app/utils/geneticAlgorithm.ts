// app/utils/geneticAlgorithm.ts

export interface FlowerScore {
  name: string;
  gold: number;   // скільки разів на 1-му місці
  silver: number; // скільки разів на 2-му місці
  bronze: number; // скільки разів на 3-му місці
  total: number;  // 3*gold + 2*silver + 1*bronze
}

// ── Як правильно читати евристики методички ───────────────────────────────
//
// Евристики описують МАКСИМАЛЬНО СЛАБКУ підтримку, при якій квітку
// ще можна видалити БЕЗ суттєвого впливу на результат.
//
// "Участь в одному МП на 3-му місці" = квітка має підтримку
// НЕ БІЛЬШЕ ніж одна бронза і нічого сильнішого.
// → Видаляємо: gold=0, silver=0, bronze ≤ 1
//
// "Участь в 2х МП на 3-му місці" = квітка має підтримку
// НЕ БІЛЬШЕ ніж дві бронзи і нічого сильнішого.
// → Видаляємо: gold=0, silver=0, bronze ≤ 2
// (це ШИРША евристика — включає всіх кого Е1 видаляє, плюс тих хто має 2 бронзи)
//
// "Участь в одному МП на 2-му місці" = НЕ БІЛЬШЕ одного срібла, без золота.
// → Видаляємо: gold=0, silver ≤ 1, bronze = 0
//
// "Участь в одному МП на 1-му місці" = НЕ БІЛЬШЕ одного золота, без підтримки взагалі.
// → Видаляємо: gold ≤ 1, silver = 0, bronze = 0
// (поодинока перемога без будь-якої іншої підтримки)
//
// "Одне 3-є + одне 2-є" = НЕ БІЛЬШЕ ніж 1 срібло + 1 бронза, без золота.
// → Видаляємо: gold=0, silver ≤ 1, bronze ≤ 1, silver+bronze > 0
//
// Е6 (власна): зважений бал < середнього по підмножині
// → потребує контексту
//
// Е7 (власна): жодного золота І загальна кількість голосів ≤ 2
// → gold=0, gold+silver+bronze ≤ 2

export const HEURISTIC_RULES: Record<string, (f: FlowerScore, ctx?: { mean: number }) => boolean> = {
  // Е1: не більше 1 бронзи, нуль золота і срібла
  e1: (f) => f.gold === 0 && f.silver === 0 && f.bronze <= 1,

  // Е2: не більше 1 срібла, нуль золота і бронзи
  e2: (f) => f.gold === 0 && f.silver <= 1 && f.bronze === 0,

  // Е3: не більше 1 золота, нуль срібла і бронзи (поодинока перемога)
  e3: (f) => f.gold <= 1 && f.silver === 0 && f.bronze === 0,

  // Е4: не більше 2 бронз, нуль золота і срібла (включає Е1)
  e4: (f) => f.gold === 0 && f.silver === 0 && f.bronze <= 2,

  // Е5: не більше 1 срібла + 1 бронзи, нуль золота, хоч щось є
  e5: (f) => f.gold === 0 && f.silver <= 1 && f.bronze <= 1 && (f.silver + f.bronze) > 0,

  // Е6: зважений бал нижче середнього (потребує контексту)
  e6: (f, ctx) => ctx !== undefined && f.total < ctx.mean,

  // Е7: жодного золота і мало голосів загалом
  e7: (f) => f.gold === 0 && (f.gold + f.silver + f.bronze) <= 2,
};

export const HEURISTIC_EXPLANATIONS: Record<string, string> = {
  e1: 'Видаляємо квітки з не більше 1 бронзою і нуль золота/срібла — найслабша можлива участь.',
  e2: 'Видаляємо квітки з не більше 1 сріблом і нуль золота/бронзи.',
  e3: 'Видаляємо квітки з не більше 1 золотом і нуль срібла/бронзи — поодинока перемога без підтримки.',
  e4: 'Видаляємо квітки з не більше 2 бронзами і нуль золота/срібла. Включає всіх кого Е1 видаляє.',
  e5: 'Видаляємо квітки без золота, з не більше 1 сріблом і 1 бронзою — слабка участь без першості.',
  e6: 'Видаляємо квітки, чий зважений бал нижче середнього по підмножині.',
  e7: 'Видаляємо квітки без жодного золота і з не більше 2 голосами загалом.',
};

// ── Застосування однієї евристики ─────────────────────────────────────────
export function applyHeuristic(
  scores: FlowerScore[],
  heurId: string
): { kept: FlowerScore[]; removed: FlowerScore[] } {
  const rule = HEURISTIC_RULES[heurId];
  if (!rule) return { kept: scores, removed: [] };

  let ctx: { mean: number } | undefined;
  if (heurId === 'e6') {
    const mean = scores.reduce((s, f) => s + f.total, 0) / (scores.length || 1);
    ctx = { mean };
  }

  const kept = scores.filter(f => !rule(f, ctx));
  const removed = scores.filter(f => rule(f, ctx));
  return { kept, removed };
}

// ── Послідовне застосування ────────────────────────────────────────────────
export function applyHeuristicsSequentially(
  scores: FlowerScore[],
  heurIds: string[]
): { step: number; heurId: string; result: FlowerScore[]; removedCount: number }[] {
  const steps: { step: number; heurId: string; result: FlowerScore[]; removedCount: number }[] = [];
  let current = [...scores];
  heurIds.forEach((heurId, i) => {
    const { kept, removed } = applyHeuristic(current, heurId);
    current = kept;
    steps.push({ step: i + 1, heurId, result: [...current], removedCount: removed.length });
  });
  return steps;
}

// ── Генетичний алгоритм ────────────────────────────────────────────────────
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
  targetSize = 5,
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