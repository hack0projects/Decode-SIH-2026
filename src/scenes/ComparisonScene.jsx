import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SubtitleBar } from './AvatarScene';

/**
 * ComparisonScene — High-Voltage Side-by-Side Comparison with Feature Gauges
 * Features:
 * - Dynamic Feature Advantage Gauges (Speed, Simplicity, Scope)
 * - Shockwave pulsing VS emblem with rotating dashed energy ring
 * - Staggered point reveals with glowing markers
 * - Full indigenous script font support ('Noto Sans Ol Chiki' for Santhali)
 */
export function ComparisonScene({
  leftTitle = 'Option A',
  leftPoints = [],
  rightTitle = 'Option B',
  rightPoints = [],
  audioDuration = 10,
  subtitleWords = [],
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = Math.max(Math.round(audioDuration * fps), 300);

  // Card slide springs
  const slideLeft = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.8 },
  });
  const slideRight = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.8 },
  });

  // VS Badge pop spring
  const popVs = spring({
    frame: frame - 14,
    fps,
    config: { damping: 10, stiffness: 130, mass: 0.6 },
  });

  const pulse = Math.sin(frame * 0.12) * 6;
  const rotateVs = frame * 1.5;

  // Metric fill animation
  const metricFill = interpolate(frame, [30, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#060512',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.14) 0%, transparent 60%),
          radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.14) 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.08) 0%, transparent 50%)
        `,
        color: '#fff',
        padding: '35px 55px 85px 55px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Micro-grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Badge */}
      <div style={{ textAlign: 'center', marginBottom: 16, zIndex: 10 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 18px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.15))',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
            color: '#fecaca',
            textTransform: 'uppercase',
          }}
        >
          ⚡ COMPARATIVE CONCEPT ANALYSIS
        </span>
      </div>

      {/* Main Dual Cards Container */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          position: 'relative',
          gap: 36,
          zIndex: 10,
          alignItems: 'stretch',
        }}
      >
        {/* Left Card: Option A (Electric Cyan) */}
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(160deg, rgba(8, 47, 73, 0.65) 0%, rgba(3, 20, 36, 0.85) 100%)',
            backdropFilter: 'blur(16px)',
            borderRadius: 20,
            padding: '24px 28px',
            border: '1.5px solid rgba(6, 182, 212, 0.45)',
            boxShadow:
              '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(6, 182, 212, 0.18)',
            opacity: interpolate(slideLeft, [0, 1], [0, 1]),
            transform: `translateX(${interpolate(slideLeft, [0, 1], [-80, 0])}px)`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderBottom: '2px solid rgba(6, 182, 212, 0.3)',
              paddingBottom: 14,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 22, color: '#38bdf8' }}>🔷</span>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#e0f2fe',
                margin: 0,
                letterSpacing: '-0.01em',
                textShadow: '0 0 18px rgba(56, 189, 248, 0.5)',
              }}
            >
              {leftTitle}
            </h2>
          </div>

          {/* Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {leftPoints.map((pt, i) => {
              const ptProgress = spring({
                frame: frame - (18 + i * 10),
                fps,
                config: { damping: 14, stiffness: 100 },
              });
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 18,
                    lineHeight: 1.45,
                    color: '#f0f9ff',
                    opacity: interpolate(ptProgress, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(ptProgress, [0, 1], [15, 0])}px)`,
                    background: 'rgba(6, 182, 212, 0.08)',
                    padding: '9px 12px',
                    borderRadius: 10,
                    borderLeft: '3px solid #06b6d4',
                  }}
                >
                  <span style={{ color: '#38bdf8', fontWeight: 800 }}>✦</span>
                  <span>{pt}</span>
                </div>
              );
            })}
          </div>

          {/* Performance Meter */}
          <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>
              <span>SUITABILITY SCORE</span>
              <span>{Math.round(88 * metricFill)}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${88 * metricFill}%`, height: '100%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }} />
            </div>
          </div>
        </div>

        {/* Center Shockwave VS Badge */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${popVs})`,
            zIndex: 25,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 86 + pulse,
              height: 86 + pulse,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${rotateVs}deg)`,
              width: 82,
              height: 82,
              borderRadius: '50%',
              border: '2px dashed rgba(248, 113, 113, 0.6)',
            }}
          />

          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)',
              border: '3px solid #fecaca',
              boxShadow: '0 0 28px rgba(239, 68, 68, 0.8), 0 8px 16px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 1.5,
            }}
          >
            VS
          </div>
        </div>

        {/* Right Card: Option B (Neon Emerald) */}
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(160deg, rgba(6, 78, 59, 0.65) 0%, rgba(2, 28, 20, 0.85) 100%)',
            backdropFilter: 'blur(16px)',
            borderRadius: 20,
            padding: '24px 28px',
            border: '1.5px solid rgba(16, 185, 129, 0.45)',
            boxShadow:
              '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.18)',
            opacity: interpolate(slideRight, [0, 1], [0, 1]),
            transform: `translateX(${interpolate(slideRight, [0, 1], [80, 0])}px)`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderBottom: '2px solid rgba(16, 185, 129, 0.3)',
              paddingBottom: 14,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 22, color: '#34d399' }}>🟢</span>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#d1fae5',
                margin: 0,
                letterSpacing: '-0.01em',
                textShadow: '0 0 18px rgba(52, 211, 153, 0.5)',
              }}
            >
              {rightTitle}
            </h2>
          </div>

          {/* Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {rightPoints.map((pt, i) => {
              const ptProgress = spring({
                frame: frame - (24 + i * 10),
                fps,
                config: { damping: 14, stiffness: 100 },
              });
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 18,
                    lineHeight: 1.45,
                    color: '#f0fdf4',
                    opacity: interpolate(ptProgress, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(ptProgress, [0, 1], [15, 0])}px)`,
                    background: 'rgba(16, 185, 129, 0.08)',
                    padding: '9px 12px',
                    borderRadius: 10,
                    borderLeft: '3px solid #10b981',
                  }}
                >
                  <span style={{ color: '#34d399', fontWeight: 800 }}>⚡</span>
                  <span>{pt}</span>
                </div>
              );
            })}
          </div>

          {/* Performance Meter */}
          <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>
              <span>SUITABILITY SCORE</span>
              <span>{Math.round(94 * metricFill)}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${94 * metricFill}%`, height: '100%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Karaoke Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
}

export default ComparisonScene;