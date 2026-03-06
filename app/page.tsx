"use client";
import React, { useState } from 'react';
import Image from 'next/image';

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

  // Підрахунок медалей для кожної квітки
  const medalCounts = flowers.reduce((acc, flower) => {
    acc[flower.name] = [0, 0, 0]; // [gold, silver, bronze]
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
          fontWeight: '800',
          background: 'linear-gradient(to right, #f472b6, #fb7185, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ЛР1: Розподілене Введення Даних
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
              fontSize: '2rem', // Зменшено розмір заголовка
              fontWeight: '900',
              marginBottom: '50px',
              background: 'linear-gradient(to right, #f472b6, #fb7185, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.1'
            }}>
              Оберіть 3 найвпливовіші об’єкти (місця 1–3)
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
                    <Image
                      src={f.img}
                      alt={f.name}
                      width={300}
                      height={200}
                      style={{
                        width: '100%',
                        height: '190px',
                        objectFit: 'cover',
                        transition: 'transform 0.4s'
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
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0 10px',
                fontSize: '1rem'
              }}>
                <thead>
                  <tr>
                    <th style={{
                      textAlign: 'left',
                      padding: '16px 24px',
                      background: '#1e293b',
                      borderRadius: '12px 0 0 12px',
                      color: '#f472b6',
                      fontWeight: '900'
                    }}>Квітка / Об&apos;єкт</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '16px 24px',
                      background: '#1e293b',
                      color: '#f472b6',
                      fontWeight: '900'
                    }}>🥇 1-е місце</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '16px 24px',
                      background: '#1e293b',
                      color: '#f472b6',
                      fontWeight: '900'
                    }}>🥈 2-е місце</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '16px 24px',
                      background: '#1e293b',
                      borderRadius: '0 12px 12px 0',
                      color: '#f472b6',
                      fontWeight: '900'
                    }}>🥉 3-є місце</th>
                  </tr>
                </thead>
                <tbody>
                  {flowers.map((flower) => {
                    const counts = medalCounts[flower.name];
                    return (
                      <tr key={flower.id}>
                        <td style={{
                          padding: '16px 24px',
                          background: '#1e293b44',
                          borderRadius: '12px 0 0 12px',
                          border: '1px solid #334155',
                          fontWeight: '600'
                        }}>{flower.name}</td>
                        <td style={{
                          textAlign: 'center',
                          padding: '16px 24px',
                          background: '#1e293b44',
                          borderTop: '1px solid #334155',
                          borderBottom: '1px solid #334155'
                        }}>{counts[0]}</td>
                        <td style={{
                          textAlign: 'center',
                          padding: '16px 24px',
                          background: '#1e293b44',
                          borderTop: '1px solid #334155',
                          borderBottom: '1px solid #334155'
                        }}>{counts[1]}</td>
                        <td style={{
                          textAlign: 'center',
                          padding: '16px 24px',
                          background: '#1e293b44',
                          borderRadius: '0 12px 12px 0',
                          border: '1px solid #334155'
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
