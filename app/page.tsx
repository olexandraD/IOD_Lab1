"use client";
import React, { useState } from 'react';

const flowers = [
  { id: 'f1', name: 'Червона Троянда', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800' },
  { id: 'f2', name: 'Біла Лілія', img: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?w=800' },
  { id: 'f3', name: 'Соняшник', img: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800' },
  { id: 'f4', name: 'Лаванда', img: 'https://images.unsplash.com/photo-1499002238440-45c4b7a1b0e4?w=800' },
  { id: 'f5', name: 'Орхідея', img: 'https://images.unsplash.com/photo-1611591437281-4605e5c3e6f9?w=800' },
  { id: 'f6', name: 'Тюльпан', img: 'https://images.unsplash.com/photo-1589994160815-6f0a5f9d3c2e?w=800' },
  { id: 'f7', name: 'Півонія', img: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=800' },
  { id: 'f8', name: 'Магнолія', img: 'https://images.unsplash.com/photo-1559825481-12a9009a6d8b?w=800' },
  { id: 'f9', name: 'Сакура', img: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800' },
  { id: 'f10', name: 'Гортензія', img: 'https://unsplash.com/photos/green-leafed-plant-with-purple-flowers-_SAVhxRL2U8' },
  { id: 'f11', name: 'Ірис', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800' },
  { id: 'f12', name: 'Лотос', img: 'https://images.unsplash.com/photo-1580130684518-9e9c4d1a0f8b?w=800' },
  { id: 'f13', name: 'Гібіскус', img: 'https://images.unsplash.com/photo-1570545884426-1c9a0b7f5c3e?w=800' },
  { id: 'f14', name: 'Нарцис', img: 'https://images.unsplash.com/photo-1587300003388-59208cc9628e?w=800' },
  { id: 'f15', name: 'Жасмин', img: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800' },
  { id: 'f16', name: 'Ромашка', img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800' },
  { id: 'f17', name: 'Хризантема', img: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800' },
  { id: 'f18', name: 'Гербера', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800' },
  { id: 'f19', name: 'Мак', img: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800' },
  { id: 'f20', name: 'Кала', img: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=800' },
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
      return alert("Будь ласка, оберіть 3 квіти!");
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

  const medalCounts = flowers.reduce((acc, flower) => {
    acc[flower.name] = [0, 0, 0];
    return acc;
  }, {} as Record<string, number[]>);

  votes.forEach(vote => {
    vote.choices.forEach((choice, idx) => {
      medalCounts[choice][idx]++;
    });
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdf9f4 0%, #f8f0e8 100%)',
      color: '#3f2c29',
      paddingBottom: '140px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Навігація */}
      <nav style={{
        padding: '20px 5%',
        borderBottom: '1px solid #e8d9d0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 248, 240, 0.97)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h2 style={{
          fontSize: '1.15rem',
          letterSpacing: '1.5px',
          color: '#3f2c29',
          margin: 0,
          fontWeight: '700'
        }}>
          ЛР1 • Розподілене Введення Даних
        </h2>
        <button
          onClick={() => setView(view === 'results' ? 'vote' : 'login')}
          style={{
            background: '#f8f0e8',
            border: '1px solid #e8d9d0',
            color: '#3f2c29',
            padding: '10px 22px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#f0e4d8'}
          onMouseOut={(e) => e.currentTarget.style.background = '#f8f0e8'}
        >
          {view === 'results' ? '← Повернутися' : '🔑 Вхід для викладача'}
        </button>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '50px 20px' }}>
        {view === 'vote' ? (
          <>
            <h1 style={{
              textAlign: 'center',
              fontSize: '2.05rem',
              fontWeight: '700',
              marginBottom: '50px',
              color: '#3f2c29',
              lineHeight: '1.15'
            }}>
              Оберіть 3 найпрекрасніші квіти<br />(місця 1–3)
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
                      borderRadius: '24px',
                      overflow: 'hidden',
                      cursor: isDone ? 'default' : 'pointer',
                      border: isSel ? '3px solid #e8b4b0' : '1px solid #f0e4d8',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      boxShadow: isSel
                        ? '0 20px 35px rgba(232, 180, 176, 0.15)'
                        : '0 10px 25px rgba(0,0,0,0.08)',
                      transform: isSel ? 'translateY(-4px)' : 'none'
                    }}
                  >
                    <img
                      src={f.img}
                      alt={f.name}
                      style={{
                        width: '100%',
                        height: '205px',
                        objectFit: 'cover',
                        transition: 'transform 0.4s'
                      }}
                    />
                    <div style={{
                      padding: '18px 14px',
                      textAlign: 'center',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#3f2c29'
                    }}>
                      {f.name}
                    </div>
                    {isSel && (
                      <div style={{
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        background: '#ffffff',
                        color: '#3f2c29',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '0.95rem',
                        fontWeight: '800',
                        border: '1px solid #e8b4b0',
                        boxShadow: '0 4px 12px rgba(232, 180, 176, 0.2)'
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
            borderRadius: '24px',
            textAlign: 'center',
            border: '1px solid #f0e4d8',
            boxShadow: '0 20px 40px rgba(0,0,0,0.07)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🌸</div>
            <h2 style={{ marginBottom: '30px', fontWeight: '700', fontSize: '1.75rem', color: '#3f2c29' }}>Вхід для викладача</h2>
            <div style={{ position: 'relative', marginBottom: '25px' }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Введіть пароль"
                onChange={e => setPass(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '2px solid #f0e4d8',
                  background: '#fdf9f4',
                  color: '#3f2c29',
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
                  color: '#b89f96'
                }}
              >
                {showPass ? '🔒' : '👁️'}
              </button>
            </div>
            <button
              onClick={() => pass === 'lr1_2026' ? setView('results') : alert('Невірний пароль!')}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #e8b4b0, #d8a7a0)',
                color: '#ffffff',
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
            borderRadius: '24px',
            border: '1px solid #f0e4d8',
            boxShadow: '0 20px 40px rgba(0,0,0,0.07)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
              borderBottom: '2px solid #f0e4d8',
              paddingBottom: '20px'
            }}>
              <h2 style={{ fontWeight: '700', fontSize: '1.85rem', margin: 0, color: '#3f2c29' }}>
                📋 Протокол голосування
              </h2>
              <div style={{
                background: '#fdf9f4',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                fontWeight: '700',
                color: '#3f2c29'
              }}>
                Голосів: <span style={{ color: '#3f2c29' }}>{votes.length}</span>
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
                      background: '#fdf9f4',
                      borderRadius: '14px 0 0 14px',
                      color: '#3f2c29',
                      fontWeight: '700'
                    }}>Квітка</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '16px 24px',
                      background: '#fdf9f4',
                      color: '#3f2c29',
                      fontWeight: '700'
                    }}>🥇 1-е місце</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '16px 24px',
                      background: '#fdf9f4',
                      color: '#3f2c29',
                      fontWeight: '700'
                    }}>🥈 2-е місце</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '16px 24px',
                      background: '#fdf9f4',
                      borderRadius: '0 14px 14px 0',
                      color: '#3f2c29',
                      fontWeight: '700'
                    }}>🥉 3-є місце</th>
                  </tr>
                </thead>
                <tbody>
                  {flowers.map((flower) => {
                    const counts = medalCounts[flower.name];
                    return (
                      <tr key={flower.id}>
                        <td style={{
                          padding: '18px 24px',
                          background: '#fdf9f4',
                          borderRadius: '14px 0 0 14px',
                          border: '1px solid #f0e4d8',
                          fontWeight: '600',
                          color: '#3f2c29'
                        }}>{flower.name}</td>
                        <td style={{
                          textAlign: 'center',
                          padding: '18px 24px',
                          background: '#fdf9f4',
                          borderTop: '1px solid #f0e4d8',
                          borderBottom: '1px solid #f0e4d8',
                          color: '#3f2c29'
                        }}>{counts[0]}</td>
                        <td style={{
                          textAlign: 'center',
                          padding: '18px 24px',
                          background: '#fdf9f4',
                          borderTop: '1px solid #f0e4d8',
                          borderBottom: '1px solid #f0e4d8',
                          color: '#3f2c29'
                        }}>{counts[1]}</td>
                        <td style={{
                          textAlign: 'center',
                          padding: '18px 24px',
                          background: '#fdf9f4',
                          borderRadius: '0 14px 14px 0',
                          border: '1px solid #f0e4d8',
                          color: '#3f2c29'
                        }}>{counts[2]}</td>
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
          background: 'rgba(255, 248, 240, 0.97)',
          backdropFilter: 'blur(24px)',
          borderTop: '3px solid #e8b4b0',
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
                      border: '1px solid #f0e4d8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#3f2c29'
                    }}
                  >
                    <span style={{ color: '#e8b4b0', fontWeight: '800' }}>
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
                  border: '2px solid #e8b4b0',
                  color: '#e8b4b0',
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
                    background: 'linear-gradient(to right, #e8b4b0, #d8a7a0)',
                    border: 'none',
                    color: '#ffffff',
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
