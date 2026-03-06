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
      return alert("Будь ласка, оберіть рівно 3 квіти!");
    }
    const expert = `Експерт ${votes.length + 1}`;
    const record: VoteRecord = {
      expert,
      choices: selected.map(id => flowers.find(f => f.id === id)!.name),
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    };
    setVotes(prev => [...prev, record]);
    setIsDone(true);
  };

  const resetVote = () => {
    setSelected([]);
    setIsDone(false);
  };

  // Правильна типізація для TypeScript (щоб Vercel не падав)
  const medalCounts = flowers.reduce<Record<string, [number, number, number]>>((acc, flower) => {
    acc[flower.name] = [0, 0, 0];
    return acc;
  }, {});

  votes.forEach(vote => {
    vote.choices.forEach((choice, idx) => {
      if (medalCounts[choice]) {
        medalCounts[choice][idx]++;
      }
    });
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdfaf7 0%, #fff8f5 100%)',
      color: '#1f2937',
      paddingBottom: '160px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Навігація */}
      <nav style={{
        padding: '1.5rem 5%',
        borderBottom: '1px solid #ffe4e1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 250, 245, 0.98)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          letterSpacing: '0.5px',
          color: '#1f2937',
          margin: 0,
          fontWeight: '700'
        }}>
          ЛР1 • Розподілене введення даних
        </h2>
        <button
          onClick={() => setView(view === 'results' ? 'vote' : 'login')}
          style={{
            background: '#ffffff',
            border: '1px solid #ec4899',
            color: '#ec4899',
            padding: '0.65rem 1.5rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.25s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#ec4899';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = '#ec4899';
          }}
        >
          {view === 'results' ? '← Назад' : '🔑 Викладач'}
        </button>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        {view === 'vote' ? (
          <>
            <h1 style={{
              textAlign: 'center',
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '3.5rem',
              color: '#1f2937',
              lineHeight: '1.15'
            }}>
              Оберіть 3 найулюбленіші квіти
            </h1>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '2rem'
            }}>
              {flowers.map(f => {
                const idx = selected.indexOf(f.id);
                const isSel = idx !== -1;
                return (
                  <div
                    key={f.id}
                    onClick={() => handleSelect(f.id)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '1.25rem',
                      overflow: 'hidden',
                      cursor: isDone ? 'default' : 'pointer',
                      border: isSel ? '3px solid #ec4899' : '1px solid #ffe4e1',
                      transition: 'all 0.35s ease',
                      boxShadow: isSel
                        ? '0 25px 50px -12px rgba(236, 72, 153, 0.18)'
                        : '0 10px 30px rgba(0,0,0,0.07)',
                      transform: isSel ? 'translateY(-8px)' : 'scale(1)'
                    }}
                  >
                    <img
                      src={f.img}
                      alt={f.name}
                      style={{
                        width: '100%',
                        height: '230px',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                    />
                    <div style={{
                      padding: '1.25rem 1rem',
                      textAlign: 'center',
                      fontSize: '1.05rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {f.name}
                    </div>
                    {isSel && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        background: '#ec4899',
                        color: 'white',
                        padding: '0.45rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        boxShadow: '0 6px 16px rgba(236, 72, 153, 0.35)'
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
          <div style={{
            maxWidth: '420px',
            margin: '10rem auto',
            background: '#ffffff',
            padding: '3rem 2.5rem',
            borderRadius: '1.25rem',
            textAlign: 'center',
            border: '1px solid #ffe4e1',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🌸</div>
            <h2 style={{ marginBottom: '2rem', fontWeight: '700', fontSize: '1.8rem', color: '#1f2937' }}>
              Вхід для викладача
            </h2>
            <div style={{ position: 'relative', marginBottom: '1.8rem' }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Введіть пароль"
                value={pass}
                onChange={e => setPass(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '2px solid #ffe4e1',
                  background: '#fdfaf7',
                  color: '#1f2937',
                  fontSize: '1.05rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.4rem',
                  color: '#9ca3af'
                }}
              >
                {showPass ? '🔒' : '👁️'}
              </button>
            </div>
            <button
              onClick={() => pass === 'lr1_2026' ? setView('results') : alert('Невірний пароль!')}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #ec4899, #db2777)',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.25s'
              }}
            >
              УВІЙТИ В ПРОТОКОЛ
            </button>
          </div>
        ) : (
          /* ПРОТОКОЛ */
          <div style={{
            background: '#ffffff',
            padding: '2.5rem',
            borderRadius: '1.25rem',
            border: '1px solid #ffe4e1',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              borderBottom: '2px solid #ffe4e1',
              paddingBottom: '1.25rem'
            }}>
              <h2 style={{ fontWeight: '700', fontSize: '1.9rem', margin: 0, color: '#1f2937' }}>
                📋 Протокол голосування
              </h2>
              <div style={{
                background: '#fdfaf7',
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                Голосів: <span style={{ color: '#ec4899' }}>{votes.length}</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0 12px',
                fontSize: '1.05rem'
              }}>
                <thead>
                  <tr>
                    <th style={{
                      textAlign: 'left',
                      padding: '1rem 1.5rem',
                      background: '#fdfaf7',
                      borderRadius: '12px 0 0 12px',
                      color: '#1f2937',
                      fontWeight: '700'
                    }}>Квітка</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '1rem 1.5rem',
                      background: '#fdfaf7',
                      color: '#1f2937',
                      fontWeight: '700'
                    }}>🥇 1-е місце</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '1rem 1.5rem',
                      background: '#fdfaf7',
                      color: '#1f2937',
                      fontWeight: '700'
                    }}>🥈 2-е місце</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '1rem 1.5rem',
                      background: '#fdfaf7',
                      borderRadius: '0 12px 12px 0',
                      color: '#1f2937',
                      fontWeight: '700'
                    }}>🥉 3-є місце</th>
                  </tr>
                </thead>
                <tbody>
                  {flowers.map((flower) => {
                    const counts = medalCounts[flower.name] || [0, 0, 0];
                    return (
                      <tr key={flower.id}>
                        <td style={{
                          padding: '1.1rem 1.5rem',
                          background: '#fdfaf7',
                          borderRadius: '12px 0 0 12px',
                          border: '1px solid #ffe4e1',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          {flower.name}
                        </td>
                        <td style={{
                          textAlign: 'center',
                          padding: '1.1rem 1.5rem',
                          background: '#fdfaf7',
                          borderTop: '1px solid #ffe4e1',
                          borderBottom: '1px solid #ffe4e1',
                          color: '#ec4899',
                          fontWeight: '700'
                        }}>
                          {counts[0]}
                        </td>
                        <td style={{
                          textAlign: 'center',
                          padding: '1.1rem 1.5rem',
                          background: '#fdfaf7',
                          borderTop: '1px solid #ffe4e1',
                          borderBottom: '1px solid #ffe4e1',
                          color: '#ec4899',
                          fontWeight: '700'
                        }}>
                          {counts[1]}
                        </td>
                        <td style={{
                          textAlign: 'center',
                          padding: '1.1rem 1.5rem',
                          background: '#fdfaf7',
                          borderRadius: '0 12px 12px 0',
                          border: '1px solid #ffe4e1',
                          color: '#ec4899',
                          fontWeight: '700'
                        }}>
                          {counts[2]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Нижня панель */}
      {selected.length > 0 && view === 'vote' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 250, 245, 0.98)',
          backdropFilter: 'blur(16px)',
          borderTop: '3px solid #ec4899',
          padding: '1.4rem 1.5rem',
          zIndex: 1000
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {selected.map((id, idx) => {
                const name = flowers.find(f => f.id === id)?.name;
                return (
                  <div
                    key={id}
                    style={{
                      fontSize: '1rem',
                      background: '#ffffff',
                      padding: '0.8rem 1.4rem',
                      borderRadius: '12px',
                      border: '1px solid #ffe4e1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      color: '#1f2937',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  >
                    <span style={{ color: '#ec4899', fontWeight: '800' }}>
                      {idx + 1}:
                    </span>
                    {name}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={resetVote}
                style={{
                  background: 'transparent',
                  border: '2px solid #ec4899',
                  color: '#ec4899',
                  padding: '0.75rem 1.8rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Скинути
              </button>
              {!isDone && (
                <button
                  onClick={confirmVote}
                  style={{
                    background: 'linear-gradient(to right, #ec4899, #db2777)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 2rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '1.05rem',
                    boxShadow: '0 6px 16px rgba(236, 72, 153, 0.3)'
                  }}
                >
                  Підтвердити вибір
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
