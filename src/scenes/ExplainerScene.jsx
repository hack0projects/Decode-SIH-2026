import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SubtitleBar } from './AvatarScene';

/**
 * ExplainerScene — Cinematic Glassmorphism Educational Card
 * Features:
 * - Fluid spring entrances with elastic damping
 * - Staggered glowing concept cards with numeric holographic pills
 * - Glowing key-term highlights with golden amber aura
 * - Ambient cosmic nebula background with micro-grid
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

  // Cinematic camera slow dolly push (1 -> 1.03)
  const dollyScale = interpolate(frame, [0, totalFrames], [1, 1.03], {
    extrapolateRight: 'clamp',
  });

  // Heading spring animation
  const headingSpring = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 100, mass: 0.8 },
  });
  const headingOpacity = interpolate(headingSpring, [0, 1], [0, 1]);
  const headingY = interpolate(headingSpring, [0, 1], [-30, 0]);

  // Underline reveal animation
  const underlineWidth = interpolate(frame, [10, 35], [0, 140], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Background animated nebula orbs
  const orb1X = Math.sin(frame * 0.02) * 25;
  const orb1Y = Math.cos(frame * 0.02) * 20;

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#070514',
        backgroundImage: `
          radial-gradient(ellipse at 15% 20%, rgba(99, 102, 241, 0.18) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 75%, rgba(168, 85, 247, 0.18) 0%, transparent 55%),
          radial-gradient(ellipse at 50% 50%, rgba(14, 165, 233, 0.08) 0%, transparent 60%)
        `,
        color: '#fff',
        padding: '50px 70px 90px 70px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transform: `scale(${dollyScale})`,
      }}
    >
      {/* High-tech animated micro-grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(147, 197, 253, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 197, 253, 0.035) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      {/* Floating glowing nebula orbs */}
      <div
        style={{
          position: 'absolute',
          top: -80 + orb1Y,
          right: 200 + orb1X,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.22) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Section */}
      <div
        style={{
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
          marginBottom: '26px',
          zIndex: 10,
        }}
      >
        {/* Floating Category Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 16px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.2))',
            border: '1px solid rgba(167, 139, 250, 0.5)',
            borderRadius: 999,
            marginBottom: 12,
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
            CORE CONCEPT EXPLAINER
          </span>
        </div>

        {/* Main Title with Glowing Gradient */}
        <h1
          style={{
            fontSize: '44px',
            fontWeight: 800,
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(167, 139, 250, 0.3)',
          }}
        >
          {heading}
        </h1>

        {/* Dynamic Neon Underline */}
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

      {/* Bullet Points Container (Left 68% width to keep space clear for PiP cam on right) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '70%',
          maxWidth: 820,
          zIndex: 10,
        }}
      >
        {bullets.map((bullet, i) => {
          // Staggered spring entrance
          const delay = 12 + i * 14;
          const slideProgress = spring({
            frame: frame - delay,
            fps,
            config: { damping: 14, stiffness: 100, mass: 0.7 },
          });
          const slideX = interpolate(slideProgress, [0, 1], [-50, 0]);
          const slideOpacity = interpolate(slideProgress, [0, 1], [0, 1]);

          // Process highlights properly (with $1 replacement)
          let processedHtml = bullet;
          if (Array.isArray(highlights) && highlights.length > 0) {
            highlights.forEach((hl) => {
              if (!hl || typeof hl !== 'string') return;
              try {
                const escaped = hl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escaped})`, 'gi');
                processedHtml = processedHtml.replace(
                  regex,
                  '<span style="color:#fef08a; background:rgba(234,179,8,0.2); padding:2px 8px; border-radius:6px; font-weight:800; border:1px solid rgba(250,204,21,0.45); text-shadow:0 0 10px rgba(250,204,21,0.5);">$1</span>'
                );
              } catch (_) {}
            });
          }

          // Card color theme per index
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
                gap: '18px',
                opacity: slideOpacity,
                transform: `translateX(${slideX}px)`,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(12px)',
                padding: '16px 22px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderLeft: `5px solid ${colorTheme.border}`,
                boxShadow:
                  '0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Numeric Hologram Pill */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: colorTheme.badge,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#ffffff',
                  boxShadow: `0 0 14px ${colorTheme.border}66`,
                  flexShrink: 0,
                }}
              >
                0{i + 1}
              </div>

              {/* Text content */}
              <div
                style={{
                  fontSize: '22px',
                  lineHeight: 1.5,
                  color: '#f1f5f9',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}
                dangerouslySetInnerHTML={{ __html: processedHtml }}
              />
            </div>
          );
        })}
      </div>

      {/* Karaoke Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
}

export default ExplainerScene;