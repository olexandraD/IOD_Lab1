"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA3scwKpLRt8NG9_n4LHLJGrjP_y0lxNX0",
  authDomain: "iou-lab1.firebaseapp.com",
  databaseURL: "https://iou-lab1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "iou-lab1",
  storageBucket: "iou-lab1.firebasestorage.app",
  messagingSenderId: "212171299544",
  appId: "1:212171299544:web:d73d0004d9837c867015ad",
  measurementId: "G-QXW6RLDGX8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const flowers = [
  { id: 'f1', name: 'Біла Лілія', img: '/images/f1.jpg' },
  { id: 'f2', name: 'Ранункулюс', img: '/images/f2.jpg' },
  { id: 'f3', name: 'Лотос', img: '/images/f3.jpg' },
  { id: 'f4', name: 'Орхідея', img: '/images/f4.jpg' },
  { id: 'f5', name: 'Соняшник', img: '/images/f5.jpg' },
  { id: 'f6', name: 'Тюльпан', img: '/images/f6.jpg' },
  { id: 'f7', name: 'Червона Троянда', img: '/images/f7.jpg' },
  { id: 'f8', name: 'Ромашка', img: '/images/f8.jpg' },
  { id: 'f9', name: 'Гортензія', img: '/images/f9.jpg' },
  { id: 'f10', name: 'Сакура', img: '/images/f10.jpg' },
  { id: 'f11', name: 'Нарцис', img: '/images/f11.jpg' },
  { id: 'f12', name: 'Ірис', img: '/images/f12.jpg' },
  { id: 'f13', name: 'Гібіскус', img: '/images/f13.jpg' },
  { id: 'f14', name: 'Хризантема', img: '/images/f14.jpg' },
  { id: 'f15', name: 'Гвоздика', img: '/images/f15.jpg' },
  { id: 'f16', name: 'Магнолія', img: '/images/f16.jpg' },
  { id: 'f17', name: 'Еустома', img: '/images/f17.jpg' },
  { id: 'f18', name: 'Півонія', img: '/images/f18.jpg' },
  { id: 'f19', name: 'Гербера', img: '/images/f19.jpg' },
  { id: 'f20', name: 'Антуріум', img: '/images/f20.jpg' },
];

const MEDALS = ['🥇 1', '🥈 2', '🥉 3'];

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

  useEffect(() => {
    const votesRef = ref(db, 'votes');
    return onValue(votesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const votesList = Object.values(data) as VoteRecord[];
        setVotes(votesList);
      }
    });
  }, []);

  const handleSelect = (id: string) => {
    if (isDone) return;
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const confirmVote = async () => {
    if (selected.length !== 3) return alert("Оберіть 3 квіти!");
    const expertId = `ID-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: VoteRecord = {
      expert: expertId,
      choices: selected.map(id => flowers.find(f => f.id === id)!.name),
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    };
    try {
      await push(ref(db, 'votes'), record);
      setIsDone(true);
      alert("Ваш голос враховано анонімно!"); [cite: 7]
    } catch (err) {
      console.error(err);
      alert("Помилка з&apos;єднання з базою!");
    }
  };

  const medalCounts = flowers.reduce<Record<string, [number, number, number]>>((acc, flower) => {
    acc[flower.name] = [0, 0, 0];
    return acc;
  }, {});

  votes.forEach(vote => {
    vote.choices.forEach((choice, idx) => {
      if (medalCounts[choice]) medalCounts[choice][idx]++;
    });
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdfaf7 0%, #fff8f5 100%)',
      color: '#1f2937',
      paddingBottom: '200px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <nav style={{
        padding: '15px 5%',
        borderBottom: '1px solid #ffe4e1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 250, 245, 0.98)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h2 style={{ fontSize: '1rem', color: '#1f2937', margin: 0, fontWeight: '700' }}>ЛР1 • ІОД</h2>
        <button
          onClick={() => setView(view === 'results' ? 'vote' : 'login')}
          style={{
            background: '#ffffff',
            border: '1px solid #ec4899',
            color: '#ec4899',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}
        >
          {view === 'results' ? '← Назад' : '🔑 Адмін'}
        </button>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '30px 15px' }}>
        {view === 'vote' ? (
          <>
            <h1 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: '800', marginBottom: '30px' }}>
              Оберіть 3 квітки
            </h1>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '15px'
            }}>
              {flowers.map(f => {
                const idx = selected.indexOf(f.id);
                const isSel = idx !== -1;
                const anySelected = selected.length === 3;
                
                return (
                  <div key={f.id} onClick={() => handleSelect(f.id)} style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: isDone ? 'default' : 'pointer',
                    border: isSel ? '3px solid #ec4899' : '1px solid #ffe4e1',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    opacity: anySelected && !isSel ? 0.5 : 1,
                    filter: anySelected && !isSel ? 'grayscale(0.5)' : 'none',
                    transform: isSel ? 'scale(1.02)' : 'none',
                    boxShadow: isSel ? '0 10px 20px rgba(236, 72, 153, 0.2)' : '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.img} alt={f.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    <div style={{ padding: '12px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>{f.name}</div>
                    {isSel && (
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px', background: '#ec4899',
                        color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700'
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
          <div style={{ maxWidth: '350px', margin: '80px auto', background: '#ffffff', padding: '40px 30px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '25px', fontSize: '1.5rem' }}>Вхід</h2>
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Пароль"
                value={pass}
                onChange={e => setPass(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #ffe4e1', outline: 'none' }}
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPass ? '🔒' : '👁️'}
              </button>
            </div>
            <button
              onClick={() => pass === 'lr1_2026' ? setView('results') : alert('Невірний пароль!')}
              style={{ width: '100%', background: '#ec4899', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              УВІЙТИ
            </button>
          </div>
        ) : (
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '20px', border: '1px solid #ffe4e1', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #ffe4e1', paddingBottom: '15px' }}>
              <h2 style={{ fontWeight: '700', fontSize: '1.4rem', margin: 0 }}>📋 Протокол голосування</h2> [cite: 68]
              <div style={{ background: '#fdfaf7', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
                Голосів: <span style={{ color: '#ec4899' }}>{votes.length}</span>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    <th style={{ textAlign: 'left', padding: '12px 15px' }}>Об&apos;єкт (Квітка)</th>
                    <th>🥇 1-е</th><th>🥈 2-е</th><th>🥉 3-є</th>
                  </tr>
                </thead>
                <tbody>
                  {flowers.map((flower) => {
                    const counts = medalCounts[flower.name] || [0, 0, 0];
                    return (
                      <tr key={flower.id}>
                        <td style={{ padding: '14px 15px', background: '#fdfaf7', borderRadius: '12px 0 0 12px', border: '1px solid #ffe4e1', fontWeight: '600' }}>
                          {flower.name}
                        </td>
                        <td style={{ textAlign: 'center', background: '#fdfaf7', borderTop: '1px solid #ffe4e1', borderBottom: '1px solid #ffe4e1', color: '#ec4899', fontWeight: '700' }}>{counts[0]}</td>
                        <td style={{ textAlign: 'center', background: '#fdfaf7', borderTop: '1px solid #ffe4e1', borderBottom: '1px solid #ffe4e1', color: '#ec4899', fontWeight: '700' }}>{counts[1]}</td>
                        <td style={{ textAlign: 'center', background: '#fdfaf7', borderRadius: '0 12px 12px 0', border: '1px solid #ffe4e1', color: '#ec4899', fontWeight: '700' }}>{counts[2]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selected.length > 0 && view === 'vote' && (
        <div style={{
          position: 'fixed', bottom: 0, width: '100%', background: 'rgba(255, 250, 245, 0.98)',
          backdropFilter: 'blur(20px)', borderTop: '3px solid #ec4899', padding: '15px', zIndex: 1000, boxShadow: '0 -10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {selected.map((id, idx) => (
                <div key={id} style={{ background: 'white', padding: '8px 12px', borderRadius: '10px', border: '1px solid #ffe4e1', fontSize: '0.8rem' }}>
                  <b style={{ color: '#ec4899' }}>{idx + 1}:</b> {flowers.find(f => f.id === id)?.name}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
              <button 
                onClick={() => { setSelected([]); setIsDone(false); }} 
                style={{ flex: 1, maxWidth: '120px', background: 'white', border: '2px solid #ec4899', color: '#ec4899', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Скинути
              </button>
              {!isDone && (
                <button 
                  onClick={confirmVote} 
                  style={{ flex: 2, maxWidth: '240px', background: 'linear-gradient(to right, #ec4899, #db2777)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  ПІДТВЕРДИТИ ✅
                </button> [cite: 5]
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
