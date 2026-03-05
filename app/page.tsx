"use client";
import React, { useState } from 'react';

const flowers = [
  { id: 'f1', name: 'Червона Троянда', img: 'https://picsum.photos/id/1015/300/200' },
  { id: 'f2', name: 'Біла Лілія', img: 'https://picsum.photos/id/102/300/200' },
  { id: 'f3', name: 'Соняшник', img: 'https://picsum.photos/id/103/300/200' },
  { id: 'f4', name: 'Лаванда', img: 'https://picsum.photos/id/104/300/200' },
  { id: 'f5', name: 'Орхідея', img: 'https://picsum.photos/id/105/300/200' },
  { id: 'f6', name: 'Тюльпан', img: 'https://picsum.photos/id/106/300/200' },
  { id: 'f7', name: 'Півонія', img: 'https://picsum.photos/id/107/300/200' },
  { id: 'f8', name: 'Магнолія', img: 'https://picsum.photos/id/108/300/200' },
  { id: 'f9', name: 'Сакура', img: 'https://picsum.photos/id/109/300/200' },
  { id: 'f10', name: 'Гортензія', img: 'https://picsum.photos/id/110/300/200' },
  { id: 'f11', name: 'Ірис', img: 'https://picsum.photos/id/111/300/200' },
  { id: 'f12', name: 'Лотос', img: 'https://picsum.photos/id/112/300/200' },
  { id: 'f13', name: 'Гібіскус', img: 'https://picsum.photos/id/113/300/200' },
  { id: 'f14', name: 'Нарцис', img: 'https://picsum.photos/id/114/300/200' },
  { id: 'f15', name: 'Жасмин', img: 'https://picsum.photos/id/115/300/200' },
  { id: 'f16', name: 'Ромашка', img: 'https://picsum.photos/id/116/300/200' },
  { id: 'f17', name: 'Хризантема', img: 'https://picsum.photos/id/117/300/200' },
  { id: 'f18', name: 'Гербера', img: 'https://picsum.photos/id/118/300/200' },
  { id: 'f19', name: 'Мак', img: 'https://picsum.photos/id/119/300/200' },
  { id: 'f20', name: 'Кала', img: 'https://picsum.photos/id/120/300/200' },
];

const MEDALS = ['🥇 1', '🥈 2', '🥉 3'];

// Оновлений інтерфейс з автоматичним анонімним експертом
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
      return alert("Будь ласка, заповніть усі 3 призові місця!");
    }

    // Автоматичне присвоювання анонімного експерта
    const expert = `Експерт ${votes.length + 1}`;

    const record: VoteRecord = {
      expert,
      choices: selected.map(id => flowers.find(f => f.id === id)!.name),
      time: new Date().toLocaleTimeString('uk-UA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setVotes(prev => [...prev, record]);
    setIsDone(true);
  };

  const resetVote = () => {
    setSelected([]);
    setIsDone(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', 
      color: '#f8fafc', 
      paddingBottom: '140px', 
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      {/* Навігація */}
      <nav style={{ 
        padding: '20px 5%', 
        borderBottom: '1px solid #334155', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h2 style={{ 
          fontSize: '1.1rem', 
          letterSpacing: '3px', 
          color: '#f472b6', 
          margin: 0, 
          fontWeight: '800' 
        }}>
          EXPERT PANEL
        </h2>
        <button 
          onClick={() => setView(view === 'results' ? 'vote' : 'login')} 
          style={{ 
            background: '#1e293b', 
            border: '1px solid #334155', 
            color: '#fff', 
            padding: '10px 20px', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            fontWeight: '700',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#334155'}
          onMouseOut={(e) => e.currentTarget.style.background = '#1e293b'}
        >
          {view === 'results' ? '← Назад до голосування' : '🔑 Вхід для викладача'}
        </button>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '50px 20px' }}>
        {view === 'vote' ? (
          <>
            <h1 style={{ 
              textAlign: 'center', 
              fontSize: '2.8rem', 
              fontWeight: '900', 
              marginBottom: '50px', 
              background: 'linear-gradient(to right, #f472b6, #fb7185, #a78bfa)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.1'
            }}>
              Оберіть 3 найвпливовіші об’єкти<br />(місця 1–3)
            </h1>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '24px' 
            }}>
              {flowers.map(f => {
                const idx = selected.indexOf(f.id);
                const isSel = idx !== -1;

                return (
                  <div 
                    key={f.id} 
                    onClick={() => handleSelect(f.id)} 
                    style={{
                      background: '#0f172a',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      cursor: isDone ? 'default' : 'pointer',
                      border: isSel ? '4px solid #f472b6' : '2px solid #1e293b',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      boxShadow: isSel 
                        ? '0 20px 25px -5px rgba(244, 114, 182, 0.3)' 
                        : '0 10px 15px -3px rgba(0,0,0,0.3)',
                      transform: isSel ? 'scale(1.04)' : 'scale(1)',
                      opacity: isDone && !isSel ? 0.45 : 1
                    }}
                  >
                    <img 
                      src={f.img} 
                      alt={f.name} 
                      style={{ 
                        width: '100%', 
                        height: '190px', 
                        objectFit: 'cover',
                        transition: 'transform 0.4s'
                      }} 
                      onError={(e) => {
                        e.currentTarget.src = 'https://picsum.photos/id/1005/300/200';
                      }}
                    />
                    
                    <div style={{ 
                      padding: '16px 12px', 
                      textAlign: 'center', 
                      fontSize: '0.95rem', 
                      fontWeight: '700',
                      background: 'rgba(15, 23, 42, 0.6)',
                      backdropFilter: 'blur(8px)'
                    }}>
                      {f.name}
                    </div>

                    {isSel && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        left: '12px', 
                        background: 'linear-gradient(135deg, #f472b6, #db2777)', 
                        color: 'white', 
                        padding: '6px 14px', 
                        borderRadius: '9999px', 
                        fontSize: '0.95rem', 
                        fontWeight: '900', 
                        boxShadow: '0 8px 16px rgba(244, 114, 182, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
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
            background: '#0f172a', 
            padding: '50px 40px', 
            borderRadius: '28px', 
            textAlign: 'center', 
            border: '1px solid #334155',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔐</div>
            <h2 style={{ marginBottom: '30px', fontWeight: '900', fontSize: '1.8rem' }}>Вхід для викладача</h2>
            
            <div style={{ position: 'relative', marginBottom: '25px' }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Введіть пароль"
                onChange={e => setPass(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '16px 20px', 
                  borderRadius: '14px', 
                  border: '2px solid #334155', 
                  background: '#020617', 
                  color: 'white', 
                  fontSize: '1.05rem',
                  boxSizing: 'border-box'
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
                  color: '#94a3b8' 
                }}
              >
                {showPass ? '🔒' : '👁️'}
              </button>
            </div>

            <button
              onClick={() => pass === 'lr1_2026' ? setView('results') : alert('Невірний пароль!')}
              style={{ 
                width: '100%', 
                background: 'linear-gradient(to right, #6366f1, #a78bfa)', 
                color: 'white', 
                border: 'none', 
                padding: '16px', 
                borderRadius: '14px', 
                fontWeight: '800', 
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              УВІЙТИ В ПРОТОКОЛ
            </button>
          </div>
        ) : (
          /* АДМІН ПАНЕЛЬ (протокол) */
          <div style={{ 
            background: '#0f172a', 
            padding: '40px', 
            borderRadius: '24px', 
            border: '1px solid #334155',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.6)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '30px',
              borderBottom: '2px solid #334155',
              paddingBottom: '20px'
            }}>
              <h2 style={{ fontWeight: '900', fontSize: '1.9rem', margin: 0 }}>
                📋 Протокол голосування
              </h2>
              <div style={{ 
                background: '#1e293b', 
                padding: '8px 18px', 
                borderRadius: '9999px', 
                fontSize: '0.95rem',
                fontWeight: '700',
                color: '#f472b6'
              }}>
                Голосів: <span style={{ color: '#fff' }}>{votes.length}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {votes.length > 0 ? (
                votes.map((v, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '24px', 
                      background: '#1e293b44', 
                      borderRadius: '18px',
                      border: '1px solid #334155'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '16px' 
                    }}>
                      <div style={{ 
                        fontWeight: '700', 
                        fontSize: '1.15rem', 
                        color: '#f472b6' 
                      }}>
                        {v.expert}
                      </div>
                      <div style={{ 
                        color: '#64748b', 
                        fontSize: '0.9rem', 
                        fontFamily: 'monospace' 
                      }}>
                        {v.time}
                      </div>
                    </div>

                    {/* Місця обов’язково з медалями */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {v.choices.map((choice, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '14px', 
                            fontSize: '1.1rem',
                            padding: '8px 0'
                          }}
                        >
                          <span style={{ 
                            fontSize: '1.8rem', 
                            lineHeight: 1,
                            minWidth: '42px'
                          }}>
                            {MEDALS[idx]}
                          </span>
                          <span style={{ fontWeight: '600' }}>{choice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '80px 20px', 
                  color: '#64748b',
                  fontSize: '1.1rem'
                }}>
                  Голосів ще немає. Поверніться до голосування.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Фіксована нижня панель з вибраними місцями */}
      {selected.length > 0 && view === 'vote' && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          background: 'rgba(15, 23, 42, 0.96)', 
          backdropFilter: 'blur(24px)', 
          borderTop: '3px solid #f472b6', 
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
                      background: '#1e293b', 
                      padding: '12px 20px', 
                      borderRadius: '14px', 
                      border: '2px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ 
                      color: '#f472b6', 
                      fontWeight: '900', 
                      fontSize: '1.1rem' 
                    }}>
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
                  border: '2px solid #f472b6', 
                  color: '#f472b6', 
                  padding: '12px 26px', 
                  borderRadius: '14px', 
                  cursor: 'pointer', 
                  fontWeight: '700',
                  transition: 'all 0.2s'
                }}
              >
                Скинути
              </button>
              {!isDone && (
                <button 
                  onClick={confirmVote} 
                  style={{ 
                    background: 'linear-gradient(to right, #f472b6, #db2777)', 
                    border: 'none', 
                    color: 'white', 
                    padding: '12px 36px', 
                    borderRadius: '14px', 
                    cursor: 'pointer', 
                    fontWeight: '900', 
                    fontSize: '1.05rem',
                    boxShadow: '0 10px 25px rgba(244, 114, 182, 0.4)'
                  }}
                >
                  ПІДТВЕРДИТИ ГОЛОС ✅
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
