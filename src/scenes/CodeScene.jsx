import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SubtitleBar } from "./AvatarScene";

/**
 * CodeScene — Interactive VS Code Studio with Live Memory State & Output Stream
 * Features:
 * - Animated execution line pointer that steps down code lines
 * - Live Variable Memory Tracker dock (variable changes live on screen)
 * - Live terminal execution output console
 * - Native Ol Chiki & indigenous language font support
 */
export const CodeScene = ({
  code = "# Code example\nfor i in range(3):\n    print('Loop:', i)",
  language = "python",
  audioDuration = 10,
  subtitleWords = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = Math.max(Math.round(audioDuration * fps), 300);

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [22, 0]);

  // Clean code and line counting
  const cleanCode = (code || "").replace(/\\n/g, "\n");
  const codeLines = cleanCode.split("\n");
  const lineCount = codeLines.length;

  // Active line step execution simulation
  const activeLineIdx = Math.min(
    lineCount - 1,
    Math.floor((frame / Math.max(1, totalFrames * 0.8)) * lineCount)
  );

  // Live variable iteration simulation
  const simIteration = Math.floor(frame / 35) % 4;

  // Terminal blinking cursor
  const cursorBlink = Math.floor(frame / 12) % 2 === 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
        backgroundColor: "#030209",
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.12) 0%, transparent 50%)
        `,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", sans-serif',
        padding: "35px 55px 85px 55px",
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
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Main Dual Area: Editor (60%) + Live Execution Inspector (40%) */}
      <div
        style={{
          display: "flex",
          gap: 24,
          width: "74%",
          maxWidth: 920,
          zIndex: 10,
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        {/* Left: Code Editor Terminal Window */}
        <div
          style={{
            flex: 1.3,
            background: "rgba(10, 13, 24, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1.5px solid rgba(124, 58, 237, 0.4)",
            borderRadius: 18,
            boxShadow:
              "0 20px 45px rgba(0, 0, 0, 0.6), 0 0 30px rgba(124, 58, 237, 0.2)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top Window Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 18px",
              background: "linear-gradient(180deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 12, 41, 0.8) 100%)",
              borderBottom: "1px solid rgba(139, 92, 246, 0.25)",
            }}
          >
            <div style={{ display: "flex", gap: 7 }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ef4444" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#f59e0b" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#10b981" }} />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(124, 58, 237, 0.2)",
                border: "1px solid rgba(167, 139, 250, 0.35)",
                padding: "3px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                color: "#e0e7ff",
                fontFamily: "monospace",
              }}
            >
              <span>{language === "cpp" ? "⚡ main.cpp" : "🐍 main.py"}</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
            </div>

            <span style={{ fontSize: 10, fontWeight: 800, color: "#c4b5fd", letterSpacing: 1.5 }}>
              EXEC LINE {activeLineIdx + 1}/{lineCount}
            </span>
          </div>

          {/* Code Text with Line Highlighter */}
          <div style={{ position: "relative", padding: "10px 14px" }}>
            <SyntaxHighlighter
              language={language === "cpp" ? "cpp" : "python"}
              style={vscDarkPlus}
              showLineNumbers
              wrapLines
              lineNumberStyle={{
                color: "rgba(148, 163, 184, 0.35)",
                minWidth: "2.2em",
                paddingRight: "0.8em",
                fontSize: 14,
              }}
              customStyle={{
                margin: 0,
                padding: "10px 14px",
                background: "transparent",
                fontSize: 15,
                lineHeight: 1.6,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Noto Sans Ol Chiki', monospace",
              }}
            >
              {cleanCode}
            </SyntaxHighlighter>
          </div>

          {/* Bottom IDE status */}
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              justifyContent: "space-between",
              padding: "7px 16px",
              background: "#080614",
              borderTop: "1px solid rgba(255, 255, 255, 0.07)",
              fontSize: 10,
              color: "#94a3b8",
              fontFamily: "monospace",
            }}
          >
            <span style={{ color: "#34d399" }}>▶ Running Interpreter</span>
            <span>UTF-8 • Spaces: 4</span>
          </div>
        </div>

        {/* Right: Animated Memory State & Live Console Stream */}
        <div
          style={{
            flex: 0.9,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Live Variable Watcher Card */}
          <div
            style={{
              background: "rgba(15, 12, 35, 0.85)",
              backdropFilter: "blur(16px)",
              border: "1.5px solid rgba(56, 189, 248, 0.35)",
              borderRadius: 16,
              padding: "14px 16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 11, fontWeight: 800, color: "#38bdf8", letterSpacing: 1 }}>
              <span>🧠</span>
              <span>MEMORY STATE TRACKER</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", padding: "6px 10px", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }}>
                <span style={{ color: "#a5b4fc" }}>step_index:</span>
                <span style={{ color: "#38bdf8", fontWeight: 800 }}>{simIteration}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", padding: "6px 10px", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }}>
                <span style={{ color: "#a5b4fc" }}>memory_addr:</span>
                <span style={{ color: "#34d399", fontWeight: 800 }}>0x7FFEE3</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", padding: "6px 10px", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }}>
                <span style={{ color: "#a5b4fc" }}>cpu_cycles:</span>
                <span style={{ color: "#fbbf24", fontWeight: 800 }}>{frame * 12} ops</span>
              </div>
            </div>
          </div>

          {/* Live Output Console */}
          <div
            style={{
              background: "#080614",
              border: "1.5px solid rgba(16, 185, 129, 0.35)",
              borderRadius: 16,
              padding: "14px 16px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 11, fontWeight: 800, color: "#34d399", letterSpacing: 1 }}>
              <span>💻</span>
              <span>TERMINAL STDOUT</span>
            </div>

            <div style={{ fontFamily: "monospace", fontSize: 12, color: "#cbd5e1", lineHeight: 1.5, flex: 1 }}>
              <div style={{ color: "#64748b" }}>$ python main.py</div>
              <div style={{ color: "#38bdf8" }}>[Program started...]</div>
              {simIteration >= 1 && <div style={{ color: "#86efac" }}>&gt; Output: step 1 processed</div>}
              {simIteration >= 2 && <div style={{ color: "#86efac" }}>&gt; Output: step 2 processed</div>}
              {simIteration >= 3 && <div style={{ color: "#86efac" }}>&gt; Loop completed successfully ✓</div>}
              <span style={{ display: cursorBlink ? "inline-block" : "none", color: "#34d399", fontWeight: 900 }}>▌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Karaoke Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
};

export default CodeScene;
