import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SubtitleBar } from './AvatarScene';

export function ComparisonScene({ leftTitle, leftPoints = [], rightTitle, rightPoints = [], audioDuration, subtitleWords = [] }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const totalFrames = Math.max(audioDuration * fps, 300);
  const slideLeft = spring({ frame, fps, config: { damping: 12 } });
  const slideRight = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const popVs = spring({ frame: frame - 20, fps, config: { tension: 200, friction: 10 } });
  
  return (
    <div style={{
      flex: 1, backgroundColor: '#0f172a', color: '#fff', padding: '60px',
      display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', flex: 1, position: 'relative', marginTop: '40px' }}>
        
        {/* Left Card */}
        <div style={{
          flex: 1, marginRight: '30px', background: 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)',
          borderRadius: '20px', padding: '40px', borderTop: '6px solid #3b82f6',
          opacity: slideLeft, transform: 'translateX(' + ((1 - slideLeft) * -100) + 'px)'
        }}>
          <h2 style={{ fontSize: '50px', color: '#93c5fd', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '20px', textAlign: 'center' }}>{leftTitle}</h2>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '40px' }}>
            {leftPoints.map((pt, i) => {
               const pAnim = spring({ frame: frame - (40 + i * 15), fps });
               return <li key={i} style={{ fontSize: '36px', marginBottom: '30px', opacity: pAnim, transform: 'translateY(' + ((1-pAnim)*20) + 'px)' }}>🔹 {pt}</li>;
            })}
          </ul>
        </div>

        {/* VS Badge */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(' + popVs + ')',
          width: '100px', height: '100px', borderRadius: '50%', background: '#ef4444',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontSize: '40px', fontWeight: 'bold', boxShadow: '0 0 30px rgba(239, 68, 68, 0.6)',
          zIndex: 10, color: 'white'
        }}>VS</div>

        {/* Right Card */}
        <div style={{
          flex: 1, marginLeft: '30px', background: 'linear-gradient(180deg, #166534 0%, #052e16 100%)',
          borderRadius: '20px', padding: '40px', borderTop: '6px solid #22c55e',
          opacity: slideRight, transform: 'translateX(' + ((1 - slideRight) * 100) + 'px)'
        }}>
          <h2 style={{ fontSize: '50px', color: '#86efac', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '20px', textAlign: 'center' }}>{rightTitle}</h2>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '40px' }}>
            {rightPoints.map((pt, i) => {
               const pAnim = spring({ frame: frame - (40 + i * 15), fps });
               return <li key={i} style={{ fontSize: '36px', marginBottom: '30px', opacity: pAnim, transform: 'translateY(' + ((1-pAnim)*20) + 'px)' }}>🔸 {pt}</li>;
            })}
          </ul>
        </div>
      </div>
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
}