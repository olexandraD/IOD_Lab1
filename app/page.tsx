"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, onValue, set } from "firebase/database";

import { firebaseConfig } from './config/firebaseConfig';
import { flowers } from './data/flowers';
import { labStyles } from './constants/labStyles';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app);

const MEDALS = ['🥇 1', '🥈 2', '🥉 3'];

interface VoteRecord {
  expert: string;
  choices: string[];
  time: string;
}

export default function Lab1Page() {
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
      setVotes(data ? Object.values(data) as VoteRecord[] : []);
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
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    };
    try {
      await push(ref(db, 'votes'), record);
      setIsDone(true);
      alert("Ваш голос враховано анонімно! ✅");
    } catch (err) {
      console.error(err);
      alert("Помилка з'єднання з базою!");
    }
  };

  const clearDatabase = async () => {
    if (window.confirm("Видалити ВСІ голоси з бази?")) {
      await set(ref(db, 'votes'), null);
      alert("База очищена!");
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

  const sortedFlowers = [...flowers].sort((a, b) => {
    const ca = medalCounts[a.name] || [0, 0, 0];
    const cb = medalCounts[b.name] || [0, 0, 0];
    if (cb[0] !== ca[0]) return cb[0] - ca[0];
    if (cb[1] !== ca[1]) return cb[1] - ca[1];
    return cb[2] - ca[2];
  });

  return (
    <div style={labStyles.mainContainer}>
      <nav style={labStyles.nav}>
        <h2 style={labStyles.navTitle}>ЛР1 • Розподілене введення даних</h2>
        <div style={labStyles.navLinks}>
          <a href="/lr2" style={labStyles.navBtn(false)}>ЛР2</a>

          <button
            onClick={() => setView(view === 'results' ? 'vote' : 'login')}
            style={labStyles.adminBtn}
          >
            {view === 'results' ? '← Повернутися' : '🔑 Адмін'}
          </button>
        </div>
      </nav>

      <main style={labStyles.main}>
        {view === 'vote' ? (
          <>
            <h1 style={labStyles.voteTitle}>Оберіть 3 найулюбленіші квітки</h1>
            <div style={labStyles.flowerGrid}>
              {flowers.map(f => {
                const idx = selected.indexOf(f.id);
                const isSel = idx !== -1;
                const anySelected = selected.length === 3;
                return (
                  <div
                    key={f.id}
                    onClick={() => handleSelect(f.id)}
                    style={labStyles.flowerCard(isSel, anySelected, isDone)}
                  >
                    <img src={f.img} alt={f.name} style={labStyles.flowerImage} />
                    <div style={labStyles.flowerName}>{f.name}</div>
                    {isSel && <div style={labStyles.medalBadge}>{MEDALS[idx]}</div>}
                  </div>
                );
              })}
            </div>
          </>
        ) : view === 'login' ? (
          <div style={labStyles.loginBox}>
            <div style={labStyles.loginEmoji}>🌸</div>
            <h2 style={labStyles.loginTitle}>Вхід для Адміна</h2>
            <div style={labStyles.passwordWrapper}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Пароль"
                value={pass}
                onChange={e => setPass(e.target.value)}
                style={labStyles.passwordInput}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={labStyles.eyeBtn}>
                {showPass ? '🔒' : '👁️'}
              </button>
            </div>
            <div style={labStyles.loginButtons}>
              <button
                onClick={() => pass === 'lr1_2026' ? setView('results') : alert('Невірний пароль!')}
                style={labStyles.loginSubmitBtn}
              >
                УВІЙТИ В ПРОТОКОЛ
              </button>
              <button onClick={() => setView('vote')} style={labStyles.loginCancelBtn}>
                Скасувати та повернутись
              </button>
            </div>
          </div>
        ) : (
          <div style={labStyles.resultsBox}>
            <div style={labStyles.resultsHeader}>
              <h2 style={labStyles.resultsTitle}>📋 Протокол голосування</h2>
              <div style={labStyles.resultsHeaderRight}>
                <div style={labStyles.voteCount}>
                  Голосів: <span style={labStyles.accentText}>{votes.length}</span>
                </div>
                <button onClick={clearDatabase} style={labStyles.clearBtn}>
                  🗑️ ОЧИСТИТИ БД
                </button>
              </div>
            </div>

            <div style={labStyles.tableWrapper}>
              <table style={labStyles.table}>
                <thead>
                  <tr>
                    <th style={labStyles.thLeft}>Квітка (За рейтингом)</th>
                    <th style={labStyles.thCenter}>🥇 1-е місце</th>
                    <th style={labStyles.thCenter}>🥈 2-е місце</th>
                    <th style={labStyles.thRight}>🥉 3-є місце</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFlowers.map((flower, idx) => {
                    const counts = medalCounts[flower.name] || [0, 0, 0];
                    const hasVotes = counts.some(c => c > 0);
                    return (
                      <tr key={flower.id}>
                        <td style={labStyles.tdFlower(idx, hasVotes)}>
                          {idx === 0 && hasVotes && '👑 '}{flower.name}
                        </td>
                        <td style={labStyles.tdCenter(idx, hasVotes)}>{counts[0]}</td>
                        <td style={labStyles.tdCenter(idx, hasVotes)}>{counts[1]}</td>
                        <td style={labStyles.tdRight(idx, hasVotes)}>{counts[2]}</td>
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
        <div style={labStyles.bottomBar}>
          <div style={labStyles.bottomContent}>
            <div style={labStyles.selectedList}>
              {selected.map((id, idx) => (
                <div key={id} style={labStyles.selectedItem}>
                  <b style={labStyles.accentText}>{idx + 1}:</b> {flowers.find(f => f.id === id)?.name}
                </div>
              ))}
            </div>
            <div style={labStyles.bottomButtons}>
              <button onClick={() => { setSelected([]); setIsDone(false); }} style={labStyles.resetBtn}>
                Скинути
              </button>
              {!isDone && (
                <button onClick={confirmVote} style={labStyles.confirmBtn}>
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
