import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { SubtitleBar } from "./AvatarScene";

/**
 * VisualScene — Interactive Algorithm & Data Structure Visualizer
 * Features:
 * - Floating Data Packet transfer animation from array to execution block
 * - Dynamic HUD gauge with animated needle and particle sparks
 * - Full indigenous language font support ('Noto Sans Ol Chiki' for Santhali)
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
        fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", sans-serif',
        padding: "35px 55px 85px 55px",
        boxSizing: "border-box",
      }}
    >
      {/* Micro-grid overlay */}
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

      {/* Main Card */}
      <div
        style={{
          width: "74%",
          maxWidth: 900,
          background: "rgba(15, 12, 35, 0.88)",
          backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(139, 92, 246, 0.4)",
          borderRadius: 22,
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.6), 0 0 35px rgba(124, 58, 237, 0.2)",
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
            justifyContent: "space-between",
            padding: "12px 22px",
            background: "linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)",
            borderBottom: "1px solid rgba(139, 92, 246, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 8px #38bdf8" }} />
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: "#e0e7ff", textTransform: "uppercase" }}>
              ALGORITHM & MEMORY VISUALIZER
            </span>
          </div>

          <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", background: "rgba(16, 185, 129, 0.2)", padding: "2px 8px", borderRadius: 6 }}>
            ● LIVE EXECUTION
          </span>
        </div>

        {/* Dynamic Visual Content */}
        <div style={{ padding: "26px 32px" }}>{renderContent()}</div>
      </div>

      {/* Karaoke Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
};

// ── ForLoopDiagram ────────────────────────────────────────────────────────────
const ForLoopDiagram = ({ frame, fps }) => {
  const ITEMS = ["Apple 🍎", "Banana 🍌", "Cherry 🍒", "Date 🌴"];
  const CYCLE = 45;
  const activeIdx = Math.floor(frame / CYCLE) % ITEMS.length;

  // Floating packet trajectory
  const packetCycle = frame % CYCLE;
  const packetY = interpolate(packetCycle, [0, 15, 30, CYCLE], [0, -18, 12, 0], {
    extrapolateRight: "clamp",
  });
  const packetOpacity = interpolate(packetCycle, [0, 10, 35, CYCLE], [0.4, 1, 1, 0.4]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Code Header */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 20,
          fontWeight: 700,
          color: "#a5b4fc",
          background: "rgba(99, 102, 241, 0.15)",
          padding: "7px 16px",
          borderRadius: 10,
          border: "1px solid rgba(99, 102, 241, 0.3)",
          alignSelf: "flex-start",
        }}
      >
        for fruit in fruits:
      </div>

      {/* Memory Array Container with Addresses */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "monospace", fontSize: 18, color: "#64748b" }}>
          fruits = [
        </span>

        <div style={{ display: "flex", gap: 12 }}>
          {ITEMS.map((item, i) => {
            const isActive = i === activeIdx;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {/* Memory address badge */}
                <span style={{ fontSize: 9, fontFamily: "monospace", color: isActive ? "#38bdf8" : "#64748b" }}>
                  0x0{i}
                </span>

                <div
                  style={{
                    padding: "10px 18px",
                    borderRadius: 12,
                    fontFamily: "monospace",
                    fontSize: 16,
                    fontWeight: 800,
                    background: isActive
                      ? "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                      : "rgba(255, 255, 255, 0.05)",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    border: `1.5px solid ${isActive ? "#38bdf8" : "rgba(255,255,255,0.1)"}`,
                    boxShadow: isActive
                      ? "0 0 25px rgba(99, 102, 241, 0.7), 0 4px 12px rgba(0,0,0,0.4)"
                      : "none",
                    transform: isActive ? `scale(1.06) translateY(${packetY}px)` : "scale(1)",
                    opacity: isActive ? packetOpacity : 0.8,
                    transition: "all 0.15s ease",
                  }}
                >
                  "{item}"
                </div>
              </div>
            );
          })}
        </div>

        <span style={{ fontFamily: "monospace", fontSize: 18, color: "#64748b" }}>
          ]
        </span>
      </div>

      {/* Active Laser Pointer Arrow */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#38bdf8", fontSize: 15, fontWeight: 700 }}>
        <span>⚡ DATA REGISTER:</span>
        <span style={{ color: "#facc15", background: "rgba(250,204,21,0.15)", padding: "2px 8px", borderRadius: 6 }}>
          fruit = {ITEMS[activeIdx]}
        </span>
      </div>

      {/* Live Terminal Output Box */}
      <div
        style={{
          background: "#080614",
          border: "1px solid rgba(56, 189, 248, 0.35)",
          borderRadius: 12,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ color: "#34d399", fontFamily: "monospace", fontSize: 15 }}>
          $ stdout:
        </span>
        <span style={{ color: "#f1f5f9", fontFamily: "monospace", fontSize: 16, fontWeight: 700 }}>
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
  const needleAngle = -90 + (count / MAX) * 180;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 20,
          fontWeight: 700,
          color: "#38bdf8",
          background: "rgba(14, 165, 233, 0.15)",
          padding: "7px 16px",
          borderRadius: 10,
          border: "1px solid rgba(14, 165, 233, 0.3)",
          alignSelf: "flex-start",
        }}
      >
        while count &lt; 5: count += 1
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {/* Analog HUD Speedometer Gauge with Swinging Needle */}
        <div
          style={{
            width: 105,
            height: 105,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)",
            border: "3px solid #38bdf8",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 24px rgba(56, 189, 248, 0.5)",
            position: "relative",
          }}
        >
          {/* Animated Gauge Needle */}
          <div
            style={{
              position: "absolute",
              width: 3,
              height: 38,
              background: "#ef4444",
              bottom: "50%",
              transformOrigin: "bottom center",
              transform: `rotate(${needleAngle}deg)`,
              borderRadius: 2,
              boxShadow: "0 0 8px #ef4444",
              transition: "transform 0.15s ease-out",
            }}
          />
          <span style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", zIndex: 5 }}>
            {count}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#93c5fd", zIndex: 5 }}>
            OF {MAX}
          </span>
        </div>

        {/* Linear Progress Bar */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>
            <span>ITERATION PROGRESS</span>
            <span>{progressPct.toFixed(0)}%</span>
          </div>

          <div style={{ width: "100%", height: 12, borderRadius: 8, background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
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
