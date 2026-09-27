import type {CSSProperties, ReactNode} from "react";
import {Easing, Img, interpolate, staticFile} from "remotion";
import {StickPerson} from "../StickPerson";
import type {StickPose} from "../StickPerson";

export const FONT = "'Noto Sans JP', 'IPAGothic', sans-serif";

export const C = {
  night: "#090D19",
  navy: "#11192C",
  indigo: "#27324A",
  green: "#14261F",
  paper: "#D7CCB5",
  gold: "#D2A451",
  red: "#9E3E47",
  teal: "#638A8A",
  white: "#F2F1EA",
  dim: "rgba(242,241,234,0.62)",
};

export type SceneProps = {
  f: number;
  dur: number;
  R: Record<string, number>;
};

// 0→1 around a spoken anchor. The midpoint of the reveal sits on the anchor frame.
export const rv = (f: number, at: number | undefined, len = 10): number => {
  if (at === undefined) return 1;
  return interpolate(f, [at - len / 2, at + len / 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.7, 0.3, 1),
  });
};

export const lerp = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

// deterministic pseudo random
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Svg: React.FC<{children: ReactNode; style?: CSSProperties}> = ({children, style}) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: "absolute", inset: 0, ...style}}>
    {children}
  </svg>
);

export const Person = StickPerson;
export type {StickPose};

/* ---------- Telop system: every in-scene text uses these three components ---------- */

type KeyTextProps = {
  id: string;
  text: string;
  x: number;
  y: number;
  size?: number;
  reveal?: number;
  align?: "left" | "center";
  glitch?: number;
  color?: string;
  bar?: boolean;
  width?: number;
};

// Large key phrase (キネティック文字). One font, one color family, one accent bar.
export const KeyText: React.FC<KeyTextProps> = ({
  id,
  text,
  x,
  y,
  size = 84,
  reveal = 1,
  align = "center",
  glitch = 0,
  color = C.white,
  bar = true,
  width = 1300,
}) => {
  const left = align === "center" ? x - width / 2 : x;
  const shift = glitch > 0 ? Math.sin(glitch * 37) * 10 * glitch : 0;
  const base: CSSProperties = {
    fontFamily: FONT,
    fontWeight: 900,
    fontSize: size,
    lineHeight: 1.2,
    letterSpacing: size * 0.04,
    whiteSpace: "pre-line",
  };
  return (
    <div
      data-layout-box={id}
      style={{
        position: "absolute",
        left,
        top: y,
        width,
        textAlign: align,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 26}px)`,
      }}
    >
      <div style={{position: "relative", display: "inline-block"}}>
        {glitch > 0 ? (
          <>
            <div style={{...base, position: "absolute", inset: 0, color: "#C8505E", transform: `translateX(${-shift}px)`, clipPath: `inset(${10 + (glitch * 40) % 50}% 0 ${30 - (glitch * 20) % 25}% 0)`, opacity: 0.85}}>{text}</div>
            <div style={{...base, position: "absolute", inset: 0, color: "#6FB7B7", transform: `translateX(${shift}px)`, clipPath: `inset(${55 - (glitch * 30) % 40}% 0 ${8 + (glitch * 50) % 30}% 0)`, opacity: 0.85}}>{text}</div>
          </>
        ) : null}
        <div style={{...base, position: "relative", color, textShadow: "0 6px 26px rgba(0,0,0,0.6)"}}>{text}</div>
        {bar ? (
          <div
            style={{
              height: 6,
              marginTop: 10,
              background: C.gold,
              width: `${reveal * 100}%`,
              marginLeft: align === "center" ? "auto" : 0,
              marginRight: align === "center" ? "auto" : 0,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

// Small in-scene label (説明ラベル).
export const Label: React.FC<{
  id: string;
  text: string;
  x: number;
  y: number;
  reveal?: number;
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  chip?: boolean;
}> = ({id, text, x, y, reveal = 1, size = 32, color = C.paper, align = "left", chip = false}) => (
  <div
    data-layout-box={id}
    style={{
      position: "absolute",
      left: align === "center" ? x : align === "right" ? undefined : x,
      right: align === "right" ? 1920 - x : undefined,
      top: y,
      transform: `${align === "center" ? "translateX(-50%) " : ""}translateY(${(1 - reveal) * 14}px)`,
      opacity: reveal,
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.3,
      letterSpacing: 2,
      color: chip ? C.night : color,
      background: chip ? color : "transparent",
      padding: chip ? "6px 18px" : 0,
      borderRadius: chip ? 6 : 0,
      whiteSpace: "nowrap",
      textShadow: chip ? "none" : "0 3px 14px rgba(0,0,0,0.7)",
    }}
  >
    {text}
  </div>
);

// Study / evidence card used for all three research citations.
export const StudyCard: React.FC<{
  id: string;
  f: number;
  R: Record<string, number>;
  org: string;
  name: string;
  year: string;
  place?: string;
  count?: number;
  countUnit?: string;
  topic: string;
}> = ({id, f, R, org, name, year, place, count, countUnit = "人", topic}) => {
  const slide = lerp(f, 0, 14, 60, 0);
  const nameR = rv(f, R.name);
  const yearR = rv(f, R.year);
  const countR = rv(f, R.count ?? R.place, 12);
  const shown = count !== undefined ? Math.round(count * lerp(f, (R.count ?? 0) - 5, (R.count ?? 0) + 18, 0, 1)) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 560,
        top: 120 + slide,
        width: 800,
        height: 640,
        background: "linear-gradient(180deg, #E1D7C2, #CFC3AA)",
        borderRadius: 6,
        boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
        transform: "rotate(-1.2deg)",
        padding: "56px 64px",
        boxSizing: "border-box",
        fontFamily: FONT,
        color: "#1B1F2A",
      }}
    >
      <div data-layout-box={`${id}-org`} style={{fontSize: 30, fontWeight: 700, letterSpacing: 4, color: "#6B5A3A"}}>
        {org}
      </div>
      <div style={{height: 3, background: "#1B1F2A", opacity: 0.8, margin: "22px 0 30px"}} />
      <div data-layout-box={`${id}-name`} style={{fontSize: 64, fontWeight: 900, opacity: nameR, transform: `translateX(${(1 - nameR) * -20}px)`}}>
        {name}
      </div>
      <div data-layout-box={`${id}-topic`} style={{fontSize: 30, fontWeight: 700, marginTop: 18, color: "#3A3F4E"}}>
        {topic}
      </div>
      <div style={{display: "flex", gap: 28, marginTop: 44, alignItems: "baseline"}}>
        <div data-layout-box={`${id}-year`} style={{fontSize: 30, fontWeight: 900, background: "#1B1F2A", color: C.paper, padding: "8px 22px", borderRadius: 4, opacity: yearR}}>
          {year}
        </div>
        {place ? (
          <div data-layout-box={`${id}-place`} style={{fontSize: 40, fontWeight: 900, opacity: countR}}>
            {place}
          </div>
        ) : null}
        {count !== undefined ? (
          <div data-layout-box={`${id}-count`} style={{display: "inline-flex", alignItems: "baseline", gap: 10, opacity: countR}}>
            <span style={{fontSize: 120, fontWeight: 900, fontVariantNumeric: "tabular-nums", lineHeight: 1}}>{shown}</span>
            <span style={{fontSize: 44, fontWeight: 900, color: "#8A6A2E"}}>{countUnit}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ---------- Backgrounds ---------- */

// "Shader" style: slow drifting light pools, kept dark per palette.
export const Aurora: React.FC<{f: number; tint?: string; tint2?: string; strength?: number}> = ({
  f,
  tint = "rgba(99,138,138,0.35)",
  tint2 = "rgba(210,164,81,0.22)",
  strength = 1,
}) => {
  const t = f / 30;
  const x1 = 30 + Math.sin(t * 0.35) * 14;
  const y1 = 35 + Math.cos(t * 0.27) * 10;
  const x2 = 70 + Math.cos(t * 0.3) * 12;
  const y2 = 62 + Math.sin(t * 0.22) * 12;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 60% 55% at ${x1}% ${y1}%, ${tint}, transparent 70%), radial-gradient(ellipse 50% 50% at ${x2}% ${y2}%, ${tint2}, transparent 70%), radial-gradient(ellipse 80% 70% at 50% 110%, rgba(39,50,74,0.7), transparent 70%), ${C.night}`,
        opacity: strength,
      }}
    />
  );
};

// Generative flow lines (p5-style field), deterministic.
export const FlowField: React.FC<{f: number; color?: string; count?: number; opacity?: number; seed?: number}> = ({
  f,
  color = C.teal,
  count = 90,
  opacity = 0.5,
  seed = 1,
}) => {
  const t = f / 30;
  const lines = Array.from({length: count}, (_, i) => {
    let x = rnd(i + seed * 100) * 2000 - 40;
    let y = rnd(i * 3 + seed * 7) * 1100 - 10;
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    for (let k = 0; k < 14; k += 1) {
      const a = Math.sin(x * 0.004 + t * 0.25) * 1.6 + Math.cos(y * 0.005 - t * 0.18) * 1.6 + Math.sin((x + y) * 0.002) * 1.2;
      x += Math.cos(a) * 16;
      y += Math.sin(a) * 16;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return <path key={i} d={d} fill="none" stroke={i % 7 === 0 ? C.gold : color} strokeWidth={i % 5 === 0 ? 2.4 : 1.4} opacity={opacity * (0.4 + rnd(i) * 0.6)} strokeLinecap="round" />;
  });
  return <g>{lines}</g>;
};

// Top-down crowd of dots flowing through a concourse (particle style).
export const CrowdDots: React.FC<{f: number; n?: number; speed?: number; avoid?: {x: number; y: number; r: number}}> = ({
  f,
  n = 170,
  speed = 1,
  avoid,
}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const lane = rnd(i * 5 + 1) * 1080;
      const dir = i % 2 === 0 ? 1 : -1;
      const v = (1.4 + rnd(i * 9) * 1.8) * speed;
      let x = ((rnd(i * 13) * 2200 + dir * f * v) % 2200 + 2200) % 2200 - 140;
      let y = lane + Math.sin(f / 30 + i) * 6;
      if (avoid) {
        const dx = x - avoid.x;
        const dy = y - avoid.y;
        const d = Math.hypot(dx, dy);
        if (d < avoid.r && d > 0.1) {
          x = avoid.x + (dx / d) * avoid.r;
          y = avoid.y + (dy / d) * avoid.r;
        }
      }
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={11} fill="#27324A" />
          <circle cx={x} cy={y} r={6.5} fill={i % 11 === 0 ? C.paper : "#8894AE"} opacity={0.85} />
        </g>
      );
    })}
  </g>
);

// Network lines between nodes (particle network style).
export const NetworkLines: React.FC<{f: number; nodes: {x: number; y: number}[]; hub?: {x: number; y: number}; cut?: number; color?: string}> = ({
  f,
  nodes,
  hub,
  cut = 0,
  color = C.teal,
}) => (
  <g>
    {nodes.map((a, i) =>
      nodes.slice(i + 1).map((b, j) => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > 330) return null;
        return <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={1.4} opacity={(1 - d / 330) * 0.5} />;
      }),
    )}
    {hub
      ? nodes.map((a, i) => {
          const gone = cut > 0 && rnd(i * 17) < cut;
          if (gone) return null;
          const wob = Math.sin(f / 9 + i) * 6;
          return <line key={`h${i}`} x1={a.x} y1={a.y} x2={hub.x + wob} y2={hub.y - 60} stroke={C.gold} strokeWidth={2} opacity={0.55} />;
        })
      : null}
    {nodes.map((a, i) => (
      <g key={`n${i}`}>
        <circle cx={a.x} cy={a.y} r={9} fill={C.night} stroke={color} strokeWidth={3} />
        <circle cx={a.x} cy={a.y} r={3} fill={C.white} opacity={0.5 + 0.5 * Math.sin(f / 12 + i)} />
      </g>
    ))}
  </g>
);

/* ---------- The station pod ---------- */

// Native SVG pod modelled on the supplied photo: black frame, glass door, green vacancy lamp.
export const PodSVG: React.FC<{
  x: number;
  y: number;
  s?: number;
  lit?: number;
  door?: number;
  occupant?: StickPose | null;
  glass?: number;
}> = ({x, y, s = 1, lit = 0.35, door = 0, occupant = "sit", glass = 0.55}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={20} cy={4} rx={230} ry={26} fill="#000" opacity={0.45} />
    {/* side face */}
    <path d="M150 -620 L230 -660 L230 -30 L150 0 Z" fill="#0C0F16" stroke="#1D2230" strokeWidth={4} />
    {/* top */}
    <path d="M-150 -620 L150 -620 L230 -660 L-70 -660 Z" fill="#1A1E28" />
    {/* front frame */}
    <rect x={-150} y={-620} width={300} height={620} fill="#12151D" stroke="#262B38" strokeWidth={6} />
    {/* interior light */}
    <rect x={-92} y={-570} width={226} height={540} fill={`rgba(210,164,81,${lit * 0.55})`} />
    <rect x={-92} y={-570} width={226} height={540} fill="url(#podGlass)" opacity={glass} />
    {occupant ? (
      <g clipPath="url(#podClip)">
        <rect x={-40} y={-230} width={150} height={16} fill="#3A2B22" />
        <rect x={-10} y={-300} width={80} height={60} rx={6} fill="#0A0F1B" stroke="#40526A" strokeWidth={5} />
        <Person x={-20} y={-150} scale={0.62} pose={occupant} color={C.paper} />
      </g>
    ) : null}
    {/* frosted band and number */}
    <rect x={-92} y={-300} width={226} height={170} fill="rgba(215,220,225,0.10)" />
    {/* door leaf (swings open by narrowing) */}
    <rect x={-92} y={-570} width={226 * (1 - door * 0.82)} height={540} fill="none" stroke="#2F3545" strokeWidth={8} />
    <rect x={-80} y={-330} width={8} height={70} rx={3} fill="#9AA1AE" />
    {/* green vacancy lamp */}
    <rect x={-138} y={-600} width={40} height={24} rx={3} fill="#1FB36B" opacity={0.95} />
    <rect x={-138} y={-600} width={40} height={24} rx={3} fill="#1FB36B" opacity={0.35} filter="url(#glow)" />
    {/* ceiling lights */}
    <rect x={-70} y={-560} width={40} height={6} fill="#FFFFFF" opacity={0.8} />
    <rect x={90} y={-560} width={32} height={6} fill="#FFFFFF" opacity={0.8} />
  </g>
);

export const PodDefs: React.FC = () => (
  <defs>
    <linearGradient id="podGlass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#8FA6B8" stopOpacity={0.35} />
      <stop offset="0.5" stopColor="#1B2230" stopOpacity={0.15} />
      <stop offset="1" stopColor="#8FA6B8" stopOpacity={0.25} />
    </linearGradient>
    <clipPath id="podClip">
      <rect x={-92} y={-570} width={226} height={540} />
    </clipPath>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" />
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
  </defs>
);

// The supplied photograph of the booth (brand marks masked).
export const PodPhoto: React.FC<{
  x: number;
  y: number;
  h: number;
  grade?: number;
  warm?: number;
  style?: CSSProperties;
}> = ({x, y, h, grade = 0.35, warm = 0, style}) => {
  const w = (h * 704) / 1296;
  return (
    <div style={{position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, ...style}}>
      <div style={{position: "absolute", left: -w * 0.3, right: -w * 0.3, bottom: -h * 0.03, height: h * 0.08, background: "radial-gradient(ellipse, rgba(0,0,0,0.6), transparent 70%)"}} />
      <Img src={staticFile("station-pod.png")} style={{width: w, height: h, display: "block", filter: `brightness(${1 - grade}) contrast(1.08) saturate(0.85)`}} />
      {warm > 0 ? (
        <div style={{position: "absolute", left: w * 0.24, top: h * 0.1, width: w * 0.66, height: h * 0.82, background: `rgba(210,164,81,${0.32 * warm})`, mixBlendMode: "screen"}} />
      ) : null}
    </div>
  );
};

/* ---------- Station architecture ---------- */

export const StationSign: React.FC<{id: string; x: number; y: number; text: string; w?: number; color?: string; showText?: boolean}> = ({
  id,
  x,
  y,
  text,
  w = 300,
  color = "#E6C36A",
  showText = true,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={0} width={w} height={64} rx={6} fill="#141A26" stroke="#2C3446" strokeWidth={4} />
    <rect x={10} y={10} width={44} height={44} rx={4} fill={color} />
    {showText ? (
      <text data-layout-box={id} x={70} y={44} fill={C.white} fontFamily={FONT} fontWeight={700} fontSize={30}>
        {text}
      </text>
    ) : (
      <rect x={70} y={22} width={w - 100} height={20} rx={4} fill={C.white} opacity={0.5} />
    )}
  </g>
);

// Side-on concourse with pillars, ceiling lights and signs. `pan` scrolls layers at different speeds.
export const Concourse: React.FC<{f: number; pan?: number; idPrefix: string; people?: boolean; sepia?: boolean; signText?: boolean}> = ({
  f,
  pan = 1,
  idPrefix,
  people = true,
  sepia = false,
  signText = true,
}) => {
  const far = (f * 0.4 * pan) % 480;
  const mid = (f * 1.1 * pan) % 520;
  const near = (f * 2.6 * pan) % 760;
  const wall = sepia ? "#2A2119" : "#141B2B";
  return (
    <g>
      <rect width={1920} height={1080} fill={sepia ? "#1C160F" : C.night} />
      <rect y={120} width={1920} height={560} fill={wall} />
      {/* ceiling */}
      <rect width={1920} height={130} fill={sepia ? "#15100B" : "#0A0F1B"} />
      {Array.from({length: 6}, (_, i) => (
        <rect key={i} x={i * 480 - far} y={96} width={260} height={14} rx={4} fill="#EDE6D2" opacity={0.75} />
      ))}
      {/* wall tiles */}
      {Array.from({length: 12}, (_, i) => (
        <line key={i} x1={0} x2={1920} y1={170 + i * 42} y2={170 + i * 42} stroke="#FFFFFF" opacity={0.025} />
      ))}
      {/* signs on far wall */}
      <g transform={`translate(${-far * 0.5} 0)`}>
        <StationSign id={`${idPrefix}-sign1`} x={240} y={200} text="中央改札" showText={signText} />
        <StationSign id={`${idPrefix}-sign2`} x={880} y={200} text="1・2番線" color="#6FA7D8" showText={signText} />
        <StationSign id={`${idPrefix}-sign3`} x={1480} y={200} text="出口 東口" color="#E0E0E0" w={320} showText={signText} />
      </g>
      {/* pillars */}
      {Array.from({length: 5}, (_, i) => (
        <g key={i}>
          <rect x={i * 520 - mid - 60} y={120} width={110} height={580} fill={sepia ? "#3A2E22" : "#1E2638"} />
          <rect x={i * 520 - mid - 60} y={120} width={16} height={580} fill="#FFFFFF" opacity={0.05} />
        </g>
      ))}
      {/* floor */}
      <rect y={680} width={1920} height={400} fill={sepia ? "#231A12" : "#0D121E"} />
      {Array.from({length: 9}, (_, i) => (
        <line key={i} x1={960 + (i - 4) * 90} y1={680} x2={960 + (i - 4) * 560} y2={1080} stroke="#FFFFFF" opacity={0.04} strokeWidth={2} />
      ))}
      <rect y={680} width={1920} height={6} fill="#FFFFFF" opacity={0.06} />
      {/* tactile paving */}
      <rect y={760} width={1920} height={22} fill={C.gold} opacity={0.18} />
      {people
        ? Array.from({length: 7}, (_, i) => {
            const dir = i % 2 === 0 ? 1 : -1;
            const x = (((i * 310 + dir * f * (3.2 + (i % 3))) % 2300) + 2300) % 2300 - 190;
            return <Person key={i} x={x} y={690 + (i % 3) * 22} scale={0.72 + (i % 3) * 0.08} pose="walk" phase={f / 5 + i} flip={dir < 0} color={i % 3 === 0 ? "#7A879F" : "#56627A"} />;
          })
        : null}
      {/* near foreground silhouettes for depth */}
      {people
        ? Array.from({length: 3}, (_, i) => (
            <Person key={`fg${i}`} x={i * 760 - near + 120} y={1180} scale={1.9} pose="walk" phase={f / 4 + i * 2} color="#070A12" />
          ))
        : null}
    </g>
  );
};

export const Skyline: React.FC<{f: number; idPrefix: string; rain?: boolean; drift?: number}> = ({f, idPrefix, rain = false, drift = 0.6}) => {
  const layers = [
    {n: 14, base: 560, h: 260, color: "#141A2B", sp: 0.2},
    {n: 11, base: 640, h: 300, color: "#10151F", sp: 0.5},
    {n: 8, base: 760, h: 360, color: "#0A0E16", sp: 1.0},
  ];
  const signs = ["駅前通り", "オフィス", "薬局", "駐輪場", "カフェ"];
  return (
    <g>
      <rect width={1920} height={1080} fill="#0B1020" />
      <ellipse cx={1380} cy={300} rx={420} ry={220} fill={C.gold} opacity={0.05} />
      {layers.map((L, li) => {
        const off = (f * L.sp * drift) % 260;
        return (
          <g key={li}>
            {Array.from({length: L.n + 2}, (_, i) => {
              const w = 1920 / L.n;
              const bh = L.h * (0.55 + rnd(i * 7 + li * 31) * 0.45);
              const bx = i * w - off;
              return (
                <g key={i}>
                  <rect x={bx} y={L.base - bh} width={w - 8} height={bh + 400} fill={L.color} />
                  {li < 2
                    ? Array.from({length: 10}, (_, k) => (
                        <rect key={k} x={bx + 12 + (k % 3) * (w / 3.4)} y={L.base - bh + 20 + Math.floor(k / 3) * 38} width={12} height={16} fill={C.gold} opacity={rnd(i * 11 + k + li * 5) > 0.62 ? 0.4 : 0.05} />
                      ))
                    : null}
                </g>
              );
            })}
          </g>
        );
      })}
      {signs.slice(0, 3).map((s, i) => (
        <g key={s} transform={`translate(${260 + i * 560 - ((f * 1.0 * drift) % 260)} 470)`}>
          <rect width={170} height={54} rx={4} fill="#1A2233" stroke="#3A4458" strokeWidth={3} />
          <text data-layout-box={`${idPrefix}-sky-${i}`} x={85} y={37} textAnchor="middle" fill={C.paper} fontFamily={FONT} fontWeight={700} fontSize={26}>
            {s}
          </text>
        </g>
      ))}
      <rect y={900} width={1920} height={180} fill="#06080E" />
      {rain
        ? Array.from({length: 160}, (_, i) => {
            const x = ((rnd(i) * 2100 - f * 3) % 2100 + 2100) % 2100 - 90;
            const y = ((rnd(i * 3) * 1100 + f * 26) % 1100) - 40;
            return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 30} stroke="#9FB6D6" strokeWidth={1.5} opacity={0.35} />;
          })
        : null}
    </g>
  );
};

export const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "radial-gradient(circle at 50% 46%, transparent 38%, rgba(4,7,14,0.35) 78%, rgba(4,7,14,0.75) 100%)",
      pointerEvents: "none",
    }}
  />
);
