import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import IntroScene from "./scenes/IntroScene";
import CodeScene from "./scenes/CodeScene";
import VisualScene from "./scenes/VisualScene";

/**
 * SCENE_DURATION_SECONDS — fixed time allocated to every scene.
 * Change this constant to globally adjust scene pacing.
 */
export const SCENE_DURATION_SECONDS = 8;

/**
 * sceneRenderer — pure function that maps a scene object to a React component.
 * Keeps DynamicVideoEngine declarative and easy to extend.
 *
 * @param {Object} scene - A single scene from the JSON schema.
 * @param {string} language - The programming language from the root JSON.
 * @returns {JSX.Element}
 */
const sceneRenderer = (scene, language) => {
  switch (scene.type) {
    case "intro":
      return <IntroScene text={scene.text} />;

    case "code":
      return (
        <CodeScene
          code={scene.code}
          language={language?.toLowerCase() === "c++" ? "cpp" : "python"}
        />
      );

    case "visual":
      return <VisualScene animation={scene.animation} />;

    default:
      // Graceful fallback for unknown scene types
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "#0f172a",
            color: "#ef4444",
            fontSize: 28,
            fontFamily: "monospace",
          }}
        >
          ⚠ Unknown scene type: "{scene.type}"
        </div>
      );
  }
};

/**
 * DynamicVideoEngine — Core orchestration component.
 *
 * Props:
 *   script {Object} — The parsed JSON educational script.
 *
 * Behaviour:
 *   • Reads script.scenes[]
 *   • For each scene calculates the `from` frame offset and `durationInFrames`
 *   • Wraps each rendered scene in a <Sequence> for timeline placement
 *   • Scenes play sequentially without overlap
 */
const DynamicVideoEngine = ({ script }) => {
  const { fps } = useVideoConfig();

  // ── Guard: validate script prop ───────────────────────────────────────────
  if (!script || !Array.isArray(script.scenes) || script.scenes.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#0f172a",
          color: "#f87171",
          fontSize: 26,
          fontFamily: "monospace",
          textAlign: "center",
          padding: 40,
        }}
      >
        ⚠ Invalid script: "scenes" array is missing or empty.
      </div>
    );
  }

  const durationInFrames = SCENE_DURATION_SECONDS * fps;

  return (
    <>
      {script.scenes.map((scene, index) => {
        // Each scene starts right after the previous one ends
        const from = index * durationInFrames;

        return (
          <Sequence
            key={`scene-${index}-${scene.type}`}
            from={from}
            durationInFrames={durationInFrames}
            name={`Scene ${index + 1}: ${scene.type.toUpperCase()}`}
          >
            {sceneRenderer(scene, script.language)}
          </Sequence>
        );
      })}
    </>
  );
};

export default DynamicVideoEngine;
