import { useCurrentFrame, useVideoConfig, interpolate, spring, Video, staticFile } from 'remotion';

// =============================================================================
// SubtitleBar -- Word-level synchronized subtitles
// subtitleWords: [{ word, startFrame, endFrame }]
// =============================================================================
export function SubtitleBar({ subtitleWords = [], totalFrames, audioFrames }) {
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

// Blinking eyes with natural eyelid motion and subtle gaze
function IndianEye({ cx, frame }) {
  const blinkCycle = frame % 130;
  const blink = blinkCycle < 6 ? interpolate(blinkCycle, [0, 3, 6], [14, 1.5, 14]) : 14;
  const gazeX = Math.sin(frame * 0.03) * 1.5;
  return (
    <g>
      <ellipse cx={cx} cy="110" rx="10" ry={blink} fill="#ffffff" />
      <ellipse cx={cx + gazeX} cy="110" rx="6.5" ry={Math.min(blink, 8.5)} fill="#2b1810" />
      <ellipse cx={cx + gazeX} cy="110" rx="3.5" ry={Math.min(blink * 0.5, 4.5)} fill="#0a0503" />
      <ellipse cx={cx + gazeX + 2} cy="107" rx="2" ry={Math.min(blink * 0.35, 2.5)} fill="#ffffff" opacity="0.9" />
    </g>
  );
}

// Animated mouth with word-synchronized open/close
function IndianMouth({ isSpeakingWord }) {
  const frame = useCurrentFrame();
  const openness = isSpeakingWord
    ? Math.abs(Math.sin(frame * 0.42)) * 14 + 3
    : 2;
  const mouthWidth = isSpeakingWord ? 22 + Math.sin(frame * 0.3) * 3 : 18;

  return (
    <g>
      <ellipse cx="100" cy="146" rx={mouthWidth} ry={openness}
        fill="#260f08" stroke="#8b5cf6" strokeWidth="1.5" />
      <path d={`M${100 - mouthWidth + 3} ${146 + openness * 0.8} Q100 ${148 + openness} ${100 + mouthWidth - 3} ${146 + openness * 0.8}`}
        stroke="#b86b4f" strokeWidth="1.5" fill="none" opacity="0.7" strokeLinecap="round" />
    </g>
  );
}

// Full Indian AI Educator avatar with authentic styling, glasses, Nehru collar, and affirmative gestures
function IndianAvatarFace({ speaking, isSpeakingWord }) {
  const frame = useCurrentFrame();
  const nodY  = Math.sin(frame * 0.05) * 2.8;
  const tiltR = Math.sin(frame * 0.075) * 1.8;
  const glowR = 84 + Math.sin(frame * 0.06) * 4;

  return (
    <svg width="220" height="250" viewBox="0 0 200 240"
      style={{
        transform: `translateY(${nodY}px) rotate(${tiltR}deg)`,
        filter: 'drop-shadow(0 0 22px rgba(124,58,237,0.5))',
        transformOrigin: '100px 180px',
        transition: 'transform 0.05s ease-out',
      }}>
      <defs>
        <radialGradient id="indianSkin" cx="42%" cy="38%">
          <stop offset="0%" stopColor="#e3a778" />
          <stop offset="70%" stopColor="#cf9563" />
          <stop offset="100%" stopColor="#b4784a" />
        </radialGradient>
        <radialGradient id="outerGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="jacketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0f0c29" />
        </linearGradient>
        <linearGradient id="mandarinCollar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>

      {/* Outer pulsing halo rings */}
      <circle cx="100" cy="110" r={glowR + 14} fill="url(#outerGlow)" />
      <circle cx="100" cy="110" r={glowR} fill="none" stroke="#7c3aed" strokeWidth="1.5" opacity="0.45" />
      <circle cx="100" cy="110" r={glowR - 8} fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.3" strokeDasharray="6 4" />

      {/* Head base */}
      <circle cx="100" cy="110" r="70" fill="#181829" />

      {/* Hair back / sides */}
      <ellipse cx="100" cy="46" rx="72" ry="32" fill="#151522" />
      <ellipse cx="42" cy="85" rx="16" ry="34" fill="#151522" />
      <ellipse cx="158" cy="85" rx="16" ry="34" fill="#151522" />

      {/* Face with authentic warm Indian skin tone */}
      <ellipse cx="100" cy="120" rx="55" ry="60" fill="url(#indianSkin)" />

      {/* Modern textured hair front */}
      <path d="M42 75 Q100 25 158 75 Q140 48 100 48 Q60 48 42 75" fill="#151522" />
      <path d="M55 60 Q100 38 145 60 Q100 44 55 60" fill="#2d2b45" opacity="0.4" />

      {/* Eyebrows */}
      <path d="M64 94 Q78 86 92 93" stroke="#2a1810" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M108 93 Q122 86 136 94" stroke="#2a1810" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* Eyes */}
      <IndianEye cx={78} frame={frame} />
      <IndianEye cx={122} frame={frame} />

      {/* Modern Spectacles (Violet/Titanium frame) */}
      <rect x="64" y="99" width="28" height="22" rx="6" fill="rgba(124,58,237,0.06)" stroke="#8b5cf6" strokeWidth="2" />
      <rect x="108" y="99" width="28" height="22" rx="6" fill="rgba(124,58,237,0.06)" stroke="#8b5cf6" strokeWidth="2" />
      <path d="M92 108 Q100 105 108 108" stroke="#8b5cf6" strokeWidth="2" fill="none" />
      <line x1="68" y1="103" x2="74" y2="103" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <line x1="112" y1="103" x2="118" y2="103" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="100" cy="132" rx="5.5" ry="6" fill="#b97c4e" />

      {/* Mouth */}
      <IndianMouth isSpeakingWord={isSpeakingWord} />

      {/* Ears */}
      <ellipse cx="44" cy="118" rx="6" ry="12" fill="#cf9563" />
      <ellipse cx="156" cy="118" rx="6" ry="12" fill="#cf9563" />

      {/* Body -- Stylish Nehru Collar / Tech Jacket */}
      <ellipse cx="100" cy="214" rx="64" ry="42" fill="url(#jacketGrad)" stroke="#4338ca" strokeWidth="1.5" />
      <rect x="80" y="174" width="40" height="24" rx="5" fill="url(#mandarinCollar)" stroke="#6366f1" strokeWidth="1" />
      <line x1="100" y1="174" x2="100" y2="198" stroke="#1e1b4b" strokeWidth="2" />
      <circle cx="126" cy="198" r="4.5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1" />
      <polygon points="126,195 127.5,197.5 130,197.5 128,199.5 129,202 126,200.5 123,202 124,199.5 122,197.5 124.5,197.5" fill="#ffffff" />
    </svg>
  );
}

// Floating code glyph particles
const CODE_GLYPHS = ['</>', '{ }', 'let', 'fn()', '=>', '01', 'loop', 'def'];

function CodeParticles({ frame }) {
  return (
    <>
      {CODE_GLYPHS.map((glyph, i) => {
        const x = 6 + i * 11.5;
        const y = 14 + Math.sin(frame * 0.018 + i * 0.8) * 18;
        const s = 0.5 + Math.abs(Math.sin(frame * 0.02 + i)) * 0.6;
        const rot = Math.sin(frame * 0.02 + i) * 15;
        return (
          <div key={i} style={{
            position: 'absolute', left: `${x}%`, top: `${y}%`,
            color: i % 2 === 0 ? '#8b5cf6' : '#38bdf8',
            fontFamily: 'Consolas, monospace',
            fontSize: 13,
            fontWeight: 700,
            opacity: 0.25 * s,
            transform: `scale(${s}) rotate(${rot}deg)`,
            pointerEvents: 'none',
            userSelect: 'none',
            textShadow: '0 0 10px currentColor',
          }}>
            {glyph}
          </div>
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

  // Active word vocalization sync (mouth moves synchronously when word is spoken)
  const isSpeakingWord = subtitleWords.length > 0
    ? subtitleWords.some(w => frame >= w.startFrame && frame < w.endFrame)
    : speaking;

  // Parse text
  const lines    = (scene?.text || '').split('\n');
  const headline = lines[0] || '';
  const body     = lines.slice(1).join(' ').trim();

  // Check if a video avatar was generated
  const hasVideoAvatar = !!scene?.avatarVideoPath;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse at 50% 30%, #170d38 0%, #090518 70%, #04020a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
      position: 'relative', overflow: 'hidden',
      opacity,
    }}>

      {/* Sleek animated grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
        backgroundSize: '54px 54px',
      }} />

      {/* Floating code glyph particles */}
      <CodeParticles frame={frame} />

      {/* Pulsing center glow */}
      <div style={{
        position: 'absolute',
        width: 440, height: 440, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.16) 0%, rgba(99,102,241,0.08) 50%, transparent 75%)',
        transform: `scale(${1 + Math.sin(frame * 0.04) * 0.08})`,
        filter: 'blur(20px)',
      }} />

      {/* Main content row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 56, width: '92%', maxWidth: 1200,
        transform: `translateY(${slideUp}px)`,
        zIndex: 5,
      }}>

        {/* Avatar column */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {hasVideoAvatar ? (
            <div style={{
              width: 220, height: 260, borderRadius: 24, overflow: 'hidden',
              border: '2.5px solid rgba(167, 139, 250, 0.7)',
              boxShadow: '0 0 35px rgba(124, 58, 237, 0.45), 0 0 10px rgba(99, 102, 241, 0.3)',
              position: 'relative', background: '#090518',
            }}>
              <Video
                src={staticFile(scene.avatarVideoPath)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(15, 12, 41, 0.85)', backdropFilter: 'blur(8px)',
                padding: '2px 10px', borderRadius: 12, border: '1px solid rgba(167, 139, 250, 0.4)',
                fontSize: 10, fontWeight: 700, color: '#c4b5fd', letterSpacing: 1.5,
              }}>AI PRESENTER</div>
            </div>
          ) : (
            <IndianAvatarFace speaking={speaking} isSpeakingWord={isSpeakingWord} />
          )}

          {/* AI Teacher badge */}
          <div style={{
            fontSize: 11, color: '#c4b5fd', letterSpacing: 2.5, fontWeight: 800,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))',
            border: '1px solid rgba(167,139,250,0.4)',
            borderRadius: 20, padding: '4px 14px',
            boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
          }}>AI TEACHER • INDIAN ACCENT</div>

          {/* Dynamic Audio Equalizer Bars */}
          {speaking && (
            <div style={{ display: 'flex', gap: 3.5, alignItems: 'center', marginTop: 2 }}>
              {[1.1, 1.8, 0.9, 1.6, 1.2, 1.7, 0.8, 1.4].map((h, i) => (
                <div key={i} style={{
                  width: 3.5,
                  height: 6 + Math.abs(Math.sin(frame * 0.32 + i * 0.5)) * 18 * h,
                  background: `linear-gradient(180deg, #c4b5fd, #7c3aed)`,
                  borderRadius: 2,
                  boxShadow: '0 0 6px rgba(124,58,237,0.8)',
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Speech Card + Typography */}
        <div style={{ flex: 1, maxWidth: 640 }}>
          {/* Top meta pill */}
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(99,102,241,0.2))',
              border: '1px solid rgba(167,139,250,0.5)',
              borderRadius: 20, padding: '3px 14px', fontSize: 11, color: '#e0e7ff', letterSpacing: 2, fontWeight: 700,
            }}>
              SCENE {(sceneIndex || 0) + 1}
            </div>
            {/* Audio progression bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#a78bfa' }}>🔊</span>
              <div style={{ width: 90, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99 }}>
                <div style={{
                  width: `${Math.min(100, (frame / Math.max(audioFrames, 1)) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #7c3aed, #38bdf8)',
                  borderRadius: 99,
                  boxShadow: '0 0 8px #7c3aed',
                }} />
              </div>
            </div>
          </div>

          {/* Frosted Glassmorphism Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.45) 0%, rgba(15, 12, 41, 0.65) 100%)',
            border: '1.5px solid rgba(167, 139, 250, 0.45)',
            borderRadius: 24, padding: '30px 36px',
            position: 'relative',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.45), 0 0 28px rgba(124, 58, 237, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
          }}>
            {/* Speech bubble pointer */}
            <div style={{
              position: 'absolute', left: -18, top: 46,
              width: 0, height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderRight: '18px solid rgba(167, 139, 250, 0.45)',
            }} />

            {/* Headline */}
            <div style={{
              fontSize: 32, fontWeight: 800, color: '#ffffff',
              lineHeight: 1.25, marginBottom: body ? 18 : 0,
              textShadow: '0 2px 24px rgba(124,58,237,0.7)',
              letterSpacing: '-0.01em',
            }}>
              <AnimatedText text={headline} startFrame={8} fontSize={32} fontWeight={800} />
            </div>

            {/* Body */}
            {body && (
              <div style={{ fontSize: 20, lineHeight: 1.75, color: '#e0e7ff', opacity: 0.95 }}>
                <AnimatedText text={body} startFrame={20} color="#e0e7ff" fontSize={20} fontWeight={400} />
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