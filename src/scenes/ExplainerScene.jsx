import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { SubtitleBar } from './AvatarScene';

export function ExplainerScene({ heading, bullets = [], highlights = [], audioDuration, subtitleWords = [] }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const totalFrames = Math.max(audioDuration * fps, 300);
  const headingY = spring({ frame, fps, config: { damping: 12 } });
  
  return (
    <div style={{
      flex: 1, backgroundColor: '#1e1b4b', color: '#fff', padding: '80px',
      display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", Arial, sans-serif'
    }}>
      <h1 style={{
        fontSize: '60px', fontWeight: 'bold', color: '#c4b5fd',
        transform: 'translateY(' + ((1 - headingY) * -50) + 'px)',
        opacity: headingY, marginBottom: '40px', borderBottom: '4px solid #7c3aed', paddingBottom: '20px'
      }}>{heading}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '20px' }}>
        {bullets.map((bullet, i) => {
          const delay = (totalFrames / (bullets.length + 1)) * (i + 0.5);
          const slideIn = Math.max(0, spring({ frame: frame - delay, fps, config: { damping: 14 } }));
          let renderedText = bullet;
          highlights.forEach(hl => {
            const regex = new RegExp('(' + hl + ')', 'gi');
            renderedText = renderedText.replace(regex, '<span style="color:#fde047; font-weight:800; border-bottom: 3px solid #facc15;"></span>');
          });

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', fontSize: '42px',
              opacity: slideIn, transform: 'translateX(' + ((1 - slideIn) * 100) + 'px)',
              background: 'rgba(255,255,255,0.05)', padding: '20px 30px',
              borderRadius: '12px', borderLeft: '8px solid #8b5cf6', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
              <span style={{ marginRight: '20px' }}>💡</span>
              <span dangerouslySetInnerHTML={{ __html: renderedText }} />
            </div>
          );
        })}
      </div>
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
}