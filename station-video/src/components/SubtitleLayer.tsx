import {useCurrentFrame, useVideoConfig} from "remotion";
import type {Timeline} from "../types";

const cleanSubtitle = (text: string) => text.replace(/[、。]/gu, "").trim();

const wrapJapanese = (text: string, max = 22): string => {
  const given = text
    .trim()
    .split(/\n+/)
    .map(cleanSubtitle)
    .filter(Boolean);
  if (given.length > 1) return given.slice(0, 2).join("\n");

  const compact = cleanSubtitle(given[0] || text).replace(/\s+/gu, "");
  if (compact.length <= 11) return compact;

  const target = Math.ceil(compact.length / 2);
  const minimum = Math.max(6, compact.length - max);
  const maximum = Math.min(max, compact.length - 6);
  const candidates: number[] = [];
  for (const particle of ["ため", "ので", "から", "こと", "もの", "まで", "より", "が", "を", "に", "で", "と", "は", "も", "て", "へ"]) {
    let index = compact.indexOf(particle);
    while (index >= 0) {
      const cut = index + particle.length;
      if (cut >= minimum && cut <= maximum && compact.length - cut <= max) candidates.push(cut);
      index = compact.indexOf(particle, index + 1);
    }
  }
  const cut = candidates.length > 0
    ? candidates.sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0]
    : Math.min(max, Math.max(minimum, target));
  return `${compact.slice(0, cut)}\n${compact.slice(cut)}`;
};

export const SubtitleLayer: React.FC<{timeline: Timeline}> = ({timeline}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const activeScene = timeline.scenes.find(
    (scene) => time >= scene.start && time < scene.start + scene.duration,
  );
  if (activeScene?.type === "chapter") return null;

  const cue = timeline.captions.find((caption) => time >= caption.start && time < caption.end);
  if (!cue) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 130,
        right: 130,
        bottom: 62,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        data-layout-box={`subtitle-${Math.round(cue.start * 1000)}`}
        style={{
          maxWidth: 1500,
          whiteSpace: "pre-line",
          textAlign: "center",
          color: "#F2F1EA",
          fontFamily: "'Noto Sans JP', 'IPAGothic', sans-serif",
          fontSize: 43,
          lineHeight: 1.45,
          fontWeight: 900,
          letterSpacing: 0.6,
          WebkitTextStroke: "3px rgba(3,5,10,0.92)",
          paintOrder: "stroke fill",
          textShadow: "0 5px 16px rgba(0,0,0,0.92)",
        }}
      >
        {wrapJapanese(cue.text)}
      </div>
    </div>
  );
};
