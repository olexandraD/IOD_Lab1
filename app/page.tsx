"use client";
import React, { useState, useEffect } from 'react';

const flowers = [
  { id: 'f1', name: 'Червона Троянда', icon: '🌹' },
  { id: 'f2', name: 'Тюльпан', icon: '🌷' },
  { id: 'f3', name: 'Соняшник', icon: '🌻' },
  { id: 'f4', name: 'Орхідея', icon: '🌸' },
  { id: 'f5', name: 'Сакура', icon: '🌸' },
  { id: 'f6', name: 'Ромашка', icon: '🌼' },
  { id: 'f7', name: 'Лотос', icon: '🪷' },
  { id: 'f8', name: 'Гібіскус', icon: '🌺' },
  { id: 'f9', name: 'Лаванда', icon: '🪻' },
  { id: 'f10', name: 'Біла Лілія', icon: '🪡' },
  { id: 'f11', name: 'Півонія', icon: '🌺' },
  { id: 'f12', name: 'Ірис', icon: '🪁' },
  { id: 'f13', name: 'Магнолія', icon: '🏵️' },
  { id: 'f14', name: 'Гортензія', icon: '💠' },
  { id: 'f15', name: 'Гвоздика', icon: '💮' },
  { id: 'f16', name: 'Кульбаба', icon: '🌼' },
  { id: 'f17', name: 'Айстра', icon: '🟣' },
  { id: 'f18', name: 'Жоржина', icon: '🎯' },
  { id: 'f19', name: 'Мак', icon: '🔴' },
  { id: 'f20', name: 'Фіалка', icon: '🟣' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

export default function FlowerApp() {
  const [view, setView] = useState<'vote' | 'admin' | 'login'>('vote');
  const [expertId, setExpertId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  
  // Дані для входу в адмінку
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');

  useEffect(() => {
    setExpertId(`Expert_${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const handleAdminLogin = () => {
    if (login === 'admin' && pass === 'lr1_2026') {
      setView('admin');
    } else {
      alert("Невірний логін або пароль!");
    }
  };

  const submitVote = () => {
    if (selected.length !== 3) return alert("Оберіть топ-3 квітки!");
    const record = {
      expert: expertId,
      choices: selected.map(id => flowers.find(f => f.id === id)?.name),
      time: new Date().toLocaleTimeString()
    };
    setVotes([...votes, record]);
    alert("Ваш вибір збережено! Дякуємо.");
    setSelected([]);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Навігація */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 5%', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(to right, #f472b6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FLORAL AWARDS</div>
        <button onClick={() => setView(view === 'admin' ? 'vote' : 'login')} style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer' }}>
          {view === 'admin' ? '← Вийти' : '🔑 Адмін'}
        </button>
      </nav>

      <main style={{ padding: '40px 5%' }}>
        {view === 'vote' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px' }}>Визначте квітковий топ-3</h1>
              <p style={{ color: '#94a3b8' }}>Ваш анонімний профіль: <span style={{ color: '#f472b6' }}>{expertId}</span></p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
              {flowers.map((f) => {
                const index = selected.indexOf(f.id);
                return (
                  <div key={f.id} onClick={() => handleSelect(f.id)} style={{
                    background: index !== -1 ? 'rgba(99, 102, 241, 0.1)' : '#1e293b',
                    border: index !== -1 ? '2px solid #6366f1' : '1px solid #334155',
                    padding: '20px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', transition: '0.2s', position: 'relative'
                  }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>{f.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{f.name}</div>
                    {index !== -1 && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px' }}>{MEDALS[index]}</div>}
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <button onClick={submitVote} style={{ background: 'linear-gradient(to right, #f472b6, #6366f1)', color: 'white', border: 'none', padding: '18px 60px', borderRadius: '40px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 25px rgba(244, 114, 182, 0.3)' }}>Надіслати результати</button>
            </div>
          </>
        )}

        {view === 'login' && (
          <div style={{ maxWidth: '400px', margin: '100px auto', background: '#1e293b', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
            <h2>Вхід для викладача</h2>
            <input type="text" placeholder="Логін" onChange={e => setLogin(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Пароль" onChange={e => setPass(e.target.value)} style={inputStyle} />
            <button onClick={handleAdminLogin} style={{ ...mainBtn, width: '100%' }}>Увійти</button>
          </div>
        )}

        {view === 'admin' && (
          <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px' }}>
            <h2 style={{ marginBottom: '20px' }}>📊 Протокол експертних оцінок</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '15px' }}>ID Експерта</th>
                  <th style={{ padding: '15px' }}>🥇 1 місце</th>
                  <th style={{ padding: '15px' }}>🥈 2 місце</th>
                  <th style={{ padding: '15px' }}>🥉 3 місце</th>
                  <th style={{ padding: '15px' }}>Час</th>
                </tr>
              </thead>
              <tbody>
                {votes.map((v, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '15px' }}>{v.expert}</td>
                    <td style={{ padding: '15px', color: '#fcd34d' }}>{v.choices[0]}</td>
                    <td style={{ padding: '15px', color: '#e2e8f0' }}>{v.choices[1]}</td>
                    <td style={{ padding: '15px', color: '#f97316' }}>{v.choices[2]}</td>
                    <td style={{ padding: '15px', color: '#64748b' }}>{v.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: 'white' };
const mainBtn = { background: '#6366f1', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
