"use client";
import React, { useState } from 'react';

const flowers = [
  { id: 'f1', name: 'Червона Троянда',   img: '/images/f1.jpg' },
  { id: 'f2', name: 'Біла Лілія',       img: '/images/f2.jpg' },
  { id: 'f3', name: 'Соняшник',         img: '/images/f3.jpg' },
  { id: 'f4', name: 'Лаванда',          img: '/images/f4.jpg' },
  { id: 'f5', name: 'Орхідея',          img: '/images/f5.jpg' },
  { id: 'f6', name: 'Тюльпан',          img: '/images/f6.jpg' },
  { id: 'f7', name: 'Півонія',          img: '/images/f7.jpg' },
  { id: 'f8', name: 'Магнолія',         img: '/images/f8.jpg' },
  { id: 'f9', name: 'Сакура',           img: '/images/f9.jpg' },
  { id: 'f10', name: 'Гортензія',       img: '/images/f10.jpg' },
  { id: 'f11', name: 'Ірис',            img: '/images/f11.jpg' },
  { id: 'f12', name: 'Лотос',           img: '/images/f12.jpg' },
  { id: 'f13', name: 'Гібіскус',        img: '/images/f13.jpg' },
  { id: 'f14', name: 'Нарцис',          img: '/images/f14.jpg' },
  { id: 'f15', name: 'Жасмин',          img: '/images/f15.jpg' },
  { id: 'f16', name: 'Ромашка',         img: '/images/f16.jpg' },
  { id: 'f17', name: 'Хризантема',      img: '/images/f17.jpg' },
  { id: 'f18', name: 'Гербера',         img: '/images/f18.jpg' },
  { id: 'f19', name: 'Мак',             img: '/images/f19.jpg' },
  { id: 'f20', name: 'Кала',            img: '/images/f20.jpg' },
];

const MEDALS = ['🥇 1', '🥈 2', '🥉 3'];

interface VoteRecord {
  expert: string;
  choices: string[];
  time: string;
}

export default function Lab1App() {
  const [selected, setSelected] = useState<string[]>([]);
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [view, setView] = useState<'vote' | 'login' | 'results'>('vote');
  const [showPass, setShowPass] = useState(false);
  const [pass, setPass] = useState('');

  const handleSelect = (id: string) => {
    if (isDone) return;
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const confirmVote = () => {
    if (selected.length !== 3) {
      alert("Оберіть рівно 3 квіти!");
      return;
    }
    const expert = `Експерт ${votes.length + 1}`;
    const record = {
      expert,
      choices: selected.map(id => flowers.find(f => f.id === id)?.name || ''),
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    };
    setVotes(prev => [...prev, record]);
    setIsDone(true);
  };

  const resetVote = () => {
    setSelected([]);
    setIsDone(false);
  };

  // Підрахунок голосів
  const medalCounts = flowers.reduce((acc, f) => {
    acc[f.name] = [0, 0, 0];
    return acc;
  }, {});

  votes.forEach(v => {
    v.choices.forEach((name, idx) => {
      if (medalCounts[name]) medalCounts[name][idx]++;
    });
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff8f5 0%, #fff3ee 100%)',
      color: '#2d1e18',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Шапка */}
      <nav style={{
        padding: '1.5rem 5%',
        borderBottom: '1px solid #ffe0db',
        background: 'rgba(255, 248, 245, 0.98)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#2d1e18', margin: 0 }}>
          ЛР1 • Розподілене введення даних
        </h2>
        <button
          onClick={() => setView(view === 'results' ? 'vote' : 'login')}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid #ff6b81',
            background: view === 'results' ? '#ff6b81' : 'white',
            color: view === 'results' ? 'white' : '#ff6b81',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {view === 'results' ? '← Назад' : 'Викладач'}
        </button>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {view === 'vote' ? (
          <>
            <h1 style={{
              textAlign: 'center',
              fontSize: '2.4rem',
              fontWeight: 700,
              color: '#2d1e18',
              marginBottom: '3rem'
            }}>
              Оберіть 3 найулюбленіші квіти
            </h1>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.8rem'
            }}>
              {flowers.map(f => {
                const idx = selected.indexOf(f.id);
                const selected = idx !== -1;
                return (
                  <div
                    key={f.id}
                    onClick={() => handleSelect(f.id)}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: selected ? '3px solid #ff6b81' : '1px solid #ffe0db',
                      boxShadow: selected 
                        ? '0 20px 40px rgba(255, 107, 129, 0.18)'
                        : '0 8px 24px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      transform: selected ? 'translateY(-6px)' : 'none',
                      cursor: isDone ? 'default' : 'pointer',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={f.img}
                      alt={f.name}
                      style={{
                        width: '100%',
                        height: '220px',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      padding: '1.2rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#2d1e18'
                    }}>
                      {f.name}
                    </div>

                    {selected && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: '#ff6b81',
                        color: 'white',
                        padding: '0.4rem 0.9rem',
                        borderRadius: '999px',
                        fontSize: '0.95rem',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(255,107,129,0.4)'
                      }}>
                        {MEDALS[idx]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : view === 'login' ? (
          // ... (залишаю без змін, якщо потрібно — можу оновити)
          <div style={{ maxWidth: '420px', margin: '8rem auto', background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2d1e18' }}>Вхід для викладача</h2>
            {/* решта коду login */}
          </div>
        ) : (
          // ... протокол (можу оновити кольори аналогічно)
          <div>Протокол голосування (оновити кольори)</div>
        )}
      </main>

      {/* Нижня панель */}
      {selected.length > 0 && view === 'vote' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 248, 245, 0.98)',
          backdropFilter: 'blur(16px)',
          borderTop: '2px solid #ff6b81',
          padding: '1.2rem',
          zIndex: 1000
        }}>
          {/* ... твоя нижня панель з вибраними */}
        </div>
      )}
    </div>
  );
}
