// app/constants/labStyles.ts
import type { CSSProperties } from 'react';

export const labStyles = {
  // ==================== ГЛОБАЛЬНІ ====================
  mainContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fdfaf7 0%, #fff8f5 100%)',
    color: '#1f2937',
    paddingBottom: '220px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as CSSProperties,

  nav: {
    padding: '20px 5%',
    borderBottom: '1px solid #ffe4e1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 250, 245, 0.98)',
    backdropFilter: 'blur(20px)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    flexWrap: 'wrap' as const,
    gap: '10px',
  } as CSSProperties,

  navTitle: {
    fontSize: '1.2rem',
    color: '#1f2937',
    margin: 0,
    fontWeight: '700',
  } as CSSProperties,

  navLinks: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  } as CSSProperties,

  adminBtn: {
    background: '#ffffff',
    border: '1px solid #ec4899',
    color: '#ec4899',
    padding: '10px 22px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
  } as CSSProperties,

  navBtn: (active: boolean): CSSProperties => ({
    background: active ? '#ec4899' : '#ffffff',
    border: '1px solid #ec4899',
    color: active ? '#ffffff' : '#ec4899',
    padding: '10px 22px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'none',
    fontSize: '0.95rem',
    display: 'inline-block',
  }),

  main: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '50px 20px',
  } as CSSProperties,

  voteTitle: {
    textAlign: 'center' as const,
    fontSize: '2.2rem',
    fontWeight: '700',
    marginBottom: '50px',
  } as CSSProperties,

  flowerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: '28px',
  } as CSSProperties,

  flowerCard: (isSel: boolean, anySelected: boolean, isDone: boolean): CSSProperties => ({
    background: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    cursor: isDone ? 'default' : 'pointer',
    border: isSel ? '3px solid #ec4899' : '1px solid #ffe4e1',
    position: 'relative' as const,
    transition: 'all 0.3s ease',
    filter: anySelected && !isSel ? 'brightness(0.4) grayscale(0.2)' : 'none',
    transform: isSel ? 'translateY(-6px)' : 'none',
    boxShadow: isSel ? '0 20px 35px rgba(236, 72, 153, 0.18)' : '0 10px 25px rgba(0,0,0,0.07)',
  }),

  flowerImage: {
    width: '100%',
    height: '210px',
    objectFit: 'cover' as const,
  } as CSSProperties,

  flowerName: {
    padding: '16px 12px',
    textAlign: 'center' as const,
    fontWeight: '600',
  } as CSSProperties,

  medalBadge: {
    position: 'absolute' as const,
    top: '14px',
    left: '14px',
    background: '#ec4899',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '9999px',
    fontWeight: '700',
  } as CSSProperties,

  loginBox: {
    maxWidth: '420px',
    margin: '120px auto',
    background: '#ffffff',
    padding: '50px 40px',
    borderRadius: '20px',
    textAlign: 'center' as const,
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    border: '1px solid #ffe4e1',
  } as CSSProperties,

  loginEmoji: { fontSize: '3rem', marginBottom: '20px' } as CSSProperties,
  loginTitle: { marginBottom: '30px', fontWeight: '700', fontSize: '1.75rem' } as CSSProperties,

  passwordWrapper: { position: 'relative' as const, marginBottom: '25px' } as CSSProperties,

  passwordInput: {
    width: '100%',
    padding: '16px 20px',
    borderRadius: '14px',
    border: '2px solid #ffe4e1',
    background: '#fdfaf7',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as CSSProperties,

  eyeBtn: {
    position: 'absolute' as const,
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.4rem',
  } as CSSProperties,

  loginButtons: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  } as CSSProperties,

  loginSubmitBtn: {
    width: '100%',
    background: 'linear-gradient(to right, #ec4899, #db2777)',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  } as CSSProperties,

  loginCancelBtn: {
    width: '100%',
    background: 'transparent',
    color: '#6b7280',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  } as CSSProperties,

  resultsBox: {
    background: '#ffffff',
    padding: '40px',
    borderRadius: '20px',
    border: '1px solid #ffe4e1',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
  } as CSSProperties,

  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid #ffe4e1',
    paddingBottom: '20px',
    flexWrap: 'wrap' as const,
    gap: '15px',
  } as CSSProperties,

  resultsTitle: { fontWeight: '700', fontSize: '1.85rem', margin: 0 } as CSSProperties,

  resultsHeaderRight: { display: 'flex', gap: '10px', alignItems: 'center' } as CSSProperties,

  voteCount: {
    background: '#fdfaf7',
    padding: '8px 18px',
    borderRadius: '9999px',
    fontSize: '0.95rem',
    fontWeight: '700',
  } as CSSProperties,

  accentText: { color: '#ec4899' } as CSSProperties,

  clearBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.85rem',
  } as CSSProperties,

  tableWrapper: { overflowX: 'auto' as const } as CSSProperties,

  table: {
    width: '100%',
    borderCollapse: 'separate' as const,
    borderSpacing: '0 12px',
  } as CSSProperties,

  thLeft: {
    textAlign: 'left' as const,
    padding: '16px 24px',
    background: '#fdfaf7',
    borderRadius: '14px 0 0 14px',
  } as CSSProperties,

  thCenter: {
    textAlign: 'center' as const,
    background: '#fdfaf7',
  } as CSSProperties,

  thRight: {
    textAlign: 'center' as const,
    background: '#fdfaf7',
    borderRadius: '0 14px 14px 0',
  } as CSSProperties,

  tdFlower: (idx: number, hasVotes: boolean): CSSProperties => ({
    padding: '18px 24px',
    background: idx === 0 && hasVotes ? '#fffaf0' : '#fdfaf7',
    borderRadius: '14px 0 0 14px',
    border: idx === 0 && hasVotes ? '1px solid #fbbf24' : '1px solid #ffe4e1',
    fontWeight: '600',
  }),

  tdCenter: (idx: number, hasVotes: boolean): CSSProperties => ({
    textAlign: 'center' as const,
    background: idx === 0 && hasVotes ? '#fffaf0' : '#fdfaf7',
    borderTop: '1px solid #ffe4e1',
    borderBottom: '1px solid #ffe4e1',
    color: '#ec4899',
    fontWeight: '700',
  }),

  tdRight: (idx: number, hasVotes: boolean): CSSProperties => ({
    textAlign: 'center' as const,
    background: idx === 0 && hasVotes ? '#fffaf0' : '#fdfaf7',
    borderRadius: '0 14px 14px 0',
    border: '1px solid #ffe4e1',
    color: '#ec4899',
    fontWeight: '700',
  }),

  bottomBar: {
    position: 'fixed' as const,
    bottom: 0,
    width: '100%',
    background: 'rgba(255, 250, 245, 0.98)',
    backdropFilter: 'blur(20px)',
    borderTop: '3px solid #ec4899',
    padding: '20px',
    zIndex: 1000,
    boxShadow: '0 -10px 25px rgba(0,0,0,0.1)',
  } as CSSProperties,

  bottomContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    alignItems: 'center',
  } as CSSProperties,

  selectedList: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  } as CSSProperties,

  selectedItem: {
    background: 'white',
    padding: '10px 18px',
    borderRadius: '12px',
    border: '1px solid #ffe4e1',
    fontSize: '0.8rem',
  } as CSSProperties,

  bottomButtons: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    justifyContent: 'center',
  } as CSSProperties,

  resetBtn: {
    flex: 1,
    maxWidth: '140px',
    background: 'white',
    border: '2px solid #ec4899',
    color: '#ec4899',
    padding: '14px',
    borderRadius: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  } as CSSProperties,

  confirmBtn: {
    flex: 2,
    maxWidth: '280px',
    background: 'linear-gradient(to right, #ec4899, #db2777)',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(236, 72, 153, 0.3)',
  } as CSSProperties,

  // ==================== ЛР2 ====================
  card: {
    background: '#ffffff',
    border: '1px solid #ffe4e1',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '28px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  } as CSSProperties,

  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#1f2937',
  } as CSSProperties,

  heurGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  } as CSSProperties,

  heurCard: (selected: boolean): CSSProperties => ({
    padding: '16px 18px',
    background: selected ? '#fff0f7' : '#fdfaf7',
    border: selected ? '2px solid #ec4899' : '1px solid #ffe4e1',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  }),

  heurLabel: (selected: boolean): CSSProperties => ({
    background: selected ? '#ec4899' : '#ffe4e1',
    color: selected ? '#ffffff' : '#ec4899',
    fontWeight: '700',
    borderRadius: '8px',
    padding: '2px 10px',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  }),

  accentBtn: {
    background: 'linear-gradient(to right, #ec4899, #db2777)',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '999px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '1rem',
  } as CSSProperties,

  purpleBtn: {
    background: 'linear-gradient(to right, #a855f7, #7c3aed)',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '999px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '1rem',
  } as CSSProperties,

  outlineBtn: {
    background: '#ffffff',
    border: '2px solid #ec4899',
    color: '#ec4899',
    padding: '12px 28px',
    borderRadius: '999px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.95rem',
  } as CSSProperties,

  inputField: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '14px',
    border: '2px solid #ffe4e1',
    background: '#fdfaf7',
    outline: 'none',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
    marginBottom: '20px',
  } as CSSProperties,

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  } as CSSProperties,

  summaryCard: {
    background: '#ffffff',
    border: '1px solid #ffe4e1',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  } as CSSProperties,

  narrowStepBtn: (active: boolean): CSSProperties => ({
    padding: '10px 18px',
    borderRadius: '10px',
    border: active ? '2px solid #ec4899' : '1px solid #ffe4e1',
    background: active ? '#fff0f7' : '#ffffff',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    color: active ? '#ec4899' : '#374151',
    transition: 'all 0.2s',
  }),

  narrowItemKept: {
    padding: '10px 14px',
    borderRadius: '10px',
    background: '#f0fdf4',
    border: '1px solid #86efac',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#166534',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s',
  } as CSSProperties,

  narrowItemRemoved: {
    padding: '10px 14px',
    borderRadius: '10px',
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#991b1b',
    textDecoration: 'line-through',
    opacity: 0.6,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s',
  } as CSSProperties,

  gaCard: (top: boolean): CSSProperties => ({
    background: top ? 'linear-gradient(135deg, #fef3c7, #fffbeb)' : '#fdfaf7',
    border: `2px solid ${top ? '#fbbf24' : '#ffe4e1'}`,
    borderRadius: '16px',
    padding: '20px 18px',
    textAlign: 'center' as const,
  }),

  flowCircle: (color: string): CSSProperties => ({
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: color,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
    fontWeight: '800',
    margin: '0 auto 8px',
    boxShadow: `0 4px 15px ${color}50`,
  }),
} as const;