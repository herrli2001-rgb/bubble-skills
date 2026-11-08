import { Composition, Folder, Still } from "remotion";
import { Film } from "./Film";
import { Cover } from "./intro/Cover";
import { PortraitCover } from "./intro/PortraitCover";
import { SceneRenderer } from "./intro/SceneRenderer";
import { project, sceneFrames, totalFrames } from "./project";

export const RemotionRoot = () => <>
  <Composition id="PixelFilm" component={Film} durationInFrames={totalFrames} fps={30} width={1920} height={1080} />
  <Still id="PixelCoverLandscape" component={Cover} width={1920} height={1080} defaultProps={{animated:false}} />
  <Still id="PixelCoverPortrait" component={PortraitCover} width={1080} height={1920} />
  <Folder name="Scenes">
    {project.scenes.map((scene, i) => <Composition key={i} id={`Scene-${i+1}-${scene.id}`}
      component={SceneRenderer} durationInFrames={sceneFrames(scene)} fps={30} width={1920} height={1080}
      defaultProps={{id:scene.id, playbackRate:scene.playbackRate}} />)}
  </Folder>
</>;
