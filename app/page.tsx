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
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '25px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setView('vote')} style={navBtn(view === 'vote')}>💼 Голосування</button>
        <button onClick={() => setView('admin')} style={navBtn(view === 'admin')}>🔒 Адмінка</button>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <span style={{ background: '#6366f1', color: 'white', padding: '6px 18px', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)' }}>
            {expertId}
          </span>
        </div>

        {view === 'vote' ? (
          <div style={{ width: '100%' }}>
            <h1 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '40px', fontSize: '2.2rem' }}>Оберіть 3 найулюбленіші рослини</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {flowers.map((f) => {
                const isSel = selected.includes(f.id);
                const rank = selected.indexOf(f.id) + 1;
                return (
                  <div key={f.id} onClick={() => handleSelect(f.id)} style={card(isSel)}>
                    <span style={{ fontSize: '42px', marginBottom: '10px' }}>{f.icon}</span>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#334155' }}>{f.name}</span>
                    {isSel && <div style={badge}>{rank}</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <button onClick={submitVote} style={mainBtn}>Надіслати вибір</button>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 15px 30px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#1e293b', marginBottom: '25px' }}>📊 Протокол експертних оцінок</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '18px' }}>Експерт</th>
                    <th style={{ padding: '18px' }}>Пріоритетність (1 &gt; 2 &gt; 3)</th>
                    <th style={{ padding: '18px' }}>Час</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((v, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '18px', fontWeight: '500' }}>{v.expert}</td>
                      <td style={{ padding: '18px', color: '#6366f1', fontWeight: 'bold' }}>{v.choices.join(' → ')}</td>
                      <td style={{ padding: '18px', color: '#94a3b8' }}>{v.time}</td>
                    </tr>
                  ))}
                  {votes.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: '50px', textAlign: 'center', color: '#cbd5e1' }}>Дані поки відсутні</td></tr>
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
  padding: '12px 28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
  background: active ? '#6366f1' : 'transparent', color: active ? 'white' : '#64748b',
  fontWeight: '600', transition: 'all 0.3s', boxShadow: active ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
});

const card = (sel: boolean): React.CSSProperties => ({
  background: 'white', padding: '30px', borderRadius: '22px', cursor: 'pointer',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', transition: 'all 0.3s',
  boxShadow: sel ? '0 0 0 3px #6366f1' : '0 4px 6px rgba(0,0,0,0.03)',
  position: 'relative', transform: sel ? 'translateY(-5px)' : 'none'
});

const badge: React.CSSProperties = {
  position: 'absolute', right: '15px', top: '15px', background: '#6366f1',
  color: 'white', width: '32px', height: '32px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px'
};

const mainBtn: React.CSSProperties = {
  padding: '20px 80px', borderRadius: '40px', border: 'none', background: '#6366f1',
  color: 'white', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
  boxShadow: '0 12px 20px rgba(99, 102, 241, 0.3)', transition: 'transform 0.2s'
};
