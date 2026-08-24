import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * CodeScene — Renders a syntax-highlighted code snippet.
 * Uses react-syntax-highlighter (Prism / vscDarkPlus theme).
 * Supports Python and C++.
 * Features: fade-in card, animated left-border reveal, line numbers.
 */
const CodeScene = ({ code, language = "python" }) => {
  const frame = useCurrentFrame();

  // ── Entrance animation ────────────────────────────────────────────────────
  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const translateX = interpolate(frame, [0, 22], [-32, 0], {
    extrapolateRight: "clamp",
  });

  // ── Animated left-border height reveal ────────────────────────────────────
  const borderHeight = interpolate(frame, [5, 35], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <div style={styles.wrapper}>
      {/* Background grid pattern */}
      <div style={styles.gridOverlay} />

      {/* Outer card */}
      <div
        style={{
          ...styles.card,
          opacity,
          transform: `translateX(${translateX}px)`,
        }}
      >
        {/* Top bar: language badge + file name */}
        <div style={styles.topBar}>
          {/* Traffic-light dots */}
          <div style={styles.dots}>
            <span style={{ ...styles.dot, background: "#ff5f57" }} />
            <span style={{ ...styles.dot, background: "#febc2e" }} />
            <span style={{ ...styles.dot, background: "#28c840" }} />
          </div>

          <div style={styles.fileName}>
            {language === "cpp" ? "snippet.cpp" : "snippet.py"}
          </div>

          {/* Language badge */}
          <div style={styles.langBadge}>
            {language === "cpp" ? "C++" : "Python 3"}
          </div>
        </div>

        {/* Code block with animated left accent */}
        <div style={styles.codeWrapper}>
          {/* Animated left border */}
          <div
            style={{
              ...styles.accentBar,
              height: `${borderHeight}%`,
            }}
          />

          <SyntaxHighlighter
            language={language === "cpp" ? "cpp" : "python"}
            style={vscDarkPlus}
            showLineNumbers
            wrapLines
            lineNumberStyle={{
              color: "rgba(148,163,184,0.35)",
              minWidth: "2.6em",
              paddingRight: "1.2em",
              userSelect: "none",
              fontSize: 15,
            }}
            customStyle={{
              margin: 0,
              padding: "28px 32px 28px 12px",
              background: "transparent",
              fontSize: 17,
              lineHeight: 1.75,
              fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>

        {/* Bottom hint bar */}
        <div style={styles.bottomBar}>
          <span style={styles.hintIcon}>💡</span>
          <span style={styles.hint}>
            Study each line carefully — understanding, not memorising.
          </span>
        </div>
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
    background: "linear-gradient(160deg, #020617 0%, #0f172a 50%, #1e0a3c 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  card: {
    width: "88%",
    maxWidth: 900,
    background: "#0d1117",
    border: "1px solid rgba(99,102,241,0.28)",
    borderRadius: 18,
    boxShadow:
      "0 0 80px rgba(99,102,241,0.14), 0 40px 80px rgba(0,0,0,0.6)",
    overflow: "hidden",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    background: "#161b27",
    borderBottom: "1px solid rgba(99,102,241,0.15)",
  },
  dots: {
    display: "flex",
    gap: 7,
    marginRight: 8,
  },
  dot: {
    display: "inline-block",
    width: 13,
    height: 13,
    borderRadius: "50%",
  },
  fileName: {
    flex: 1,
    color: "#64748b",
    fontSize: 14,
    fontFamily: "monospace",
    letterSpacing: "0.04em",
  },
  langBadge: {
    padding: "3px 12px",
    background: "rgba(99,102,241,0.2)",
    border: "1px solid rgba(99,102,241,0.4)",
    borderRadius: 999,
    color: "#a5b4fc",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.06em",
  },
  codeWrapper: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 3,
    background: "linear-gradient(180deg, #6366f1, #a855f7)",
    borderRadius: "0 2px 2px 0",
    transition: "height 0.1s",
  },
  bottomBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 24px",
    background: "#161b27",
    borderTop: "1px solid rgba(99,102,241,0.12)",
  },
  hintIcon: {
    fontSize: 16,
  },
  hint: {
    color: "#475569",
    fontSize: 13,
    fontStyle: "italic",
  },
};

export default CodeScene;
