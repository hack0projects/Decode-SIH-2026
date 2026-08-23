import { Composition, Sequence, useVideoConfig, interpolate, Audio } from 'remotion';
import IntroScene from './scenes/IntroScene';
import CodeScene from './scenes/CodeScene';
import VisualScene from './scenes/VisualScene';
import AvatarScene from './scenes/AvatarScene';
import { ExplainerScene } from './scenes/ExplainerScene';
import { ComparisonScene } from './scenes/ComparisonScene';
import { FlowchartScene } from './scenes/FlowchartScene';

const SceneFade = ({ children, duration = 18 }) => {
  const { frame, fps, durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, duration, durationInFrames - duration, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ flex: 1, opacity }}>{children}</div>;
};

export const V3VideoEngine = ({ script, audioFiles, avatarEngine }) => {
  const { fps } = useVideoConfig();

  if (!script?.scenes) return <div style={{ color: 'red', fontSize: '30px', padding: '50px' }}>No script data found</div>;

  let cumulativeStart = 0;

  return (
    <>
      {script.scenes.map((scene, index) => {
        const audioData = audioFiles?.find((a) => a.sceneIndex === index);
        const durationSec = audioData?.durationSec || 10;
        const sceneDurationFrames = Math.round(durationSec * fps) + 60; // 2 seconds buffer

        const startFrame = cumulativeStart;
        cumulativeStart += sceneDurationFrames;

        const renderInnerScene = () => {
          switch (scene.type) {
            case 'intro': return <IntroScene text={scene.text} />;
            case 'code': return <CodeScene code={scene.code} language={script.language} />;
            case 'visual': return <VisualScene animation={scene.animation} />;
            case 'explainer': return <ExplainerScene heading={scene.heading} bullets={scene.bullets} highlights={scene.highlights} audioDuration={durationSec} subtitleWords={audioData?.subtitleWords} />;
            case 'comparison': return <ComparisonScene leftTitle={scene.leftTitle} leftPoints={scene.leftPoints} rightTitle={scene.rightTitle} rightPoints={scene.rightPoints} audioDuration={durationSec} subtitleWords={audioData?.subtitleWords} />;
            case 'flowchart': return <FlowchartScene steps={scene.steps} colors={scene.colors} audioDuration={durationSec} subtitleWords={audioData?.subtitleWords} />;
            default: return <IntroScene text={scene.text || JSON.stringify(scene)} />;
          }
        };

        return (
          <Sequence key={index} from={startFrame} durationInFrames={sceneDurationFrames} name={'Scene ' + index}>
            <SceneFade duration={20}>
              {/* Only full-screen avatar on intro. For other scenes, we skip avatar or could add it in corner */}
              {scene.type === 'intro' ? (
                <AvatarScene text={scene.text} audioDuration={durationSec} subtitleWords={audioData?.subtitleWords} audioFrames={Math.round(durationSec * fps)} />
              ) : (
                renderInnerScene()
              )}
              {audioData?.path && <Audio src={audioData.path} />}
            </SceneFade>
          </Sequence>
        );
      })}
    </>
  );
};

const mockProps = {
  script: {
    title: 'Test',
    language: 'Python',
    scenes: [ { type: 'intro', text: 'Hello' } ]
  },
  audioFiles: [],
  avatarEngine: 'Remotion-Avatar'
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
          const dur = props.audioFiles?.find(a => a.sceneIndex === i)?.durationSec || 10;
          total += Math.round(dur * 30) + 60;
        });
        return { durationInFrames: Math.max(total, 300) };
      }}
    />
  );
};
import { registerRoot } from 'remotion';
registerRoot(RemotionRoot);
