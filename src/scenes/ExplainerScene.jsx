import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SubtitleBar } from './AvatarScene';

/**
 * ExplainerScene — Cinematic Glassmorphism Educational Card with Concept Radar
 * Features:
 * - Left: Staggered glassmorphic bullet cards with golden keyword highlights
 * - Right: Interactive Holographic Concept Radar with orbiting nodes & pulse beacons
 * - Full indigenous language font support ('Noto Sans Ol Chiki' for Santhali)
 */
export function ExplainerScene({
  heading = 'Concept Overview',
  bullets = [],
  highlights = [],
  audioDuration = 10,
  subtitleWords = [],
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = Math.max(Math.round(audioDuration * fps), 300);

  // Cinematic slow camera dolly
  const dollyScale = interpolate(frame, [0, totalFrames], [1, 1.025], {
    extrapolateRight: 'clamp',
  });

  // Heading entrance spring
  const headingSpring = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 100, mass: 0.8 },
  });
  const headingOpacity = interpolate(headingSpring, [0, 1], [0, 1]);
  const headingY = interpolate(headingSpring, [0, 1], [-25, 0]);

  // Underline animation
  const underlineWidth = interpolate(frame, [8, 32], [0, 160], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Orbital rotation for the concept radar
  const radarRotation = frame * 0.7;
  const radarPulse = Math.sin(frame * 0.08) * 4;

  // Active concept tracking based on frame progression
  const activeBulletIdx = Math.min(
    bullets.length - 1,
    Math.max(0, Math.floor((frame / Math.max(1, totalFrames * 0.85)) * bullets.length))
  );

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#060412',
        backgroundImage: `
          radial-gradient(ellipse at 15% 20%, rgba(99, 102, 241, 0.18) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 75%, rgba(168, 85, 247, 0.18) 0%, transparent 55%),
          radial-gradient(ellipse at 50% 50%, rgba(14, 165, 233, 0.08) 0%, transparent 60%)
        `,
        color: '#fff',
        padding: '38px 60px 85px 60px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transform: `scale(${dollyScale})`,
      }}
    >
      {/* Background animated micro-grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(147, 197, 253, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 197, 253, 0.035) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Section */}
      <div
        style={{
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
          marginBottom: '20px',
          zIndex: 10,
        }}
      >
        {/* Floating Category Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 16px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.2))',
            border: '1px solid rgba(167, 139, 250, 0.5)',
            borderRadius: 999,
            marginBottom: 10,
            boxShadow: '0 0 16px rgba(124, 58, 237, 0.3)',
          }}
        >
          <span style={{ fontSize: 13, color: '#facc15' }}>✦</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              color: '#e0e7ff',
              textTransform: 'uppercase',
            }}
          >
            CONCEPT EXPLAINER
          </span>
        </div>

        {/* Main Heading */}
        <h1
          style={{
            fontSize: '40px',
            fontWeight: 800,
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em',
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(167, 139, 250, 0.3)',
            lineHeight: 1.25,
          }}
        >
          {heading}
        </h1>

        {/* Animated Underline */}
        <div
          style={{
            height: 4,
            width: underlineWidth,
            borderRadius: 4,
            background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #38bdf8 100%)',
            boxShadow: '0 0 12px rgba(168, 85, 247, 0.8)',
          }}
        />
      </div>

      {/* Main Body: Left Bullets (62%) + Right Concept Radar (38%) */}
      <div style={{ display: 'flex', gap: 30, flex: 1, zIndex: 10, alignItems: 'center' }}>
        {/* Left Bullet Points */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            width: '63%',
            maxWidth: 730,
          }}
        >
          {bullets.map((bullet, i) => {
            const delay = 10 + i * 14;
            const slideProgress = spring({
              frame: frame - delay,
              fps,
              config: { damping: 14, stiffness: 100, mass: 0.7 },
            });
            const slideX = interpolate(slideProgress, [0, 1], [-45, 0]);
            const slideOpacity = interpolate(slideProgress, [0, 1], [0, 1]);

            // Highlight terms replacement
            let processedHtml = bullet;
            if (Array.isArray(highlights) && highlights.length > 0) {
              highlights.forEach((hl) => {
                if (!hl || typeof hl !== 'string') return;
                try {
                  const escaped = hl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const regex = new RegExp(`(${escaped})`, 'gi');
                  processedHtml = processedHtml.replace(
                    regex,
                    '<span style="color:#fef08a; background:rgba(234,179,8,0.22); padding:2px 8px; border-radius:6px; font-weight:800; border:1px solid rgba(250,204,21,0.5); text-shadow:0 0 10px rgba(250,204,21,0.5);">$1</span>'
                  );
                } catch (_) {}
              });
            }

            const isCurrent = i === activeBulletIdx;
            const colors = [
              { border: '#8b5cf6', badge: 'linear-gradient(135deg, #7c3aed, #6366f1)' },
              { border: '#06b6d4', badge: 'linear-gradient(135deg, #0891b2, #0284c7)' },
              { border: '#10b981', badge: 'linear-gradient(135deg, #059669, #10b981)' },
              { border: '#f59e0b', badge: 'linear-gradient(135deg, #d97706, #f59e0b)' },
            ];
            const colorTheme = colors[i % colors.length];

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  opacity: slideOpacity,
                  transform: `translateX(${slideX}px) scale(${isCurrent ? 1.02 : 1})`,
                  background: isCurrent
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(30, 27, 75, 0.4) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%)',
                  backdropFilter: 'blur(12px)',
                  padding: '13px 20px',
                  borderRadius: '15px',
                  border: `1.5px solid ${isCurrent ? colorTheme.border : 'rgba(255, 255, 255, 0.08)'}`,
                  borderLeft: `5px solid ${colorTheme.border}`,
                  boxShadow: isCurrent
                    ? `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px ${colorTheme.border}44`
                    : '0 6px 18px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Numeric Pill */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: colorTheme.badge,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#ffffff',
                    boxShadow: `0 0 12px ${colorTheme.border}66`,
                    flexShrink: 0,
                  }}
                >
                  0{i + 1}
                </div>

                {/* Bullet text */}
                <div
                  style={{
                    fontSize: '20px',
                    lineHeight: 1.45,
                    color: '#f8fafc',
                    fontWeight: 500,
                  }}
                  dangerouslySetInnerHTML={{ __html: processedHtml }}
                />
              </div>
            );
          })}
        </div>

        {/* Right Side: Animated Concept Radar & Orbit Network */}
        <div
          style={{
            width: '35%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transform: 'translateY(-35px)',
          }}
        >
          {/* Holographic Radar Canvas */}
          <div
            style={{
              width: 260,
              height: 260,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Outer Rotating Cyber Grid Ring */}
            <svg
              width="260"
              height="260"
              viewBox="0 0 260 260"
              style={{
                position: 'absolute',
                transform: `rotate(${radarRotation}deg)`,
              }}
            >
              <circle
                cx="130"
                cy="130"
                r="115"
                fill="none"
                stroke="rgba(124, 58, 237, 0.3)"
                strokeWidth="1.5"
                strokeDasharray="8 6"
              />
              <circle
                cx="130"
                cy="130"
                r="85"
                fill="none"
                stroke="rgba(56, 189, 248, 0.25)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {/* Radial crosshairs */}
              <line x1="130" y1="10" x2="130" y2="250" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="10" y1="130" x2="250" y2="130" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </svg>

            {/* Pulsing Central Core */}
            <div
              style={{
                width: 72 + radarPulse,
                height: 72 + radarPulse,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #7c3aed 0%, #4338ca 70%, #1e1b4b 100%)',
                border: '2px solid #a78bfa',
                boxShadow: '0 0 24px rgba(124, 58, 237, 0.8), 0 0 40px rgba(56, 189, 248, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>🧠</span>
              <span style={{ fontSize: 8, fontWeight: 800, color: '#e0e7ff', letterSpacing: 1 }}>
                LOGIC
              </span>
            </div>

            {/* 4 Orbiting Concept Nodes */}
            {[
              { label: 'Rules', icon: '✦', color: '#8b5cf6', angle: 0 },
              { label: 'Flow', icon: '⚡', color: '#06b6d4', angle: 90 },
              { label: 'Data', icon: '🔄', color: '#10b981', angle: 180 },
              { label: 'Scope', icon: '🎯', color: '#f59e0b', angle: 270 },
            ].map((node, i) => {
              const rad = ((node.angle + frame * 0.4) * Math.PI) / 180;
              const radius = 95;
              const x = 130 + Math.cos(rad) * radius - 20;
              const y = 130 + Math.sin(rad) * radius - 20;
              const isActive = i === activeBulletIdx;

              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: isActive ? node.color : 'rgba(15, 12, 35, 0.85)',
                    border: `2px solid ${node.color}`,
                    boxShadow: isActive
                      ? `0 0 20px ${node.color}, 0 0 35px ${node.color}aa`
                      : `0 0 8px ${node.color}55`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 800,
                    transform: `scale(${isActive ? 1.25 : 1})`,
                    transition: 'all 0.15s ease',
                    zIndex: 15,
                  }}
                >
                  {node.icon}
                </div>
              );
            })}
          </div>

          {/* Animated Concept Progress Gauge */}
          <div
            style={{
              width: '85%',
              background: 'rgba(15, 12, 35, 0.75)',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              borderRadius: 12,
              padding: '8px 14px',
              marginTop: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 800, color: '#c4b5fd' }}>
              <span>CONCEPT MAPPING</span>
              <span>{Math.round(((activeBulletIdx + 1) / Math.max(1, bullets.length)) * 100)}%</span>
            </div>
            <div style={{ width: '100%', height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((activeBulletIdx + 1) / Math.max(1, bullets.length)) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1 0%, #38bdf8 100%)',
                  boxShadow: '0 0 8px #38bdf8',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Karaoke Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
}

export default ExplainerScene;