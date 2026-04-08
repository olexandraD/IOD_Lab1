export interface FlowerScore {
  name: string;
  gold: number;
  silver: number;
  bronze: number;
  count: number;
  total: number;
}

export const HEURISTIC_RULES: Record<string, (f: FlowerScore, all?: FlowerScore[]) => boolean> = {
  e1: (f) => f.gold === 0 && f.silver === 0 && f.bronze === 1,
  e2: (f) => f.gold === 0 && f.silver === 1 && f.bronze === 0,
  e3: (f) => f.gold === 1 && f.silver === 0 && f.bronze === 0,
  e4: (f) => f.gold === 0 && f.silver === 0 && f.bronze === 2,
  e5: (f) => f.gold === 0 && f.silver === 1 && f.bronze === 1,
  // E6: бал нижче середнього (власна)
  e6: (f, all) => {
    if (!all || all.length === 0) return false;
    const avg = all.reduce((s, x) => s + x.total, 0) / all.length;
    return f.total < avg;
  },
  // E7: ніколи не на 1-му місці ТА загальних голосів ≤ 1 (власна)
  e7: (f) => f.gold === 0 && f.count <= 1,
};

export const HEURISTIC_EXPLANATIONS: Record<string, string> = {
  e1: 'Участь в одному множинному порівнянні на 3 місці (bronze=1, gold=0, silver=0).',
  e2: 'Участь в одному множинному порівнянні на 2 місці (silver=1, gold=0, bronze=0).',
  e3: 'Участь в одному множинному порівнянні на 1 місці (gold=1, silver=0, bronze=0).',
  e4: 'Участь в 2х множинних порівняннях на 3 місці (bronze=2, gold=0, silver=0).',
  e5: 'Участь в одному на 3 місці та ще в одному на 2 місці (gold=0, silver=1, bronze=1).',
  e6: 'Власна: сумарний бал нижче середнього по підмножині.',
  e7: 'Власна: ніколи не обраний на 1-му місці та отримав ≤1 голос загалом.',
};

export function applyHeuristic(
  scores: FlowerScore[],
  heurId: string
): { kept: FlowerScore[]; removed: FlowerScore[] } {
  const rule = HEURISTIC_RULES[heurId];
  if (!rule) return { kept: scores, removed: [] };
  return {
    kept:    scores.filter(f => !rule(f, scores)),
    removed: scores.filter(f =>  rule(f, scores)),
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

// ─── ГЕНЕТИЧНИЙ АЛГОРИТМ (два критерії, незалежно від медалей) ───────────────
//
// Вхід: candidates — підмножина після евристик (масив FlowerScore)
// Кожен FlowerScore має поле total = зважений бал від ЛР1 (gold×3+silver×2+bronze)
//
// Інтерпретація як задача ранжування:
//   Є M експертів. Кожен задав ранжування (своє топ-3).
//   "Повне ранжування" кожного exp — це порядок об'єктів за тим, кому він дав gold/silver/bronze.
//   Відстань між двома ранжуваннями = кількість пар (i,j), де порядок не збігається (Кендалл).
//
// Критерій 1: Σ відстаней від ранжування підмножини до кожного експертного ранжування → мінімум.
// Критерій 2: Мінімізувати максимум відстані (мінімакс).
//
// Ми шукаємо одне консенсусне ранжування (перестановку candidates).

type Permutation = number[]; // індекси в candidates

// Відстань Кендалла між двома перестановками (кількість інверсій спільних елементів)
function kendallDistance(a: number[], b: number[]): number {
  // Позиція елемента i у перестановці b
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

// Будуємо "експертні ранжування" з lr1Votes (gold=rank0, silver=rank1, bronze=rank2)
// Кожне ранжування — масив індексів у candidates, відсортований за преференцією експерта
function buildExpertRankings(candidates: FlowerScore[]): number[][] {
  // candidates вже відсортовані за total (спадання).
  // Кожен об'єкт має gold, silver, bronze — агреговані по всіх експертах.
  // Ми симулюємо "expert votes" через розклад: для кожного gold-голосу
  // створюємо ранжування [gold_object, ...решта за total].
  // Це наближення (повних individual бюлетенів у нас немає в цій функції),
  // але воно узгоджується з даними ЛР1.

  const expertRankings: number[][] = [];
  const indices = candidates.map((_, i) => i);

  candidates.forEach((flower, idx) => {
    // gold votes: цей об'єкт на 1-му місці
    for (let g = 0; g < flower.gold; g++) {
      const ranking = [idx, ...indices.filter(i => i !== idx)
        .sort((a, b) => candidates[b].total - candidates[a].total)];
      expertRankings.push(ranking);
    }
    // silver votes: цей об'єкт на 2-му місці
    for (let s = 0; s < flower.silver; s++) {
      const rest = indices.filter(i => i !== idx)
        .sort((a, b) => candidates[b].total - candidates[a].total);
      // топ-1 залишається на місці, цей об'єкт вставляємо на 2-ге
      const top1 = rest[0];
      const others = rest.slice(1);
      const ranking = [top1, idx, ...others];
      expertRankings.push(ranking);
    }
    // bronze votes: цей об'єкт на 3-му місці
    for (let b2 = 0; b2 < flower.bronze; b2++) {
      const rest = indices.filter(i => i !== idx)
        .sort((a, b) => candidates[b].total - candidates[a].total);
      const top2 = rest.slice(0, 2);
      const others = rest.slice(2);
      const ranking = [...top2, idx, ...others];
      expertRankings.push(ranking);
    }
  });

  // Якщо жодного голосу — повертаємо одне дефолтне ранжування за total
  if (expertRankings.length === 0) {
    expertRankings.push([...indices]);
  }

  return expertRankings;
}

// Функція придатності для ГА (двокритеріальна, скалярна згортка)
// f = w1 * sumDist + w2 * maxDist  (мінімізуємо)
// w1=0.5, w2=0.5 — рівна вага; можна змінити
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
  // Order Crossover (OX) — стандартний для задач ранжування
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
): FlowerScore[] {
  // Якщо кандидатів менше або рівно targetSize — просто повертаємо відсортованих
  if (candidates.length <= targetSize) {
    return [...candidates].sort((a, b) => b.total - a.total);
  }

  // Беремо топ-targetSize кандидатів для ранжування
  const pool = [...candidates]
    .sort((a, b) => b.total - a.total)
    .slice(0, targetSize);

  const expertRankings = buildExpertRankings(pool);
  const n = pool.length;
  const { popSize, generations, mutationRate, eliteCount } = opts;

  let pop: Permutation[] = Array.from({ length: popSize }, () => randomPerm(n));

  for (let g = 0; g < generations; g++) {
    pop.sort((a, b) => gaFitness(a, expertRankings) - gaFitness(b, expertRankings));

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

  // Повертаємо об'єкти у знайденому оптимальному порядку
  return pop[0].map(i => pool[i]);
}

export function capToMaxSize(scores: FlowerScore[], maxSize = 10): FlowerScore[] {
  if (scores.length <= maxSize) return scores;
  return [...scores].sort((a, b) => b.total - a.total).slice(0, maxSize);
}
