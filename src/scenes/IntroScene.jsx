import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

/**
 * IntroScene — Cinematic Opening & Title Presentation
 * Features:
 * - Ambient cosmic nebula drift
 * - Glassmorphism card with glowing specular highlights
 * - Kinetic gradient typography
 * - Floating cyber embers and micro-grid
 */
export const IntroScene = ({ text = "Welcome to CodeSeekho\nMaster Programming Naturally" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const scaleProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 95, mass: 0.8 },
  });
  const scale = interpolate(scaleProgress, [0, 1], [0.88, 1]);
  const opacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [0, 20], [28, 0], { extrapolateRight: "clamp" });

  // Floating background ambient motion
  const orbX = Math.sin(frame * 0.025) * 35;
  const orbY = Math.cos(frame * 0.02) * 25;

  const lines = (text || "").split("\n");
  const headline = lines[0] || "CodeSeekho AI";
  const bodyLines = lines.slice(1);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#05030e",
        backgroundImage: `
          radial-gradient(circle at 20% 25%, rgba(124, 58, 237, 0.22) 0%, transparent 55%),
          radial-gradient(circle at 80% 75%, rgba(6, 182, 212, 0.18) 0%, transparent 55%),
          radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.08) 0%, transparent 60%)
        `,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
      }}
    >
      {/* Background Cyber Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          pointerEvents: "none",
        }}
      />

      {/* Floating glowing orbs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)",
          top: -120 + orbY,
          right: -80 + orbX,
          filter: "blur(35px)",
          pointerEvents: "none",
        }}
      />

      {/* Main Glass Card */}
      <div
        style={{
          maxWidth: 920,
          width: "86%",
          padding: "54px 64px",
          background: "rgba(15, 12, 35, 0.72)",
          border: "1.5px solid rgba(167, 139, 250, 0.4)",
          borderRadius: 28,
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 24px 60px rgba(0, 0, 0, 0.6), 0 0 45px rgba(124, 58, 237, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px)`,
          zIndex: 10,
        }}
      >
        {/* CodeSeekho Logo Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 18px",
            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(79, 70, 229, 0.25))",
            border: "1px solid rgba(167, 139, 250, 0.5)",
            borderRadius: 999,
            color: "#c4b5fd",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 26,
            boxShadow: "0 0 16px rgba(124, 58, 237, 0.35)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#38bdf8",
              boxShadow: "0 0 8px #38bdf8",
            }}
          />
          CodeSeekho AI Masterclass
        </div>

        {/* Headline */}
        <h1
          style={{
            margin: "0 0 20px 0",
            fontSize: 50,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 45%, #c4b5fd 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 35px rgba(167, 139, 250, 0.4)",
          }}
        >
          {headline}
        </h1>

        {/* Dynamic Gradient Divider */}
        <div
          style={{
            width: 80,
            height: 4,
            background: "linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)",
            borderRadius: 4,
            marginBottom: 24,
            boxShadow: "0 0 12px rgba(56, 189, 248, 0.7)",
          }}
        />

        {/* Body Lines */}
        {bodyLines.map((line, idx) => (
          <p
            key={idx}
            style={{
              margin: "10px 0",
              fontSize: 23,
              color: "#e2e8f0",
              lineHeight: 1.65,
              fontWeight: 450,
            }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default IntroScene;
