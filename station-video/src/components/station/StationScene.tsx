import {AbsoluteFill} from "remotion";
import type {Scene} from "../../types";
import {Vignette} from "./kit";
import type {SceneProps} from "./kit";
import * as A from "./scenesA";
import * as B from "./scenesB";
import * as Cc from "./scenesC";

const TABLE: Record<number, React.FC<SceneProps>> = {
  1: A.S01, 2: A.S02, 3: A.S03, 4: A.S04, 5: A.S05, 6: A.S06, 7: A.S07, 8: A.S08, 9: A.S09, 10: A.S10, 11: A.S11, 12: A.S12,
  13: B.S13, 14: B.S14, 15: B.S15, 16: B.S16, 17: B.S17, 18: B.S18, 19: B.S19, 20: B.S20, 21: B.S21, 22: B.S22, 23: B.S23, 24: B.S24,
  25: Cc.S25, 26: Cc.S26, 27: Cc.S27, 28: Cc.S28, 29: Cc.S29, 30: Cc.S30, 31: Cc.S31, 32: Cc.S32, 33: Cc.S33, 34: Cc.S34, 35: Cc.S35,
};

export const StationScene: React.FC<{scene: Scene; frame: number; fps: number}> = ({scene, frame, fps}) => {
  const Comp = TABLE[scene.visual.variant || 1];
  const startFrame = Math.round(scene.start * fps);
  const dur = Math.max(1, Math.round(scene.duration * fps));
  const R: Record<string, number> = {};
  for (const [k, v] of Object.entries(scene.reveals || {})) R[k] = v - startFrame;
  return (
    <AbsoluteFill style={{backgroundColor: "#090D19", overflow: "hidden"}}>
      <Comp f={frame} dur={dur} R={R} />
      <Vignette />
    </AbsoluteFill>
  );
};
