"use client";
import React, { useState, useEffect } from 'react';

// Об'єкти згідно з варіантом "Квіти" [Завдання 2]
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

interface Vote {
  expert: string;
  choices: string[];
  time: string;
}

export default function Lab1() {
  const [view, setView] = useState<'vote' | 'admin'>('vote');
  const [expertId, setExpertId] = useState<string>('');
  const [selected, setSelected] = useState<string[]>([]);
  const [allVotes, setAllVotes] = useState<Vote[]>([]);

  // Автоматичне присвоєння номера експерта для конфіденційності [Завдання 7]
  useEffect(() => {
    setExpertId(`Експерт #${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const handleVote = () => {
    if (selected.length < 3) return alert("Будь ласка, оберіть рівно 3 рослини!");
    const newVote: Vote = { 
      expert: expertId, 
      choices: selected, 
      time: new Date().toLocaleTimeString() 
    };
    setAllVotes(prev => [...prev, newVote]);
    alert("Ваш голос враховано!");
    setSelected([]);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      {/* Навігація - пункт 4 завдання */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '30px' }}>
        <button onClick={() => setView('vote')} style={navBtnStyle(view === 'vote')}>💼 Голосування</button>
        <button onClick={() => setView('admin')} style={navBtnStyle(view === 'admin')}>🔒 Адмінка</button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: '#6366f1', padding: '6px 16px', borderRadius: '20px', display: 'inline-block', fontSize: '13px', color: 'white', fontWeight: '600', marginBottom: '16px' }}>
          {expertId}
        </div>

        {view === 'vote' ? (
          <>
            <h1 style={{ color: '#1e293b', fontSize: '2.5rem', marginBottom: '8px' }}>Оберіть 3 пріоритетні об'єкти</h1>
            <p style={{ color: '#64748b', marginBottom: '40px' }}>Множинне порівняння (v=3) згідно з варіантом А11</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {flowers.map((f) => {
                const isSelected = selected.includes(f.id);
                const rank = selected.indexOf(f.id) + 1;
                return (
                  <div key={f.id} onClick={() => toggleSelect(f.id)} style={cardStyle(isSelected)}>
                    <span style={{ fontSize: '40px', marginBottom: '10px' }}>{f.icon}</span>
                    <span style={{ fontWeight: '600', color: '#334155' }}>{f.name}</span>
                    {isSelected && <div style={rankBadgeStyle}>{rank}</div>}
                  </div>
                );
              })}
            </div>
            
            <button onClick={handleVote} style={mainBtnStyle}>Надіслати результати</button>
          </>
        ) : (
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'left' }}>
            <h2 style={{ color: '#1e293b', marginBottom: '24px' }}>📊 Протокол експертного опитування [cite: 68]</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '16px' }}>Експерт</th>
                    <th style={{ padding: '16px' }}>Ранжування (1 > 2 > 3)</th>
                    <th style={{ padding: '16px' }}>Мітка часу</th>
                  </tr>
                </thead>
                <tbody>
                  {allVotes.length > 0 ? allVotes.map((v, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{v.expert}</td>
                      <td style={{ padding: '16px', color: '#6366f1', fontWeight: 'bold' }}>{v.choices.join(' → ')}</td>
                      <td style={{ padding: '16px', color: '#94a3b8' }}>{v.time}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Очікування даних від експертів...</td></tr>
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

// Допоміжні стилі (типізовані)
const navBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '12px 24px', borderRadius: '14px', border: 'none', cursor: 'pointer',
  background: active ? 'white' : 'transparent', color: active ? '#1e293b' : '#64748b',
  boxShadow: active ? '0 4px 12px rgba(0,0,0,0.08)' : 'none', fontWeight: '600', transition: 'all 0.2s'
});

const cardStyle = (active: boolean): React.CSSProperties => ({
  background: 'white', padding: '24px', borderRadius: '20px', cursor: 'pointer',
  display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s',
  boxShadow: active ? '0 0 0 3px #6366f1' : '0 4px 6px -1px rgba(0,0,0,0.05)',
  position: 'relative', transform: active ? 'translateY(-5px)' : 'none'
});

const rankBadgeStyle: React.CSSProperties = {
  position: 'absolute', right: '12px', top: '12px', background: '#6366f1',
  color: 'white', width: '28px', height: '28px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800'
};

const mainBtnStyle: React.CSSProperties = {
  marginTop: '50px', padding: '18px 60px', borderRadius: '40px', border: 'none',
  background: '#6366f1', color: 'white', fontSize: '18px', fontWeight: '700',
  cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)', transition: 'transform 0.2s'
};
