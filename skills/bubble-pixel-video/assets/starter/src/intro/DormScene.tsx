import { SceneRenderer } from "./SceneRenderer";
export const DormScene = ({
  playbackRate = 1.5,
}: {
  playbackRate?: number;
}) => <SceneRenderer id="dorm" playbackRate={playbackRate} />;
