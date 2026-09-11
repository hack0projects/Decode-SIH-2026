import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Video, staticFile } from 'remotion';
import { IndianAvatarFace } from '../scenes/AvatarScene';

/**
 * PipTeacherCam — Floating Picture-in-Picture Teacher Camera
 * Renders on all content scenes (code, explainer, comparison, flowchart, visual)
 * giving life and continuous teacher presence throughout the entire video.
 */
export function PipTeacherCam({
  audioDuration = 10,
  subtitleWords = [],
  avatarVideoPath = null,
  position = 'bottom-right'
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation
  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 110,
      mass: 0.8,
    },
  });

  const scale = interpolate(entrance, [0, 1], [0.5, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Audio speech timing
  const audioFrames = Math.round(audioDuration * fps);
  const isSpeaking = frame > 6 && frame < audioFrames;
  const isSpeakingWord = subtitleWords.length > 0
    ? subtitleWords.some((w) => frame >= w.startFrame && frame < w.endFrame)
    : isSpeaking;

  // Gentle breathing float
  const floatY = Math.sin(frame * 0.06) * 3;

  // Positioning styles
  const posStyle = position === 'top-right'
    ? { top: 28, right: 32 }
    : { bottom: 36, right: 36 };

  return (
    <div
      style={{
        position: 'absolute',
        ...posStyle,
        zIndex: 60,
        opacity,
        transform: `scale(${scale}) translateY(${floatY}px)`,
        transformOrigin: 'bottom right',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Outer Glowing Glass Card */}
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(23, 13, 56, 0.85) 0%, rgba(9, 5, 24, 0.95) 100%)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(167, 139, 250, 0.55)',
          borderRadius: 20,
          padding: '10px 14px 12px 14px',
          boxShadow:
            '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(124, 58, 237, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {/* Top Status Bar: Live Dot + Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '2px 4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: isSpeaking ? '#22c55e' : '#a855f7',
                boxShadow: isSpeaking
                  ? '0 0 8px #22c55e, 0 0 14px #22c55e'
                  : '0 0 6px #a855f7',
              }}
            />
            <span
              style={{
                fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.2,
                color: isSpeaking ? '#86efac' : '#c4b5fd',
                textTransform: 'uppercase',
              }}
            >
              {isSpeaking ? 'TEACHING' : 'AI TUTOR'}
            </span>
          </div>

          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#93c5fd',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              borderRadius: 6,
              padding: '1px 5px',
            }}
          >
            HD
          </span>
        </div>

        {/* Avatar View Container */}
        <div
          style={{
            width: 140,
            height: 155,
            borderRadius: 14,
            overflow: 'hidden',
            background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0a061a 100%)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {avatarVideoPath ? (
            <Video
              src={staticFile(avatarVideoPath)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ transform: 'scale(0.72) translateY(-14px)' }}>
              <IndianAvatarFace
                speaking={isSpeaking}
                isSpeakingWord={isSpeakingWord}
                width={190}
                height={215}
              />
            </div>
          )}
        </div>

        {/* Dynamic Equalizer Waveform Bars when speaking */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3.5,
            height: 14,
            marginTop: 2,
          }}
        >
          {[0.9, 1.6, 1.2, 1.8, 1.4, 1.9, 1.0, 1.5].map((multiplier, i) => {
            const barHeight = isSpeaking
              ? Math.max(3, Math.abs(Math.sin(frame * 0.38 + i * 0.55)) * 12 * multiplier)
              : 3;
            return (
              <div
                key={i}
                style={{
                  width: 3,
                  height: barHeight,
                  borderRadius: 2,
                  background: isSpeaking
                    ? 'linear-gradient(180deg, #38bdf8 0%, #a855f7 100%)'
                    : 'rgba(167, 139, 250, 0.3)',
                  boxShadow: isSpeaking ? '0 0 6px rgba(56, 189, 248, 0.7)' : 'none',
                  transition: 'height 0.05s ease',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PipTeacherCam;
