import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

/**
 * VisualScene — A rich animated diagram / counter scene.
 * Renders different visuals based on the `animation` prop:
 *   "forLoopIterator" → Animated list iteration diagram
 *   "whileCounter"    → Animated counting counter
 *   (default)         → Generic animated placeholder
 */
const VisualScene = ({ animation }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Global entrance ───────────────────────────────────────────────────────
  const entrance = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const cardOpacity = interpolate(entrance, [0, 1], [0, 1]);
  const cardScale  = interpolate(entrance, [0, 1], [0.88, 1]);

  const renderContent = () => {
    switch (animation) {
      case "forLoopIterator":
        return <ForLoopDiagram frame={frame} fps={fps} />;
      case "whileCounter":
        return <WhileCounterDiagram frame={frame} fps={fps} />;
      default:
        return <GenericPlaceholder animation={animation} frame={frame} />;
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.gridOverlay} />
      <div
        style={{
          ...styles.card,
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
        }}
      >
        {/* Scene header */}
        <div style={styles.header}>
          <div style={styles.headerDot} />
          <span style={styles.headerText}>VISUAL EXPLAINER</span>
        </div>

        {/* Dynamic content */}
        <div style={styles.contentArea}>{renderContent()}</div>
      </div>
    </div>
  );
};

// ── ForLoopDiagram ────────────────────────────────────────────────────────────
const ForLoopDiagram = ({ frame, fps }) => {
  const ITEMS = ["apple 🍎", "banana 🍌", "cherry 🍒"];
  const CYCLE = 60; // frames per item cycle

  // Which item is currently "active" — steps every CYCLE frames
  const activeIdx = Math.floor(frame / CYCLE) % ITEMS.length;

  return (
    <div style={fd.wrapper}>
      <h2 style={fd.title}>for fruit in fruits:</h2>

      {/* List representation */}
      <div style={fd.listBox}>
        <span style={fd.listLabel}>fruits = [</span>
        <div style={fd.items}>
          {ITEMS.map((item, i) => {
            const isActive = i === activeIdx;
            const pulse = interpolate(
              frame % CYCLE,
              [0, 10, 40, CYCLE],
              isActive ? [0.8, 1, 1, 0.8] : [1, 1, 1, 1],
              { extrapolateRight: "clamp" }
            );
            return (
              <div
                key={i}
                style={{
                  ...fd.item,
                  background: isActive
                    ? "linear-gradient(90deg,#6366f1,#a855f7)"
                    : "rgba(255,255,255,0.06)",
                  color: isActive ? "#fff" : "#64748b",
                  transform: `scale(${pulse})`,
                  boxShadow: isActive ? "0 0 20px rgba(99,102,241,0.6)" : "none",
                }}
              >
                "{item}"
              </div>
            );
          })}
        </div>
        <span style={fd.listLabel}>]</span>
      </div>

      {/* Arrow + output */}
      <div style={fd.arrow}>↓</div>
      <div style={fd.outputBox}>
        <span style={fd.outputLabel}>print(f"I love </span>
        <span style={fd.outputValue}>{ITEMS[activeIdx]}</span>
        <span style={fd.outputLabel}>!")</span>
      </div>

      {/* Step indicator */}
      <div style={fd.stepRow}>
        {ITEMS.map((_, i) => (
          <div
            key={i}
            style={{
              ...fd.stepDot,
              background: i === activeIdx ? "#6366f1" : "#1e293b",
              transform: i === activeIdx ? "scale(1.4)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

const fd = {
  wrapper: { textAlign: "center", padding: "20px 0" },
  title: { color: "#a5b4fc", fontFamily: "monospace", fontSize: 26, marginBottom: 32, letterSpacing: "0.04em" },
  listBox: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  listLabel: { color: "#475569", fontSize: 18, fontFamily: "monospace" },
  items: { display: "flex", gap: 14, margin: "10px 0" },
  item: { padding: "12px 24px", borderRadius: 12, fontFamily: "monospace", fontSize: 18, fontWeight: 700, transition: "all 0.1s", border: "1px solid rgba(99,102,241,0.3)" },
  arrow: { color: "#6366f1", fontSize: 36, margin: "18px 0", fontWeight: 800 },
  outputBox: { display: "inline-flex", alignItems: "center", gap: 6, padding: "14px 28px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12 },
  outputLabel: { color: "#64748b", fontFamily: "monospace", fontSize: 20 },
  outputValue: { color: "#a5b4fc", fontFamily: "monospace", fontSize: 20, fontWeight: 800 },
  stepRow: { display: "flex", gap: 10, justifyContent: "center", marginTop: 28 },
  stepDot: { width: 10, height: 10, borderRadius: "50%", transition: "all 0.2s" },
};

// ── WhileCounterDiagram ───────────────────────────────────────────────────────
const WhileCounterDiagram = ({ frame, fps }) => {
  const MAX = 5;
  // Count up from 0 → MAX over the scene
  const rawCount = interpolate(frame, [10, 160], [0, MAX], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const count = Math.floor(rawCount);
  const isRunning = count < MAX;

  // Progress bar fill
  const barFill = interpolate(rawCount, [0, MAX], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <div style={wc.wrapper}>
      <h2 style={wc.title}>while counter &lt; 5:</h2>

      {/* Status pill */}
      <div style={{ ...wc.status, background: isRunning ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${isRunning ? "#22c55e" : "#ef4444"}44` }}>
        <div style={{ ...wc.statusDot, background: isRunning ? "#22c55e" : "#ef4444", boxShadow: `0 0 8px ${isRunning ? "#22c55e" : "#ef4444"}` }} />
        <span style={{ color: isRunning ? "#4ade80" : "#f87171", fontSize: 15, fontWeight: 700 }}>
          {isRunning ? "LOOP RUNNING" : "LOOP FINISHED"}
        </span>
      </div>

      {/* Big counter */}
      <div style={wc.counterBox}>
        <span style={wc.counterLabel}>counter</span>
        <span style={wc.counterValue}>{count}</span>
      </div>

      {/* Progress bar */}
      <div style={wc.barTrack}>
        <div style={{ ...wc.barFill, width: `${barFill}%`, background: isRunning ? "linear-gradient(90deg,#6366f1,#a855f7)" : "#ef4444" }} />
      </div>
      <div style={wc.barLabels}>
        <span style={wc.barLabel}>0</span>
        <span style={wc.barLabel}>5</span>
      </div>

      {/* Condition check */}
      <div style={wc.condition}>
        <span style={wc.condLabel}>Condition:</span>
        <span style={{ ...wc.condValue, color: isRunning ? "#4ade80" : "#f87171" }}>
          {count} &lt; 5 → {isRunning ? "True ✅" : "False ❌"}
        </span>
      </div>
    </div>
  );
};

const wc = {
  wrapper: { textAlign: "center", padding: "20px 0" },
  title: { color: "#a5b4fc", fontFamily: "monospace", fontSize: 26, marginBottom: 20, letterSpacing: "0.04em" },
  status: { display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 20px", borderRadius: 999, marginBottom: 28 },
  statusDot: { width: 10, height: 10, borderRadius: "50%" },
  counterBox: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 },
  counterLabel: { color: "#64748b", fontSize: 18, fontFamily: "monospace", marginBottom: 8 },
  counterValue: { fontSize: 96, fontWeight: 900, color: "#f1f5f9", fontFamily: "monospace", lineHeight: 1, textShadow: "0 0 40px rgba(99,102,241,0.6)" },
  barTrack: { width: 400, height: 14, background: "#1e293b", borderRadius: 999, overflow: "hidden", margin: "0 auto 8px" },
  barFill: { height: "100%", borderRadius: 999, transition: "width 0.1s" },
  barLabels: { display: "flex", justifyContent: "space-between", width: 400, margin: "0 auto 20px" },
  barLabel: { color: "#475569", fontSize: 13, fontFamily: "monospace" },
  condition: { display: "inline-flex", gap: 12, padding: "10px 24px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10 },
  condLabel: { color: "#64748b", fontSize: 17, fontFamily: "monospace" },
  condValue: { fontSize: 17, fontFamily: "monospace", fontWeight: 700 },
};

// ── GenericPlaceholder ────────────────────────────────────────────────────────
const GenericPlaceholder = ({ animation, frame }) => {
  const rotate = interpolate(frame, [0, 300], [0, 360]);
  return (
    <div style={gp.wrapper}>
      <div style={{ ...gp.spinner, transform: `rotate(${rotate}deg)` }} />
      <h3 style={gp.label}>Visual: {animation}</h3>
      <p style={gp.sub}>Custom animation placeholder</p>
    </div>
  );
};

const gp = {
  wrapper: { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 },
  spinner: { width: 80, height: 80, borderRadius: "50%", border: "4px solid #1e293b", borderTop: "4px solid #6366f1" },
  label: { color: "#a5b4fc", fontSize: 22, fontFamily: "monospace", margin: 0 },
  sub: { color: "#475569", fontSize: 16, margin: 0 },
};

// ── Shared wrapper styles ─────────────────────────────────────────────────────
const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    background: "linear-gradient(160deg, #020617 0%, #0f172a 60%, #1e0a3c 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
  },
  card: {
    width: "86%",
    maxWidth: 860,
    background: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(99,102,241,0.28)",
    borderRadius: 22,
    boxShadow: "0 0 80px rgba(99,102,241,0.12), 0 40px 80px rgba(0,0,0,0.5)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "16px 24px",
    background: "rgba(99,102,241,0.08)",
    borderBottom: "1px solid rgba(99,102,241,0.15)",
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#6366f1",
    boxShadow: "0 0 8px #6366f1",
  },
  headerText: {
    color: "#6366f1",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  },
  contentArea: {
    padding: "36px 40px",
  },
};

export default VisualScene;
