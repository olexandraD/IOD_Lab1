"use client";
import React, { useState } from 'react';

const flowers = [
  { id: 'f1', name: 'Червона Троянда', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f2', name: 'Біла Лілія', img: 'https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f3', name: 'Соняшник', img: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f4', name: 'Лаванда', img: 'https://images.unsplash.com/photo-1565011523534-747a8601f10a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f5', name: 'Орхідея', img: 'https://images.unsplash.com/photo-1534885391029-cc2846cb5d83?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f6', name: 'Тюльпан', img: 'https://images.unsplash.com/photo-1520323232427-4144953d9309?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f7', name: 'Півонія', img: 'https://images.unsplash.com/photo-1563241527-3004b7be0fab?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f8', name: 'Магнолія', img: 'https://images.unsplash.com/photo-1525310235261-94527ec3186d?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f9', name: 'Сакура', img: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f10', name: 'Гортензія', img: 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f11', name: 'Ірис', img: 'https://images.unsplash.com/photo-1463930601335-32f234b51bb6?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f12', name: 'Лотос', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f13', name: 'Гібіскус', img: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f14', name: 'Нарцис', img: 'https://images.unsplash.com/photo-1444021465936-c6ca81d3f3ad?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f15', name: 'Жасмин', img: 'https://images.unsplash.com/photo-1596130101538-406187764f69?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f16', name: 'Ромашка', img: 'https://images.unsplash.com/photo-1464334468620-1b55979bc62d?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f17', name: 'Хризантема', img: 'https://images.unsplash.com/photo-1603565555067-157978252a13?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f18', name: 'Гербера', img: 'https://images.unsplash.com/photo-1596273444615-80261c43abc7?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f19', name: 'Мак', img: 'https://images.unsplash.com/photo-1550504105-0909581895a6?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'f20', name: 'Кала', img: 'https://images.unsplash.com/photo-1549488344-1f9b05de0bb6?q=80&w=200&h=200&auto=format&fit=crop' },
];

const MEDALS = ['🥇 1-ше', '🥈 2-ге', '🥉 3-тє'];

// Опис інтерфейсу для усунення помилки 'Unexpected any'
interface VoteRecord {
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
    if (selected.length !== 3) return alert("Будь ласка, заповніть усі 3 призові місця!");
    const record: VoteRecord = { 
      choices: selected.map(id => flowers.find(f => f.id === id)!.name), 
      time: new Date().toLocaleTimeString() 
    };
    setVotes(prev => [...prev, record]);
    setIsDone(true);
  };

  const resetVote = () => {
    setSelected([]);
    setIsDone(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', paddingBottom: '120px', fontFamily: 'sans-serif' }}>
      <nav style={{ padding: '20px 5%', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1rem', letterSpacing: '2px', color: '#f472b6', margin: 0 }}>EXPERT PANEL</h2>
        <button onClick={() => setView(view === 'results' ? 'vote' : 'login')} style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          {view === 'results' ? '← Назад' : '🔑 Вхід'}
        </button>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {view === 'vote' ? (
          <>
            <h1 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: '900', marginBottom: '40px', background: 'linear-gradient(to right, #f472b6, #fb7185)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 40px 0' }}>
              Оберіть 3 найвпливовіші квітки (місця 1-3)
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
              {flowers.map(f => {
                const idx = selected.indexOf(f.id);
                const isSel = idx !== -1;
                return (
                  <div key={f.id} onClick={() => handleSelect(f.id)} style={{
                    background: '#0f172a', borderRadius: '16px', overflow: 'hidden', cursor: isDone ? 'default' : 'pointer',
                    border: isSel ? '3px solid #f472b6' : '1px solid #1e293b', transition: '0.2s', position: 'relative',
                    opacity: isDone && !isSel ? 0.4 : 1
                  }}>
                    <img src={f.img} alt={f.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    <div style={{ padding: '10px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>{f.name}</div>
                    {isSel && (
                      <div style={{ position: 'absolute', top: '5px', left: '5px', background: '#f472b6', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                        {MEDALS[idx]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : view === 'login' ? (
          <div style={{ maxWidth: '400px', margin: '100px auto', background: '#0f172a', padding: '40px', borderRadius: '24px', textAlign: 'center', border: '1px solid #1e293b' }}>
            <h2 style={{ marginBottom: '25px', fontWeight: '900' }}>Вхід в систему</h2>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <input 
                type={showPass ? "text" : "password"} 
                placeholder="Введіть пароль" 
                onChange={e => setPass(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #334155', background: '#020617', color: 'white', boxSizing: 'border-box' }} 
              />
              <button 
                onClick={() => setShowPass(!showPass)} 
                style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}
              >
                {showPass ? '🔒' : '👁️'}
              </button>
            </div>
            <button 
              onClick={() => pass === 'lr1_2026' ? setView('results') : alert('Невірний пароль!')} 
              style={{ width: '100%', background: '#6366f1', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              УВІЙТИ
            </button>
          </div>
        ) : (
          <div style={{ background: '#0f172a', padding: '30px', borderRadius: '24px', border: '1px solid #1e293b' }}>
            <h2 style={{ marginBottom: '25px', fontWeight: '900' }}>📊 Протокол експертних оцінок</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {votes.length > 0 ? votes.map((v, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #1e293b', background: '#1e293b44', borderRadius: '12px' }}>
                  <span style={{ fontWeight: '500' }}>{v.choices.join(' → ')}</span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{v.time}</span>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Голосів поки немає. Поверніться до голосування.</div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* НИЖНЯ ФІКСОВАНА ПАНЕЛЬ З РЕЗУЛЬТАТАМИ */}
      {selected.length > 0 && view === 'vote' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderTop: '2px solid #f472b6', padding: '20px', zIndex: 1000 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {selected.map((id, idx) => (
                <div key={id} style={{ fontSize: '0.9rem', background: '#1e293b', padding: '8px 15px', borderRadius: '10px', border: '1px solid #334155' }}>
                  <span style={{ color: '#f472b6', fontWeight: '900' }}>{idx + 1}-ше:</span> {flowers.find(f => f.id === id)?.name}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={resetVote} style={{ background: 'transparent', border: '1px solid #f472b6', color: '#f472b6', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Скинути та переголосувати</button>
              {!isDone && <button onClick={confirmVote} style={{ background: '#f472b6', border: 'none', color: 'white', padding: '10px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', boxShadow: '0 4px 15px rgba(244, 114, 182, 0.4)' }}>ПІДТВЕРДИТИ ✅</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
