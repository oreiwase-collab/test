import type {CSSProperties, ReactNode} from "react";
import {AbsoluteFill, Easing, Img, interpolate, staticFile} from "remotion";

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

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

/** 0→1 の局所的な出現。中点（0.5）が発話の瞬間 at に重なる */
export const reveal = (frame: number, at: number, length = 10) =>
  interpolate(frame, [at - length / 2, at + length / 2], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.7, 0.3, 1),
  });

export const lerp = (frame: number, range: [number, number], out: [number, number]) =>
  interpolate(frame, range, out, {...clamp, easing: Easing.inOut(Easing.cubic)});

/** 決定的な疑似乱数 */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Svg: React.FC<{children: ReactNode; style?: CSSProperties}> = ({children, style}) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: "absolute", inset: 0, ...style}}>
    {children}
  </svg>
);

/** 暗く抑えた「シェーダー風」背景。色の溜まりがゆっくり流れる */
export const ShaderBg: React.FC<{frame: number; warm?: number; hue?: "night" | "warm" | "rose"}> = ({frame, warm = 0.5, hue = "night"}) => {
  const t = frame / 30;
  const a = hue === "rose" ? "158,62,71" : hue === "warm" ? "210,164,81" : "99,138,138";
  const b = hue === "night" ? "39,50,74" : "90,52,60";
  const p1 = [50 + Math.sin(t * 0.21) * 22, 42 + Math.cos(t * 0.17) * 16];
  const p2 = [30 + Math.cos(t * 0.13) * 18, 70 + Math.sin(t * 0.19) * 12];
  const p3 = [74 + Math.sin(t * 0.11 + 1) * 14, 28 + Math.cos(t * 0.23) * 14];
  return (
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(ellipse 46% 52% at ${p1[0]}% ${p1[1]}%, rgba(${a},${0.26 * warm + 0.08}), transparent 70%)`,
          `radial-gradient(ellipse 40% 44% at ${p2[0]}% ${p2[1]}%, rgba(${b},0.55), transparent 72%)`,
          `radial-gradient(ellipse 34% 38% at ${p3[0]}% ${p3[1]}%, rgba(210,164,81,${0.1 * warm}), transparent 70%)`,
          "linear-gradient(180deg, #0B1020 0%, #090D19 100%)",
        ].join(","),
      }}
    />
  );
};

/** 写真のステーションポッド（依頼で指定された実写素材） */
export const Pod: React.FC<{
  x: number;
  y: number;
  height: number;
  brightness?: number;
  glow?: number;
  opacity?: number;
  style?: CSSProperties;
  children?: ReactNode;
}> = ({x, y, height, brightness = 0.82, glow = 0, opacity = 1, style, children}) => {
  const width = (height * 948) / 1712;
  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height,
        width,
        height,
        opacity,
        filter: `brightness(${brightness}) contrast(1.04) saturate(0.85) drop-shadow(0 ${height * 0.02}px ${height * 0.05}px rgba(0,0,0,0.7))${glow > 0 ? ` drop-shadow(0 0 ${40 * glow}px rgba(210,164,81,${0.55 * glow}))` : ""}`,
        ...style,
      }}
    >
      <Img src={staticFile("station-pod.png")} style={{width: "100%", height: "100%", display: "block"}} />
      {children}
    </div>
  );
};

/** 画面内テロップ。全シーンで同じ書体・色・縁取り・下線を使う */
export const KeyText: React.FC<{
  id: string;
  text: string;
  x: number;
  y: number;
  frame: number;
  at: number;
  size?: number;
  glitch?: boolean;
  align?: "center" | "left";
  accent?: string;
  sub?: string;
}> = ({id, text, x, y, frame, at, size = 84, glitch = false, align = "center", accent = C.gold, sub}) => {
  const r = reveal(frame, at, 10);
  const since = frame - at;
  const jitter = glitch && since > -4 && since < 16 ? Math.max(0, 1 - Math.max(0, since) / 16) : 0;
  const dx = jitter * (Math.sin(frame * 2.7) * 14);
  const dy = jitter * (Math.cos(frame * 3.3) * 4);
  const common: CSSProperties = {
    fontFamily: FONT,
    fontWeight: 900,
    fontSize: size,
    lineHeight: 1.18,
    letterSpacing: size * 0.02,
    whiteSpace: "pre",
  };
  return (
    <div
      data-layout-box={id}
      style={{
        position: "absolute",
        left: align === "center" ? x : x,
        top: y,
        transform: `translate(${align === "center" ? "-50%" : "0"}, ${(1 - r) * 22}px) scale(${0.95 + r * 0.05})`,
        transformOrigin: align === "center" ? "50% 50%" : "0 50%",
        opacity: r,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
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
        <div
          style={{
            ...common,
            position: "relative",
            color: C.white,
            WebkitTextStroke: `${Math.max(4, size * 0.07)}px rgba(4,6,12,0.9)`,
            paintOrder: "stroke fill",
            textShadow: "0 8px 30px rgba(0,0,0,0.6)",
            transform: jitter > 0 ? `translate(${dx * 0.3}px,0)` : undefined,
          }}
        >
          {text}
        </div>
      </div>
      <div style={{width: Math.min(220, size * 2.4) * r, height: 6, borderRadius: 3, background: accent}} />
      {sub ? (
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: size * 0.36, color: C.dim, letterSpacing: 2}}>{sub}</div>
      ) : null}
    </div>
  );
};

/** UI カード（研究カード・通知など）の共通パネル */
export const Panel: React.FC<{style?: CSSProperties; children: ReactNode; id?: string}> = ({style, children, id}) => (
  <div
    data-layout-box={id}
    style={{
      position: "absolute",
      background: "linear-gradient(180deg, rgba(23,31,52,0.96), rgba(14,20,36,0.96))",
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

/** 真上から見た人の流れ（点）。lanes ごとに左右へ流れる */
export const CrowdDots: React.FC<{frame: number; count?: number; stopX?: number; stopAt?: number; color?: string; area?: [number, number]}> = ({
  frame,
  count = 150,
  color = "rgba(215,204,181,0.75)",
  area = [120, 960],
}) => {
  const dots = Array.from({length: count}, (_, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    const speed = 2.2 + rand(i) * 2.6;
    const y = area[0] + rand(i + 900) * (area[1] - area[0]);
    const x = ((rand(i + 300) * 2200 + dir * frame * speed) % 2200 + 2200) % 2200 - 140;
    const r = 7 + rand(i + 50) * 4;
    return {x, y, r, dir};
  });
  return (
    <g>
      {dots.map((d, i) => (
        <g key={i}>
          <line x1={d.x - d.dir * 26} y1={d.y} x2={d.x} y2={d.y} stroke={color} strokeOpacity={0.18} strokeWidth={d.r * 1.2} strokeLinecap="round" />
          <circle cx={d.x} cy={d.y} r={d.r} fill={color} />
        </g>
      ))}
    </g>
  );
};

/** 駅構内のパララックス背景（柱・案内表示・床・天井照明） */
export const StationHall: React.FC<{frame: number; speed?: number; dim?: number; sepia?: boolean; signs?: boolean}> = ({frame, speed = 1, dim = 0, sepia = false, signs: showSigns = true}) => {
  const far = -((frame * 0.6 * speed) % 480);
  const mid = -((frame * 1.6 * speed) % 640);
  const wall = sepia ? "#1E1A18" : "#131B2D";
  const floor = sepia ? "#17130F" : "#0C111D";
  const signs = ["のりば", "出口", "改札", "乗換", "中央口"];
  return (
    <>
      <rect width="1920" height="1080" fill={wall} />
      <rect y="0" width="1920" height="120" fill="#0A0E18" />
      {Array.from({length: 7}, (_, i) => (
        <rect key={`l${i}`} x={far + i * 480 + 80} y="104" width="300" height="12" rx="6" fill="#E9E2CF" opacity={0.55} />
      ))}
      <path d="M0 116 H1920" stroke="#2A3550" strokeWidth="4" />
      {showSigns && Array.from({length: 6}, (_, i) => (
        <g key={`s${i}`} transform={`translate(${far + i * 480 + 140} 170)`}>
          <rect width="210" height="58" rx="6" fill={sepia ? "#3A2F24" : "#1B2A44"} stroke="#3D4B6A" strokeWidth="3" />
          <rect x="14" y="14" width="30" height="30" rx="4" fill={i % 2 ? C.gold : C.teal} opacity="0.85" />
          <text data-layout-box={`hall-sign-${i}`} x="58" y="40" fill={C.white} opacity="0.8" fontFamily={FONT} fontWeight={700} fontSize="26">
            {signs[i % signs.length]}
          </text>
        </g>
      ))}
      <rect y="600" width="1920" height="480" fill={floor} />
      {Array.from({length: 12}, (_, i) => (
        <path key={`f${i}`} d={`M${960 + (i - 6) * 60} 600 L${960 + (i - 6) * 520} 1080`} stroke="#1A2336" strokeWidth="3" />
      ))}
      {[640, 700, 780, 890, 1030].map((y) => (
        <path key={y} d={`M0 ${y} H1920`} stroke="#172033" strokeWidth="3" />
      ))}
      {Array.from({length: 5}, (_, i) => (
        <g key={`p${i}`} transform={`translate(${mid + i * 640 + 40} 0)`}>
          <rect x="0" y="120" width="120" height="560" fill={sepia ? "#2A231D" : "#1A2439"} />
          <rect x="0" y="120" width="18" height="560" fill="#2C3957" opacity="0.7" />
          <ellipse cx="60" cy="690" rx="120" ry="16" fill="#000" opacity="0.35" />
        </g>
      ))}
      <rect width="1920" height="1080" fill="#05070D" opacity={dim} />
    </>
  );
};

/** 夜の街のシルエット（奥行き3層） */
export const CitySkyline: React.FC<{frame: number; speed?: number; lit?: number}> = ({frame, speed = 1, lit = 0.6}) => {
  const layers = [
    {y: 520, h: 260, color: "#141B2F", sp: 0.25, n: 14, seed: 1},
    {y: 600, h: 300, color: "#10162A", sp: 0.6, n: 10, seed: 2},
    {y: 700, h: 320, color: "#0B1020", sp: 1.2, n: 8, seed: 3},
  ];
  return (
    <>
      {layers.map((L, li) => {
        const shift = -((frame * L.sp * speed) % 1920);
        return (
          <g key={li} transform={`translate(${shift} 0)`}>
            {[0, 1920].map((base) =>
              Array.from({length: L.n}, (_, i) => {
                const w = 1920 / L.n;
                const h = L.h * (0.45 + rand(i * 7 + L.seed) * 0.55);
                const x = base + i * w;
                return (
                  <g key={`${base}-${i}`}>
                    <rect x={x + 4} y={L.y + L.h - h} width={w - 8} height={h + 400} fill={L.color} />
                    {li < 2
                      ? Array.from({length: 8}, (_, k) => (
                          <rect
                            key={k}
                            x={x + 18 + (k % 3) * (w / 3.4)}
                            y={L.y + L.h - h + 24 + Math.floor(k / 3) * 36}
                            width="16"
                            height="12"
                            fill={C.gold}
                            opacity={rand(i * 13 + k + L.seed * 5) > 0.55 ? 0.5 * lit : 0.06}
                          />
                        ))
                      : null}
                  </g>
                );
              }),
            )}
          </g>
        );
      })}
    </>
  );
};

/** 生成的な流れ線（決定的なベクトル場を積分した軌跡） */
export const FlowLines: React.FC<{frame: number; count?: number; box?: [number, number, number, number]; hue?: string; seed?: number}> = ({
  frame,
  count = 90,
  box = [0, 0, 1920, 1080],
  hue = "210,164,81",
  seed = 1,
}) => {
  const [bx, by, bw, bh] = box;
  const field = (x: number, y: number) =>
    Math.sin(x * 0.006 + seed) * 1.6 + Math.cos(y * 0.007 - seed) * 1.6 + Math.sin((x + y) * 0.002) * 1.2;
  const paths = Array.from({length: count}, (_, i) => {
    let x = bx + rand(i * 3 + seed) * bw;
    let y = by + rand(i * 5 + seed * 7) * bh;
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    for (let s = 0; s < 40; s += 1) {
      const a = field(x, y);
      x += Math.cos(a) * 9;
      y += Math.sin(a) * 9;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  });
  return (
    <g>
      {paths.map((d, i) => {
        const phase = ((frame * 0.012 + rand(i + 40)) % 1);
        return (
          <path
            key={i}
            d={d}
            pathLength={1}
            fill="none"
            stroke={`rgba(${hue},${0.18 + rand(i + 2) * 0.35})`}
            strokeWidth={1.6 + rand(i + 9) * 1.4}
            strokeDasharray="0.35 0.65"
            strokeDashoffset={-phase}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

/** SVG の線画を発話に合わせて描く */
export const DrawPath: React.FC<{d: string; progress: number; stroke?: string; width?: number; fill?: string}> = ({
  d,
  progress,
  stroke = C.gold,
  width = 5,
  fill = "none",
}) => (
  <path
    d={d}
    pathLength={1}
    fill={fill}
    stroke={stroke}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeDasharray="1 1"
    strokeDashoffset={1 - progress}
  />
);

/** 雨（決定的） */
export const Rain: React.FC<{frame: number; count?: number; ground?: number}> = ({frame, count = 170, ground = 1000}) => (
  <g>
    {Array.from({length: count}, (_, i) => {
      const sp = 26 + rand(i) * 16;
      const len = 24 + rand(i + 7) * 30;
      const y = ((rand(i + 100) * (ground + 200) + frame * sp) % (ground + 200)) - 200;
      const x = rand(i + 300) * 2100 - y * 0.18;
      return <line key={i} x1={x} y1={y} x2={x - len * 0.18} y2={y + len} stroke="rgba(170,196,232,0.42)" strokeWidth={1.8} />;
    })}
  </g>
);

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.7}) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse 75% 70% at 50% 45%, transparent 45%, rgba(3,5,10,${strength}) 100%)`,
    }}
  />
);
