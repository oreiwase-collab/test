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
  | "station";

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
  styles?: Record<string, number | null>;
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
  audioParts?: {file: string; fromFrame: number}[];
  durationSeconds: number;
  timingSource: string;
  scenes: Scene[];
  captions: Caption[];
};
