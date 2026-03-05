"use client";
import React, { useState, useEffect } from 'react';

const flowers = [
  { id: 'f1', name: 'Червона Троянда', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f2', name: 'Біла Лілія', img: 'https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f3', name: 'Соняшник', img: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f4', name: 'Лаванда', img: 'https://images.unsplash.com/photo-1565011523534-747a8601f10a?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f5', name: 'Орхідея', img: 'https://images.unsplash.com/photo-1534885391029-cc2846cb5d83?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f6', name: 'Тюльпан', img: 'https://images.unsplash.com/photo-1520323232427-4144953d9309?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f7', name: 'Півонія', img: 'https://images.unsplash.com/photo-1563241527-3004b7be0fab?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f8', name: 'Магнолія', img: 'https://images.unsplash.com/photo-1525310235261-94527ec3186d?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f9', name: 'Сакура', img: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f10', name: 'Гортензія', img: 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f11', name: 'Ірис', img: 'https://images.unsplash.com/photo-1463930601335-32f234b51bb6?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f12', name: 'Лотос', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f13', name: 'Гібіскус', img: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f14', name: 'Нарцис', img: 'https://images.unsplash.com/photo-1444021465936-c6ca81d3f3ad?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f15', name: 'Жасмин', img: 'https://images.unsplash.com/photo-1596130101538-406187764f69?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f16', name: 'Ромашка', img: 'https://images.unsplash.com/photo-1464334468620-1b55979bc62d?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f17', name: 'Хризантема', img: 'https://images.unsplash.com/photo-1603565555067-157978252a13?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f18', name: 'Гербера', img: 'https://images.unsplash.com/photo-1596273444615-80261c43abc7?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f19', name: 'Мак', img: 'https://images.unsplash.com/photo-1550504105-0909581895a6?q=80&w=300&h=300&auto=format&fit=crop' },
  { id: 'f20', name: 'Кала', img: 'https://images.unsplash.com/photo-1549488344-1f9b05de0bb6?q=80&w=300&h=300&auto=format&fit=crop' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

interface Vote { expert: string; choices: string[]; time: string; }

export default function FlowerExpertApp() {
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
    if (selected.length !== 3) return alert("Будь ласка, оберіть ТОП-3 колективи!");
    const names = selected.map(id => flowers.find(f => f.id === id)!.name);
    const newVote = { expert: expertId, choices: names, time: new Date().toLocaleTimeString() };
    setVotes(prev => [...prev, newVote]);
    setUserVote(names);
    localStorage.setItem('myVote', JSON.stringify(names));
    alert("Ваш вибір успішно збережено!");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 5%', borderBottom: '1px solid #1e293b', background: '#020617', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: '900', letterSpacing: '2px', color: '#f472b6', fontSize: '1.2rem' }}>FLOWER EXPERT RANKING</div>
        <button onClick={() => setView(view === 'admin' ? 'vote' : 'login')} style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
          {view === 'admin' ? '← ДО ГОЛОСУВАННЯ' : '🔑 АДМІН-ПАНЕЛЬ'}
        </button>
      </nav>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {view === 'vote' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h1 style={{ fontSize: '3rem', marginBottom: '10px', background: 'linear-gradient(to right, #f472b6, #fb7185)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '900' }}>Експертне ранжування квітів</h1>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Анонімне попереднє преференційне голосування: оберіть 3 найвпливовіші колективи.
              </p>
              {userVote && (
                <div style={{ padding: '20px', background: 'rgba(34, 197, 94, 0.1)', border: '2px solid #22c55e', borderRadius: '16px', display: 'inline-block', animation: 'fadeIn 0.5s' }}>
                  <span style={{ fontSize: '1.2rem' }}>✅ Ваш результат збережено: <b>{userVote.join(' → ')}</b></span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px' }}>
              {flowers.map(f => {
                const idx = selected.indexOf(f.id);
                const isSel = idx !== -1;
                return (
                  <div key={f.id} onClick={() => !userVote && (isSel ? setSelected(selected.filter(i => i !== f.id)) : selected.length < 3 && setSelected([...selected, f.id]))} style={{
                    background: '#0f172a', borderRadius: '24px', overflow: 'hidden', cursor: userVote ? 'default' : 'pointer', border: isSel ? '4px solid #f472b6' : '1px solid #1e293b', transition: 'all 0.3s ease', position: 'relative', transform: isSel ? 'scale(1.03)' : 'none', boxShadow: isSel ? '0 0 20px rgba(244, 114, 182, 0.3)' : 'none'
                  }}>
                    <img src={f.img} alt={f.name} style={{ width: '100%', height: '220px', objectFit: 'cover', opacity: userVote ? 0.4 : 1 }} />
                    <div style={{ padding: '20px', textAlign: 'center', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.5px' }}>{f.name}</div>
                    {isSel && (
                      <div style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '50px', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))', animation: 'bounce 0.5s' }}>
                        {MEDALS[idx]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!userVote && (
              <div style={{ textAlign: 'center', marginTop: '70px' }}>
                <button onClick={handleVote} style={{ background: 'linear-gradient(45deg, #f472b6, #db2777)', color: 'white', border: 'none', padding: '25px 100px', borderRadius: '50px', fontSize: '22px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 15px 30px rgba(219, 39, 119, 0.4)', transition: 'transform 0.2s' }}>
                  ЗАФІКСУВАТИ ТОП-3
                </button>
              </div>
            )}
          </>
        ) : view === 'login' ? (
          <div style={{ maxWidth: '450px', margin: '80px auto', background: '#0f172a', padding: '50px', borderRadius: '32px', textAlign: 'center', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px', fontWeight: '900' }}>Вхід в адмінку</h2>
            <input type="text" placeholder="Логін" onChange={e => setLogin(e.target.value)} style={inpStyle} />
            <div style={{ position: 'relative' }}>
              <input type={showPass ? "text" : "password"} placeholder="Пароль" onChange={e => setPass(e.target.value)} style={inpStyle} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>{showPass ? '🔒' : '👁️'}</button>
            </div>
            <button onClick={() => (login === 'admin' && pass === 'lr1_2026') ? setView('admin') : alert("Доступ заборонено!")} style={actionBtn}>УВІЙТИ</button>
          </div>
        ) : (
          <div style={{ background: '#0f172a', padding: '40px', borderRadius: '32px', border: '1px solid #1e293b' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px', fontWeight: '900' }}>📊 Протокол експертного опитування</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '2px solid #1e293b' }}>
                    <th style={{ padding: '20px' }}>Експерт</th>
                    <th style={{ padding: '20px' }}>Місця (🥇 → 🥈 → 🥉)</th>
                    <th style={{ padding: '20px' }}>Час сесії</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((v, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }}>
                      <td style={{ padding: '20px', fontWeight: 'bold', color: '#f472b6' }}>{v.expert}</td>
                      <td style={{ padding: '20px', letterSpacing: '1px' }}>{v.choices.join(' — ')}</td>
                      <td style={{ padding: '20px', color: '#64748b' }}>{v.time}</td>
                    </tr>
                  ))}
                  {votes.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: '60px', textAlign: 'center', color: '#475569', fontSize: '1.2rem' }}>Система очікує на перші голоси експертів...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
      `}</style>
    </div>
  );
}

const inpStyle: React.CSSProperties = { width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '12px', border: '1px solid #1e293b', background: '#020617', color: 'white', fontSize: '16px', boxSizing: 'border-box' };
const actionBtn: React.CSSProperties = { background: '#f472b6', color: 'white', border: 'none', padding: '18px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', width: '100%', fontSize: '16px', letterSpacing: '1px' };
