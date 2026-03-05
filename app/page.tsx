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
  { id: 'a14', name: 'Орхідея Фаленопсис', icon: '🌸' },
  { id: 'a15', name: 'Антуріум', icon: '🥀' },
  { id: 'a16', name: 'Евкаліпт Сріблястий', icon: '🌿' },
  { id: 'a17', name: 'Кактус Опунція', icon: '🌵' },
  { id: 'a18', name: 'Бонсай Фікус', icon: '🌳' },
  { id: 'a19', name: 'Калатея Орната', icon: '🎨' },
  { id: 'a20', name: 'Бамбук Лаки', icon: '🎋' },
];

export default function Lab1() {
  const [view, setView] = useState('vote'); // 'vote' або 'admin'
  const [expertId, setExpertId] = useState('');
  const [selected, setSelected] = useState([]);
  const [allVotes, setAllVotes] = useState([]); // Імітація бази даних

  // Автоматичне присвоєння номера експерта при завантаженні
  useEffect(() => {
    setExpertId(`Експерт #${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const handleVote = () => {
    if (selected.length < 3) return alert("Оберіть рівно 3 рослини!");
    const newVote = { expert: expertId, choices: selected, time: new Date().toLocaleTimeString() };
    setAllVotes([...allVotes, newVote]);
    alert("Ваш вибір прийнято!");
    setSelected([]);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #d7e3ec 100%)', fontFamily: 'sans-serif', padding: '20px' }}>
      {/* Навігація */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
        <button onClick={() => setView('vote')} style={navBtnStyle(view === 'vote')}>💼 Голосування</button>
        <button onClick={() => setView('admin')} style={navBtnStyle(view === 'admin')}>🔒 Адмінка</button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.4)', padding: '5px 15px', borderRadius: '20px', display: 'inline-block', fontSize: '14px', color: '#6366f1', fontWeight: 'bold', marginBottom: '10px' }}>
          {expertId}
        </div>

        {view === 'vote' ? (
          <>
            <h1 style={{ color: '#1f2937', marginBottom: '40px' }}>Оберіть ваші 3 найулюбленіші рослини</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              {flowers.map((f) => {
                const isSelected = selected.includes(f.id);
                const rank = selected.indexOf(f.id) + 1;
                return (
                  <div key={f.id} onClick={() => toggleSelect(f.id)} style={cardStyle(isSelected)}>
                    <span style={{ fontSize: '32px' }}>{f.icon}</span>
                    <span style={{ fontWeight: '500', color: '#4b5563' }}>{f.name}</span>
                    {isSelected && <div style={rankBadgeStyle}>{rank}</div>}
                  </div>
                );
              })}
            </div>
            <button onClick={handleVote} style={mainBtnStyle}>Підтвердити вибір (v=3)</button>
          </>
        ) : (
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'left' }}>
            <h2 style={{ color: '#1f2937' }}>📊 Протокол результатів (Адмін-панель)</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                  <th style={{ padding: '10px' }}>Експерт</th>
                  <th style={{ padding: '10px' }}>Вибір (1 > 2 > 3)</th>
                  <th style={{ padding: '10px' }}>Час</th>
                </tr>
              </thead>
              <tbody>
                {allVotes.length > 0 ? allVotes.map((v, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px' }}>{v.expert}</td>
                    <td style={{ padding: '10px' }}>{v.choices.join(' > ')}</td>
                    <td style={{ padding: '10px', color: '#9ca3af' }}>{v.time}</td>
                  </tr>
                )) : <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>Голосів ще немає</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Стилі
const navBtnStyle = (active) => ({
  padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
  background: active ? 'white' : 'transparent', color: active ? '#1f2937' : '#6b7280',
  boxShadow: active ? '0 4px 6px rgba(0,0,0,0.05)' : 'none', fontWeight: '500', transition: '0.3s'
});

const cardStyle = (active) => ({
  background: 'white', padding: '20px', borderRadius: '15px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '15px', transition: '0.2s',
  boxShadow: active ? '0 0 0 3px #6366f1' : '0 4px 6px rgba(0,0,0,0.02)',
  position: 'relative', transform: active ? 'scale(1.02)' : 'none'
});

const rankBadgeStyle = {
  position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)',
  background: '#6366f1', color: 'white', width: '24px', height: '24px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'
};

const mainBtnStyle = {
  marginTop: '40px', padding: '15px 40px', borderRadius: '30px', border: 'none',
  background: '#6366f1', color: 'white', fontSize: '16px', fontWeight: 'bold',
  cursor: 'pointer', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
};
