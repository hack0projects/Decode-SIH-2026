import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { SubtitleBar } from "./AvatarScene";

/**
 * VisualScene — Interactive Algorithm & Data Structure Visualizer
 * Features:
 * - Fluid pointer beacon tracking data in memory
 * - Animated HUD circular progress meter
 * - Glowing glass cards with live console outputs
 */
export const VisualScene = ({
  animation = "forLoopIterator",
  audioDuration = 10,
  subtitleWords = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = Math.max(Math.round(audioDuration * fps), 300);

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 95, mass: 0.8 },
  });
  const cardOpacity = interpolate(entrance, [0, 1], [0, 1]);
  const cardScale = interpolate(entrance, [0, 1], [0.92, 1]);

  const renderContent = () => {
    switch (animation) {
      case "whileCounter":
        return <WhileCounterDiagram frame={frame} fps={fps} />;
      case "forLoopIterator":
      default:
        return <ForLoopDiagram frame={frame} fps={fps} />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
        backgroundColor: "#05030f",
        backgroundImage: `
          radial-gradient(circle at 15% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.12) 0%, transparent 60%)
        `,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        padding: "40px 60px 85px 60px",
        boxSizing: "border-box",
      }}
    >
      {/* Background Cyber Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          pointerEvents: "none",
        }}
      />

      {/* Main Card (Width 70% to reserve space for PiP Teacher Cam) */}
      <div
        style={{
          width: "70%",
          maxWidth: 860,
          background: "rgba(15, 12, 35, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(139, 92, 246, 0.4)",
          borderRadius: 24,
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.6), 0 0 35px rgba(124, 58, 237, 0.2), inset 0 1px 1px rgba(255,255,255,0.15)",
          overflow: "hidden",
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
          zIndex: 10,
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 24px",
            background: "linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)",
            borderBottom: "1px solid rgba(139, 92, 246, 0.25)",
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#38bdf8",
              boxShadow: "0 0 8px #38bdf8",
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              color: "#e0e7ff",
              textTransform: "uppercase",
            }}
          >
            INTERACTIVE ALGORITHM VISUALIZATION
          </span>
        </div>

        {/* Dynamic Visual Content */}
        <div style={{ padding: "32px 36px" }}>{renderContent()}</div>
      </div>

      {/* Karaoke Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
};

// ── ForLoopDiagram ────────────────────────────────────────────────────────────
const ForLoopDiagram = ({ frame, fps }) => {
  const ITEMS = ["apple 🍎", "banana 🍌", "cherry 🍒", "date 🌴"];
  const CYCLE = 45;
  const activeIdx = Math.floor(frame / CYCLE) % ITEMS.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Code Header */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 22,
          fontWeight: 700,
          color: "#a5b4fc",
          background: "rgba(99, 102, 241, 0.15)",
          padding: "8px 18px",
          borderRadius: 10,
          border: "1px solid rgba(99, 102, 241, 0.3)",
          alignSelf: "flex-start",
        }}
      >
        for fruit in fruits:
      </div>

      {/* Memory Array Container */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontFamily: "monospace", fontSize: 20, color: "#64748b" }}>
          fruits = [
        </span>

        <div style={{ display: "flex", gap: 14 }}>
          {ITEMS.map((item, i) => {
            const isActive = i === activeIdx;
            return (
              <div
                key={i}
                style={{
                  padding: "12px 20px",
                  borderRadius: 14,
                  fontFamily: "monospace",
                  fontSize: 18,
                  fontWeight: 800,
                  background: isActive
                    ? "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                    : "rgba(255, 255, 255, 0.05)",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  border: `1.5px solid ${isActive ? "#38bdf8" : "rgba(255,255,255,0.1)"}`,
                  boxShadow: isActive
                    ? "0 0 25px rgba(99, 102, 241, 0.7), 0 4px 12px rgba(0,0,0,0.4)"
                    : "none",
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                  transition: "all 0.15s ease",
                }}
              >
                "{item}"
              </div>
            );
          })}
        </div>

        <span style={{ fontFamily: "monospace", fontSize: 20, color: "#64748b" }}>
          ]
        </span>
      </div>

      {/* Active Laser Pointer Arrow */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#38bdf8" }}>
        <span style={{ fontSize: 22 }}>⚡</span>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
          POINTER FOCUS: <span style={{ color: "#facc15" }}>{ITEMS[activeIdx]}</span>
        </span>
      </div>

      {/* Live Terminal Output Box */}
      <div
        style={{
          background: "#080614",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: 14,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ color: "#34d399", fontFamily: "monospace", fontSize: 16 }}>
          $ stdout:
        </span>
        <span
          style={{
            color: "#f1f5f9",
            fontFamily: "monospace",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          I love {ITEMS[activeIdx]}!
        </span>
      </div>
    </div>
  );
};

// ── WhileCounterDiagram ───────────────────────────────────────────────────────
const WhileCounterDiagram = ({ frame, fps }) => {
  const MAX = 5;
  const count = Math.min(MAX, Math.floor(frame / 30) % (MAX + 1));
  const progressPct = (count / MAX) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 22,
          fontWeight: 700,
          color: "#38bdf8",
          background: "rgba(14, 165, 233, 0.15)",
          padding: "8px 18px",
          borderRadius: 10,
          border: "1px solid rgba(14, 165, 233, 0.3)",
          alignSelf: "flex-start",
        }}
      >
        while count &lt; 5: count += 1
      </div>

      {/* Circular HUD Gauge & Meter */}
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)",
            border: "3px solid #38bdf8",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 24px rgba(56, 189, 248, 0.5)",
          }}
        >
          <span style={{ fontSize: 36, fontWeight: 900, color: "#ffffff" }}>
            {count}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#93c5fd" }}>
            OF {MAX}
          </span>
        </div>

        {/* Linear High-Tech Progress Bar */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 700,
              color: "#94a3b8",
            }}
          >
            <span>PROGRESS</span>
            <span>{progressPct.toFixed(0)}%</span>
          </div>

          <div
            style={{
              width: "100%",
              height: 14,
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                background: "linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)",
                boxShadow: "0 0 12px #38bdf8",
                transition: "width 0.1s ease",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualScene;
