export interface Heuristic {
  id: string;
  label: string;
  desc: string;
}

export const heuristics: Heuristic[] = [
  { id: 'e1', label: 'Е1', desc: 'Лише 3-і місця, жодного 1-го чи 2-го' },
  { id: 'e2', label: 'Е2', desc: 'Лише до 2-го місця включно, жодного 1-го' },
  { id: 'e3', label: 'Е3', desc: 'Рівно 1 голос і лише на 1-му місці' },
  { id: 'e4', label: 'Е4', desc: 'Лише 3-і місця і їх 2 або більше' },
  { id: 'e5', label: 'Е5', desc: 'Є 2-е і 3-є місця одночасно, без 1-го' },
  { id: 'e6', label: 'Е6', desc: 'Без золота і не більше 2 голосів загалом (власна)' },
  { id: 'e7', label: 'Е7', desc: 'Без золота і зважений бал ≤ 6 (власна)' },
];
