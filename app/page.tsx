"use client";
import React, { useState, useEffect } from 'react';

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

const MEDALS = ['🥇', '🥈', '🥉'];

interface Vote { expert: string; choices: string[]; time: string; }

export default function Lab1() {
  const [view, setView] = useState<'vote' | 'admin' | 'login'>('vote');
  const [expertId, setExpertId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<string[] | null>(null);
  
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem('expertId') || `Exp_${Math.floor(Math.random() * 9000)}`;
    const savedVote = localStorage.getItem('myVote');
    setExpertId(savedId);
    localStorage.setItem('expertId', savedId);
    if (savedVote) setUserVote(JSON.parse(savedVote));
  }, []);

  const handleVote = () => {
    if (selected.length !== 3) return alert("Оберіть топ-3!");
    const names = selected.map(id => flowers.find(f => f.id === id)!.name);
    const newVote = { expert: expertId, choices: names, time: new Date().toLocaleTimeString() };
    setVotes(prev => [...prev, newVote]);
    setUserVote(names);
    localStorage.setItem('myVote', JSON.stringify(names));
    alert("Ваш голос збережено в браузері!");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 5%', borderBottom: '1px solid #1e293b', background: '#0f172a', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 'bold', letterSpacing: '1px', color: '#818cf8' }}>FLOWER EXPERT RANKING</div>
        <button onClick={() => setView(view === 'admin' ? 'vote' : 'login')} style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>
          {view === 'admin' ? '← Назад' : '🔑 Адмін'}
        </button>
      </nav>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {view === 'vote' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Експертне ранжування квітів</h1>
              <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
                Анонімне попереднє преференційне голосування: оберіть 3 найвпливовіші колективи.
              </p>
              {userVote && (
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '12px', display: 'inline-block' }}>
                  ✅ Ваш вибір збережено: <b>{userVote.join(' → ')}</b>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {flowers.map(f => {
                const idx = selected.indexOf(f.id);
                const isSel = idx !== -1;
                return (
                  <div key={f.id} onClick={() => !userVote && (isSel ? setSelected(selected.filter(i => i !== f.id)) : selected.length < 3 && setSelected([...selected, f.id]))} style={{
                    background: '#1e293b', borderRadius: '20px', overflow: 'hidden', cursor: userVote ? 'default' : 'pointer', border: isSel ? '3px solid #6366f1' : '1px solid transparent', transition: '0.2s', position: 'relative'
                  }}>
                    <img src={f.img} alt={f.name} style={{ width: '100%', height: '180px', objectFit: 'crop', opacity: userVote ? 0.6 : 1 }} />
                    <div style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold' }}>{f.name}</div>
                    {isSel && (
                      <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '35px', filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))' }}>
                        {MEDALS[idx]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!userVote && (
              <div style={{ textAlign: 'center', marginTop: '60px' }}>
                <button onClick={handleVote} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '20px 80px', borderRadius: '40px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}>
                  Підтвердити ТОП-3
                </button>
              </div>
            )}
          </>
        ) : view === 'login' ? (
          <div style={{ maxWidth: '400px', margin: '100px auto', background: '#1e293b', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
            <h2>Вхід в систему</h2>
            <input type="text" placeholder="Логін" onChange={e => setLogin(e.target.value)} style={inp} />
            <div style={{ position: 'relative' }}>
              <input type={showPass ? "text" : "password"} placeholder="Пароль" onChange={e => setPass(e.target.value)} style={inp} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '10px', top: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>{showPass ? '👁️' : '🕶️'}</button>
            </div>
            <button onClick={() => (login === 'admin' && pass === 'lr1_2026') ? setView('admin') : alert("Помилка!")} style={mainBtn}>Увійти</button>
          </div>
        ) : (
          <div style={{ background: '#1e293b', padding: '30px', borderRadius: '20px' }}>
            <h2>📊 Протокол голосування</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead><tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '15px' }}>Експерт</th><th style={{ padding: '15px' }}>Місця (1-2-3)</th><th style={{ padding: '15px' }}>Час</th>
              </tr></thead>
              <tbody>{votes.map((v, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '15px' }}>{v.expert}</td>
                  <td style={{ padding: '15px' }}>{v.choices.join(' → ')}</td>
                  <td style={{ padding: '15px', fontSize: '12px', color: '#64748b' }}>{v.time}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const inp = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: 'white', boxSizing: 'border-box' as const };
const mainBtn = { background: '#6366f1', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' as const, width: '100%' };
