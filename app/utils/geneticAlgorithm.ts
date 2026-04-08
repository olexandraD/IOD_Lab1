export interface GenerationLog {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  worstFitness: number;
  bestRanking: string; // імена через " > "
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

  // Логуємо кожне 10-е покоління + перше + останнє
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
