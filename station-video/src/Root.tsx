import {Composition} from "remotion";
import {NarratedIllustratedVideo} from "./Composition";
import timelineData from "./data/timeline.json";
import type {Timeline} from "./types";

const timeline = timelineData as unknown as Timeline;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="NarratedIllustratedVideo"
      component={NarratedIllustratedVideo}
      durationInFrames={Math.max(1, Math.ceil(timeline.durationSeconds * timeline.fps))}
      fps={timeline.fps}
      width={timeline.width}
      height={timeline.height}
    />
  );
};
