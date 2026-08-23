import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SubtitleBar } from './AvatarScene';

export function FlowchartScene({ steps = [], colors = [], audioDuration, subtitleWords = [] }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const totalFrames = Math.max(audioDuration * fps, 300);
  const defaultColors = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  
  return (
    <div style={{
      flex: 1, backgroundColor: '#111827', color: '#fff', padding: '60px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      fontFamily: '"Segoe UI", Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
        {steps.map((step, i) => {
          const delay = i * 40;
          const pop = spring({ frame: frame - delay, fps, config: { tension: 150 } });
          const arrowDraw = spring({ frame: frame - delay - 20, fps, config: { damping: 20 } });
          const color = colors[i] || defaultColors[i % defaultColors.length];
          
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                background: color, padding: '25px 40px', borderRadius: '15px',
                fontSize: '38px', fontWeight: 'bold', transform: 'scale(' + pop + ')',
                opacity: pop, boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                maxWidth: '250px', textAlign: 'center', wordWrap: 'break-word'
              }}>
                {step}
              </div>
              
              {i < steps.length - 1 && (
                <div style={{
                  width: '80px', height: '8px', background: '#4b5563', margin: '0 20px',
                  position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, background: '#cbd5e1',
                    width: (arrowDraw * 100) + '%'
                  }} />
                  <div style={{
                    position: 'absolute', right: '-10px', top: '-10px',
                    borderTop: '14px solid transparent', borderBottom: '14px solid transparent',
                    borderLeft: '20px solid #cbd5e1', opacity: arrowDraw > 0.9 ? 1 : 0
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
}