import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SubtitleBar } from "./AvatarScene";

/**
 * CodeScene — Ultra-Sleek VS Code Studio Glass Terminal
 * Features:
 * - macOS frosted glass window frame with traffic light controls
 * - Animated laser scan sweep across code lines
 * - Blinking typewriter cursor
 * - Integrated IDE bottom status bar
 * - Clear layout reserving corner space for PiP Teacher Cam
 */
export const CodeScene = ({
  code = "# Code example\nprint('Hello World')",
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
  const translateY = interpolate(entrance, [0, 1], [25, 0]);

  // Animated left accent line
  const borderHeight = interpolate(frame, [8, 32], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Laser scan line position (sweeps down every 100 frames)
  const scanProgress = (frame % 110) / 110;
  const scanTop = scanProgress * 100;

  // Blinking cursor
  const cursorBlink = Math.floor(frame / 12) % 2 === 0;

  // Clean code string
  const cleanCode = (code || "").replace(/\\n/g, "\n");
  const lineCount = cleanCode.split("\n").length;

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
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        padding: "45px 60px 85px 60px",
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

      {/* Terminal Card (Width 70% to leave room for PiP Teacher Cam) */}
      <div
        style={{
          width: "70%",
          maxWidth: 860,
          background: "rgba(10, 13, 24, 0.88)",
          backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(124, 58, 237, 0.4)",
          borderRadius: 20,
          boxShadow:
            "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(124, 58, 237, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
          overflow: "hidden",
          opacity,
          transform: `translateY(${translateY}px)`,
          zIndex: 10,
        }}
      >
        {/* Top Window Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            background: "linear-gradient(180deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 12, 41, 0.8) 100%)",
            borderBottom: "1px solid rgba(139, 92, 246, 0.25)",
          }}
        >
          {/* Traffic Lights */}
          <div style={{ display: "flex", gap: 8 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ef4444",
                boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
              }}
            />
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#f59e0b",
                boxShadow: "0 0 8px rgba(245, 158, 11, 0.6)",
              }}
            />
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
              }}
            />
          </div>

          {/* Active File Tab */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(124, 58, 237, 0.2)",
              border: "1px solid rgba(167, 139, 250, 0.35)",
              padding: "4px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              color: "#e0e7ff",
              fontFamily: "monospace",
            }}
          >
            <span>{language === "cpp" ? "⚡ main.cpp" : "🐍 script.py"}</span>
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#38bdf8",
                boxShadow: "0 0 6px #38bdf8",
              }}
            />
          </div>

          {/* Language Tag */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: "#c4b5fd",
              textTransform: "uppercase",
              background: "rgba(255, 255, 255, 0.06)",
              padding: "3px 10px",
              borderRadius: 6,
            }}
          >
            {language === "cpp" ? "C++ 20" : "Python 3.12"}
          </div>
        </div>

        {/* Code Content Area */}
        <div style={{ position: "relative", padding: "12px 18px" }}>
          {/* Animated left neon accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 4,
              height: `${borderHeight}%`,
              background: "linear-gradient(180deg, #7c3aed 0%, #38bdf8 100%)",
              boxShadow: "0 0 10px #7c3aed",
            }}
          />

          {/* Laser scanning beam */}
          <div
            style={{
              position: "absolute",
              top: `${scanTop}%`,
              left: 4,
              right: 0,
              height: 2,
              background:
                "linear-gradient(90deg, rgba(56, 189, 248, 0) 0%, rgba(56, 189, 248, 0.8) 50%, rgba(168, 85, 247, 0) 100%)",
              boxShadow: "0 0 8px rgba(56, 189, 248, 0.8)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />

          {/* Syntax Highlighter */}
          <SyntaxHighlighter
            language={language === "cpp" ? "cpp" : "python"}
            style={vscDarkPlus}
            showLineNumbers
            wrapLines
            lineNumberStyle={{
              color: "rgba(148, 163, 184, 0.35)",
              minWidth: "2.4em",
              paddingRight: "1em",
              userSelect: "none",
              fontSize: 15,
            }}
            customStyle={{
              margin: 0,
              padding: "16px 20px 16px 8px",
              background: "transparent",
              fontSize: 16,
              lineHeight: 1.65,
              fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            }}
          >
            {cleanCode}
          </SyntaxHighlighter>

          {/* Blinking Typewriter Cursor */}
          <span
            style={{
              display: cursorBlink ? "inline-block" : "none",
              width: 8,
              height: 18,
              background: "#38bdf8",
              boxShadow: "0 0 8px #38bdf8",
              marginLeft: 4,
              verticalAlign: "middle",
            }}
          />
        </div>

        {/* Bottom IDE Status Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 18px",
            background: "#080614",
            borderTop: "1px solid rgba(255, 255, 255, 0.07)",
            fontSize: 11,
            color: "#94a3b8",
            fontFamily: "monospace",
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ color: "#34d399" }}>⚡ Ready</span>
            <span>Lines: {lineCount}</span>
            <span>UTF-8</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ color: "#c4b5fd" }}>Spaces: 4</span>
            <span style={{ color: "#38bdf8" }}>Syntax: OK</span>
          </div>
        </div>
      </div>

      {/* Karaoke Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
};

export default CodeScene;
