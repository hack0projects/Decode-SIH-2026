import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SubtitleBar } from './AvatarScene';

/**
 * FlowchartScene — Circuit Energy Flow & Step-by-Step Algorithm
 * Features:
 * - Animated laser energy connectors with traveling pulses
 * - Active step dynamic halo tracking
 * - Holographic step cards with glowing numeric pins
 * - Smooth spring entry physics
 */
export function FlowchartScene({
  steps = [],
  colors = [],
  audioDuration = 10,
  subtitleWords = [],
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = Math.max(Math.round(audioDuration * fps), 300);
  const defaultColors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  // Identify which step is currently active based on frame progression
  const activeStepIdx = Math.min(
    steps.length - 1,
    Math.floor((frame / Math.max(1, totalFrames * 0.9)) * steps.length)
  );

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#050410',
        backgroundImage: `
          radial-gradient(ellipse at 50% 15%, rgba(139, 92, 246, 0.16) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 85%, rgba(6, 182, 212, 0.12) 0%, transparent 60%)
        `,
        color: '#fff',
        padding: '40px 60px 85px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* High-tech micro-grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header */}
      <div style={{ marginBottom: 36, textAlign: 'center', zIndex: 10 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 18px',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.2))',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
            color: '#bae6fd',
            textTransform: 'uppercase',
            boxShadow: '0 0 16px rgba(14, 165, 233, 0.25)',
          }}
        >
          🔄 STEP-BY-STEP WORKFLOW PIPELINE
        </span>
      </div>

      {/* Steps Flow Chain (Flex wrap or row) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: steps.length > 4 ? 'wrap' : 'nowrap',
          gap: '12px',
          maxWidth: 1100,
          zIndex: 10,
        }}
      >
        {steps.map((step, i) => {
          const delay = i * 14;
          const pop = spring({
            frame: frame - delay,
            fps,
            config: { damping: 13, stiffness: 110, mass: 0.7 },
          });
          const opacity = interpolate(pop, [0, 1], [0, 1]);
          const scale = interpolate(pop, [0, 1], [0.6, 1]);

          const color = colors[i] || defaultColors[i % defaultColors.length];
          const isActive = i === activeStepIdx;
          const isPassed = i < activeStepIdx;

          return (
            <React.Fragment key={i}>
              {/* Step Card Node */}
              <div
                style={{
                  opacity,
                  transform: `scale(${scale * (isActive ? 1.05 : 1)})`,
                  background: isActive
                    ? `linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(20, 15, 45, 0.9) 100%)`
                    : 'rgba(15, 12, 35, 0.75)',
                  backdropFilter: 'blur(16px)',
                  border: `2px solid ${isActive ? color : 'rgba(255, 255, 255, 0.12)'}`,
                  borderRadius: 20,
                  padding: '22px 26px',
                  minWidth: 170,
                  maxWidth: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: isActive
                    ? `0 0 35px ${color}88, 0 16px 36px rgba(0,0,0,0.6)`
                    : '0 10px 25px rgba(0,0,0,0.4)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Step Number Tag */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: isActive || isPassed
                      ? color
                      : 'rgba(255,255,255,0.08)',
                    border: `2px solid ${isActive ? '#ffffff' : color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#ffffff',
                    boxShadow: isActive ? `0 0 16px ${color}` : 'none',
                  }}
                >
                  {i + 1}
                </div>

                {/* Step Description */}
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                  }}
                >
                  {step}
                </div>

                {/* Active Indicator Pulse */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -8,
                      width: 16,
                      height: 4,
                      borderRadius: 4,
                      background: color,
                      boxShadow: `0 0 10px ${color}`,
                    }}
                  />
                )}
              </div>

              {/* Animated Connecting Laser Beam between steps */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 24,
                    position: 'relative',
                  }}
                >
                  <svg width="44" height="16" viewBox="0 0 44 16">
                    <line
                      x1="0"
                      y1="8"
                      x2="32"
                      y2="8"
                      stroke={isActive || isPassed ? color : 'rgba(255,255,255,0.2)'}
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      strokeDashoffset={-frame * 2.5}
                    />
                    <polygon
                      points="32,3 42,8 32,13"
                      fill={isActive || isPassed ? color : 'rgba(255,255,255,0.3)'}
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Karaoke Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
}

export default FlowchartScene;