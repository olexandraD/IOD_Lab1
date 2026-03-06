"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, set } from "firebase/database";

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
      } else {
        setVotes([]); // Очищення списку, якщо в БД порожньо
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
    if (selected.length !== 3) return alert("Будь ласка, оберіть рівно 3 квіти!");
    const expertId = `ID-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: VoteRecord = {
      expert: expertId,
      choices: selected.map(id => flowers.find(f => f.id === id)!.name),
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    };
    try {
      await push(ref(db, 'votes'), record);
      setIsDone(true);
      alert("Ваш голос враховано анонімно!");
    } catch (err) {
      console.error(err);
      alert("Помилка з'єднання з базою!");
    }
  };

  const clearDatabase = async () => {
    if (window.confirm("Ви впевнені, що хочете видалити ВСІ голоси з бази даних?")) {
      try {
        await set(ref(db, 'votes'), null); // Видалення вузла 'votes'
        alert("Базу даних успішно очищено!");
      } catch (err) {
        console.error(err);
        alert("Помилка при очищенні бази!");
      }
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
      paddingBottom: '220px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <nav style={{
        padding: '20px 5%',
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
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', margin: 0, fontWeight: '700' }}>
          ЛР1 • Розподілене введення даних
        </h2>
        <button
          onClick={() => setView(view === 'results' ? 'vote' : 'login')}
          style={{
            background: '#ffffff',
            border: '1px solid #ec4899',
            color: '#ec4899',
            padding: '10px 22px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {view === 'results' ? '← Повернутися' : '🔑 Адмін'}
        </button>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '50px 20px' }}>
        {view === 'vote' ? (
          <>
            <h1 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: '700', marginBottom: '50px' }}>
              Оберіть 3 найулюбленіші квітки
            </h1>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '28px'
            }}>
              {flowers.map(f => {
                const idx = selected.indexOf(f.id);
                const isSel = idx !== -1;
                const anySelected = selected.length === 3;
                
                return (
                  <div key={f.id} onClick={() => handleSelect(f.id)} style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    cursor: isDone ? 'default' : 'pointer',
                    border: isSel ? '3px solid #ec4899' : '1px solid #ffe4e1',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    filter: anySelected && !isSel ? 'brightness(0.4) grayscale(0.2)' : 'none',
                    transform: isSel ? 'translateY(-6px)' : 'none',
                    boxShadow: isSel ? '0 20px 35px rgba(236, 72, 153, 0.18)' : '0 10px 25px rgba(0,0,0,0.07)'
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.img} alt={f.name} style={{ width: '100%', height: '210px', objectFit: 'cover' }} />
                    <div style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600' }}>{f.name}</div>
                    {isSel && (
                      <div style={{
                        position: 'absolute', top: '14px', left: '14px', background: '#ec4899',
                        color: 'white', padding: '6px 14px', borderRadius: '9999px', fontWeight: '700'
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
          <div style={{ maxWidth: '420px', margin: '120px auto', background: '#ffffff', padding: '50px 40px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid #ffe4e1' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🌸</div>
            <h2 style={{ marginBottom: '30px', fontWeight: '700', fontSize: '1.75rem' }}>Вхід для Адміна</h2>
            <div style={{ position: 'relative', marginBottom: '25px' }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Введіть пароль"
                value={pass}
                onChange={e => setPass(e.target.value)}
                style={{ width: '100%', padding: '16px 20px', borderRadius: '14px', border: '2px solid #ffe4e1', background: '#fdfaf7', outline: 'none' }}
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}
              >
                {showPass ? '🔒' : '👁️'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button
                onClick={() => pass === 'lr1_2026' ? setView('results') : alert('Невірний пароль!')}
                style={{ width: '100%', background: 'linear-gradient(to right, #ec4899, #db2777)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}
              >
                УВІЙТИ В ПРОТОКОЛ
              </button>
              <button
                onClick={() => setView('vote')}
                style={{ width: '100%', background: 'transparent', color: '#6b7280', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Скасувати та повернутись
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#ffffff', padding: '40px', borderRadius: '20px', border: '1px solid #ffe4e1', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #ffe4e1', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <h2 style={{ fontWeight: '700', fontSize: '1.85rem', margin: 0 }}>📋 Протокол голосування</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ background: '#fdfaf7', padding: '8px 18px', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: '700' }}>
                  Голосів: <span style={{ color: '#ec4899' }}>{votes.length}</span>
                </div>
                <button 
                  onClick={clearDatabase}
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  🗑️ ОЧИСТИТИ БД
                </button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                <thead>
                  <tr style={{ color: '#1f2937', fontWeight: '700' }}>
                    <th style={{ textAlign: 'left', padding: '16px 24px', background: '#fdfaf7', borderRadius: '14px 0 0 14px' }}>Квітка</th>
                    <th style={{ textAlign: 'center', background: '#fdfaf7' }}>🥇 1-е місце</th>
                    <th style={{ textAlign: 'center', background: '#fdfaf7' }}>🥈 2-е місце</th>
                    <th style={{ textAlign: 'center', background: '#fdfaf7', borderRadius: '0 14px 14px 0' }}>🥉 3-є місце</th>
                  </tr>
                </thead>
                <tbody>
                  {flowers.map((flower) => {
                    const counts = medalCounts[flower.name] || [0, 0, 0];
                    return (
                      <tr key={flower.id}>
                        <td style={{ padding: '18px 24px', background: '#fdfaf7', borderRadius: '14px 0 0 14px', border: '1px solid #ffe4e1', fontWeight: '600' }}>
                          {flower.name}
                        </td>
                        <td style={{ textAlign: 'center', background: '#fdfaf7', borderTop: '1px solid #ffe4e1', borderBottom: '1px solid #ffe4e1', color: '#ec4899', fontWeight: '700' }}>{counts[0]}</td>
                        <td style={{ textAlign: 'center', background: '#fdfaf7', borderTop: '1px solid #ffe4e1', borderBottom: '1px solid #ffe4e1', color: '#ec4899', fontWeight: '700' }}>{counts[1]}</td>
                        <td style={{ textAlign: 'center', background: '#fdfaf7', borderRadius: '0 14px 14px 0', border: '1px solid #ffe4e1', color: '#ec4899', fontWeight: '700' }}>{counts[2]}</td>
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
          backdropFilter: 'blur(20px)', borderTop: '3px solid #ec4899', padding: '20px', zIndex: 1000, boxShadow: '0 -10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {selected.map((id, idx) => (
                <div key={id} style={{ background: 'white', padding: '10px 18px', borderRadius: '12px', border: '1px solid #ffe4e1', fontSize: '0.9rem' }}>
                  <b style={{ color: '#ec4899' }}>{idx + 1}:</b> {flowers.find(f => f.id === id)?.name}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
              <button 
                onClick={() => { setSelected([]); setIsDone(false); }} 
                style={{ flex: 1, maxWidth: '140px', background: 'white', border: '2px solid #ec4899', color: '#ec4899', padding: '14px', borderRadius: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Скинути
              </button>
              {!isDone && (
                <button 
                  onClick={confirmVote} 
                  style={{ flex: 2, maxWidth: '280px', background: 'linear-gradient(to right, #ec4899, #db2777)', color: 'white', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(236, 72, 153, 0.3)' }}
                >
                  ПІДТВЕРДИТИ ✅
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
