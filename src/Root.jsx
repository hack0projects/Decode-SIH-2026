import React from 'react';
import {
  Composition,
  Sequence,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Audio,
  staticFile,
  registerRoot,
} from 'remotion';
import IntroScene from './scenes/IntroScene';
import CodeScene from './scenes/CodeScene';
import VisualScene from './scenes/VisualScene';
import { AvatarScene } from './scenes/AvatarScene';
import { ExplainerScene } from './scenes/ExplainerScene';
import { ComparisonScene } from './scenes/ComparisonScene';
import { FlowchartScene } from './scenes/FlowchartScene';
import { PipTeacherCam } from './components/PipTeacherCam';

const SceneFade = ({ children, duration = 18 }) => {
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, duration, durationInFrames - duration, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ flex: 1, width: '100%', height: '100%', opacity, position: 'relative' }}>{children}</div>;
};

export const V3VideoEngine = ({ script, audioFiles, avatarEngine }) => {
  const { fps } = useVideoConfig();

  if (!script?.scenes) {
    return (
      <div style={{ color: 'red', fontSize: '30px', padding: '50px' }}>
        No script data found
      </div>
    );
  }

  let cumulativeStart = 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Ol+Chiki:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
      `}</style>
      {script.scenes.map((scene, index) => {
        const audioData = audioFiles?.find((a) => a.sceneIndex === index);
        const durationSec = audioData?.durationSec || 10;
        const sceneDurationFrames = Math.round(durationSec * fps) + 60; // 2 seconds buffer

        const startFrame = cumulativeStart;
        cumulativeStart += sceneDurationFrames;

        const isIntroOrSummary = scene.type === 'intro' || (index === script.scenes.length - 1 && scene.type !== 'code');

        const renderInnerScene = () => {
          if (isIntroOrSummary) {
            return (
              <AvatarScene
                scene={{
                  ...scene,
                  audioDuration: durationSec,
                  subtitleWords: audioData?.subtitleWords ?? [],
                  avatarVideoPath: audioData?.avatarVideoPath,
                }}
                sceneIndex={index}
                sceneDurationFrames={sceneDurationFrames}
              />
            );
          }

          switch (scene.type) {
            case 'code':
              return (
                <>
                  <CodeScene
                    code={scene.code}
                    language={script.language}
                    audioDuration={durationSec}
                    subtitleWords={audioData?.subtitleWords}
                  />
                  <PipTeacherCam
                    audioDuration={durationSec}
                    subtitleWords={audioData?.subtitleWords}
                    avatarVideoPath={audioData?.avatarVideoPath}
                    position="bottom-right"
                  />
                </>
              );

            case 'visual':
              return (
                <>
                  <VisualScene
                    animation={scene.animation}
                    audioDuration={durationSec}
                    subtitleWords={audioData?.subtitleWords}
                  />
                  <PipTeacherCam
                    audioDuration={durationSec}
                    subtitleWords={audioData?.subtitleWords}
                    avatarVideoPath={audioData?.avatarVideoPath}
                    position="bottom-right"
                  />
                </>
              );

            case 'explainer':
              return (
                <>
                  <ExplainerScene
                    heading={scene.heading}
                    bullets={scene.bullets}
                    highlights={scene.highlights}
                    audioDuration={durationSec}
                    subtitleWords={audioData?.subtitleWords}
                  />
                  <PipTeacherCam
                    audioDuration={durationSec}
                    subtitleWords={audioData?.subtitleWords}
                    avatarVideoPath={audioData?.avatarVideoPath}
                    position="bottom-right"
                  />
                </>
              );

            case 'comparison':
              return (
                <>
                  <ComparisonScene
                    leftTitle={scene.leftTitle}
                    leftPoints={scene.leftPoints}
                    rightTitle={scene.rightTitle}
                    rightPoints={scene.rightPoints}
                    audioDuration={durationSec}
                    subtitleWords={audioData?.subtitleWords}
                  />
                  <PipTeacherCam
                    audioDuration={durationSec}
                    subtitleWords={audioData?.subtitleWords}
                    avatarVideoPath={audioData?.avatarVideoPath}
                    position="top-right"
                  />
                </>
              );

            case 'flowchart':
              return (
                <>
                  <FlowchartScene
                    steps={scene.steps}
                    colors={scene.colors}
                    audioDuration={durationSec}
                    subtitleWords={audioData?.subtitleWords}
                  />
                  <PipTeacherCam
                    audioDuration={durationSec}
                    subtitleWords={audioData?.subtitleWords}
                    avatarVideoPath={audioData?.avatarVideoPath}
                    position="bottom-right"
                  />
                </>
              );

            default:
              return (
                <>
                  <IntroScene text={scene.text || JSON.stringify(scene)} />
                  <PipTeacherCam
                    audioDuration={durationSec}
                    subtitleWords={audioData?.subtitleWords}
                    avatarVideoPath={audioData?.avatarVideoPath}
                    position="bottom-right"
                  />
                </>
              );
          }
        };

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={sceneDurationFrames}
            name={'Scene ' + index + ' [' + scene.type + ']'}
          >
            <SceneFade duration={18}>
              {renderInnerScene()}
              {audioData?.path && <Audio src={staticFile(audioData.path)} />}
            </SceneFade>
          </Sequence>
        );
      })}
    </>
  );
};

const mockProps = {
  script: {
    title: 'Python Mastery — Loops and Conditions',
    language: 'Python',
    scenes: [
      {
        type: 'intro',
        text: 'ᱡᱚᱦᱟᱨ! ᱛᱮᱦᱮᱧ ᱫᱚ ᱯᱟᱭᱛᱷᱚᱱ ᱞᱩᱯ ᱵᱚᱱ ᱪᱮᱫᱟ\nLearn iteration, clean logic, and algorithms with live visualizations.',
      },
      {
        type: 'explainer',
        heading: 'ᱯᱟᱭᱛᱷᱚᱱ ᱞᱩᱯ ᱵᱟᱵᱚᱛ (About Python Loops)',
        bullets: [
          'ᱞᱩᱯ ᱫᱚ ᱵᱟᱨ ᱵᱟᱨ ᱠᱟᱹᱢᱤ ᱞᱟᱹᱜᱤᱫ ᱵᱮᱵᱷᱟᱨᱚᱜ-ᱟ (Repeats tasks efficiently)',
          'ᱠᱚᱢ ᱚᱠᱛᱚ ᱨᱮ ᱰᱷᱮᱨ ᱠᱟᱹᱢᱤ ᱦᱩᱭᱩᱜ-ᱟ (Saves computational time)',
          'ᱯᱟᱭᱛᱷᱚᱱ ᱨᱮ For ᱟᱨ While ᱞᱩᱯ ᱢᱮᱱᱟᱜ-ᱟ (Supports For and While loops)',
          'ᱠᱳᱰ ᱟᱹᱰᱤ ᱪᱮᱦᱨᱟ ᱟᱨ ᱥᱚᱞᱦᱮ ᱧᱮᱞᱚᱜ-ᱟ (Produces clean, readable code)',
        ],
        highlights: ['ᱞᱩᱯ', 'For', 'While', 'ᱠᱳᱰ'],
      },
      {
        type: 'code',
        code: '# Loop over items with index\nfruits = ["Apple", "Banana", "Cherry"]\nfor idx, fruit in enumerate(fruits, start=1):\n    print(f"{idx}. {fruit}")',
      },
    ],
  },
  audioFiles: [],
  avatarEngine: 'Remotion-Avatar',
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="CodeSeekho-Avatar"
      component={V3VideoEngine}
      durationInFrames={300}
      fps={30}
      width={1280}
      height={720}
      defaultProps={mockProps}
      calculateMetadata={({ props }) => {
        if (!props.script?.scenes) return { durationInFrames: 300 };
        let total = 0;
        props.script.scenes.forEach((s, i) => {
          const dur =
            props.audioFiles?.find((a) => a.sceneIndex === i)?.durationSec || 10;
          total += Math.round(dur * 30) + 60;
        });
        return { durationInFrames: Math.max(total, 300) };
      }}
    />
  );
};

registerRoot(RemotionRoot);
export default RemotionRoot;
