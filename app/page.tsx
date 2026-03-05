"use client";
import React, { useState, useEffect } from 'react';

const flowers = [
  { id: 'a1', name: 'Монстера Деліціоза', icon: '🪴' },
  { id: 'a2', name: 'Сансев’єрія', icon: '🌵' },
  { id: 'a3', name: 'Заміокулькас', icon: '🌿' },
  { id: 'a4', name: 'Фікус Лірата', icon: '🍃' },
  { id: 'a5', name: 'Хлорофітум', icon: '🌱' },
  { id: 'a6', name: 'Спатифілум', icon: '🏳️' },
  { id: 'a7', name: 'Драцена Маргіната', icon: '🌴' },
  { id: 'a8', name: 'Алое Віра', icon: '🎍' },
  { id: 'a9', name: 'Папороть', icon: '🌿' },
  { id: 'a10', name: 'Ехеверія', icon: '🪴' },
  { id: 'a11', name: 'Лаванда', icon: '🪻' },
  { id: 'a12', name: 'Протея Королівська', icon: '🏵️' },
  { id: 'a13', name: 'Стреліція', icon: '🐦' },
  { id: 'a14', name: 'Орхидея Фаленопсис', icon: '🌸' },
  { id: 'a15', name: 'Антуріум', icon: '🥀' },
  { id: 'a16', name: 'Евкаліпт Сріблястий', icon: '🌿' },
  { id: 'a17', name: 'Кактус Опунція', icon: '🌵' },
  { id: 'a18', name: 'Бонсай Фікус', icon: '🌳' },
  { id: 'a19', name: 'Калатея Орната', icon: '🎨' },
  { id: 'a20', name: 'Бамбук Лаки', icon: '🎋' },
];

interface VoteRecord {
  expert: string;
  choices: string[];
  time: string;
}

export default function Lab1() {
  const [view, setView] = useState<'vote' | 'admin'>('vote');
  const [expertId, setExpertId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [votes, setVotes] = useState<VoteRecord[]>([]);

  useEffect(() => {
    setExpertId(`Експерт #${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const submitVote = () => {
    if (selected.length !== 3) return alert("Оберіть рівно 3 рослини!");
    const record: VoteRecord = {
      expert: expertId,
      choices: selected.map(id => flowers.find(f => f.id === id)?.name || id),
      time: new Date().toLocaleTimeString()
    };
    setVotes([...votes, record]);
    alert("Ваш голос враховано!");
    setSelected([]);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'sans-serif', padding: '0 0 50px 0' }}>
      {/* Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '20px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', sticky: 'top', zIndex: 100 }}>
        <button onClick={() => setView('vote')} style={navBtn(view === 'vote')}>💼 Голосування</button>
        <button onClick={() => setView('admin')} style={navBtn(view === 'admin')}>🔒 Адмінка</button>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
            {expertId}
          </span>
        </div>

        {view === 'vote' ? (
          <div style={{ width: '100%' }}>
            <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '40px' }}>Оберіть ваші 3 найулюбленіші рослини</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {flowers.map((f) => {
                const isSel = selected.includes(f.id);
                const rank = selected.indexOf(f.id) + 1;
                return (
                  <div key={f.id} onClick={() => handleSelect(f.id)} style={card(isSel)}>
                    <span style={{ fontSize: '40px' }}>{f.icon}</span>
                    <span style={{ fontSize: '18px', fontWeight: '500' }}>{f.name}</span>
                    {isSel && <div style={badge}>{rank}</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <button onClick={submitVote} style={mainBtn}>Підтвердити вибір (v=3)</button>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '20px' }}>📊 Протокол результатів</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #edf2f7', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>Експерт</th>
                    <th style={{ padding: '15px' }}>Пріоритетність (1 > 2 > 3)</th>
                    <th style={{ padding: '15px' }}>Час</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((v, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '15px' }}>{v.expert}</td>
                      <td style={{ padding: '15px', color: '#4f46e5', fontWeight: 'bold' }}>{v.choices.join(' → ')}</td>
                      <td style={{ padding: '15px', color: '#718096' }}>{v.time}</td>
                    </tr>
                  ))}
                  {votes.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: '30px', textAlign: 'center', color: '#a0aec0' }}>Дані відсутні</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const navBtn = (active: boolean): React.CSSProperties => ({
  padding: '10px 25px', borderRadius: '12px', border: 'none', cursor: 'pointer',
  background: active ? '#4f46e5' : 'transparent', color: active ? 'white' : '#4b5563',
  fontWeight: '600', transition: '0.3s'
});

const card = (sel: boolean): React.CSSProperties => ({
  background: 'white', padding: '30px', borderRadius: '20px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '20px', transition: '0.3s',
  boxShadow: sel ? '0 0 0 3px #4f46e5' : '0 4px 6px rgba(0,0,0,0.02)',
  position: 'relative'
});

const badge: React.CSSProperties = {
  position: 'absolute', right: '20px', top: '20px', background: '#4f46e5',
  color: 'white', width: '30px', height: '30px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
};

const mainBtn: React.CSSProperties = {
  padding: '18px 60px', borderRadius: '35px', border: 'none', background: '#4f46e5',
  color: 'white', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
  boxShadow: '0 10px 15px rgba(79, 70, 229, 0.3)'
};
