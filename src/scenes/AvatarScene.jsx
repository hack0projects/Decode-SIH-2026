import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

// =============================================================================
// SubtitleBar -- Word-level synchronized subtitles
// subtitleWords: [{ word, startFrame, endFrame }]
// =============================================================================
function SubtitleBar({ subtitleWords = [], totalFrames, audioFrames }) {
  const frame = useCurrentFrame();
  if (!subtitleWords.length) return null;

  const activeIdx = subtitleWords.findIndex(w => frame >= w.startFrame && frame < w.endFrame);
  const windowStart    = Math.max(0, activeIdx - 4);
  const windowEnd      = Math.min(subtitleWords.length, windowStart + 10);
  const visible        = subtitleWords.slice(windowStart, windowEnd);
  const activeInWindow = activeIdx - windowStart;

  // Fade in quickly, fade out when audio ends
  const fadeEnd = audioFrames || totalFrames;
  const barOpacity = interpolate(frame,
    [0, 10, fadeEnd - 10, fadeEnd],
    [0, 1,  1,            0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', bottom: 22, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      flexWrap: 'wrap', gap: '0.35em',
      padding: '10px 40px',
      opacity: barOpacity,
    }}>
      {visible.map((w, i) => {
        const isActive = i === activeInWindow;
        const isPast   = i < activeInWindow;
        return (
          <span key={windowStart + i} style={{
            fontSize: isActive ? 24 : 20,
            fontWeight: isActive ? 700 : 400,
            color: isActive ? '#ffffff' : isPast ? '#6d5fc7' : '#8b7de0',
            background: isActive ? 'rgba(124,58,237,0.55)' : 'transparent',
            borderRadius: isActive ? 6 : 0,
            padding: isActive ? '2px 8px' : '2px 2px',
            transition: 'all 0.1s',
            textShadow: isActive ? '0 0 18px rgba(167,139,250,0.9)' : 'none',
            fontFamily: '"Segoe UI", Arial, sans-serif',
            letterSpacing: '0.02em',
          }}>
            {w.word}
          </span>
        );
      })}
    </div>
  );
}

// Word-by-word animated text reveal
function AnimatedText({ text, startFrame = 0, color = '#ffffff', fontSize = 22, fontWeight = 400 }) {
  const frame = useCurrentFrame();
  const words = (text || '').split(' ');
  return (
    <span style={{ lineHeight: 1.7 }}>
      {words.map((word, i) => {
        const wordFrame = Math.max(0, frame - startFrame - i * 2.5);
        const opacity   = Math.min(1, wordFrame / 8);
        const translateY = interpolate(Math.min(wordFrame, 8), [0, 8], [10, 0], { extrapolateRight: 'clamp' });
        return (
          <span key={i} style={{
            display: 'inline-block',
            opacity,
            transform: `translateY(${translateY}px)`,
            marginRight: '0.27em',
            color,
            fontSize,
            fontWeight,
          }}>{word}</span>
        );
      })}
    </span>
  );
}

// Blinking eyes with natural eyelid motion
function Eye({ cx }) {
  const frame = useCurrentFrame();
  const blinkCycle = frame % 150;
  const blink = blinkCycle < 6 ? interpolate(blinkCycle, [0, 3, 6], [14, 1, 14]) : 14;
  return (
    <>
      <ellipse cx={cx} cy="110" rx="10" ry={blink} fill="#ffffff" />
      <ellipse cx={cx} cy="110" rx="6" ry={Math.min(blink, 8)} fill="#7c3aed" />
      <ellipse cx={cx + 2} cy="107" rx="2" ry={Math.min(blink * 0.35, 3)} fill="#ffffff" />
    </>
  );
}

// Animated mouth with smooth open/close
function Mouth({ speaking }) {
  const frame = useCurrentFrame();
  const openness = speaking
    ? Math.abs(Math.sin(frame * 0.35)) * 16 + 2
    : 2;
  return (
    <ellipse cx="100" cy="145" rx="22" ry={openness}
      fill="#1a0a00" stroke="#8b5cf6" strokeWidth="1.5" />
  );
}

// Full avatar with subtle head bob and glow ring pulse
function AvatarFace({ speaking }) {
  const frame  = useCurrentFrame();
  const bob    = Math.sin(frame * 0.04) * 3;
  const glowR  = 83 + Math.sin(frame * 0.06) * 4;
  return (
    <svg width="200" height="240" viewBox="0 0 200 240"
      style={{ transform: `translateY(${bob}px)`, filter: 'drop-shadow(0 0 18px rgba(124,58,237,0.45))' }}>
      <defs>
        <radialGradient id="faceGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glowGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer glow */}
      <circle cx="100" cy="110" r={glowR + 12} fill="url(#glowGrad)" />
      <circle cx="100" cy="110" r={glowR} fill="none" stroke="#7c3aed" strokeWidth="1.5" opacity="0.5" />
      <circle cx="100" cy="110" r={glowR - 7} fill="none" stroke="#4f46e5" strokeWidth="1" opacity="0.3" />

      {/* Head */}
      <circle cx="100" cy="110" r="72" fill="#1e1b4b" />
      <circle cx="100" cy="110" r="72" fill="url(#faceGrad)" />

      {/* Hair */}
      <ellipse cx="100" cy="46" rx="72" ry="30" fill="#312e81" />
      <ellipse cx="44" cy="80" rx="18" ry="32" fill="#312e81" />
      <ellipse cx="156" cy="80" rx="18" ry="32" fill="#312e81" />

      {/* Face */}
      <ellipse cx="100" cy="120" rx="55" ry="60" fill="#fcd9a0" />

      {/* Eyes */}
      <Eye cx={78} />
      <Eye cx={122} />

      {/* Eyebrows */}
      <path d="M65 95 Q78 88 91 95" stroke="#5b3a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M109 95 Q122 88 135 95" stroke="#5b3a1a" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="100" cy="132" rx="5" ry="6" fill="#e8b887" />

      {/* Mouth */}
      <Mouth speaking={speaking} />

      {/* Body */}
      <ellipse cx="100" cy="210" rx="60" ry="40" fill="#312e81" />
      <rect x="82" y="180" width="36" height="35" fill="#4f46e5" rx="4" />
      <polygon points="100,182 108,195 100,230 92,195" fill="#7c3aed" opacity="0.8" />
    </svg>
  );
}

// Floating particles
function Particles({ frame }) {
  return (
    <>
      {[...Array(10)].map((_, i) => {
        const x = 8 + i * 9;
        const y = 15 + Math.sin(frame * 0.018 + i * 0.7) * 20;
        const s = 0.4 + Math.abs(Math.sin(frame * 0.025 + i)) * 0.8;
        return (
          <div key={i} style={{
            position: 'absolute', left: `${x}%`, top: `${y}%`,
            width: 5, height: 5, borderRadius: '50%',
            background: i % 2 === 0 ? '#7c3aed' : '#4f46e5',
            opacity: 0.3 * s, transform: `scale(${s})`,
          }} />
        );
      })}
    </>
  );
}

export function AvatarScene({ scene, sceneIndex, sceneDurationFrames }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const totalFrames   = sceneDurationFrames || durationInFrames;
  const subtitleWords = scene?.subtitleWords ?? [];

  // Audio-synced: use actual audioDuration to time the fade-out
  const audioDurSec = scene?.audioDuration ?? (totalFrames / 30);
  const audioFrames = Math.round(audioDurSec * 30);            // speech ends here
  const fadeStart   = Math.min(audioFrames + 15, totalFrames - 20); // start fading after speech

  // --- Fade-in (first 15 frames) ---
  const fadeIn  = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  // --- Fade-out (starts just after audio ends, 2 s buffer already in getSceneFrames) ---
  const fadeOut = interpolate(frame, [fadeStart, totalFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  // --- Slide-up entrance ---
  const slideUp = interpolate(frame, [0, 18], [36, 0], { extrapolateRight: 'clamp' });

  // Avatar speaks only while audio is playing
  const speaking = frame > 10 && frame < audioFrames;

  // Animated background gradient shift
  const bgHue = interpolate(frame, [0, totalFrames], [220, 260], { extrapolateRight: 'clamp' });

  // Parse text
  const lines    = (scene?.text || '').split('\n');
  const headline = lines[0] || '';
  const body     = lines.slice(1).join(' ').trim();

  // Scene progress bar
  const progress = (frame / totalFrames) * 100;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(135deg, #07071a 0%, #0d0929 40%, #1a0a3e 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      position: 'relative', overflow: 'hidden',
      opacity,
    }}>

      {/* Animated grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Floating particles */}
      <Particles frame={frame} />

      {/* Pulsing center glow */}
      <div style={{
        position: 'absolute',
        width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        transform: `scale(${1 + Math.sin(frame * 0.04) * 0.08})`,
      }} />

      {/* Main content row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 56, width: '90%', maxWidth: 1200,
        transform: `translateY(${slideUp}px)`,
      }}>

        {/* Avatar column */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <AvatarFace speaking={speaking} />
          {/* AI Teacher label */}
          <div style={{
            fontSize: 12, color: '#a78bfa', letterSpacing: 3, fontWeight: 700,
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 20, padding: '4px 14px',
          }}>AI TEACHER</div>

          {/* Audio wave bars */}
          {speaking && (
            <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginTop: 4 }}>
              {[1.2, 1.8, 0.9, 1.5, 1.1, 1.7, 0.8].map((h, i) => (
                <div key={i} style={{
                  width: 3,
                  height: 5 + Math.abs(Math.sin(frame * 0.28 + i * 0.6)) * 16 * h,
                  background: `rgba(124,58,237,${0.6 + Math.sin(frame * 0.3 + i) * 0.4})`,
                  borderRadius: 2,
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Speech bubble + text */}
        <div style={{ flex: 1, maxWidth: 600 }}>
          {/* Scene badge */}
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.5)',
              borderRadius: 20, padding: '3px 14px', fontSize: 11, color: '#a78bfa', letterSpacing: 2,
            }}>
              SCENE {(sceneIndex || 0) + 1}
            </div>
            {/* Audio progress bar -- how much has been read */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#6d5fc7' }}>🔊</span>
              <div style={{ width: 80, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 99 }}>
                <div style={{
                  width: `${Math.min(100, (frame / Math.max(audioFrames, 1)) * 100)}%`,
                  height: '100%', background: '#7c3aed', borderRadius: 99,
                  boxShadow: '0 0 6px #7c3aed',
                }} />
              </div>
            </div>
          </div>

          {/* Speech bubble */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.08))',
            border: '1.5px solid rgba(124,58,237,0.45)',
            borderRadius: 20, padding: '28px 34px',
            position: 'relative',
            boxShadow: '0 8px 40px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            {/* Bubble pointer */}
            <div style={{
              position: 'absolute', left: -18, top: 44,
              width: 0, height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderRight: '18px solid rgba(124,58,237,0.45)',
            }} />

            {/* Headline */}
            <div style={{
              fontSize: 30, fontWeight: 800, color: '#ffffff',
              lineHeight: 1.25, marginBottom: body ? 18 : 0,
              textShadow: '0 0 30px rgba(124,58,237,0.6)',
            }}>
              <AnimatedText text={headline} startFrame={8} fontSize={30} fontWeight={800} />
            </div>

            {/* Body */}
            {body && (
              <div style={{ fontSize: 19, lineHeight: 1.75, color: '#c4b5fd' }}>
                <AnimatedText text={body} startFrame={20} color="#c4b5fd" fontSize={19} fontWeight={400} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Synchronized subtitle bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} audioFrames={audioFrames} />

      {/* Bottom animated gradient bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, #4f46e5, #7c3aed, #a855f7, #7c3aed, #4f46e5)`,
        backgroundSize: `${200 + frame * 2}% 100%`,
      }} />
    </div>
  );
}