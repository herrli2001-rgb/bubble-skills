import { SceneRenderer } from "./SceneRenderer";
export const OfficeScene = ({
  playbackRate = 1.5,
}: {
  playbackRate?: number;
}) => <SceneRenderer id="office" playbackRate={playbackRate} />;
