import type {ReactNode} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import type {Scene} from "../types";
import {StickPerson} from "./StickPerson";
import {
  C,
  CitySkyline,
  CrowdDots,
  DrawPath,
  FlowLines,
  FONT,
  KeyText,
  lerp,
  Panel,
  Pod,
  Rain,
  rand,
  reveal,
  ShaderBg,
  StationHall,
  Svg,
  Vignette,
} from "./Kit";

type P = {f: number; R: (key: string) => number; dur: number; n: number};

/* ------------------------------------------------------------------ 共通の小物 */

const TopFloor: React.FC = () => (
  <>
    <rect width="1920" height="1080" fill="#0D1322" />
    {Array.from({length: 17}, (_, i) => (
      <path key={`v${i}`} d={`M${i * 120} 0 V1080`} stroke="#141C2E" strokeWidth="3" />
    ))}
    {Array.from({length: 10}, (_, i) => (
      <path key={`h${i}`} d={`M0 ${i * 120} H1920`} stroke="#141C2E" strokeWidth="3" />
    ))}
    {[96, 984].map((y) => (
      <g key={y}>
        <rect x="0" y={y - 18} width="1920" height="36" fill={C.gold} opacity="0.2" />
        {Array.from({length: 48}, (_, i) => (
          <circle key={i} cx={20 + i * 40} cy={y} r="5" fill={C.gold} opacity="0.3" />
        ))}
      </g>
    ))}
  </>
);

const Walker: React.FC<{f: number; x0: number; speed: number; y: number; scale: number; color: string; seed: number; opacity?: number}> = ({
  f,
  x0,
  speed,
  y,
  scale,
  color,
  seed,
  opacity = 1,
}) => {
  const span = 2400;
  const x = ((x0 + f * speed) % span + span) % span - 240;
  return <StickPerson x={x} y={y} scale={scale} pose="walk" phase={f * 0.32 + seed} color={color} flip={speed < 0} opacity={opacity} />;
};

const Walkers: React.FC<{f: number; y: number; scale: number; count: number; color?: string; seed?: number; opacity?: number; speedMul?: number}> = ({
  f,
  y,
  scale,
  count,
  color = "#3E5277",
  seed = 1,
  opacity = 1,
  speedMul = 1,
}) => (
  <>
    {Array.from({length: count}, (_, i) => {
      const dir = rand(i + seed * 17) > 0.5 ? 1 : -1;
      return (
        <Walker
          key={i}
          f={f}
          x0={rand(i * 3 + seed) * 2400}
          speed={dir * (3.2 + rand(i + seed * 5) * 2.4) * speedMul}
          y={y + rand(i + seed * 11) * 20}
          scale={scale * (0.9 + rand(i + 4) * 0.2)}
          color={color}
          seed={i}
          opacity={opacity}
        />
      );
    })}
  </>
);

const Brain: React.FC<{x: number; y: number; s: number; progress?: number}> = ({x, y, s, progress = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <DrawPath
      progress={progress}
      stroke={C.paper}
      width={6 / s}
      d="M-230 40 C-260 -60 -200 -170 -90 -190 C-40 -250 80 -250 130 -190 C230 -180 280 -80 250 10 C290 80 240 170 150 170 C120 220 30 230 -10 190 C-70 230 -170 210 -190 140 C-260 130 -270 80 -230 40 Z"
    />
    <DrawPath progress={progress} stroke={C.paper} width={4 / s} d="M-120 -120 C-70 -90 -80 -30 -30 -10 M40 -170 C20 -110 80 -80 60 -20 M150 -90 C110 -40 170 20 130 70 M-160 60 C-100 50 -80 110 -20 100" />
  </g>
);

const Arrow: React.FC<{x1: number; x2: number; y: number; progress: number}> = ({x1, x2, y, progress}) => (
  <g>
    <DrawPath d={`M${x1} ${y} H${x2}`} progress={progress} stroke={C.gold} width={6} />
    <path d={`M${x2 - 26} ${y - 20} L${x2} ${y} L${x2 - 26} ${y + 20}`} fill="none" stroke={C.gold} strokeWidth={6} strokeLinecap="round" opacity={progress > 0.95 ? 1 : 0} />
  </g>
);

const GlitchBands: React.FC<{f: number; at: number}> = ({f, at}) => {
  const k = f - at;
  if (k < -2 || k > 9) return null;
  const strength = 1 - Math.max(0, k) / 9;
  return (
    <Svg>
      {Array.from({length: 7}, (_, i) => (
        <rect
          key={i}
          x={(rand(i + f) - 0.5) * 120 * strength}
          y={rand(i * 3 + f) * 1000}
          width="1920"
          height={6 + rand(i + 9 + f) * 30}
          fill={i % 2 ? "rgba(99,210,220,0.14)" : "rgba(214,72,96,0.14)"}
        />
      ))}
    </Svg>
  );
};

const Stage: React.FC<{children: ReactNode; bg?: string}> = ({children, bg = C.night}) => (
  <AbsoluteFill style={{background: bg, overflow: "hidden"}}>{children}</AbsoluteFill>
);

/** 研究カード（3シーンで同じ構成） */
const StudyCard: React.FC<{
  id: string;
  f: number;
  role: string;
  name: string;
  place: string;
  year: string;
  yearAt: number;
  extra?: {label: string; value: string; unit: string; at: number};
}> = ({id, f, role, name, place, year, yearAt, extra}) => {
  const open = reveal(f, 6, 12);
  const y = reveal(f, yearAt, 10);
  const e = extra ? reveal(f, extra.at, 10) : 0;
  const count = extra ? Math.round(interpolate(f, [extra.at - 4, extra.at + 18], [0, Number(extra.value)], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})) : 0;
  return (
    <Panel id={id} style={{left: 150, top: 140, width: 900, padding: "44px 56px 48px", opacity: open, transform: `translateY(${(1 - open) * 20}px)`}}>
      <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 26}}>
        <div style={{width: 16, height: 16, borderRadius: 8, background: C.gold}} />
        <div style={{fontSize: 28, fontWeight: 700, color: C.dim, letterSpacing: 6}}>研究の紹介</div>
      </div>
      <div style={{fontSize: 32, fontWeight: 700, color: C.dim}}>{place}</div>
      <div style={{fontSize: 30, fontWeight: 700, color: C.dim, marginTop: 6}}>{role}</div>
      <div style={{fontSize: 72, fontWeight: 900, marginTop: 10, letterSpacing: 2}}>{name}</div>
      <div style={{height: 2, background: "#2E3A56", margin: "30px 0"}} />
      <div style={{display: "flex", gap: 64, alignItems: "flex-end"}}>
        <div style={{opacity: y, transform: `translateY(${(1 - y) * 14}px)`}}>
          <div style={{fontSize: 26, color: C.dim, fontWeight: 700}}>調査の年</div>
          <div style={{display: "inline-flex", alignItems: "baseline", gap: 10}}>
            <span style={{fontSize: 96, fontWeight: 900, fontVariantNumeric: "tabular-nums"}}>{year}</span>
            <span style={{fontSize: 40, fontWeight: 900, color: C.gold}}>年</span>
          </div>
        </div>
        {extra ? (
          <div style={{opacity: e, transform: `translateY(${(1 - e) * 14}px)`}}>
            <div style={{fontSize: 26, color: C.dim, fontWeight: 700}}>{extra.label}</div>
            <div style={{display: "inline-flex", alignItems: "baseline", gap: 10}}>
              <span style={{fontSize: 96, fontWeight: 900, fontVariantNumeric: "tabular-nums"}}>{count}</span>
              <span style={{fontSize: 40, fontWeight: 900, color: C.gold}}>{extra.unit}</span>
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

const PeopleGrid: React.FC<{f: number; at: number; x: number; y: number; cols: number; rows: number; color?: string}> = ({f, at, x, y, cols, rows, color = C.teal}) => (
  <Svg>
    {Array.from({length: cols * rows}, (_, i) => {
      const r = reveal(f, at + (i % cols) + Math.floor(i / cols) * 2, 8);
      const cx = x + (i % cols) * 96;
      const cy = y + Math.floor(i / cols) * 150;
      return (
        <g key={i} opacity={r} transform={`translate(0 ${(1 - r) * 12})`}>
          <circle cx={cx} cy={cy} r="20" fill="none" stroke={color} strokeWidth="6" />
          <path d={`M${cx - 32} ${cy + 90} C${cx - 30} ${cy + 36} ${cx + 30} ${cy + 36} ${cx + 32} ${cy + 90}`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
        </g>
      );
    })}
  </Svg>
);

/* ------------------------------------------------------------------ 各シーン */

// 1 駅コンコースを真上から。点（人）が流れ、1人だけ立ち止まる
const S1: React.FC<P> = ({f, R}) => {
  const ring = (f % 45) / 45;
  return (
    <Stage>
      <Svg>
        <TopFloor />
        <CrowdDots frame={f} count={170} />
        <circle cx="960" cy="540" r={22 + ring * 70} fill="none" stroke={C.gold} strokeWidth="4" opacity={0.7 * (1 - ring)} />
        <circle cx="960" cy="540" r="20" fill={C.gold} />
      </Svg>
      <KeyText id="s1-key" text="絶対にあり得ない" x={960} y={640} frame={f} at={R("kp")} />
    </Stage>
  );
};

// 2 駅の通路に置かれた実物のブース。人が入り、画面がノイズで乱れる
const S2: React.FC<P> = ({f, R}) => {
  const enter = R("enter");
  const px = interpolate(f, [0, enter], [380, 930], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const inside = interpolate(f, [enter - 2, enter + 8], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const lit = reveal(f, enter + 6, 12);
  return (
    <Stage>
      <Svg>
        <StationHall frame={f} speed={0.6} dim={0.35} />
        <Walkers f={f} y={560} scale={0.55} count={9} opacity={0.55} seed={3} />
        <ellipse cx="1100" cy="780" rx="260" ry="34" fill="#000" opacity="0.45" />
      </Svg>
      <Pod x={1100} y={790} height={660} glow={lit * 0.6} />
      <Svg>
        <StickPerson x={px} y={572} scale={1.3} pose="walk" phase={f * 0.3} color={C.teal} opacity={inside} />
      </Svg>
      <KeyText id="s2-key" text="勘違い" x={520} y={250} frame={f} at={R("kp")} glitch size={110} />
      <GlitchBands f={f} at={R("kp")} />
    </Stage>
  );
};

// 3 ニュース（シェーダー背景＋UIカード＋実物写真）
const S3: React.FC<P> = ({f, R}) => {
  const open = reveal(f, 6, 12);
  const pod = reveal(f, R("pod"), 10);
  const sns = reveal(f, R("sns"), 10);
  const pol = reveal(f, R("police"), 10);
  const flash = pol > 0.5 ? (Math.sin(f * 0.5) > 0 ? 1 : 0.35) : 0;
  return (
    <Stage>
      <ShaderBg frame={f} hue="rose" warm={0.5} />
      <Panel id="s3-news" style={{left: 150, top: 140, width: 880, padding: "40px 52px", opacity: open, transform: `translateY(${(1 - open) * 20}px)`}}>
        <div style={{display: "flex", alignItems: "center", gap: 18}}>
          <div style={{background: C.red, color: C.white, fontWeight: 900, fontSize: 28, padding: "6px 18px", borderRadius: 6, letterSpacing: 4}}>ニュース</div>
          <div style={{display: "inline-flex", alignItems: "baseline", gap: 6, fontWeight: 900}}>
            <span style={{fontSize: 56}}>2026</span>
            <span style={{fontSize: 30, color: C.gold}}>年</span>
            <span style={{fontSize: 56}}>9</span>
            <span style={{fontSize: 30, color: C.gold}}>月</span>
          </div>
        </div>
        <div style={{fontSize: 44, fontWeight: 900, marginTop: 28, lineHeight: 1.4}}>都内の大きな駅に置かれた<br />テレワーク用の防音個室</div>
        <div style={{height: 2, background: "#2E3A56", margin: "28px 0"}} />
        <div style={{display: "flex", flexDirection: "column", gap: 16}}>
          <div style={{display: "flex", alignItems: "center", gap: 18, opacity: sns, transform: `translateX(${(1 - sns) * 30}px)`}}>
            <svg width="54" height="54" viewBox="0 0 54 54"><circle cx="14" cy="27" r="8" fill={C.teal} /><circle cx="40" cy="12" r="8" fill={C.teal} /><circle cx="40" cy="42" r="8" fill={C.teal} /><path d="M14 27 L40 12 M14 27 L40 42" stroke={C.teal} strokeWidth="4" /></svg>
            <div style={{fontSize: 38, fontWeight: 700}}>動画がネットに広まる</div>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 18, opacity: pol, transform: `translateX(${(1 - pol) * 30}px)`}}>
            <svg width="54" height="54" viewBox="0 0 54 54"><rect x="6" y="20" width="42" height="22" rx="6" fill="#1A2236" /><rect x="8" y="22" width="18" height="18" rx="4" fill="#D64860" opacity={flash} /><rect x="28" y="22" width="18" height="18" rx="4" fill="#4C7BD9" opacity={1.35 - flash} /></svg>
            <div style={{fontSize: 38, fontWeight: 700}}>警察が動く大きな騒ぎに</div>
          </div>
        </div>
      </Panel>
      <Pod x={1450} y={790} height={620} brightness={0.78} opacity={0.25 + 0.75 * pod} style={{transform: `scale(${0.97 + pod * 0.03})`}} />
      <div
        data-layout-box="s3-pod-label"
        style={{position: "absolute", left: 1450, top: 100, transform: `translate(-50%, ${(1 - pod) * 12}px)`, opacity: pod, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.white, background: "rgba(9,13,25,0.85)", border: `2px solid ${C.gold}`, borderRadius: 10, padding: "4px 20px", whiteSpace: "nowrap"}}
      >
        ステーションポッド
      </div>
      <Vignette strength={0.5} />
    </Stage>
  );
};

// 4 群衆が1人を指さす。「おかしな人」に取り消し線
const S4: React.FC<P> = ({f, R}) => {
  const strike = reveal(f, R("strike"), 12);
  return (
    <Stage>
      <Svg>
        <rect width="1920" height="1080" fill="#0B0F1C" />
        <ellipse cx="1440" cy="760" rx="260" ry="40" fill={C.gold} opacity="0.12" />
        <path d="M1300 0 L1580 0 L1700 760 L1180 760 Z" fill={C.gold} opacity="0.05" />
        <rect y="760" width="1920" height="320" fill="#080B14" />
        {[240, 420, 600, 780].map((x, i) => (
          <StickPerson key={x} x={x} y={540 + (i % 2) * 20} scale={1.05} pose="point" color="#4A5A7C" />
        ))}
        <StickPerson x={1440} y={560} scale={1.15} pose="stand" color={C.paper} />
        <DrawPath d="M640 222 H1280" progress={strike} stroke={C.red} width={10} />
      </Svg>
      <KeyText id="s4-key" text="おかしな人" x={960} y={150} frame={f} at={8} />
    </Stage>
  );
};

// 5 脳の中の流れ（ジェネラティブ）と心のスイッチ
const S5: React.FC<P> = ({f, R}) => {
  const on = reveal(f, R("switch"), 8);
  return (
    <Stage>
      <ShaderBg frame={f} warm={0.3} />
      <Svg>
        <defs>
          <clipPath id="brainclip">
            <path transform="translate(960 520) scale(1.25)" d="M-230 40 C-260 -60 -200 -170 -90 -190 C-40 -250 80 -250 130 -190 C230 -180 280 -80 250 10 C290 80 240 170 150 170 C120 220 30 230 -10 190 C-70 230 -170 210 -190 140 C-260 130 -270 80 -230 40 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#brainclip)">
          <FlowLines frame={f} count={140} box={[600, 240, 760, 560]} hue={on > 0.5 ? "210,164,81" : "99,138,138"} seed={3} />
        </g>
        <Brain x={960} y={520} s={1.25} progress={reveal(f, 10, 24)} />
        <g transform="translate(960 540)">
          <rect x="-70" y="-44" width="140" height="88" rx="44" fill={on > 0.5 ? C.gold : "#1B2438"} stroke={C.paper} strokeWidth="5" />
          <circle cx={interpolate(on, [0, 1], [-26, 26])} cy="0" r="30" fill={C.paper} />
        </g>
      </Svg>
      <KeyText id="s5-key" text="心のスイッチ" x={960} y={96} frame={f} at={R("switch")} size={76} />
    </Stage>
  );
};

// 6 タイトル（頭の中 × 街の仕組み）
const S6: React.FC<P> = ({f, R}) => {
  const a = reveal(f, 14, 24);
  const b = reveal(f, R("title2"), 24);
  return (
    <Stage>
      <ShaderBg frame={f} warm={0.7} />
      <Svg>
        <Brain x={600} y={330} s={0.5} progress={a} />
        <g opacity={b}>
          <DrawPath progress={b} stroke={C.paper} width={4} d="M1180 420 V330 H1240 V270 H1300 V360 H1360 V240 H1430 V330 H1480 V300 H1540 V420" />
          <DrawPath progress={b} stroke={C.paper} width={3} d="M1150 420 H1570" />
        </g>
        <DrawPath progress={reveal(f, R("title2") + 8, 14)} stroke={C.gold} width={6} d="M930 470 L990 530 M990 470 L930 530" />
        <DrawPath progress={reveal(f, 10, 40)} stroke="rgba(210,164,81,0.5)" width={3} d="M300 190 H1620 V700 H300 Z" />
      </Svg>
      <KeyText id="s6-a" text="頭の中" x={600} y={450} frame={f} at={14} size={88} />
      <KeyText id="s6-b" text="街の仕組み" x={1360} y={450} frame={f} at={R("title2")} size={88} />
    </Stage>
  );
};

// 7 ガラス張りの箱（写真）の外を人が行き交う
const S7: React.FC<P> = ({f, R, dur}) => {
  const turn = interpolate(f, [0, dur], [-7, 7]);
  return (
    <Stage>
      <Svg>
        <StationHall frame={f} speed={0.4} dim={0.45} />
        <Walkers f={f} y={560} scale={0.75} count={7} opacity={0.6} seed={8} />
      </Svg>
      <div style={{position: "absolute", inset: 0, perspective: 1600}}>
        <Pod x={1180} y={800} height={700} style={{transform: `rotateY(${turn}deg)`}} />
      </div>
      <Svg>
        <Walkers f={f + 40} y={640} scale={1.25} count={3} color="#2B3B5A" seed={21} speedMul={1.4} />
      </Svg>
      <KeyText id="s7-key" text="油断" x={430} y={300} frame={f} at={R("kp")} size={130} />
    </Stage>
  );
};

// 8 研究カード（エバンス）
const S8: React.FC<P> = ({f, R}) => (
  <Stage>
    <ShaderBg frame={f} warm={0.35} />
    <StudyCard
      id="s8-card"
      f={f}
      place="アメリカ・コーネル大学"
      role="研究者"
      name="ゲイリー・エバンス"
      year="2000"
      yearAt={R("year")}
      extra={{label: "集めた街の人", value: "300", unit: "人", at: R("n")}}
    />
    <PeopleGrid f={f} at={R("n")} x={1230} y={260} cols={5} rows={3} />
  </Stage>
);

// 9 広さの違う3つの部屋（図解＋人物＋心拍）
const S9: React.FC<P> = ({f, R}) => {
  const rooms = [
    {cx: 420, w: 520, h: 430, s: 0.85, label: "広い部屋"},
    {cx: 1000, w: 380, h: 350, s: 0.75, label: "中くらいの部屋"},
    {cx: 1500, w: 260, h: 290, s: 0.62, label: "狭い部屋"},
  ];
  const win = reveal(f, R("window"), 12);
  const heart = reveal(f, R("heart"), 30);
  const puzzle = reveal(f, R("puzzle"), 10);
  return (
    <Stage>
      <Svg>
        <rect width="1920" height="1080" fill="#0B1020" />
        <rect y="700" width="1920" height="380" fill="#080C16" />
        {rooms.map((r, i) => {
          const x = r.cx - r.w / 2;
          const top = 700 - r.h;
          const beat = Array.from({length: 24}, (_, k) => {
            const px = x + (k / 23) * r.w;
            const spike = (k + Math.floor(f / 3)) % 8 === 0 ? -36 : (k + Math.floor(f / 3)) % 8 === 1 ? 22 : 0;
            return `${k === 0 ? "M" : "L"}${px.toFixed(1)} ${(top - 60 + spike * (1 - i * 0.28)).toFixed(1)}`;
          }).join(" ");
          return (
            <g key={i}>
              <rect x={x} y={top} width={r.w} height={r.h} fill="#141C30" stroke={C.paper} strokeWidth="5" />
              <rect x={x + r.w * 0.12} y={top + 30} width={r.w * 0.34} height={r.h * 0.32} fill="#0A1222" stroke={C.teal} strokeWidth="4" />
              <g opacity={win}>
                <clipPath id={`win${i}`}>
                  <rect x={x + r.w * 0.12} y={top + 30} width={r.w * 0.34} height={r.h * 0.32} />
                </clipPath>
                <g clipPath={`url(#win${i})`}>
                  <StickPerson x={x + r.w * 0.12 + ((f * 2.2 + i * 60) % (r.w * 0.34 + 80)) - 40} y={top + 30 + r.h * 0.26} scale={r.s * 0.4} pose="walk" phase={f * 0.35} color="#4A5A7C" />
                </g>
              </g>
              <rect x={r.cx - r.w * 0.05} y={700 - 118 * r.s} width={r.w * 0.34} height="14" fill="#5C4430" />
              <rect x={r.cx + r.w * 0.02} y={700 - 104 * r.s} width="10" height={104 * r.s} fill="#3A2B22" />
              <g opacity={puzzle}>
                {[0, 1, 2, 3].map((k) => (
                  <rect key={k} x={r.cx - r.w * 0.02 + (k % 2) * 22 * r.s} y={700 - 164 * r.s + Math.floor(k / 2) * 22 * r.s} width={18 * r.s} height={18 * r.s} fill={k === 1 ? C.gold : C.teal} />
                ))}
              </g>
              <StickPerson x={r.cx - r.w * 0.16} y={700 - 105 * r.s} scale={r.s} pose="sit" color={C.teal} />
              <DrawPath d={beat} progress={heart} stroke={C.red} width={4} />
              <text data-layout-box={`s9-label-${i}`} x={r.cx} y="760" textAnchor="middle" fill={C.dim} fontFamily={FONT} fontWeight={700} fontSize="32">
                {r.label}
              </text>
            </g>
          );
        })}
      </Svg>
    </Stage>
  );
};

// 10 警戒心のグラフ（約40％低下）
const S10: React.FC<P> = ({f, R}) => {
  const g = reveal(f, R("bars"), 20);
  const m = reveal(f, R("metric"), 10);
  const bars = [
    {label: "広い部屋", v: 1},
    {label: "中くらい", v: 0.8},
    {label: "狭い部屋", v: 0.6},
  ];
  const base = 720;
  const maxH = 420;
  return (
    <Stage>
      <ShaderBg frame={f} warm={0.25} />
      <Svg>
        <path d={`M200 ${base} H1060`} stroke={C.dim} strokeWidth="3" />
        <text data-layout-box="s10-axis" x="200" y="200" fill={C.dim} fontFamily={FONT} fontWeight={700} fontSize="32">
          外から見られていることへの警戒心
        </text>
        {bars.map((b, i) => {
          const h = maxH * b.v * g;
          const x = 260 + i * 270;
          return (
            <g key={b.label}>
              <rect x={x} y={base - h} width="170" height={h} rx="6" fill={i === 2 ? C.gold : C.indigo} />
              <text data-layout-box={`s10-bar-${i}`} x={x + 85} y={base + 50} textAnchor="middle" fill={C.white} fontFamily={FONT} fontWeight={700} fontSize="30">
                {b.label}
              </text>
            </g>
          );
        })}
        <g opacity={m}>
          <path d={`M345 ${base - maxH} H885`} stroke={C.red} strokeWidth="3" strokeDasharray="10 10" />
          <path d={`M885 ${base - maxH} V${base - maxH * 0.6}`} stroke={C.red} strokeWidth="5" />
          <path d={`M870 ${base - maxH * 0.6 - 22} L885 ${base - maxH * 0.6} L900 ${base - maxH * 0.6 - 22}`} stroke={C.red} strokeWidth="5" fill="none" />
        </g>
      </Svg>
      <div data-layout-box="s10-metric" style={{position: "absolute", left: 1180, top: 330, opacity: m, transform: `translateY(${(1 - m) * 20}px)`, fontFamily: FONT, color: C.white}}>
        <div style={{fontSize: 34, fontWeight: 700, color: C.dim, marginBottom: 12}}>警戒心</div>
        <div style={{display: "inline-flex", alignItems: "baseline", gap: 16, whiteSpace: "nowrap"}}>
          <span style={{fontSize: 170, fontWeight: 900, letterSpacing: -4}}>約40</span>
          <span style={{fontSize: 60, fontWeight: 900, color: C.gold}}>％低下</span>
        </div>
      </div>
    </Stage>
  );
};

// 11 壁が体を包む（線画の変形）→ 勘違い
const S11: React.FC<P> = ({f, R, dur}) => {
  const close = lerp(f, [0, R("safe")], [0, 1]);
  const morph = lerp(f, [R("safe") - 10, R("safe") + 20], [0, 1]);
  const cx = 960;
  const cy = 500;
  const half = interpolate(close, [0, 1], [420, 230]);
  const pts = Array.from({length: 40}, (_, i) => {
    const a = (i / 40) * Math.PI * 2;
    const sq = Math.min(1 / Math.abs(Math.cos(a) || 1e-6), 1 / Math.abs(Math.sin(a) || 1e-6));
    const r = half * (sq * (1 - morph) + 1.05 * morph);
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  });
  return (
    <Stage>
      <ShaderBg frame={f} hue="warm" warm={0.3 + 0.5 * morph} />
      <Svg>
        <polygon points={pts.join(" ")} fill={`rgba(210,164,81,${0.08 * morph})`} stroke={C.paper} strokeWidth="6" />
        <StickPerson x={cx} y={560} scale={1.05} pose="stand" color={C.paper} />
      </Svg>
      <KeyText id="s11-safe" text="守られている" x={420} y={200} frame={f} at={R("safe")} size={76} />
      <KeyText id="s11-kp" text="勘違い" x={1500} y={200} frame={f} at={R("kp")} size={96} glitch />
      <GlitchBands f={f} at={R("kp")} />
    </Stage>
  );
};

// 12 駅の通路（パララックス＋人物）
const S12: React.FC<P> = ({f}) => (
  <Stage>
    <Svg>
      <StationHall frame={f} speed={1.2} />
      <Walkers f={f} y={560} scale={0.6} count={6} opacity={0.6} seed={31} />
      <Walkers f={f} y={660} scale={1.0} count={4} color="#3A4C70" seed={32} />
      <Walkers f={f} y={790} scale={1.55} count={2} color="#24324E" seed={33} speedMul={1.5} />
    </Svg>
    <Vignette strength={0.5} />
  </Stage>
);

// 13 通路の脇に、黒い箱（写真）がポツンと立つ
const S13: React.FC<P> = ({f, R}) => {
  const pod = reveal(f, R("pod"), 12);
  return (
    <Stage>
      <Svg>
        <StationHall frame={f} speed={0.8} />
        <Walkers f={f} y={560} scale={0.6} count={8} opacity={0.6} seed={41} />
        <ellipse cx="1480" cy="790" rx="220" ry="30" fill="#000" opacity={0.5 * pod} />
        <path d="M1380 90 L1580 90 L1720 790 L1240 790 Z" fill={C.gold} opacity={0.07 * pod} />
      </Svg>
      <Pod x={1480} y={800} height={620} opacity={pod} style={{transform: `translateY(${(1 - pod) * 30}px)`}} />
      <Svg>
        <Walkers f={f} y={660} scale={1.0} count={5} color="#3A4C70" seed={42} />
      </Svg>
    </Stage>
  );
};

// 14 ブースの断面：ドアが閉まり、外の騒がしさが遠のく
const S14: React.FC<P> = ({f, R}) => {
  const door = reveal(f, 6, 10);
  const mute = reveal(f, R("mute"), 30);
  const desk = reveal(f, R("desk"), 14);
  return (
    <Stage>
      <div style={{position: "absolute", inset: 0, filter: `blur(${mute * 7}px) brightness(${1 - mute * 0.5})`}}>
        <Svg>
          <StationHall frame={f} speed={0.8} />
          <Walkers f={f} y={600} scale={0.95} count={9} color="#3A4C70" seed={51} />
        </Svg>
      </div>
      <Svg>
        <rect x="560" y="150" width="800" height="650" fill="#0A0E18" stroke="#2A3550" strokeWidth="14" />
        <rect x="580" y="170" width="760" height="610" fill={`rgba(210,164,81,${0.04 + desk * 0.1})`} />
        <path d={`M1360 ${150 + (1 - door) * 0} V800`} stroke={C.gold} strokeWidth="6" opacity={door} />
        <rect x={1360 - 40 * door} y="160" width="30" height="630" fill="#1C263D" opacity={door} />
        <ellipse cx="1060" cy="330" rx="200" ry="120" fill={C.gold} opacity={0.12 * desk} />
        <rect x="1000" y="250" width="16" height="120" fill={C.paper} opacity={desk} />
        <rect x="900" y="560" width="380" height="18" fill="#5C4430" />
        <rect x="920" y="578" width="14" height="210" fill="#3A2B22" />
        <rect x="1250" y="578" width="14" height="210" fill="#3A2B22" />
        <rect x="1010" y="440" width="190" height="120" rx="8" fill="#0A0F1B" stroke="#40526A" strokeWidth="6" />
        <rect x="1024" y="454" width="162" height="84" fill={`rgba(24,52,71,${0.5 + desk * 0.5})`} />
        <StickPerson x={800} y={662} scale={0.95} pose="sit" color={C.teal} />
        <rect x="640" y="662" width="200" height="16" fill="#2B2A36" />
        <g transform="translate(180 170)">
          <path d="M0 30 H22 L50 6 V94 L22 70 H0 Z" fill={C.paper} />
          {[0, 1, 2, 3, 4].map((k) => {
            const h = (40 + rand(k + Math.floor(f / 4)) * 80) * (1 - mute * 0.85);
            return <rect key={k} x={76 + k * 26} y={50 - h / 2} width="16" height={h} rx="6" fill={C.gold} />;
          })}
        </g>
      </Svg>
    </Stage>
  );
};

// 15 肩越し：ガラスの向こうを通勤客が早足で通る → テレビ画面のように遠い
const S15: React.FC<P> = ({f, R}) => {
  const suit = reveal(f, R("suit"), 12);
  const tv = reveal(f, R("tv"), 16);
  return (
    <Stage bg="#070A12">
      <Svg>
        <rect x="260" y="110" width="1400" height="640" fill="#101728" />
      </Svg>
      <div style={{position: "absolute", left: 260, top: 110, width: 1400, height: 640, overflow: "hidden", filter: `saturate(${1 - tv * 0.6}) blur(${tv * 1.2}px)`}}>
        <svg viewBox="260 110 1400 640" width={1400} height={640}>
          <StationHall frame={f} speed={0.5} />
          <g opacity={suit}>
            <Walkers f={f} y={520} scale={1.25} count={6} color="#1E2A44" seed={61} speedMul={1.8} />
          </g>
        </svg>
        <div style={{position: "absolute", inset: 0, opacity: tv, background: "repeating-linear-gradient(180deg, rgba(0,0,0,0.35) 0 3px, transparent 3px 7px)"}} />
      </div>
      <Svg>
        <rect x="260" y="110" width="1400" height="640" fill="none" stroke={tv > 0.02 ? "#1B1F2B" : "#2A3550"} strokeWidth={14 + tv * 50} rx={tv * 40} />
        <rect x="140" y="760" width="1640" height="40" fill="#5C4430" />
        <StickPerson x={640} y={900} scale={1.8} pose="sit" color="#27324A" />
      </Svg>
      <GlitchBands f={f} at={R("tv")} />
    </Stage>
  );
};

// 16 ブースから引いていき、駅、そして街全体へ
const S16: React.FC<P> = ({f, R}) => {
  const pull = lerp(f, [R("pull") - 6, R("pull") + 70], [0, 1]);
  const s = interpolate(pull, [0, 1], [1, 0.34]);
  return (
    <Stage>
      <Svg>
        <rect width="1920" height="1080" fill="#0A0E1B" />
        <CitySkyline frame={f} speed={0.2} lit={0.4 + pull * 0.4} />
      </Svg>
      <div style={{position: "absolute", inset: 0, transform: `scale(${s})`, transformOrigin: "960px 700px"}}>
        <Svg>
          <StationHall frame={f} speed={0.2} dim={0.2} signs={false} />
          <Walkers f={f} y={560} scale={0.6} count={6} opacity={0.6} seed={71} />
        </Svg>
        <Pod x={960} y={800} height={640} />
      </div>
      <Svg>
        <Arrow x1={720} x2={960} y={200} progress={reveal(f, R("pull") + 6, 16)} />
      </Svg>
      <KeyText id="s16-a" text="個人の心" x={440} y={150} frame={f} at={10} size={72} />
      <KeyText id="s16-b" text="社会全体の仕組み" x={1400} y={150} frame={f} at={R("pull")} size={72} />
    </Stage>
  );
};

// 17 街のシルエット＋歪み
const S17: React.FC<P> = ({f, R}) => (
  <Stage>
    <ShaderBg frame={f} warm={0.2} />
    <Svg>
      <FlowLines frame={f} count={120} box={[0, 60, 1920, 520]} hue="158,62,71" seed={5} />
      <CitySkyline frame={f} speed={0.8} />
    </Svg>
    <KeyText id="s17-key" text="街の作りそのもの" x={960} y={210} frame={f} at={R("kp")} size={84} />
  </Stage>
);

// 18 研究カード（ソジャ）＋ロサンゼルスの街区図
const S18: React.FC<P> = ({f, R}) => {
  const city = reveal(f, R("city"), 14);
  return (
    <Stage>
      <ShaderBg frame={f} warm={0.35} />
      <StudyCard id="s18-card" f={f} place="都市について研究" role="学者" name="エドワード・ソジャ" year="1996" yearAt={R("year")} />
      <Svg>
        <g opacity={city}>
          {Array.from({length: 7}, (_, i) => (
            <DrawPath key={`a${i}`} d={`M1150 ${220 + i * 80} H1770`} progress={city} stroke="rgba(215,204,181,0.35)" width={3} />
          ))}
          {Array.from({length: 7}, (_, i) => (
            <DrawPath key={`b${i}`} d={`M${1160 + i * 100} 200 V720`} progress={city} stroke="rgba(215,204,181,0.35)" width={3} />
          ))}
          <path d="M1440 420 C1440 380 1500 380 1500 420 C1500 460 1470 480 1470 510 C1470 480 1440 460 1440 420 Z" fill={C.red} />
        </g>
        <text data-layout-box="s18-city" x="1460" y="770" textAnchor="middle" fill={C.white} opacity={city} fontFamily={FONT} fontWeight={900} fontSize="40">
          ロサンゼルス
        </text>
      </Svg>
    </Stage>
  );
};

// 19 広場を真上から：フェンス → ブースに区切る → 半年間
const S19: React.FC<P> = ({f, R}) => {
  const fence = reveal(f, R("fence"), 30);
  const booths = reveal(f, R("booths"), 24);
  const half = lerp(f, [R("half"), R("half") + 90], [0, 1]);
  const px = 460;
  const py = 120;
  const pw = 1000;
  const ph = 640;
  return (
    <Stage>
      <Svg>
        <rect width="1920" height="1080" fill="#0B1020" />
        <rect x={px} y={py} width={pw} height={ph} fill="#15201D" />
        <clipPath id="plaza">
          <rect x={px} y={py} width={pw} height={ph} />
        </clipPath>
        <g clipPath="url(#plaza)">
          <CrowdDots frame={f * (1 - booths * 0.85)} count={70} area={[py + 30, py + ph - 30]} />
        </g>
        <DrawPath d={`M${px} ${py} H${px + pw} V${py + ph} H${px} Z`} progress={fence} stroke={C.paper} width={8} />
        {Array.from({length: 4}, (_, i) => (
          <DrawPath key={`v${i}`} d={`M${px + (i + 1) * 200} ${py} V${py + ph}`} progress={booths} stroke={C.gold} width={5} />
        ))}
        <DrawPath d={`M${px} ${py + 320} H${px + pw}`} progress={booths} stroke={C.gold} width={5} />
        {Array.from({length: 6}, (_, i) => (
          <rect key={i} x={1560 + i * 44} y="380" width="34" height="90" rx="6" fill={half * 6 > i + 0.5 ? C.gold : "#1C263D"} opacity={reveal(f, R("half"), 10)} />
        ))}
        <text data-layout-box="s19-half" x="1680" y="330" textAnchor="middle" fill={C.white} opacity={reveal(f, R("half"), 10)} fontFamily={FONT} fontWeight={900} fontSize="48">
          半年間
        </text>
      </Svg>
    </Stage>
  );
};

// 20 防犯カメラが増える ／ もとの広場とブース内の比較（約3倍）
const S20: React.FC<P> = ({f, R}) => {
  const g = reveal(f, R("bars"), 20);
  const m = reveal(f, R("metric"), 10);
  const base = 740;
  return (
    <Stage>
      <ShaderBg frame={f} warm={0.2} hue="rose" />
      <Svg>
        {Array.from({length: 9}, (_, i) => {
          const r = reveal(f, 6 + i * 7, 8);
          return (
            <g key={i} transform={`translate(${220 + i * 180} 150)`} opacity={r}>
              <rect x="-40" y="-20" width="80" height="40" rx="8" fill={C.indigo} stroke={C.paper} strokeWidth="3" />
              <circle cx="30" cy="0" r="10" fill={C.red} />
              <path d="M-10 20 V44" stroke={C.paper} strokeWidth="4" />
            </g>
          );
        })}
        <path d={`M200 ${base} H980`} stroke={C.dim} strokeWidth="3" />
        {[
          {label: "もとの広場", v: 1, x: 300, c: C.indigo},
          {label: "ブースの中", v: 3, x: 640, c: C.gold},
        ].map((b, i) => {
          const h = 140 * b.v * g;
          return (
            <g key={b.label}>
              <rect x={b.x} y={base - h} width="200" height={h} rx="6" fill={b.c} />
              <text data-layout-box={`s20-bar-${i}`} x={b.x + 100} y={base + 50} textAnchor="middle" fill={C.white} fontFamily={FONT} fontWeight={700} fontSize="32">
                {b.label}
              </text>
            </g>
          );
        })}
        <text data-layout-box="s20-axis" x="200" y="290" fill={C.dim} fontFamily={FONT} fontWeight={700} fontSize="30">
          ルールを破るいたずらや迷惑行為
        </text>
      </Svg>
      <div data-layout-box="s20-metric" style={{position: "absolute", left: 1150, top: 380, opacity: m, transform: `translateY(${(1 - m) * 20}px)`, fontFamily: FONT, color: C.white}}>
        <div style={{fontSize: 34, fontWeight: 700, color: C.dim, marginBottom: 12}}>もとの広場の</div>
        <div style={{display: "inline-flex", alignItems: "baseline", gap: 16, whiteSpace: "nowrap"}}>
          <span style={{fontSize: 170, fontWeight: 900}}>約3</span>
          <span style={{fontSize: 70, fontWeight: 900, color: C.gold}}>倍</span>
        </div>
      </div>
    </Stage>
  );
};

// 21 見守り合う視線 → 個室の壁が立ち、線が切れる
const S21: React.FC<P> = ({f, R}) => {
  const walls = reveal(f, R("walls"), 24);
  const people = [
    [520, 520],
    [800, 430],
    [1120, 430],
    [1400, 520],
    [720, 690],
    [1200, 690],
  ];
  return (
    <Stage>
      <ShaderBg frame={f} warm={0.2} />
      <Svg>
        {people.map((a, i) =>
          people.slice(i + 1).map((b, j) => (
            <line key={`${i}-${j}`} x1={a[0]} y1={a[1] - 150} x2={b[0]} y2={b[1] - 150} stroke={walls > 0.5 ? C.red : C.gold} strokeWidth="3" strokeDasharray="10 12" opacity={0.6 * (1 - walls) + 0.12} />
          )),
        )}
        {people.map(([x, y], i) => (
          <g key={i}>
            <StickPerson x={x} y={y - 60} scale={0.6} pose="stand" color={C.paper} />
            <rect x={x - 80} y={y + 44 - 250 * walls} width="160" height={250 * walls} fill="rgba(20,28,46,0.85)" stroke={C.indigo} strokeWidth="5" />
          </g>
        ))}
      </Svg>
      <KeyText id="s21-key" text="自然なブレーキ" x={960} y={96} frame={f} at={R("kp")} size={76} />
    </Stage>
  );
};

// 22 昔の待合室：ベンチを分け合い、互いの目がある
const S22: React.FC<P> = ({f, R}) => {
  const eyes = reveal(f, R("eyes"), 30);
  const seats = [560, 760, 960, 1160];
  return (
    <Stage>
      <Svg>
        <StationHall frame={f} speed={0.15} sepia />
        <rect x="440" y="600" width="860" height="26" rx="8" fill="#6B4B32" />
        <rect x="460" y="626" width="20" height="120" fill="#4A3424" />
        <rect x="1260" y="626" width="20" height="120" fill="#4A3424" />
        {seats.map((x, i) => (
          <StickPerson key={x} x={x} y={600} scale={0.85} pose="sit" color={["#C9B48E", "#A89272", "#C9B48E", "#A89272"][i]} flip={i % 2 === 1} />
        ))}
        <StickPerson x={1480} y={560} scale={1} pose="stand" color="#C9B48E" flip />
        {seats.concat([1480]).map((x, i, arr) =>
          i < arr.length - 1 ? (
            <DrawPath key={i} d={`M${x} 420 Q${(x + arr[i + 1]) / 2} 360 ${arr[i + 1]} ${i === arr.length - 2 ? 380 : 420}`} progress={eyes} stroke={C.gold} width={3} />
          ) : null,
        )}
      </Svg>
      <AbsoluteFill style={{background: "rgba(120,80,40,0.12)", mixBlendMode: "soft-light"}} />
    </Stage>
  );
};

// 23 共有スペースに有料のカプセル（写真）が次々と立つ
const S23: React.FC<P> = ({f, R}) => {
  const pods = [
    {x: 360, h: 430, d: 0},
    {x: 760, h: 500, d: 8},
    {x: 1170, h: 540, d: 16},
    {x: 1570, h: 470, d: 24},
  ];
  return (
    <Stage>
      <Svg>
        <StationHall frame={f} speed={0.2} dim={0.3} signs={false} />
      </Svg>
      {pods.map((p, i) => {
        const r = reveal(f, R("pods") + p.d, 14);
        const tag = reveal(f, R("yen") + i * 4, 8);
        return (
          <div key={i}>
            <div style={{position: "absolute", left: 0, top: 0, width: 1920, height: 800, overflow: "hidden"}}>
              <Pod x={p.x} y={800 + (1 - r) * p.h} height={p.h} />
            </div>
            <div
              data-layout-box={`s23-tag-${i}`}
              style={{position: "absolute", left: p.x, top: 800 - p.h - 70, transform: `translate(-50%, ${(1 - tag) * 12}px)`, opacity: tag, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.night, background: C.gold, borderRadius: 999, padding: "4px 22px", whiteSpace: "nowrap"}}
            >
              ¥ 有料
            </div>
          </div>
        );
      })}
    </Stage>
  );
};

// 24 みんなのマナー × 自分の部屋の自由 → 衝突して隙間
const S24: React.FC<P> = ({f, R}) => {
  const free = reveal(f, R("free"), 12);
  const crash = lerp(f, [R("free") + 10, R("crash")], [0, 1]);
  const crack = reveal(f, R("crack"), 16);
  const lx = interpolate(crash, [0, 1], [560, 730]);
  const rx = interpolate(crash, [0, 1], [1360, 1190]);
  return (
    <Stage>
      <ShaderBg frame={f} warm={0.3} />
      <Svg>
        <circle cx={lx} cy="390" r="250" fill="rgba(99,138,138,0.22)" stroke={C.teal} strokeWidth="6" />
        <circle cx={rx} cy="390" r="250" fill="rgba(210,164,81,0.18)" stroke={C.gold} strokeWidth="6" opacity={free} />
        <text data-layout-box="s24-l" x={lx - 30} y="400" textAnchor="middle" fill={C.white} fontFamily={FONT} fontWeight={900} fontSize="40">
          みんなのマナー
        </text>
        <text data-layout-box="s24-r" x={rx + 30} y="400" textAnchor="middle" fill={C.white} opacity={free} fontFamily={FONT} fontWeight={900} fontSize="40">
          自分の部屋の自由
        </text>
        <DrawPath d="M960 120 L930 220 L985 300 L935 400 L990 500 L945 600 L975 680" progress={crack} stroke={C.red} width={10} />
      </Svg>
      <KeyText id="s24-key" text="大きな隙間" x={960} y={640} frame={f} at={R("crack")} size={80} glitch />
      <GlitchBands f={f} at={R("crack")} />
    </Stage>
  );
};

// 25 文字だけの転換
const S25: React.FC<P> = ({f, R}) => (
  <Stage>
    <ShaderBg frame={f} warm={0.15} />
    <KeyText id="s25-a" text="モラルを麻痺" x={960} y={220} frame={f} at={R("kp1")} size={92} />
    <KeyText id="s25-b" text="そもそもなぜ" x={960} y={470} frame={f} at={R("kp2")} size={92} />
  </Stage>
);

// 26 常時接続の網が人に絡みつく → SOS
const Net: React.FC<{f: number; cx: number; cy: number; tight: number; cut?: number}> = ({f, cx, cy, tight, cut = -1}) => (
  <g>
    {Array.from({length: 26}, (_, i) => {
      const a = (i / 26) * Math.PI * 2 + rand(i) * 0.2;
      const R0 = 330 + rand(i + 5) * 260;
      const nx = cx + Math.cos(a + f * 0.002) * R0;
      const ny = cy - 120 + Math.sin(a + f * 0.002) * R0 * 0.62;
      const tx = cx + Math.cos(a) * 40 * (1 - tight);
      const ty = cy - 130 + Math.sin(a) * 60;
      const gone = cut >= 0 && i / 26 < cut;
      return (
        <g key={i} opacity={gone ? 0 : 1}>
          <line x1={nx} y1={ny} x2={tx} y2={ty} stroke="rgba(99,210,220,0.35)" strokeWidth={2 + tight * 2} />
          <circle cx={nx} cy={ny} r="10" fill="#9DEBFA" opacity="0.8" />
        </g>
      );
    })}
  </g>
);

const S26: React.FC<P> = ({f, R}) => {
  const tight = lerp(f, [R("net") - 10, R("net") + 50], [0.2, 1]);
  const ring = ((f - R("kp")) % 40) / 40;
  const sos = reveal(f, R("kp"), 10);
  return (
    <Stage>
      <Svg>
        <rect width="1920" height="1080" fill="#080C18" />
        <Net f={f} cx={960} cy={560} tight={tight} />
        <circle cx="960" cy="430" r={120 + ring * 140} fill="none" stroke={C.red} strokeWidth="5" opacity={sos * (1 - ring) * 0.8} />
        <StickPerson x={960} y={560} scale={1.1} pose="stand" color={C.paper} phone />
      </Svg>
      <KeyText id="s26-key" text="SOS" x={1480} y={220} frame={f} at={R("kp")} size={130} />
    </Stage>
  );
};

// 27 研究カード（タークル）
const S27: React.FC<P> = ({f, R}) => (
  <Stage>
    <ShaderBg frame={f} warm={0.35} />
    <StudyCard id="s27-card" f={f} place="働く大人を追いかけた調査" role="学者" name="シェリー・タークル" year="2011" yearAt={R("year")} extra={{label: "働く大人", value: "200", unit: "人", at: R("n")}} />
    <PeopleGrid f={f} at={R("n")} x={1230} y={260} cols={5} rows={3} color={C.gold} />
  </Stage>
);

// 28 通知が止まらない → 1日1時間、閉まり切った部屋へ
const S28: React.FC<P> = ({f, R}) => {
  const room = reveal(f, R("door"), 20);
  const timer = lerp(f, [R("room"), R("room") + 200], [0, 1]);
  const badges = [
    [620, 260],
    [1300, 240],
    [540, 520],
    [1380, 500],
    [760, 160],
    [1160, 150],
  ];
  return (
    <Stage>
      <ShaderBg frame={f} warm={0.2} />
      <Svg>
        {badges.map(([x, y], i) => {
          const r = reveal(f, 8 + i * 16, 8);
          const blocked = room;
          return (
            <g key={i} opacity={r * (1 - blocked * 0.8)} transform={`translate(${x} ${y}) scale(${0.8 + r * 0.2})`}>
              <rect x="-70" y="-34" width="140" height="68" rx="16" fill="#1B2438" stroke="#2E3A56" strokeWidth="3" />
              <circle cx="-38" cy="0" r="16" fill={C.teal} />
              <rect x="-12" y="-12" width="66" height="8" rx="4" fill={C.dim} />
              <rect x="-12" y="4" width="44" height="8" rx="4" fill={C.dim} opacity="0.6" />
              <circle cx="66" cy="-30" r="14" fill={C.red} />
            </g>
          );
        })}
        <rect x={960 - 230} y={200 + (1 - room) * 20} width="460" height="560" fill="rgba(10,14,24,0.9)" stroke={C.paper} strokeWidth="8" opacity={room} />
        <StickPerson x={960} y={560} scale={1.05} pose="stand" color={C.paper} phone />
        <g transform="translate(1560 620)" opacity={reveal(f, R("room"), 10)}>
          <circle r="90" fill="none" stroke="#1C263D" strokeWidth="18" />
          <circle r="90" fill="none" stroke={C.gold} strokeWidth="18" pathLength={1} strokeDasharray="1 1" strokeDashoffset={-timer} transform="rotate(-90)" />
          <text data-layout-box="s28-hour" x="0" y="16" textAnchor="middle" fill={C.white} fontFamily={FONT} fontWeight={900} fontSize="46">
            1<tspan dx="4" fontSize="30" fill={C.gold}>時間</tspan>
          </text>
        </g>
      </Svg>
    </Stage>
  );
};

// 29 約70％（円グラフ）と、ルール／解放感の天秤
const S29: React.FC<P> = ({f, R}) => {
  const m = reveal(f, R("metric"), 10);
  const fill = lerp(f, [R("metric") - 4, R("metric") + 40], [0, 0.7]);
  const tilt = lerp(f, [R("scale") - 6, R("scale") + 24], [0, 1]);
  const ang = tilt * 16;
  const bx = 1380;
  const by = 330;
  const arm = 260;
  const lx = bx - Math.cos((ang * Math.PI) / 180) * arm;
  const ly = by - Math.sin((ang * Math.PI) / 180) * arm;
  const rx = bx + Math.cos((ang * Math.PI) / 180) * arm;
  const ry = by + Math.sin((ang * Math.PI) / 180) * arm;
  const sc = reveal(f, R("scale") - 8, 16);
  return (
    <Stage>
      <ShaderBg frame={f} warm={0.25} />
      <Svg>
        <g transform="translate(560 430)">
          <circle r="230" fill="none" stroke="#1C263D" strokeWidth="56" />
          <circle r="230" fill="none" stroke={C.gold} strokeWidth="56" pathLength={1} strokeDasharray={`${fill} 1`} transform="rotate(-90)" />
          <text data-layout-box="s29-value" x="0" y="40" textAnchor="middle" fill={C.white} opacity={m} fontFamily={FONT} fontWeight={900} fontSize="120">
            約70<tspan dx="8" fontSize="56" fill={C.gold}>％</tspan>
          </text>
        </g>
        <g opacity={sc}>
          <path d={`M${bx} ${by} V720`} stroke={C.paper} strokeWidth="10" />
          <path d={`M${bx - 90} 720 H${bx + 90}`} stroke={C.paper} strokeWidth="10" strokeLinecap="round" />
          <path d={`M${lx} ${ly} L${rx} ${ry}`} stroke={C.paper} strokeWidth="8" />
          <path d={`M${lx} ${ly} L${lx - 70} ${ly + 110} H${lx + 70} Z`} fill="none" stroke={C.teal} strokeWidth="5" />
          <path d={`M${rx} ${ry} L${rx - 70} ${ry + 110} H${rx + 70} Z`} fill="none" stroke={C.gold} strokeWidth="5" />
          <text data-layout-box="s29-rule" x={lx} y={ly + 160} textAnchor="middle" fill={C.white} fontFamily={FONT} fontWeight={900} fontSize="38">
            ルール
          </text>
          <text data-layout-box="s29-free" x={rx} y={ry + 160} textAnchor="middle" fill={C.white} fontFamily={FONT} fontWeight={900} fontSize="38">
            解放感
          </text>
        </g>
      </Svg>
    </Stage>
  );
};

// 30 繋がりの線が切れ、ブレーキが外れて落ちる
const S30: React.FC<P> = ({f, R}) => {
  const cut = lerp(f, [R("cut"), R("brake")], [0, 1]);
  const drop = lerp(f, [R("brake"), R("brake") + 40], [0, 1]);
  const on = reveal(f, R("brake") - 12, 8);
  return (
    <Stage>
      <Svg>
        <rect width="1920" height="1080" fill="#080C18" />
        <Net f={f} cx={960} cy={560} tight={0.9} cut={cut} />
        <StickPerson x={960} y={560} scale={1.1} pose="stand" color={C.paper} />
        <g transform={`translate(${1250 + drop * 60} ${330 + drop * 420}) rotate(${drop * 80})`} opacity={on * (1 - drop * 0.3)}>
          <circle r="70" fill="none" stroke={C.red} strokeWidth="12" />
          <path d="M-96 -50 A110 110 0 0 0 -96 50 M96 -50 A110 110 0 0 1 96 50" fill="none" stroke={C.red} strokeWidth="10" strokeLinecap="round" />
          <rect x="-8" y="-40" width="16" height="50" rx="6" fill={C.red} />
          <circle cx="0" cy="32" r="9" fill={C.red} />
        </g>
      </Svg>
    </Stage>
  );
};

// 31 雨の夜の街で、箱（写真）だけが暖かく灯る
const S31: React.FC<P> = ({f, R}) => {
  const glow = reveal(f, R("glow"), 40);
  return (
    <Stage bg="#070A14">
      <Svg>
        <rect width="1920" height="1080" fill="#070A14" />
        <CitySkyline frame={f} speed={0.5} lit={0.5} />
        <rect y="800" width="1920" height="280" fill="#060910" />
        <ellipse cx="960" cy="820" rx={260 + glow * 120} ry="40" fill={C.gold} opacity={0.08 + glow * 0.18} />
      </Svg>
      <Pod x={960} y={810} height={640} brightness={0.7 + glow * 0.25} glow={glow} />
      <Svg>
        <Rain frame={f} ground={1080} />
      </Svg>
    </Stage>
  );
};

// 32 箱の中の人影（写真の上にシルエット）へ寄る
const S32: React.FC<P> = ({f, R, dur}) => {
  const push = interpolate(f, [0, dur], [1, 1.08]);
  return (
    <Stage>
      <ShaderBg frame={f} warm={0.2} />
      <div style={{position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: "1320px 540px"}}>
        <Pod x={1320} y={1050} height={980} brightness={0.72}>
          <svg viewBox="0 0 948 1712" style={{position: "absolute", inset: 0, width: "100%", height: "100%"}}>
            <g opacity="0.72">
              <StickPerson x={560} y={1090} scale={3.1} pose="sit" color="#0B101C" />
            </g>
          </svg>
        </Pod>
      </div>
      <KeyText id="s32-key" text="言い切れますか" x={520} y={380} frame={f} at={R("kp")} size={88} glitch />
      <GlitchBands f={f} at={R("kp")} />
    </Stage>
  );
};

// 33 社会を科学する（線画のタイトル）
const S33: React.FC<P> = ({f}) => (
  <Stage>
    <ShaderBg frame={f} warm={0.6} />
    <Svg>
      <DrawPath d="M560 360 H1360 V640 H560 Z" progress={reveal(f, 12, 36)} stroke={C.gold} width={4} />
    </Svg>
    <KeyText id="s33-key" text="社会を科学する" x={960} y={430} frame={f} at={8} size={96} />
  </Stage>
);

// 34 コメント欄に問いが入力されていく
const S34: React.FC<P> = ({f, R}) => {
  const text = "駅のあの個室に入ったら、どんな気分になる？";
  const n = Math.floor(interpolate(f, [R("type") - 30, R("type") + 60], [0, text.length], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}));
  const open = reveal(f, 6, 12);
  return (
    <Stage>
      <ShaderBg frame={f} warm={0.3} />
      <Panel id="s34-panel" style={{left: 300, top: 220, width: 1320, padding: "40px 48px", opacity: open, transform: `translateY(${(1 - open) * 20}px)`}}>
        <div style={{fontSize: 34, fontWeight: 900, letterSpacing: 4, color: C.dim}}>コメント</div>
        <div style={{display: "flex", gap: 26, alignItems: "center", marginTop: 26}}>
          <div style={{width: 84, height: 84, borderRadius: 42, background: C.teal, flexShrink: 0}} />
          <div style={{flex: 1, borderBottom: `3px solid ${C.gold}`, paddingBottom: 12, fontSize: 44, fontWeight: 700, minHeight: 64, whiteSpace: "nowrap"}}>
            {text.slice(0, n)}
            <span style={{opacity: Math.floor(f / 15) % 2 ? 1 : 0, color: C.gold}}>｜</span>
          </div>
        </div>
      </Panel>
    </Stage>
  );
};

// 35 チャンネル登録ボタン
const S35: React.FC<P> = ({f, R}) => {
  const b = reveal(f, R("btn"), 10);
  const pulse = ((f - R("btn")) % 36) / 36;
  return (
    <Stage>
      <ShaderBg frame={f} warm={0.5} />
      <Svg>
        <rect x={960 - 330 - pulse * 40} y={500 - 70 - pulse * 40} width={660 + pulse * 80} height={140 + pulse * 80} rx={110} fill="none" stroke={C.red} strokeWidth="6" opacity={b * (1 - pulse)} />
      </Svg>
      <div
        data-layout-box="s35-btn"
        style={{position: "absolute", left: 960, top: 430, transform: `translate(-50%, 0) scale(${0.9 + b * 0.1})`, opacity: 0.35 + 0.65 * b, background: C.red, color: C.white, fontFamily: FONT, fontWeight: 900, fontSize: 64, borderRadius: 999, padding: "22px 80px", display: "flex", alignItems: "center", gap: 26, whiteSpace: "nowrap", boxShadow: `0 0 ${60 * b}px rgba(158,62,71,0.7)`}}
      >
        <svg width="56" height="56" viewBox="0 0 56 56"><path d="M28 6 C18 6 14 14 14 24 V34 L8 42 H48 L42 34 V24 C42 14 38 6 28 6 Z M22 46 C22 52 34 52 34 46" fill={C.white} /></svg>
        チャンネル登録
      </div>
    </Stage>
  );
};

const SCENES: Record<number, React.FC<P>> = {
  1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9, 10: S10,
  11: S11, 12: S12, 13: S13, 14: S14, 15: S15, 16: S16, 17: S17, 18: S18, 19: S19, 20: S20,
  21: S21, 22: S22, 23: S23, 24: S24, 25: S25, 26: S26, 27: S27, 28: S28, 29: S29, 30: S30,
  31: S31, 32: S32, 33: S33, 34: S34, 35: S35,
};

export const StoryScene: React.FC<{scene: Scene}> = ({scene}) => {
  const f = useCurrentFrame();
  const start = Math.round(scene.start * 30);
  const dur = Math.max(1, Math.round(scene.duration * 30));
  const n = scene.visual.variant || 1;
  const R = (key: string) => {
    const abs = scene.reveals?.[key];
    if (abs === undefined) throw new Error(`${scene.id} に reveal「${key}」がありません`);
    return abs - start;
  };
  const Comp = SCENES[n];
  return <Comp f={f} R={R} dur={dur} n={n} />;
};
