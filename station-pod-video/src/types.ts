export type SceneType = "chapter" | "illustration" | "data" | "quote" | "document";
export type MotionPreset = "slow-push" | "drift-left" | "drift-right" | "reveal" | "static";
export type NativeMotif =
  | "desk"
  | "city"
  | "stage"
  | "chart"
  | "document"
  | "clock"
  | "office"
  | "classroom"
  | "library"
  | "machine"
  | "balance"
  | "network"
  | "story";

export type SceneVisual = {
  kind: "remotion";
  motif: NativeMotif;
  variant?: number;
};

export type Scene = {
  id: string;
  start: number;
  duration: number;
  type: SceneType;
  headline: string;
  body: string;
  motion: MotionPreset;
  accent: string;
  visualNotes: string;
  visual: SceneVisual;
  /** 場面内の強調表示。キー → 動画全体での絶対フレーム（inputs/sync-anchors.json と一致） */
  reveals?: Record<string, number>;
};

export type Caption = {
  start: number;
  end: number;
  text: string;
};

export type Timeline = {
  version: number;
  projectTitle: string;
  fps: number;
  width: number;
  height: number;
  audioFile: string;
  durationSeconds: number;
  timingSource: string;
  scenes: Scene[];
  captions: Caption[];
};
