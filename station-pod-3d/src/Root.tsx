import {Composition} from "remotion";
import {Opening} from "./Opening";
import data from "./opening.json";

export const RemotionRoot: React.FC = () => (
  <Composition id="Opening3D" component={Opening} durationInFrames={data.durationInFrames} fps={30} width={1920} height={1080} />
);
