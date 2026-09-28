// 2D のテロップ・字幕・パネル。前回の動画と同じ書体と見た目にそろえる
import type {CSSProperties, ReactNode} from "react";
import {Easing, interpolate, useCurrentFrame} from "remotion";

export const FONT = "'Noto Sans JP', 'IPAGothic', sans-serif";
export const C = {
  night: "#090D19",
  gold: "#D2A451",
  red: "#9E3E47",
  teal: "#638A8A",
  white: "#F2F1EA",
  dim: "rgba(242,241,234,0.62)",
};

export const reveal = (frame: number, at: number, length = 10) =>
  interpolate(frame, [at - length / 2, at + length / 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.7, 0.3, 1),
  });

export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** 画面内テロップ（全シーン共通の書体・色・縁取り・金の下線） */
export const KeyText: React.FC<{text: string; x: number; y: number; frame: number; at: number; size?: number; glitch?: boolean}> = ({
  text,
  x,
  y,
  frame,
  at,
  size = 84,
  glitch = false,
}) => {
  const r = reveal(frame, at, 10);
  const since = frame - at;
  const jitter = glitch && since > -4 && since < 16 ? Math.max(0, 1 - Math.max(0, since) / 16) : 0;
  const dx = jitter * Math.sin(frame * 2.7) * 14;
  const dy = jitter * Math.cos(frame * 3.3) * 4;
  const common: CSSProperties = {fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.18, letterSpacing: size * 0.02, whiteSpace: "pre"};
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, ${(1 - r) * 22}px) scale(${0.95 + r * 0.05})`,
        opacity: r,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{position: "relative"}}>
        {jitter > 0 ? (
          <>
            <div style={{...common, position: "absolute", inset: 0, color: "rgba(99,210,220,0.8)", transform: `translate(${-dx}px, ${dy}px)`, clipPath: `inset(${10 + jitter * 30}% 0 ${30 - jitter * 10}% 0)`}}>{text}</div>
            <div style={{...common, position: "absolute", inset: 0, color: "rgba(214,72,96,0.85)", transform: `translate(${dx}px, ${-dy}px)`, clipPath: `inset(${50 - jitter * 20}% 0 ${8 + jitter * 12}% 0)`}}>{text}</div>
          </>
        ) : null}
        <div style={{...common, position: "relative", color: C.white, WebkitTextStroke: `${Math.max(4, size * 0.07)}px rgba(4,6,12,0.9)`, paintOrder: "stroke fill", textShadow: "0 8px 30px rgba(0,0,0,0.6)"}}>{text}</div>
      </div>
      <div style={{width: Math.min(220, size * 2.4) * r, height: 6, borderRadius: 3, background: C.gold}} />
    </div>
  );
};

export const Panel: React.FC<{style?: CSSProperties; children: ReactNode}> = ({style, children}) => (
  <div
    style={{
      position: "absolute",
      background: "linear-gradient(180deg, rgba(23,31,52,0.94), rgba(14,20,36,0.94))",
      border: "2px solid #2E3A56",
      borderRadius: 18,
      boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
      fontFamily: FONT,
      color: C.white,
      ...style,
    }}
  >
    {children}
  </div>
);

export const GlitchBands: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const k = f - at;
  if (k < -2 || k > 9) return null;
  const s = 1 - Math.max(0, k) / 9;
  return (
    <div style={{position: "absolute", inset: 0, pointerEvents: "none"}}>
      {Array.from({length: 7}, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (rand(i + f) - 0.5) * 120 * s,
            top: rand(i * 3 + f) * 1000,
            width: 1920,
            height: 6 + rand(i + 9 + f) * 30,
            background: i % 2 ? "rgba(99,210,220,0.16)" : "rgba(214,72,96,0.16)",
          }}
        />
      ))}
    </div>
  );
};

/** 字幕（前回の動画と同じ位置・書体・縁取り） */
export const Subtitles: React.FC<{captions: {start: number; end: number; text: string}[]}> = ({captions}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const cue = captions.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  return (
    <div style={{position: "absolute", left: 130, right: 130, bottom: 62, display: "flex", justifyContent: "center"}}>
      <div
        style={{
          whiteSpace: "pre-line",
          textAlign: "center",
          color: C.white,
          fontFamily: FONT,
          fontSize: 43,
          lineHeight: 1.45,
          fontWeight: 800,
          letterSpacing: 0.6,
          WebkitTextStroke: "3px rgba(3,5,10,0.92)",
          paintOrder: "stroke fill",
          textShadow: "0 5px 16px rgba(0,0,0,0.92)",
        }}
      >
        {cue.text.replace(/[、。]/g, "")}
      </div>
    </div>
  );
};
