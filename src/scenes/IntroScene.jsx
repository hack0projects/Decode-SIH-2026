import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

/**
 * IntroScene — Animated text card for titles and lesson introductions.
 * Uses Remotion spring() for a smooth scale + fade-in entrance.
 */
const IntroScene = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Spring animation: scale from 0.85 → 1.0 ──────────────────────────────
  const scaleProgress = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 100,
      mass: 0.6,
    },
  });

  const scale = interpolate(scaleProgress, [0, 1], [0.85, 1]);

  // ── Opacity: fade in over first 15 frames ─────────────────────────────────
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ── Vertical lift: slide up 24px → 0px ───────────────────────────────────
  const translateY = interpolate(frame, [0, 20], [24, 0], {
    extrapolateRight: "clamp",
  });

  // ── Parse text for multi-line support ─────────────────────────────────────
  const lines = text.split("\n");
  const [headline, ...bodyLines] = lines;

  return (
    <div style={styles.wrapper}>
      {/* Animated glow blob */}
      <div style={styles.glowOrb} />

      {/* Card container */}
      <div
        style={{
          ...styles.card,
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px)`,
        }}
      >
        {/* CodeSeekho logo badge */}
        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          CodeSeekho
        </div>

        {/* Headline */}
        <h1 style={styles.headline}>{headline}</h1>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Body lines */}
        {bodyLines.map((line, idx) => (
          <p key={idx} style={styles.body}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  glowOrb: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
    top: "-100px",
    right: "-100px",
    pointerEvents: "none",
  },
  card: {
    maxWidth: 820,
    width: "88%",
    padding: "56px 64px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(99,102,241,0.35)",
    borderRadius: 24,
    backdropFilter: "blur(12px)",
    boxShadow:
      "0 0 60px rgba(99,102,241,0.18), 0 30px 60px rgba(0,0,0,0.5)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 16px",
    background: "rgba(99,102,241,0.18)",
    border: "1px solid rgba(99,102,241,0.4)",
    borderRadius: 999,
    color: "#a5b4fc",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 28,
  },
  badgeDot: {
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#818cf8",
    boxShadow: "0 0 6px #818cf8",
  },
  headline: {
    margin: "0 0 20px",
    fontSize: 52,
    fontWeight: 800,
    color: "#f1f5f9",
    lineHeight: 1.2,
    letterSpacing: "-0.5px",
  },
  divider: {
    width: 64,
    height: 3,
    background: "linear-gradient(90deg, #6366f1, #a855f7)",
    borderRadius: 4,
    marginBottom: 28,
  },
  body: {
    margin: "8px 0",
    fontSize: 24,
    color: "#94a3b8",
    lineHeight: 1.65,
    fontWeight: 400,
  },
};

export default IntroScene;
