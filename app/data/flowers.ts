// lib/flowers.ts
export interface Flower {
  id: string;
  name: string;
  img: string;
}

export const flowers: Flower[] = [
  { id: 'f1',  name: 'Біла Лілія',     img: '/images/f1.jpg'  },
  { id: 'f2',  name: 'Ранункулюс',     img: '/images/f2.jpg'  },
  { id: 'f3',  name: 'Лотос',          img: '/images/f3.jpg'  },
  { id: 'f4',  name: 'Орхідея',        img: '/images/f4.jpg'  },
  { id: 'f5',  name: 'Соняшник',       img: '/images/f5.jpg'  },
  { id: 'f6',  name: 'Тюльпан',        img: '/images/f6.jpg'  },
  { id: 'f7',  name: 'Червона Троянда',img: '/images/f7.jpg'  },
  { id: 'f8',  name: 'Ромашка',        img: '/images/f8.jpg'  },
  { id: 'f9',  name: 'Гортензія',      img: '/images/f9.jpg'  },
  { id: 'f10', name: 'Сакура',         img: '/images/f10.jpg' },
  { id: 'f11', name: 'Нарцис',         img: '/images/f11.jpg' },
  { id: 'f12', name: 'Ірис',           img: '/images/f12.jpg' },
  { id: 'f13', name: 'Гібіскус',       img: '/images/f13.jpg' },
  { id: 'f14', name: 'Хризантема',     img: '/images/f14.jpg' },
  { id: 'f15', name: 'Гвоздика',       img: '/images/f15.jpg' },
  { id: 'f16', name: 'Магнолія',       img: '/images/f16.jpg' },
  { id: 'f17', name: 'Еустома',        img: '/images/f17.jpg' },
  { id: 'f18', name: 'Півонія',        img: '/images/f18.jpg' },
  { id: 'f19', name: 'Гербера',        img: '/images/f19.jpg' },
  { id: 'f20', name: 'Антуріум',       img: '/images/f20.jpg' },
];

export const MEDALS = ['🥇 1', '🥈 2', '🥉 3'];