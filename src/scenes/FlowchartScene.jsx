import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SubtitleBar } from './AvatarScene';

/**
 * FlowchartScene — Traveling Laser Energy Flow & Step Pipeline
 * Features:
 * - Animated traveling energy sparks between nodes
 * - Active step dynamic halo tracking with status badges (✓ COMPLETED, ▶ EXECUTING, ⏳ QUEUED)
 * - Algorithm Execution Progress Timeline meter
 * - Full indigenous script font support ('Noto Sans Ol Chiki' for Santhali)
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

  // Identify active step index
  const activeStepIdx = Math.min(
    steps.length - 1,
    Math.max(0, Math.floor((frame / Math.max(1, totalFrames * 0.85)) * steps.length))
  );

  // Flow progression percentage
  const pipelineProgress = Math.min(100, Math.round(((activeStepIdx + 1) / Math.max(1, steps.length)) * 100));

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#04030e',
        backgroundImage: `
          radial-gradient(ellipse at 50% 15%, rgba(139, 92, 246, 0.16) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 85%, rgba(6, 182, 212, 0.12) 0%, transparent 60%)
        `,
        color: '#fff',
        padding: '35px 55px 85px 55px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
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
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header */}
      <div style={{ marginBottom: 28, textAlign: 'center', zIndex: 10 }}>
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
          🔄 ALGORITHM WORKFLOW PIPELINE
        </span>
      </div>

      {/* Steps Flow Chain */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: steps.length > 4 ? 'wrap' : 'nowrap',
          gap: '10px',
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

          // Animated particle traveling along connector
          const particleProgress = (frame * 1.5 + i * 20) % 50;

          return (
            <React.Fragment key={i}>
              {/* Step Card Node */}
              <div
                style={{
                  opacity,
                  transform: `scale(${scale * (isActive ? 1.06 : 1)})`,
                  background: isActive
                    ? 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(20, 15, 45, 0.95) 100%)'
                    : isPassed
                    ? 'rgba(10, 25, 20, 0.75)'
                    : 'rgba(15, 12, 35, 0.75)',
                  backdropFilter: 'blur(16px)',
                  border: `2px solid ${isActive ? color : isPassed ? '#10b981' : 'rgba(255, 255, 255, 0.12)'}`,
                  borderRadius: 20,
                  padding: '20px 22px',
                  minWidth: 160,
                  maxWidth: 215,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: isActive
                    ? `0 0 35px ${color}88, 0 16px 36px rgba(0,0,0,0.6)`
                    : '0 10px 25px rgba(0,0,0,0.4)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Step Status Chip */}
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: isPassed
                      ? 'rgba(16, 185, 129, 0.25)'
                      : isActive
                      ? `${color}44`
                      : 'rgba(255, 255, 255, 0.06)',
                    color: isPassed ? '#34d399' : isActive ? '#ffffff' : '#94a3b8',
                    border: `1px solid ${isPassed ? '#10b981' : isActive ? color : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {isPassed ? '✓ COMPLETED' : isActive ? '▶ EXECUTING' : '⏳ QUEUED'}
                </div>

                {/* Step Number Badge */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: isActive || isPassed ? color : 'rgba(255,255,255,0.08)',
                    border: `2px solid ${isActive ? '#ffffff' : color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#ffffff',
                    boxShadow: isActive ? `0 0 18px ${color}` : 'none',
                  }}
                >
                  {i + 1}
                </div>

                {/* Step Description */}
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                  }}
                >
                  {step}
                </div>
              </div>

              {/* Animated Connecting Laser Beam with Traveling Sparks */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 24,
                    position: 'relative',
                  }}
                >
                  <svg width="48" height="20" viewBox="0 0 48 20">
                    <line
                      x1="0"
                      y1="10"
                      x2="36"
                      y2="10"
                      stroke={isPassed || isActive ? color : 'rgba(255,255,255,0.2)'}
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      strokeDashoffset={-frame * 2.5}
                    />
                    {/* Traveling glowing photon particle */}
                    <circle
                      cx={particleProgress}
                      cy="10"
                      r="3.5"
                      fill={color}
                      opacity={isPassed || isActive ? 0.9 : 0.4}
                    />
                    <polygon
                      points="36,5 46,10 36,15"
                      fill={isPassed || isActive ? color : 'rgba(255,255,255,0.3)'}
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom Pipeline Progress Meter */}
      <div
        style={{
          marginTop: 26,
          width: '50%',
          maxWidth: 500,
          background: 'rgba(15, 12, 35, 0.75)',
          border: '1px solid rgba(167, 139, 250, 0.3)',
          borderRadius: 12,
          padding: '8px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: '#c4b5fd' }}>
          <span>PIPELINE EXECUTION PROGRESS</span>
          <span>{pipelineProgress}%</span>
        </div>
        <div style={{ width: '100%', height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${pipelineProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 100%)',
              boxShadow: '0 0 10px #38bdf8',
              transition: 'width 0.2s ease',
            }}
          />
        </div>
      </div>

      {/* Karaoke Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
}

export default FlowchartScene;