"use client";
import React, { useState } from 'react';

const flowers = [
  { id: 'a1', name: 'Монстера Деліціоза', icon: '🪴' },
  { id: 'a2', name: 'Сансев’єрія', icon: '🌵' },
  { id: 'a3', name: 'Заміокулькас', icon: '🌿' },
  { id: 'a4', name: 'Фікус Лірата', icon: '🍃' },
  { id: 'a5', name: 'Хлорофітум', icon: '🌱' },
  { id: 'a6', name: 'Спатифілум', icon: '🏳️' },
  { id: 'a7', name: 'Драцена Маргіната', icon: '🌴' },
  { id: 'a8', name: 'Алое Віра', icon: '🎍' },
  { id: 'a9', name: 'Нефролепіс (Папороть)', icon: '🌿' },
  { id: 'a10', name: 'Ехеверія (Сукулент)', icon: '🪴' },
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
  const [expertId, setExpertId] = useState('');
  const [items, setItems] = useState(flowers);
  const [voted, setVoted] = useState(false);

  const move = (index: number, direction: number) => {
    const newItems = [...items];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= newItems.length) return;
    [newItems[index], newItems[nextIndex]] = [newItems[nextIndex], newItems[index]];
    setItems(newItems);
  };

  const submitVote = () => {
    if (!expertId) return alert("Будь ласка, введіть код експерта");
    setVoted(true);
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#111827' }}>🌱 Озеленення IT-офісу</h1>
      <p style={{ textAlign: 'center', color: '#6b7280' }}>Лабораторна робота №1</p>
      
      {!voted ? (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Анонімний код експерта:</label>
            <input 
              type="text" 
              placeholder="Наприклад: user_123"
              value={expertId} 
              onChange={(e) => setExpertId(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
            />
          </div>

          <p style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>⚠️ Підніміть 3 найкращі варіанти вгору списку (v=3):</p>
          
          {items.map((flower, index) => (
            <div key={flower.id} style={{ 
              display: 'flex', alignItems: 'center', padding: '10px', 
              border: '1px solid #e5e7eb', marginBottom: '8px', borderRadius: '8px',
              background: index < 3 ? '#ecfdf5' : 'white',
              transition: 'background 0.3s'
            }}>
              <span style={{ marginRight: '12px', fontSize: '24px' }}>{flower.icon}</span>
              <span style={{ flexGrow: 1, fontSize: '15px' }}>{index + 1}. {flower.name}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => move(index, -1)} style={{ padding: '5px 10px', cursor: 'pointer' }}>↑</button>
                <button onClick={() => move(index, 1)} style={{ padding: '5px 10px', cursor: 'pointer' }}>↓</button>
              </div>
            </div>
          ))}

          <button onClick={submitVote} style={{ 
            width: '100%', padding: '16px', background: '#059669', 
            color: 'white', border: 'none', borderRadius: '8px', marginTop: '20px',
            fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
          }}>
            Надіслати анонімно
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>
          <h2 style={{ color: '#059669' }}>Дякуємо, {expertId}! ✅</h2>
          <p>Ваше множинне порівняння збережено в протоколі.</p>
          <button onClick={() => setVoted(false)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Проголосувати ще раз</button>
        </div>
      )}
    </div>
  );
}
