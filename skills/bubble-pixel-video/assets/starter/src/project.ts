import raw from "./project.json";
import type { SceneId } from "./intro/actors";
import { sceneData } from "./intro/script";

export type SceneSpec = {
  id: SceneId;
  playbackRate: number;
  transitionAfter: "door" | "paper" | "screen" | "carton";
  transitionFrames: number;
};
export const project = raw as {
  theme: string;
  landscapeTitleLines: string[];
  portraitTitleLines: string[];
  musicFile: string | null;
  foleyFile: string | null;
  musicVolume: number;
  scenes: SceneSpec[];
};
export const sceneFrames = (scene: SceneSpec) =>
  Math.round(sceneData[scene.id].duration / scene.playbackRate);
export const totalFrames = project.scenes.reduce(
  (sum, scene, index) =>
    sum + sceneFrames(scene) -
    (index < project.scenes.length - 1 ? scene.transitionFrames : 0),
  0,
);
