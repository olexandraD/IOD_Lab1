"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import { firebaseConfig } from './../config/firebaseConfig';
import { labStyles } from './../constants/labStyles';
import { heuristics } from './../data/heuristics';
import {
  runGeneticAlgorithm,
  applyHeuristicsSequentially,
  FlowerScore,
} from './../utils/geneticAlgorithm';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app);

interface HeuristicVote {
  expert: string;
  choices: string[];
  time: string;
}
interface VoteRecord {
  choices: string[];
}

// Фільтруємо квітки з хоча б 1 голосом, беремо топ-19
function getSubset(scores: FlowerScore[]): FlowerScore[] {
  const withVotes = scores.filter(f => f.count > 0);
  const capped = withVotes.slice(0, 19);
  return capped.length >= 10 ? capped : withVotes;
}

export default function Lab2Page() {
  const [expertName, setExpertName] = useState('');
  const [selectedHeur, setSelectedHeur] = useState<string[]>([]);
  const [heurVotes, setHeurVotes] = useState<HeuristicVote[]>([]);
  const [lr1Votes, setLr1Votes] = useState<VoteRecord[]>([]);
  const [view, setView] = useState<'vote' | 'protocol' | 'login' | 'admin' | 'algo'>('vote');
  const [showPass, setShowPass] = useState(false);
  const [pass, setPass] = useState('');
  const [voteSent, setVoteSent] = useState(false);
  const [narrowStep, setNarrowStep] = useState(0);
  const [gaResult, setGaResult] = useState<FlowerScore[] | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(null);

  useEffect(() => {
    onValue(ref(db, 'heuristicVotes'), (snap) => {
      setHeurVotes(snap.val() ? Object.values(snap.val()) as HeuristicVote[] : []);
    });
    onValue(ref(db, 'votes'), (snap) => {
      setLr1Votes(snap.val() ? Object.values(snap.val()) as VoteRecord[] : []);
    });
  }, []);

  // Будуємо FlowerScore з голосів ЛР1
  // count = gold+silver+bronze (для евристик)
  // total = gold*3 + silver*2 + bronze (для ГА і сортування)
  const allFlowerScores: FlowerScore[] = useMemo(() => {
    const map: Record<string, { gold: number; silver: number; bronze: number }> = {};
    lr1Votes.forEach(vote => {
      vote.choices?.forEach((name: string, idx: number) => {
        if (!map[name]) map[name] = { gold: 0, silver: 0, bronze: 0 };
        if (idx === 0) map[name].gold++;
        if (idx === 1) map[name].silver++;
        if (idx === 2) map[name].bronze++;
      });
    });
    return Object.entries(map)
      .map(([name, m]) => ({
        name,
        gold: m.gold,
        silver: m.silver,
        bronze: m.bronze,
        count: m.gold + m.silver + m.bronze,
        total: m.gold * 3 + m.silver * 2 + m.bronze,
      }))
      .sort((a, b) => b.total - a.total);
  }, [lr1Votes]);

  const subset = useMemo(() => getSubset(allFlowerScores), [allFlowerScores]);

  // Рейтинг евристик по id
  const heurPopularity = useMemo(() => {
    return heuristics.map(h => ({
      ...h,
      votes: heurVotes.filter(v => v.choices?.includes(h.id)).length,
    })).sort((a, b) => b.votes - a.votes);
  }, [heurVotes]);

  const orderedHeurIds: string[] = useMemo(() => {
    const withVotes = heurPopularity.filter(h => h.votes > 0);
    return withVotes.length > 0 ? withVotes.map(h => h.id) : ['e1', 'e2', 'e3'];
  }, [heurPopularity]);

  const narrowingSteps = useMemo(() => {
    return applyHeuristicsSequentially(subset, orderedHeurIds);
  }, [subset, orderedHeurIds]);

  const finalAfterHeuristics = useMemo(() => {
    return narrowingSteps[narrowingSteps.length - 1]?.result ?? subset;
  }, [narrowingSteps, subset]);

  const currentNarrowSet: FlowerScore[] = useMemo(() => {
    if (narrowStep === 0) return subset;
    return narrowingSteps[narrowStep - 1]?.result ?? subset;
  }, [narrowStep, subset, narrowingSteps]);

  const maxHeurVotes = Math.max(...heurPopularity.map(h => h.votes), 1);

  const expertNarrowingSteps = useMemo(() => {
    return applyHeuristicsSequentially(subset, selectedHeur);
  }, [subset, selectedHeur]);

  const expertFinal = expertNarrowingSteps[expertNarrowingSteps.length - 1]?.result ?? subset;
  const expertKeptCount = expertFinal.length;
  const expertRemovedCount = subset.length - expertKeptCount;

  const sendVote = async () => {
    if (!expertName.trim()) return alert("Введіть ім'я експерта!");
    if (selectedHeur.length === 0) return alert("Оберіть хоча б одну евристику!");
    await push(ref(db, 'heuristicVotes'), {
      expert: expertName,
      choices: selectedHeur,
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    });
    setVoteSent(true);
    setOpenStep(null);
  };

  const clearHeurVotes = async () => {
    if (window.confirm("Видалити всі голоси евристик?")) {
      await set(ref(db, 'heuristicVotes'), null);
    }
  };

  const runGA = () => {
    if (finalAfterHeuristics.length === 0) return alert("Немає даних з ЛР1!");
    setGaResult(runGeneticAlgorithm(finalAfterHeuristics, 10));
    setView('algo');
  };

  return (
    <div style={labStyles.mainContainer}>
      <nav style={labStyles.nav}>
        <h2 style={labStyles.navTitle}>ЛР2 • Евристичне обґрунтування звуження</h2>
        <div style={labStyles.navLinks}>
          <Link href="/" style={labStyles.navBtn(false)}>ЛР1</Link>
          <button onClick={() => { setView('vote'); setVoteSent(false); }}
            style={labStyles.navBtn(view === 'vote')}>📝 Голосування</button>
          <button onClick={() => setView('protocol')}
            style={labStyles.navBtn(view === 'protocol')}>📊 Протокол</button>
          <button onClick={() => setView('login')}
            style={labStyles.navBtn(view === 'admin' || view === 'login')}>🔑 Адмін</button>
          <button onClick={() => setView('algo')}
            style={labStyles.navBtn(view === 'algo')}>🧬 Алгоритм</button>
        </div>
      </nav>

      <main style={labStyles.main}>
        {/* ════ VOTE ════ */}
        {view === 'vote' && (
          <>
            {!voteSent ? (
              <>
                <div style={labStyles.card}>
                  <div style={labStyles.sectionTitle}>👤 Ідентифікація експерта</div>
                  <input
                    placeholder="Ваше ім&apos;я та прізвище"
                    value={expertName}
                    onChange={e => setExpertName(e.target.value)}
                    style={labStyles.inputField}
                  />
                </div>
                <div style={labStyles.card}>
                  <div style={labStyles.sectionTitle}>🎯 Оберіть 2–3 евристики для відсіювання об&apos;єктів</div>
                  <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '0.9rem' }}>
                    Вибрано: <b style={labStyles.accentText}>{selectedHeur.length}</b> / 3
                  </p>
                  <div style={labStyles.heurGrid}>
                    {heuristics.map(h => {
                      const sel = selectedHeur.includes(h.id);
                      return (
                        <div key={h.id} style={labStyles.heurCard(sel)}
                          onClick={() => {
                            if (sel) setSelectedHeur(prev => prev.filter(i => i !== h.id));
                            else if (selectedHeur.length < 3) setSelectedHeur(prev => [...prev, h.id]);
                          }}>
                          <span style={labStyles.heurLabel(sel)}>{h.label}</span>
                          <span style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{h.desc}</span>
                          {sel && <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>✅</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div style={labStyles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' as const }}>
                  <div style={{ fontSize: '2.5rem' }}>✅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1f2937' }}>
                      Голос збережено, <span style={labStyles.accentText}>{expertName}</span>!
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '4px', display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                      Обрані евристики:{' '}
                      {selectedHeur.map(id => {
                        const h = heuristics.find(h => h.id === id)!;
                        return (
                          <span key={id} style={{ background: '#ec4899', color: '#fff', borderRadius: '6px', padding: '1px 8px', fontWeight: 700, fontSize: '0.8rem' }}>
                            {h.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button style={labStyles.outlineBtn}
                    onClick={() => { setVoteSent(false); setExpertName(''); setSelectedHeur([]); }}>
                    ↩ Ще раз
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' as const }}>
                  {[
                    { emoji: '🌸', value: subset.length, label: 'Підмножина', color: '#ec4899', bg: '#fff0f7' },
                    { emoji: '✅', value: expertKeptCount, label: 'Залишається', color: '#10b981', bg: '#f0fdf4' },
                    { emoji: '✂️', value: expertRemovedCount, label: 'Відсіяно', color: '#ef4444', bg: '#fef2f2' },
                  ].map(item => (
                    <div key={item.label} style={{ flex: 1, minWidth: '90px', background: item.bg, border: `1px solid ${item.color}30`, borderRadius: '12px', padding: '12px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '1.4rem' }}>{item.emoji}</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</div>
                      <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' as const, background: '#fdfaf7', borderRadius: '12px', padding: '12px 16px', border: '1px solid #ffe4e1' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', marginRight: '4px' }}>Звуження:</span>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#ec4899', color: '#fff', borderRadius: '999px', padding: '3px 12px', fontWeight: 800, fontSize: '0.85rem' }}>
                    {subset.length}
                  </div>
                  {expertNarrowingSteps.map((step) => {
                    const h = heuristics.find(h => h.id === step.heurId)!;
                    return (
                      <React.Fragment key={step.heurId}>
                        <span style={{ color: '#d1d5db', fontSize: '1rem' }}>→</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.65rem', color: '#ec4899', fontWeight: 700 }}>{h?.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', background: step.removedCount > 0 ? '#8b5cf6' : '#9ca3af', color: '#fff', borderRadius: '999px', padding: '3px 12px', fontWeight: 800, fontSize: '0.85rem' }}>
                            {step.result.length}
                            {step.removedCount > 0 && <span style={{ fontSize: '0.65rem', marginLeft: '4px', opacity: 0.85 }}>−{step.removedCount}</span>}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <span style={{ color: '#d1d5db', fontSize: '1rem' }}>→</span>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#10b981', color: '#fff', borderRadius: '999px', padding: '3px 14px', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>
                    {expertKeptCount} ✓
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '8px', fontWeight: 600 }}>
                    Деталі по кожній евристиці (натисніть щоб розкрити):
                  </div>
                  {expertNarrowingSteps.map((step, stepIdx) => {
                    const h = heuristics.find(h => h.id === step.heurId)!;
                    const inputSet = stepIdx === 0 ? subset : expertNarrowingSteps[stepIdx - 1].result;
                    const keptSet = step.result;
                    const removedSet = inputSet.filter(f => !keptSet.some(k => k.name === f.name));
                    const isOpen = openStep === stepIdx;
                    return (
                      <div key={step.heurId} style={{ marginBottom: '6px', border: `1px solid ${step.removedCount > 0 ? '#fca5a5' : '#e5e7eb'}`, borderRadius: '10px', overflow: 'hidden' }}>
                        <button
                          onClick={() => setOpenStep(isOpen ? null : stepIdx)}
                          style={{ width: '100%', background: isOpen ? '#fdfaf7' : '#fff', border: 'none', cursor: 'pointer', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' as const }}
                        >
                          <span style={{ background: '#374151', color: '#fff', borderRadius: '999px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                            {stepIdx + 1}
                          </span>
                          <span style={{ ...labStyles.heurLabel(true), padding: '2px 10px', fontSize: '0.85rem' }}>{h?.label}</span>
                          <span style={{ fontSize: '0.85rem', color: '#374151', flex: 1, fontWeight: 600 }}>{h?.desc}</span>
                          <div style={{ width: '80px', height: '6px', background: '#fee2e2', borderRadius: '99px', overflow: 'hidden', flexShrink: 0 }}>
                            <div style={{ height: '6px', width: `${(keptSet.length / (inputSet.length || 1)) * 100}%`, background: step.removedCount > 0 ? '#10b981' : '#9ca3af', borderRadius: '99px' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: step.removedCount > 0 ? '#dc2626' : '#9ca3af', minWidth: '50px', textAlign: 'right' as const, flexShrink: 0 }}>
                            {step.removedCount > 0 ? `−${step.removedCount}` : 'без змін'}
                          </span>
                          <span style={{ color: '#9ca3af', fontSize: '0.8rem', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                        </button>
                        {isOpen && (
                          <div style={{ padding: '0 14px 14px', background: '#fdfaf7', borderTop: '1px solid #ffe4e1' }}>
                            <div style={{ paddingTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginBottom: '6px' }}>✅ Залишаються ({keptSet.length})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {keptSet.map(r => (
                                    <div key={r.name} style={{ padding: '5px 10px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#166534', display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                                      <span>{r.name}</span>
                                      <span style={{ color: '#16a34a', fontSize: '0.72rem', whiteSpace: 'nowrap' as const }}>🥇{r.gold} 🥈{r.silver} 🥉{r.bronze}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: '6px' }}>✗ Відсіюються ({removedSet.length})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {removedSet.length === 0 ? (
                                    <div style={{ padding: '5px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.8rem', color: '#9ca3af' }}>Нікого не відсіяно</div>
                                  ) : removedSet.map(r => (
                                    <div key={r.name} style={{ padding: '5px 10px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#991b1b', display: 'flex', justifyContent: 'space-between', gap: '6px', textDecoration: 'line-through', opacity: 0.8 }}>
                                      <span>{r.name}</span>
                                      <span style={{ fontSize: '0.72rem', textDecoration: 'none', whiteSpace: 'nowrap' as const }}>🥇{r.gold} 🥈{r.silver} 🥉{r.bronze}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ borderTop: '2px solid #ffe4e1', paddingTop: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1f2937', marginBottom: '10px' }}>
                    🏁 Фінальна підмножина після всіх евристик:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '6px' }}>
                    {subset.map(f => {
                      const kept = expertFinal.some(k => k.name === f.name);
                      return (
                        <div key={f.name} style={{
                          padding: '6px 10px', borderRadius: '8px',
                          background: kept ? '#f0fdf4' : '#fef2f2',
                          border: `1px solid ${kept ? '#86efac' : '#fca5a5'}`,
                          fontSize: '0.82rem', fontWeight: 600,
                          color: kept ? '#166534' : '#991b1b',
                          textDecoration: kept ? 'none' : 'line-through',
                          opacity: kept ? 1 : 0.65,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <span>{f.name}</span>
                          <span style={{ fontSize: '0.72rem', textDecoration: 'none' }}>
                            {kept
                              ? <span style={{ color: '#16a34a' }}>{f.total}б</span>
                              : <span style={{ color: '#dc2626' }}>✗</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ════ PROTOCOL ════ */}
        {view === 'protocol' && (
          <>
            <div style={labStyles.card}>
              <div style={labStyles.sectionTitle}>📊 Рейтинг евристик за популярністю</div>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>
                Скільки експертів обрали кожну евристику ({heurVotes.length} голосів)
              </p>
              {heurPopularity.map((h, i) => (
                <div key={h.id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {i === 0 && '👑 '}
                      <span style={labStyles.heurLabel(i < 3)}>{h.label}</span>
                      {h.desc}
                    </span>
                    <b style={labStyles.accentText}>{h.votes}</b>
                  </div>
                  <div style={{ background: '#ffe4e1', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '10px', width: `${(h.votes / maxHeurVotes) * 100}%`, background: 'linear-gradient(to right, #ec4899, #db2777)', borderRadius: '6px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={labStyles.card}>
              <div style={labStyles.sectionTitle}>✂️ Покрокове звуження підмножини</div>
              <p style={{ color: '#6b7280', marginBottom: '8px', fontSize: '0.9rem' }}>
                Евристики застосовуються у порядку їх популярності серед експертів.
              </p>
              <div style={{ background: '#fdfaf7', border: '1px solid #ffe4e1', borderRadius: '10px', padding: '10px 16px', marginBottom: '20px', fontSize: '0.83rem', color: '#374151' }}>
                Поточний порядок:{' '}
                {orderedHeurIds.map((id, i) => {
                  const h = heuristics.find(h => h.id === id)!;
                  return <span key={id}>{i > 0 && ' → '}<b style={labStyles.accentText}>{h?.label}</b></span>;
                })}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' as const }}>
                <button onClick={() => setNarrowStep(0)} style={labStyles.narrowStepBtn(narrowStep === 0)}>
                  📋 Початок<br /><span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#6b7280' }}>{subset.length} об.</span>
                </button>
                {narrowingSteps.map((step, i) => {
                  const h = heuristics.find(h => h.id === step.heurId)!;
                  return (
                    <button key={step.heurId} onClick={() => setNarrowStep(i + 1)} style={labStyles.narrowStepBtn(narrowStep === i + 1)}>
                      {h?.label}: {h?.desc.slice(0, 18)}…<br />
                      <span style={{ fontSize: '0.75rem', fontWeight: 400, color: step.removedCount > 0 ? '#dc2626' : '#6b7280' }}>
                        {step.result.length} об. {step.removedCount > 0 ? `(−${step.removedCount})` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
                {subset.map(f => {
                  const kept = currentNarrowSet.some(c => c.name === f.name);
                  return (
                    <div key={f.name} style={kept ? labStyles.narrowItemKept : labStyles.narrowItemRemoved}>
                      {f.name}<span style={{ fontSize: '0.8rem' }}>{kept ? '✓' : '✗'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ════ LOGIN ════ */}
        {view === 'login' && (
          <div style={labStyles.loginBox}>
            <div style={labStyles.loginEmoji}>🔐</div>
            <h2 style={labStyles.loginTitle}>Вхід для Адміністратора</h2>
            <div style={labStyles.passwordWrapper}>
              <input type={showPass ? 'text' : 'password'} placeholder="Пароль" value={pass}
                onChange={e => setPass(e.target.value)} style={labStyles.passwordInput} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={labStyles.eyeBtn}>
                {showPass ? '🔒' : '👁️'}
              </button>
            </div>
            <div style={labStyles.loginButtons}>
              <button style={labStyles.loginSubmitBtn}
                onClick={() => { if (pass === 'lr1_2026') { setView('admin'); setPass(''); } else alert('Невірний пароль!'); }}>
                УВІЙТИ
              </button>
              <button onClick={() => setView('vote')} style={labStyles.loginCancelBtn}>Скасувати</button>
            </div>
          </div>
        )}

        {/* ════ ADMIN ════ */}
        {view === 'admin' && (
          <>
            <h1 style={labStyles.voteTitle}>🔐 Адмін-панель ЛР2</h1>
            <div style={labStyles.summaryGrid}>
              {[
                { emoji: '👥', value: heurVotes.length, label: 'Голосів', color: '#ec4899' },
                { emoji: '🌸', value: subset.length, label: 'Підмножина ЛР2', color: '#8b5cf6' },
                { emoji: '✂️', value: finalAfterHeuristics.length, label: 'Після евристик', color: '#10b981' },
              ].map(item => (
                <div key={item.label} style={{ ...labStyles.summaryCard, borderTop: `3px solid ${item.color}` }}>
                  <div style={{ fontSize: '2rem' }}>{item.emoji}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={labStyles.resultsBox}>
              <div style={labStyles.resultsHeader}>
                <h2 style={labStyles.resultsTitle}>📋 Бюлетені експертів</h2>
                <div style={labStyles.resultsHeaderRight}>
                  <div style={labStyles.voteCount}><span style={labStyles.accentText}>{heurVotes.length}</span> голосів</div>
                  <button style={labStyles.clearBtn} onClick={clearHeurVotes}>🗑️ Очистити БД</button>
                </div>
              </div>
              {heurVotes.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>Голосів ще немає</p>
              ) : (
                <div style={labStyles.tableWrapper}>
                  <table style={labStyles.table}>
                    <thead>
                      <tr>
                        <th style={labStyles.thLeft}>№</th>
                        <th style={labStyles.thLeft}>Експерт</th>
                        <th style={labStyles.thLeft}>Обрані евристики</th>
                        <th style={labStyles.thRight}>Час</th>
                      </tr>
                    </thead>
                    <tbody>
                      {heurVotes.map((v, i) => (
                        <tr key={i}>
                          <td style={labStyles.tdFlower(i, false)}>{i + 1}</td>
                          <td style={{ ...labStyles.tdCenter(i, false), textAlign: 'left' as const, color: '#1f2937', fontWeight: 600 }}>{v.expert}</td>
                          <td style={{ ...labStyles.tdCenter(i, false), textAlign: 'left' as const, fontSize: '0.85rem' }}>
                            {v.choices?.map(id => {
                              const h = heuristics.find(h => h.id === id);
                              return h ? `${h.label}. ${h.desc}` : id;
                            }).join(' • ')}
                          </td>
                          <td style={labStyles.tdRight(i, false)}>{v.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div style={labStyles.card}>
              <div style={labStyles.sectionTitle}>📊 Узагальнений рейтинг евристик</div>
              {heurPopularity.map((h, i) => (
                <div key={h.id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ background: '#374151', color: '#fff', borderRadius: '999px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      <span style={labStyles.heurLabel(h.votes > 0)}>{h.label}</span>
                      {h.desc}
                    </span>
                    <b style={labStyles.accentText}>{h.votes} ос.</b>
                  </div>
                  <div style={{ background: '#ffe4e1', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '10px', width: `${(h.votes / maxHeurVotes) * 100}%`, background: 'linear-gradient(to right, #ec4899, #db2777)', borderRadius: '6px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={labStyles.card}>
              <div style={labStyles.sectionTitle}>✂️ Покрокове звуження + Генетичний Алгоритм</div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' as const }}>
                <button onClick={() => setNarrowStep(0)} style={labStyles.narrowStepBtn(narrowStep === 0)}>
                  📋 Початок<br /><span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#6b7280' }}>{subset.length} об.</span>
                </button>
                {narrowingSteps.map((step, i) => {
                  const h = heuristics.find(h => h.id === step.heurId)!;
                  return (
                    <button key={step.heurId} onClick={() => setNarrowStep(i + 1)} style={labStyles.narrowStepBtn(narrowStep === i + 1)}>
                      {h?.label}: {h?.desc.slice(0, 18)}…<br />
                      <span style={{ fontSize: '0.75rem', fontWeight: 400, color: step.removedCount > 0 ? '#dc2626' : '#6b7280' }}>
                        {step.result.length} об. {step.removedCount > 0 ? `(−${step.removedCount})` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', marginBottom: '24px' }}>
                {subset.map(f => {
                  const kept = currentNarrowSet.some(c => c.name === f.name);
                  return (
                    <div key={f.name} style={kept ? labStyles.narrowItemKept : labStyles.narrowItemRemoved}>
                      {f.name}<span style={{ fontSize: '0.8rem' }}>{kept ? '✓' : '✗'}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button style={labStyles.purpleBtn} onClick={runGA}>🧬 Запустити генетичний алгоритм</button>
              </div>
            </div>
          </>
        )}

        {/* ════ ALGO ════ */}
        {view === 'algo' && (
          <>
            <h1 style={labStyles.voteTitle}>🧬 Генетичний Алгоритм — Фінальне ранжування</h1>
            <div style={labStyles.card}>
              <div style={labStyles.sectionTitle}>ℹ️ Опис алгоритму</div>
              <p style={{ color: '#374151', lineHeight: '1.8', marginBottom: 0, fontSize: '0.95rem' }}>
                ГА відбирає оптимальну підмножину <b>з 10 об&apos;єктів</b> після застосування евристик.<br /><br />
                <b>Параметри:</b> Популяція = 30 · Покоління = 100 · Мутація = 10%<br />
                <b>Функція придатності:</b> Σ (🥇×3 + 🥈×2 + 🥉×1)<br />
                <b>Оператори:</b> Елітарний відбір (топ-6) · Кросинговер · Рандомна мутація
              </p>
            </div>
            <div style={labStyles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' as const, gap: '12px' }}>
                <div style={labStyles.sectionTitle}>🏆 Результат ГА</div>
                <button style={labStyles.accentBtn} onClick={runGA}>▶ Перезапустити ГА</button>
              </div>
              {!gaResult ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <button style={labStyles.purpleBtn} onClick={runGA}>🧬 Запустити ГА</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                    {gaResult.map((f, i) => (
                      <div key={f.name} style={labStyles.gaCard(i === 0)}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                          {(['🥇', '🥈', '🥉', '4️⃣', '5️⃣'] as const)[i] ?? `${i + 1}.`}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>{f.name}</div>
                        <div style={{ color: '#ec4899', fontWeight: 800, fontSize: '1.3rem' }}>{f.total} б.</div>
                        <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px' }}>🥇{f.gold} 🥈{f.silver} 🥉{f.bronze}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '16px 20px' }}>
                    <b style={{ color: '#166534' }}>✅ Фінальна підмножина сформована!</b>
                    <p style={{ color: '#166534', marginTop: '6px', marginBottom: 0, fontSize: '0.9rem' }}>
                      ГА відібрав {gaResult.length} найкращих об&apos;єктів.
                    </p>
                  </div>
                </>
              )}
            </div>
            <div style={labStyles.card}>
              <div style={labStyles.sectionTitle}>📉 Ілюстрація звуження підмножини</div>
              <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', padding: '10px 0', gap: '4px' }}>
                <div style={{ textAlign: 'center', minWidth: '90px' }}>
                  <div style={labStyles.flowCircle('#ec4899')}>{subset.length}</div>
                  <div style={{ fontSize: '0.7rem', color: '#374151', fontWeight: 600 }}>🌸 Підмножина ЛР2</div>
                </div>
                {narrowingSteps.map((step, i) => {
                  const h = heuristics.find(h => h.id === step.heurId)!;
                  const colors = ['#f59e0b', '#8b5cf6', '#3b82f6', '#06b6d4', '#84cc16', '#f97316', '#14b8a6'];
                  return (
                    <React.Fragment key={step.heurId}>
                      <div style={{ fontSize: '1.3rem', color: '#d1d5db', flexShrink: 0, marginBottom: '20px' }}>→</div>
                      <div style={{ textAlign: 'center', minWidth: '90px' }}>
                        <div style={{ fontSize: '0.65rem', color: '#ec4899', fontWeight: 700, marginBottom: '2px' }}>{h?.label}</div>
                        <div style={labStyles.flowCircle(colors[i % colors.length])}>{step.result.length}</div>
                        <div style={{ fontSize: '0.65rem', color: step.removedCount > 0 ? '#dc2626' : '#9ca3af' }}>
                          {step.removedCount > 0 ? `−${step.removedCount}` : '–'}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div style={{ fontSize: '1.3rem', color: '#d1d5db', flexShrink: 0, marginBottom: '20px' }}>→</div>
                <div style={{ textAlign: 'center', minWidth: '90px' }}>
                  <div style={labStyles.flowCircle('#10b981')}>{gaResult?.length ?? finalAfterHeuristics.length}</div>
                  <div style={{ fontSize: '0.7rem', color: '#374151', fontWeight: 600 }}>🧬 Результат ГА</div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ════ BOTTOM BAR ════ */}
      {view === 'vote' && !voteSent && selectedHeur.length > 0 && (
        <div style={labStyles.bottomBar}>
          <div style={labStyles.bottomContent}>
            <div style={labStyles.selectedList}>
              {selectedHeur.map(id => {
                const h = heuristics.find(h => h.id === id)!;
                return (
                  <div key={id} style={labStyles.selectedItem}>
                    <b style={labStyles.accentText}>{h.label}</b> {h.desc}
                  </div>
                );
              })}
            </div>
            <div style={labStyles.bottomButtons}>
              <button onClick={() => setSelectedHeur([])} style={labStyles.resetBtn}>Скинути</button>
              <button onClick={sendVote} style={labStyles.confirmBtn}>ПІДТВЕРДИТИ ✅</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
