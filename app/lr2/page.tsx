"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import { firebaseConfig } from './../config/firebaseConfig';
import { labStyles } from './../constants/labStyles';
import { heuristics } from './../data/heuristics';
import {
  runDualCriteriaGA,
  applyHeuristicsSequentially,
  FlowerScore,
  DualGAResult,
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
  const [openStep, setOpenStep] = useState<number | null>(null);

  // ── GA state ──────────────────────────────────────────────────
  const [gaResult, setGaResult] = useState<DualGAResult | null>(null);
  const [gaRunning, setGaRunning] = useState(false);
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    onValue(ref(db, 'heuristicVotes'), (snap) => {
      setHeurVotes(snap.val() ? Object.values(snap.val()) as HeuristicVote[] : []);
    });
    onValue(ref(db, 'votes'), (snap) => {
      setLr1Votes(snap.val() ? Object.values(snap.val()) as VoteRecord[] : []);
    });
  }, []);

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

  // ── GA launch ─────────────────────────────────────────────────
  const runGA = () => {
    if (subset.length === 0) return alert('Немає даних з ЛР1!');
    setGaRunning(true);
    setTimeout(() => {
      const result = runDualCriteriaGA(subset);
      setGaResult(result);
      setGaRunning(false);
      setView('algo');
    }, 50);
  };
  // ─────────────────────────────────────────────────────────────

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
                    placeholder="Ваше ім'я та прізвище"
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
                <button
                  style={{ ...labStyles.purpleBtn, opacity: gaRunning ? 0.7 : 1, cursor: gaRunning ? 'not-allowed' : 'pointer' }}
                  onClick={runGA}
                  disabled={gaRunning}
                >
                  🧬 {gaRunning ? 'Виконується...' : 'Запустити генетичний алгоритм'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ════ ALGO ════ */}
        {view === 'algo' && (
          <>
            <h1 style={labStyles.voteTitle}>🧬 Генетичний алгоритм (Двокритеріальний пошук)</h1>

            {/* Description + launch */}
            <div style={labStyles.card}>
              <p style={{ color: '#374151', lineHeight: '1.8', fontSize: '0.95rem', marginBottom: '20px' }}>
                Виконуємо дві незалежні еволюції: для мінімізації суми відстаней (К1) та для мінімізації максимуму (К2).
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '24px', lineHeight: '1.6' }}>
                <b>Вхід:</b> 20 випадково згенерованих повних перестановок 10 об&apos;єктів (seed=42).<br />
                <b>Відстань:</b> Хемінг — кількість позицій, де перестановки різняться.<br />
                <b>К1</b> — мінімізувати суму відстаней Хемінга від 20 перестановок до знайденого ранжування.<br />
                <b>К2</b> — мінімізувати максимум відстані (найгірший з 20 варіантів).<br />
                <b>Популяція:</b> 80 · <b>Поколінь:</b> 200 · <b>Мутація:</b> 10% · <b>Еліта:</b> 10<br />
                <b>Кросинговер OX:</b> відрізок від першого батька, решта — з другого в порядку. <b>Swap-мутація:</b> два випадкових елементи міняються місцями.
              </p>
              <div style={{ textAlign: 'center' as const }}>
                <button
                  style={{
                    ...labStyles.purpleBtn,
                    opacity: gaRunning ? 0.7 : 1,
                    cursor: gaRunning ? 'not-allowed' : 'pointer',
                    fontSize: '1.05rem',
                    padding: '16px 48px',
                    width: '100%',
                    maxWidth: '520px',
                  }}
                  onClick={runGA}
                  disabled={gaRunning}
                >
                  🚀 {gaRunning ? 'Виконується...' : 'ЗАПУСТИТИ НЕЗАЛЕЖНІ ЕВОЛЮЦІЇ'}
                </button>
              </div>
            </div>

            {/* Results */}
            {gaResult && (
              <>
                {/* 8 summary metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { label: 'Мінімум суми (К1)', value: gaResult.k1BestSum, color: '#7c3aed', bg: '#fdf4ff', border: '#d8b4fe' },
                    { label: 'Макс. при К1', value: gaResult.k1BestMax, color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff' },
                    { label: 'Покращень К1', value: gaResult.k1FoundCount, color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
                    { label: 'Розв\'язків К1', value: gaResult.k1SolCount, color: '#7c3aed', bg: '#fdf4ff', border: '#d8b4fe' },
                    { label: 'Мінімум макс. (К2)', value: gaResult.k2BestMax, color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
                    { label: 'Сума при К2', value: gaResult.k2BestSum, color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
                    { label: 'Покращень К2', value: gaResult.k2FoundCount, color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
                    { label: 'Розв\'язків К2', value: gaResult.k2SolCount, color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
                  ].map(m => (
                    <div key={m.label} style={{ background: m.bg, border: `1px solid ${m.border}`, borderRadius: '12px', padding: '14px 10px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '0.7rem', color: m.color, fontWeight: 700, marginBottom: '4px', lineHeight: 1.3 }}>{m.label}</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Best rankings side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { title: 'Ранжування К1 (мін. сума)', ranking: gaResult.k1Ranking, color: '#7c3aed', bg: '#fdf4ff', border: '#d8b4fe' },
                    { title: 'Ранжування К2 (мін. макс.)', ranking: gaResult.k2Ranking, color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
                  ].map(r => (
                    <div key={r.title} style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: '14px', padding: '16px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: r.color, marginBottom: '10px' }}>{r.title}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px' }}>
                        {r.ranking.map((name, i) => (
                          <span key={name} style={{
                            background: i === 0 ? r.color : 'white',
                            color: i === 0 ? 'white' : r.color,
                            border: `1px solid ${r.border}`,
                            borderRadius: '6px',
                            padding: '3px 10px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}>
                            {i + 1}. {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Improvement history table */}
                <div style={labStyles.card}>
                  <div style={labStyles.sectionTitle}>Знайдені незалежні розв&apos;язки:</div>
                  <div style={{ overflowX: 'auto' as const }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '0.84rem' }}>
                      <thead>
                        <tr style={{ background: '#1e1b4b' }}>
                          <th style={{ padding: '12px 10px', color: '#e0e7ff', fontWeight: 700, textAlign: 'center' as const, width: '36px', borderRight: '1px solid #3730a3' }}>
                            #
                          </th>
                          <th style={{ padding: '12px 14px', textAlign: 'left' as const, borderRight: '1px solid #3730a3' }}>
                            <span style={{ color: '#a78bfa', fontWeight: 700 }}>Колонка 1: Оптимальні за К1</span><br />
                            <span style={{ color: '#c4b5fd', fontWeight: 400, fontSize: '0.77rem' }}>(Мінімізована сума відстаней)</span>
                          </th>
                          <th style={{ padding: '12px 14px', textAlign: 'left' as const }}>
                            <span style={{ color: '#6ee7b7', fontWeight: 700 }}>Колонка 2: Оптимальні за К2</span><br />
                            <span style={{ color: '#a7f3d0', fontWeight: 400, fontSize: '0.77rem' }}>(Мінімізований максимум)</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gaResult.solutions.map((row, i) => (
                          <tr key={i} style={{ background: i % 2 === 0 ? '#fdfaf7' : '#ffffff', borderBottom: '1px solid #ffe4e1' }}>
                            {/* # */}
                            <td style={{ padding: '14px 10px', textAlign: 'center' as const, fontWeight: 700, color: '#374151', borderRight: '1px solid #e5e7eb', verticalAlign: 'top' as const }}>
                              {row.rowIndex}
                            </td>
                            {/* K1 */}
                            <td style={{ padding: '14px 16px', borderRight: '1px solid #e5e7eb', verticalAlign: 'top' as const }}>
                              {row.k1Ranking ? (
                                <>
                                  <div style={{ color: '#374151', marginBottom: '6px', lineHeight: 1.6 }}>
                                    [{row.k1Ranking.join(', ')}]
                                  </div>
                                  <div style={{ color: '#7c3aed', fontWeight: 700 }}>
                                    Мінімум Суми (К1): {row.k1SumValue}
                                  </div>
                                  <div style={{ color: '#9ca3af', fontSize: '0.77rem' }}>
                                    (Знайдено в пок. {row.k1FoundGen})
                                  </div>
                                  <div style={{ color: '#9ca3af', fontSize: '0.77rem' }}>
                                    (При цьому Максимум К2 = {row.k1MaxAtK1})
                                  </div>
                                </>
                              ) : (
                                <span style={{ color: '#d1d5db', fontSize: '1.2rem' }}>—</span>
                              )}
                            </td>
                            {/* K2 */}
                            <td style={{ padding: '14px 16px', verticalAlign: 'top' as const }}>
                              {row.k2Ranking ? (
                                <>
                                  <div style={{ color: '#374151', marginBottom: '6px', lineHeight: 1.6 }}>
                                    [{row.k2Ranking.join(', ')}]
                                  </div>
                                  <div style={{ color: '#15803d', fontWeight: 700 }}>
                                    Мінімум Максимуму (К2): {row.k2MaxValue}
                                  </div>
                                  <div style={{ color: '#9ca3af', fontSize: '0.77rem' }}>
                                    (Знайдено в пок. {row.k2FoundGen})
                                  </div>
                                  <div style={{ color: '#9ca3af', fontSize: '0.77rem' }}>
                                    (При цьому Сума К1 = {row.k2SumAtK2})
                                  </div>
                                </>
                              ) : (
                                <span style={{ color: '#d1d5db', fontSize: '1.2rem' }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Comparison table */}
                <div style={labStyles.card}>
                  <div style={labStyles.sectionTitle}>📊 Порівняння двох критеріїв</div>
                  <div style={{ overflowX: 'auto' as const }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: '#fdfaf7' }}>
                          {['Критерій', 'Ранжування К1', 'Ранжування К2'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Критерій' ? 'left' as const : 'center' as const, fontWeight: 700, color: '#374151', borderBottom: '2px solid #ffe4e1' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Сума відстаней (К1)', v1: gaResult.k1BestSum, v2: gaResult.k2BestSum },
                          { label: 'Максимум відстані (К2)', v1: gaResult.k1BestMax, v2: gaResult.k2BestMax },
                          { label: 'Знайдено покращень', v1: gaResult.k1FoundCount, v2: gaResult.k2FoundCount },
                          { label: 'Кількість розв\'язків', v1: gaResult.k1SolCount, v2: gaResult.k2SolCount },
                        ].map((row, i) => (
                          <tr key={row.label} style={{ background: i % 2 === 0 ? '#fff' : '#fdfaf7' }}>
                            <td style={{ padding: '12px 16px', color: '#374151', fontWeight: 600, borderBottom: '1px solid #ffe4e1' }}>
                              {row.label}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' as const, color: '#7c3aed', fontWeight: 700, borderBottom: '1px solid #ffe4e1' }}>
                              {row.v1}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' as const, color: '#15803d', fontWeight: 700, borderBottom: '1px solid #ffe4e1' }}>
                              {row.v2}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
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
