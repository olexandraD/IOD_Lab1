export interface Heuristic {
  id: string;
  label: string;
  desc: string;
}

export const heuristics: Heuristic[] = [
  { id: 'e1', label: 'Е1', desc: 'Лише 3-і місця, жодного 1-го чи 2-го' },
  { id: 'e2', label: 'Е2', desc: 'Лише до 2-го місця включно, жодного 1-го' },
  { id: 'e3', label: 'Е3', desc: 'Лише 1-е місце і жодного іншого (одиночний лідер)' },
  { id: 'e4', label: 'Е4', desc: 'Лише 3-і місця і їх 2 або більше' },
  { id: 'e5', label: 'Е5', desc: 'Є 2-е і 3-є місця одночасно, без 1-го' },
  { id: 'e6', label: 'Е6', desc: 'Зважений бал (gold×3+silver×2+bronze) ≤ 6 (власна)' },
  { id: 'e7', label: 'Е7', desc: 'Загальна кількість голосів ≤ 3 (власна)' },
];
