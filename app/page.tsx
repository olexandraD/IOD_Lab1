"use client";
import React, { useState } from 'react';

const flowers = [
  { id: 'f1', name: 'Біла Лілія',   img: '/images/f1.jpg' },
  { id: 'f2', name: 'Ранункулюс',       img: '/images/f2.jpg' },
  { id: 'f3', name: 'Лотос',         img: '/images/f3.jpg' },
  { id: 'f4', name: 'Орхідея',       img: '/images/f4.jpg' },
  { id: 'f5', name: 'Соняшник',          img: '/images/f5.jpg' },
  { id: 'f6', name: 'Тюльпан',          img: '/images/f6.jpg' },
  { id: 'f7', name: 'Червона Троянда',          img: '/images/f7.jpg' },
  { id: 'f8', name: 'Ромашка',          img: '/images/f8.jpg' },
  { id: 'f9', name: 'Гортензія',           img: '/images/f9.jpg' },
  { id: 'f10', name: 'Сакура',       img: '/images/f10.jpg' },
  { id: 'f11', name: 'Нарцис',            img: '/images/f11.jpg' },
  { id: 'f12', name: 'Ірис',           img: '/images/f12.jpg' },
  { id: 'f13', name: 'Гібіскус',        img: '/images/f13.jpg' },
  { id: 'f14', name: 'Хризантема',          img: '/images/f14.jpg' },
  { id: 'f15', name: 'Гвоздика',        img: '/images/f15.jpg' },
  { id: 'f16', name: 'Магнолія',        img: '/images/f16.jpg' },
  { id: 'f17', name: 'Еустома',      img: '/images/f17.jpg' },
  { id: 'f18', name: 'Півонія',         img: '/images/f18.jpg' },
  { id: 'f19', name: 'Гербера',         img: '/images/f19.jpg' },
  { id: 'f20', name: 'Антуріум',        img: '/images/f20.jpg' },
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

  // Правильна типізація для Vercel (щоб не було помилки "implicit any")
  const medalCounts = flowers.reduce<Record<string, [number, number, number]>>((acc, flower) => {
    acc[flower.name] = [0, 0, 0];
    return acc;
  }, {});

  votes.forEach(vote => {
    vote.choices.forEach((choice, idx) => {
      if (medalCounts[choice]) medalCounts[choice][idx]++;
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
        padding: '20px 5%',
        borderBottom: '1px solid #ffe4e1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 250, 245, 0.98)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h2 style={{
          fontSize: '1.2rem',
          letterSpacing: '1px',
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
            padding: '10px 22px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
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
          {view === 'results' ? '← Повернутися' : '🔑 Викладач'}
        </button>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '50px 20px' }}>
        {view === 'vote' ? (
          <>
            <h1 style={{
              textAlign: 'center',
              fontSize: '2.2rem',
              fontWeight: '700',
              marginBottom: '50px',
              color: '#1f2937',
              lineHeight: '1.15'
            }}>
              Оберіть 3 найулюбленіші квітки
            </h1>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '28px'
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
                      borderRadius: '20px',
                      overflow: 'hidden',
                      cursor: isDone ? 'default' : 'pointer',
                      border: isSel ? '3px solid #ec4899' : '1px solid #ffe4e1',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      boxShadow: isSel
                        ? '0 20px 35px rgba(236, 72, 153, 0.18)'
                        : '0 10px 25px rgba(0,0,0,0.07)',
                      transform: isSel ? 'translateY(-6px)' : 'none'
                    }}
                  >
                    <img
                      src={f.img}
                      alt={f.name}
                      style={{
                        width: '100%',
                        height: '210px',
                        objectFit: 'cover',
                        transition: 'transform 0.4s'
                      }}
                    />
                    <div style={{
                      padding: '16px 12px',
                      textAlign: 'center',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {f.name}
                    </div>
                    {isSel && (
                      <div style={{
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        background: '#ec4899',
                        color: 'white',
                        padding: '6px 14px',
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
            margin: '120px auto',
            background: '#ffffff',
            padding: '50px 40px',
            borderRadius: '20px',
            textAlign: 'center',
            border: '1px solid #ffe4e1',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🌸</div>
            <h2 style={{ marginBottom: '30px', fontWeight: '700', fontSize: '1.75rem', color: '#1f2937' }}>
              Вхід для викладача
            </h2>
            <div style={{ position: 'relative', marginBottom: '25px' }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Введіть пароль"
                value={pass}
                onChange={e => setPass(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '2px solid #ffe4e1',
                  background: '#fdfaf7',
                  color: '#1f2937',
                  fontSize: '1.05rem'
                }}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '16px',
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
                padding: '16px',
                borderRadius: '14px',
                fontWeight: '700',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              УВІЙТИ В ПРОТОКОЛ
            </button>
          </div>
        ) : (
          /* ПРОТОКОЛ */
          <div style={{
            background: '#ffffff',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid #ffe4e1',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
              borderBottom: '2px solid #ffe4e1',
              paddingBottom: '20px'
            }}>
              <h2 style={{ fontWeight: '700', fontSize: '1.85rem', margin: 0, color: '#1f2937' }}>
                📋 Протокол голосування
              </h2>
              <div style={{
                background: '#fdfaf7',
                padding: '8px 18px',
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
                fontSize: '1.02rem'
              }}>
                <thead>
                  <tr>
                    <th style={{
                      textAlign: 'left',
                      padding: '16px 24px',
                      background: '#fdfaf7',
                      borderRadius: '14px 0 0 14px',
                      color: '#1f2937',
                      fontWeight: '700'
                    }}>Квітка</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '16px 24px',
                      background: '#fdfaf7',
                      color: '#1f2937',
                      fontWeight: '700'
                    }}>🥇 1-е місце</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '16px 24px',
                      background: '#fdfaf7',
                      color: '#1f2937',
                      fontWeight: '700'
                    }}>🥈 2-е місце</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '16px 24px',
                      background: '#fdfaf7',
                      borderRadius: '0 14px 14px 0',
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
                          padding: '18px 24px',
                          background: '#fdfaf7',
                          borderRadius: '14px 0 0 14px',
                          border: '1px solid #ffe4e1',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          {flower.name}
                        </td>
                        <td style={{
                          textAlign: 'center',
                          padding: '18px 24px',
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
                          padding: '18px 24px',
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
                          padding: '18px 24px',
                          background: '#fdfaf7',
                          borderRadius: '0 14px 14px 0',
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
          backdropFilter: 'blur(24px)',
          borderTop: '3px solid #ec4899',
          padding: '22px 20px',
          zIndex: 1000
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {selected.map((id, idx) => {
                const name = flowers.find(f => f.id === id)?.name;
                return (
                  <div
                    key={id}
                    style={{
                      fontSize: '1rem',
                      background: '#ffffff',
                      padding: '12px 20px',
                      borderRadius: '14px',
                      border: '1px solid #ffe4e1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
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
            <div style={{ display: 'flex', gap: '14px' }}>
              <button
                onClick={resetVote}
                style={{
                  background: 'transparent',
                  border: '2px solid #ec4899',
                  color: '#ec4899',
                  padding: '12px 26px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: '600'
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
                    padding: '12px 36px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '1.05rem'
                  }}
                >
                  ПІДТВЕРДИТИ ВИБІР ✅
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
