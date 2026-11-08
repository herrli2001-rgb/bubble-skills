import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { SceneRenderer } from "./intro/SceneRenderer";
import { materialTransition } from "./intro/MaterialTransition";
import { ease } from "./intro/actors";
import { project, sceneFrames, totalFrames } from "./project";

export function Film() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#172c33" }}>
      <TransitionSeries>
        {project.scenes.flatMap((scene, i) => {
          const sequence = (
            <TransitionSeries.Sequence key={`scene-${i}`} durationInFrames={sceneFrames(scene)}>
              <SceneRenderer id={scene.id} playbackRate={scene.playbackRate} />
            </TransitionSeries.Sequence>
          );
          return i === project.scenes.length - 1 ? [sequence] : [
            sequence,
            <TransitionSeries.Transition key={`transition-${i}`}
              presentation={materialTransition(scene.transitionAfter)}
              timing={linearTiming({durationInFrames: scene.transitionFrames})} />,
          ];
        })}
      </TransitionSeries>
      <AbsoluteFill style={{background: "#172c33", opacity: ease((frame-totalFrames+12)/11), pointerEvents: "none"}} />
      {project.musicFile && <Audio src={staticFile(project.musicFile)} volume={project.musicVolume} />}
      {project.foleyFile && <Audio src={staticFile(project.foleyFile)} />}
    </AbsoluteFill>
  );
}
