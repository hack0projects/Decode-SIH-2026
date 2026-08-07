import React from 'react';
import { X, Hand, Play, Pause, Volume2, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function ISLVideoPlayerModal({ isOpen, onClose, conceptName, signDescription, videoUrl }) {
  const [isPlaying, setIsPlaying] = React.useState(true);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(28, 25, 23, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '560px',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#FEF3C7',
          borderBottom: '1px solid #FCD34D',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          color: '#92400E'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '15px' }}>
            <Hand size={20} color="#D97706" />
            <span>ISL Gesture Clip: {conceptName || "Programming Logic"}</span>
          </div>

          <button 
            onClick={onClose}
            style={{ color: '#92400E', padding: '4px', borderRadius: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Simulation Box */}
        <div style={{
          backgroundColor: '#000000',
          height: '280px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justify: 'center',
          color: '#FFFFFF'
        }}>
          {/* Visual Sign Animated Avatar Illustration */}
          <div style={{
            fontSize: '64px',
            marginBottom: '12px',
            animation: isPlaying ? 'bounce 1.5s infinite ease-in-out' : 'none'
          }}>
            🤟🏻
          </div>

          <div style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>
            Indian Sign Language (ISL) Video Stream
          </div>

          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ color: '#FCD34D', fontWeight: '700', marginBottom: '2px' }}>
              Subtitles (Hindi & English):
            </div>
            <div>{signDescription || "Repeating steps again and again until condition becomes False"}</div>
          </div>
        </div>

        {/* Video Controls Bar */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600',
              fontSize: '13px',
              color: 'var(--text-main)'
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Pause Gesture' : 'Play Gesture'}</span>
          </button>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Speed: <strong>1.0x (Slowed for clarity)</strong>
          </div>
        </div>

        {/* Footer info & NCERT alignment note */}
        <div style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--accent)', marginBottom: '4px' }}>
            <CheckCircle2 size={14} />
            <span>Grounded in NCERT Computer Science Vocabulary</span>
          </div>
          Curated pre-recorded ISL gestures mapped for Class 8+ CS curriculum.
        </div>
      </div>
    </div>
  );
}
