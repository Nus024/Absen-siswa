// ============================================================
// features/scanner/ScannerFeedbackOverlay.jsx
// Presentational-only. Business logic lives in ScannerPage.jsx.
// ============================================================

import { useEffect, useRef } from 'react';

// ── Lightweight confetti burst (CSS-only, no library) ────────
function Confetti() {
  const pieces = [
    { color: '#22c55e', x: -30, y: -60, r: 340 },
    { color: '#86efac', x:  20, y: -75, r: 290 },
    { color: '#4ade80', x:  55, y: -45, r: 200 },
    { color: '#ffffff', x: -55, y: -50, r: 150 },
    { color: '#16a34a', x:  10, y: -80, r: 270 },
    { color: '#bbf7d0', x: -40, y: -35, r: 380 },
    { color: '#22c55e', x:  40, y: -65, r: 230 },
    { color: '#fbbf24', x: -15, y: -70, r: 310 },
  ];

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: i % 2 === 0 ? 8 : 6,
            height: i % 2 === 0 ? 8 : 12,
            borderRadius: i % 3 === 0 ? '50%' : 2,
            background: p.color,
            transform: 'translate(-50%, -50%)',
            animation: `sfConfetti${i} 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both`,
          }}
        />
      ))}
      <style>{`
        ${pieces.map((p, i) => `
          @keyframes sfConfetti${i} {
            0%   { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            60%  { opacity: 1; }
            100% { transform: translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px)) rotate(${p.r}deg) scale(1); opacity: 0; }
          }
        `).join('')}
        @media (prefers-reduced-motion: reduce) {
          ${pieces.map((_, i) => `@keyframes sfConfetti${i} { from {} to {} }`).join('')}
        }
      `}</style>
    </div>
  );
}

// ── Check icon (success) ────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <polyline
        points="7,19 14,26 29,11"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: 'sfCheckDraw 300ms 120ms ease both' }}
      />
      <style>{`
        @keyframes sfCheckDraw {
          from { stroke-dasharray: 40; stroke-dashoffset: 40; }
          to   { stroke-dasharray: 40; stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes sfCheckDraw { from {} to {} }
        }
      `}</style>
    </svg>
  );
}

// ── X icon (error) ──────────────────────────────────────────
function XIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <line x1="9"  y1="9"  x2="25" y2="25" stroke="white" strokeWidth="3.5" strokeLinecap="round"
        style={{ animation: 'sfXLine 220ms 80ms ease both' }} />
      <line x1="25" y1="9"  x2="9"  y2="25" stroke="white" strokeWidth="3.5" strokeLinecap="round"
        style={{ animation: 'sfXLine 220ms 140ms ease both' }} />
      <style>{`
        @keyframes sfXLine {
          from { stroke-dasharray: 24; stroke-dashoffset: 24; }
          to   { stroke-dasharray: 24; stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes sfXLine { from {} to {} }
        }
      `}</style>
    </svg>
  );
}

// ── Warning icon (duplicate) ────────────────────────────────
function WarnIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <line x1="17" y1="10" x2="17" y2="21" stroke="white" strokeWidth="3.5" strokeLinecap="round"
        style={{ animation: 'sfXLine 200ms 80ms ease both' }} />
      <circle cx="17" cy="26" r="2" fill="white"
        style={{ animation: 'sfXLine 200ms 180ms ease both' }} />
    </svg>
  );
}

// ── Main overlay component ──────────────────────────────────
export function ScannerFeedbackOverlay({ visible, type, title, subtitle }) {
  const isSuccess = type === 'success';
  const isWarning = type === 'warning';

  const accentColor = isSuccess
    ? '#16a34a'
    : isWarning
      ? '#d97706'
      : '#dc2626';

  const accentLight = isSuccess
    ? 'rgba(34, 197, 94, 0.18)'
    : isWarning
      ? 'rgba(245, 158, 11, 0.18)'
      : 'rgba(239, 68, 68, 0.18)';

  const glowColor = isSuccess
    ? 'rgba(34, 197, 94, 0.35)'
    : isWarning
      ? 'rgba(245, 158, 11, 0.35)'
      : 'rgba(239, 68, 68, 0.35)';

  const roleAttr = isSuccess || isWarning ? 'status' : 'alert';

  if (!visible) return null;

  return (
    <>
      {/* keyframes injected once globally via style tag */}
      <style>{`
        @keyframes sfScrimFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sfCardPop {
          0%   { transform: scale(0.82); opacity: 0; }
          65%  { transform: scale(1.03); opacity: 1; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes sfIconPop {
          0%   { transform: scale(0.5);  opacity: 0; }
          65%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes sfFadeUp {
          from { transform: translateY(6px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes sfGlow {
          0%, 100% { box-shadow: 0 0 0 0 ${glowColor}; }
          50%       { box-shadow: 0 0 0 18px ${glowColor}; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes sfScrimFade { from {} to {} }
          @keyframes sfCardPop   { from {} to {} }
          @keyframes sfIconPop   { from {} to {} }
          @keyframes sfFadeUp    { from {} to {} }
          @keyframes sfGlow      { from {} to {} }
        }
      `}</style>

      {/* Scrim — dims scanner slightly, camera stays visible */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.52)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 30,
          animation: 'sfScrimFade 180ms ease both',
        }}
      />

      {/* Card */}
      <div
        role={roleAttr}
        aria-live={roleAttr === 'alert' ? 'assertive' : 'polite'}
        aria-atomic="true"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 31,
          padding: 24,
        }}
      >
        <div
          style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 24,
            padding: '36px 28px 32px',
            width: '100%',
            maxWidth: 320,
            textAlign: 'center',
            boxShadow:
              '0 24px 48px -8px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.6)',
            animation: 'sfCardPop 280ms cubic-bezier(0.34,1.56,0.64,1) both',
            overflow: 'hidden',
          }}
        >
          {/* Confetti burst on success */}
          {isSuccess && <Confetti />}

          {/* Icon circle */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              animation: `sfIconPop 300ms 40ms cubic-bezier(0.34,1.56,0.64,1) both, sfGlow 1.4s 300ms ease-in-out infinite`,
              boxShadow: `0 8px 24px ${accentLight}`,
            }}
          >
            {isSuccess ? <CheckIcon /> : isWarning ? <WarnIcon /> : <XIcon />}
          </div>

          {/* Title */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              fontSize: 19,
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.4px',
              marginBottom: 8,
              animation: 'sfFadeUp 220ms 160ms ease both',
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                fontSize: 14,
                color: '#475569',
                lineHeight: 1.5,
                animation: 'sfFadeUp 220ms 200ms ease both',
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Bottom accent bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              background: accentColor,
              borderRadius: '0 0 24px 24px',
              opacity: 0.7,
            }}
          />
        </div>
      </div>
    </>
  );
}
