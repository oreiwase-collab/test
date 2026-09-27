
import {Aurora, C, FONT, KeyText, Label, lerp, NetworkLines, Person, PodDefs, PodPhoto, PodSVG, rnd, rv, Skyline, StudyCard, Svg} from "./kit";
import type {SceneProps} from "./kit";

/* 25 転換 — words only */
export const S25: React.FC<SceneProps> = ({f, R}) => (
  <>
    <div style={{position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, #151D30, ${C.night} 70%)`}} />
    <KeyText id="s25-a" text="便利さの追求がモラルを麻痺させた" x={960} y={230} size={60} width={1500} reveal={lerp(f, 0, 12, 0, 1)} bar={false} color={C.dim} />
    <KeyText id="s25-b" text={"なぜ私たちは\n個室を必要とした？"} x={960} y={420} size={88} width={1200} reveal={rv(f, R.q2, 12)} />
  </>
);

/* 26 繋がり続ける疲れから逃げ出すSOS */
const ring = (n: number, cx: number, cy: number, r: number) =>
  Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return {x: cx + Math.cos(a) * r * (1 + rnd(i) * 0.25), y: cy + Math.sin(a) * r * 0.62 * (1 + rnd(i * 3) * 0.25)};
  });

export const S26: React.FC<SceneProps> = ({f, R}) => {
  const hours = rv(f, R.hours, 12);
  const sos = rv(f, R.sos, 8);
  const blink = f > (R.sos ?? 1e9) + 6 ? 0.75 + 0.25 * Math.sign(Math.sin(f / 4)) : sos;
  const nodes = ring(14, 960, 520, 520);
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill="#0A0F1A" />
        <NetworkLines f={f} nodes={nodes} hub={{x: 960, y: 630}} />
        <Person x={960} y={690} scale={1.1} pose="stand" phone color={C.paper} />
      </Svg>
      <Label id="s26-hours" text="24時間 繋がり続ける" x={960} y={140} size={36} align="center" reveal={hours} color={C.teal} />
      <KeyText id="s26-sos" text="SOS" x={1560} y={360} size={120} width={420} reveal={blink} color="#F2D6D6" />
    </>
  );
};

/* 27 タークルの調査 — study card */
export const S27: React.FC<SceneProps> = ({f, R}) => (
  <>
    <Aurora f={f} tint="rgba(39,50,74,0.8)" tint2="rgba(158,62,71,0.14)" />
    <StudyCard id="s27" f={f} R={R} org="働く大人の追跡調査" name="シェリー・タークル" topic="スマホで繋がり続ける人たち" year="2011年" count={200} />
  </>
);

/* 28 通知が止まる閉まり切った部屋 */
export const S28: React.FC<SceneProps> = ({f, R}) => {
  const notify = Array.from({length: 7}, (_, i) => rv(f, (R.notify ?? 0) + i * 7, 8));
  const room = lerp(f, (R.room ?? 0) - 6, (R.room ?? 0) + 24, 0, 1);
  const feel = rv(f, R.feel, 12);
  const per = 2 * (900 + 620);
  const secs = Math.max(0, 3600 - Math.max(0, f - (R.room ?? f)) * 8);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const pos = [
    [520, 220], [1260, 260], [420, 470], [1340, 520], [600, 700], [1220, 740], [900, 170],
  ];
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill="#0B101B" />
        <rect x={510} y={170} width={900} height={620} fill="#121826" opacity={room} />
        <rect x={510} y={170} width={900} height={620} fill="none" stroke={C.paper} strokeWidth={8} strokeDasharray={`${per * room} ${per}`} />
        <Person x={960} y={700} scale={1.1} pose="stand" phone={room < 0.8} color={C.paper} />
      </Svg>
      {pos.map(([x, y], i) => (
        <div
          key={i}
          data-layout-box={`s28-n${i}`}
          style={{
            position: "absolute",
            left: x - 90,
            top: y - 26,
            width: 180,
            height: 52,
            borderRadius: 26,
            background: "#1C2538",
            border: `2px solid ${C.red}`,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 24,
            color: C.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: notify[i] * (1 - room),
            transform: `scale(${0.8 + notify[i] * 0.2})`,
          }}
        >
          仕事の連絡
        </div>
      ))}
      <div data-layout-box="s28-timer" style={{position: "absolute", left: 1450, top: 200, opacity: room, fontFamily: FONT, whiteSpace: "nowrap"}}>
        <div style={{fontSize: 30, fontWeight: 700, color: C.dim}}>通信オフ 1日1時間</div>
        <div style={{fontSize: 80, fontWeight: 900, color: C.white, fontVariantNumeric: "tabular-nums"}}>{`${mm}:${ss}`}</div>
      </div>
      <Label id="s28-feel" text="どんな気持ちになる？" x={960} y={96} size={34} align="center" reveal={feel} color={C.gold} />
    </>
  );
};

/* 29 約70%が衝動的な行動を望んだ — pie and balance */
export const S29: React.FC<SceneProps> = ({f, R}) => {
  const pie = lerp(f, (R.metric ?? 0) - 6, (R.metric ?? 0) + 30, 0, 0.7);
  const bal = rv(f, R.balance, 24);
  const a = pie * Math.PI * 2;
  const large = pie > 0.5 ? 1 : 0;
  const cx = 520;
  const cy = 480;
  const r = 250;
  const ex = cx + Math.sin(a) * r;
  const ey = cy - Math.cos(a) * r;
  const tilt = bal * 14;
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill={C.night} />
        <circle cx={cx} cy={cy} r={r} fill="#27324A" />
        {pie > 0.001 ? <path d={`M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`} fill={C.gold} /> : null}
        <circle cx={cx} cy={cy} r={120} fill={C.night} />
        <g transform="translate(1340 560)" opacity={bal}>
          <rect x={-8} y={-10} width={16} height={230} fill="#56627A" />
          <path d="M-90 230 L90 230 L0 190 Z" fill="#56627A" />
          <g transform={`rotate(${tilt})`}>
            <rect x={-360} y={-16} width={720} height={14} rx={7} fill={C.paper} />
            <line x1={-330} y1={-10} x2={-330} y2={80} stroke={C.paper} strokeWidth={3} />
            <line x1={330} y1={-10} x2={330} y2={80} stroke={C.paper} strokeWidth={3} />
            <ellipse cx={-330} cy={84} rx={90} ry={16} fill={C.teal} />
            <ellipse cx={330} cy={84} rx={90} ry={16} fill={C.gold} />
          </g>
        </g>
      </Svg>
      <div data-layout-box="s29-metric" style={{position: "absolute", left: cx - 110, top: cy - 60, width: 220, textAlign: "center", fontFamily: FONT, whiteSpace: "nowrap", opacity: rv(f, R.metric, 12)}}>
        <span style={{fontSize: 36, fontWeight: 900, color: C.white}}>約</span>
        <span style={{fontSize: 96, fontWeight: 900, color: C.white}}>70</span>
        <span style={{fontSize: 44, fontWeight: 900, color: C.gold}}>%</span>
      </div>
      <Label id="s29-cap" text="衝動的な行動を強く望んだ人" x={cx} y={770} size={30} align="center" reveal={rv(f, R.metric, 12)} />
      <Label id="s29-rule" text="ルール" x={1340 - 330} y={560 + 120 - Math.sin((bal * 14 * Math.PI) / 180) * 330} size={34} align="center" reveal={bal} color={C.teal} />
      <Label id="s29-free" text="解放感" x={1340 + 330} y={560 + 120 + Math.sin((bal * 14 * Math.PI) / 180) * 330} size={34} align="center" reveal={bal} color={C.gold} />
    </>
  );
};

/* 30 繋がりが切れ、ブレーキも外れる */
export const S30: React.FC<SceneProps> = ({f, R}) => {
  const snap = lerp(f, (R.snap ?? 0) - 6, (R.snap ?? 0) + 40, 0, 1);
  const brake = lerp(f, (R.brake ?? 0) - 4, (R.brake ?? 0) + 22, 0, 1);
  const nodes = ring(14, 960, 500, 520);
  const by = 300 + brake * brake * 520;
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill="#0A0F1A" />
        <NetworkLines f={f} nodes={nodes} hub={{x: 960, y: 630}} cut={snap * 1.05} />
        <Person x={960} y={690} scale={1.1} pose="stand" color={C.paper} />
        <g transform={`translate(1380 ${by}) rotate(${brake * 70})`} opacity={1 - brake * 0.5}>
          <circle r={70} fill="none" stroke={C.red} strokeWidth={10} />
          <path d="M-100 -50 A110 110 0 0 0 -100 50" fill="none" stroke={C.red} strokeWidth={10} />
          <path d="M100 -50 A110 110 0 0 1 100 50" fill="none" stroke={C.red} strokeWidth={10} />
          <rect x={-8} y={-38} width={16} height={46} fill={C.red} />
          <circle cy={28} r={9} fill={C.red} />
        </g>
      </Svg>
      <Label id="s30-brake" text="マナーのブレーキ" x={1380} y={180} size={34} align="center" reveal={rv(f, R.brake, 10)} color={C.red} />
      <Label id="s30-hide" text="隠れ家" x={960} y={140} size={36} align="center" reveal={rv(f, R.snap, 12)} color={C.gold} />
    </>
  );
};

/* 31 現代の隠れ家 — the pod photo glowing on a rainy night street */
export const S31: React.FC<SceneProps> = ({f, R}) => {
  const glow = rv(f, R.glow, 30);
  return (
    <>
      <Svg>
        <Skyline f={f} idPrefix="s31" rain />
      </Svg>
      <div style={{position: "absolute", left: 1000, top: 200, width: 560, height: 760, background: `radial-gradient(ellipse at 50% 55%, rgba(210,164,81,${0.12 + glow * 0.3}), transparent 70%)`}} />
      <PodPhoto x={1280} y={960} h={620} grade={0.45 - glow * 0.15} warm={glow} />
      <Label id="s31-note" text="※写真はイメージです" x={1520} y={300} size={22} color={C.dim} />
      <KeyText id="s31-key" text="現代の隠れ家" x={500} y={300} size={84} width={760} reveal={glow} />
    </>
  );
};

/* 32 自分をコントロールできる？ — slow push into the pod */
export const S32: React.FC<SceneProps> = ({f, R, dur}) => {
  const push = lerp(f, 0, dur, 1, 1.35);
  const q = rv(f, R.question, 12);
  const g = f > dur - 16 ? (f - (dur - 16)) / 16 : 0;
  return (
    <>
      <Svg style={{transform: g ? `translateX(${Math.sin(f * 2.3) * 6}px)` : undefined}}>
        <PodDefs />
        <rect width={1920} height={1080} fill={C.night} />
        <g transform={`translate(760 900) scale(${push}) translate(-760 -900)`}>
          <PodSVG x={760} y={900} s={1.2} lit={0.6} occupant="sit" />
        </g>
      </Svg>
      <KeyText id="s32-q" text={"絶対に\n自分をコントロール\nできますか？"} x={1480} y={250} size={70} width={760} reveal={q} glitch={g} />
    </>
  );
};

/* 33 社会を科学する */
export const S33: React.FC<SceneProps> = ({f}) => {
  const d = lerp(f, 0, 30, 0, 1);
  return (
    <>
      <Aurora f={f} strength={0.8} />
      <Svg>
        <line x1={960 - 420 * d} y1={620} x2={960 + 420 * d} y2={620} stroke={C.gold} strokeWidth={4} />
      </Svg>
      <KeyText id="s33-key" text="社会を科学する" x={960} y={440} size={110} width={1200} reveal={lerp(f, 0, 10, 0, 1)} bar={false} />
    </>
  );
};

/* 34 コメント欄 — typing UI */
export const S34: React.FC<SceneProps> = ({f, R}) => {
  const text = "駅のあの個室に入ったら、どんな気分？";
  const n = Math.round(lerp(f, (R.comment ?? 0) - 30, (R.comment ?? 0) + 40, 0, text.length));
  return (
    <>
      <div style={{position: "absolute", inset: 0, background: `linear-gradient(180deg, #0E1422, ${C.night})`}} />
      <div style={{position: "absolute", left: 360, top: 300, width: 1200, height: 260, borderRadius: 16, background: "#141B2B", border: "2px solid #2C3650", boxShadow: "0 30px 80px rgba(0,0,0,0.45)"}}>
        <div style={{position: "absolute", left: 40, top: 40, width: 90, height: 90, borderRadius: 45, background: C.teal}} />
        <div data-layout-box="s34-input" style={{position: "absolute", left: 160, top: 50, width: 980, fontFamily: FONT, fontWeight: 700, fontSize: 44, color: C.white}}>
          {text.slice(0, n)}
          <span style={{opacity: Math.floor(f / 12) % 2 ? 0 : 1, color: C.gold}}>｜</span>
        </div>
        <div data-layout-box="s34-btn" style={{position: "absolute", right: 40, bottom: 36, padding: "12px 34px", borderRadius: 28, background: n >= text.length ? C.gold : "#2C3650", color: C.night, fontFamily: FONT, fontWeight: 900, fontSize: 30}}>
          コメントする
        </div>
      </div>
      <Label id="s34-title" text="コメント欄で教えてください" x={960} y={190} size={40} align="center" reveal={rv(f, R.comment, 12)} color={C.paper} />
    </>
  );
};

/* 35 チャンネル登録 */
export const S35: React.FC<SceneProps> = ({f, R}) => {
  const b = rv(f, R.button, 10);
  const pulse = f > (R.button ?? 1e9) ? Math.max(0, Math.sin((f - (R.button ?? 0)) / 6)) : 0;
  return (
    <>
      <Aurora f={f} strength={0.7} />
      <div style={{position: "absolute", left: 960, top: 360, transform: `translateX(-50%) scale(${0.9 + b * 0.1 + pulse * 0.03})`, opacity: 0.35 + b * 0.65}}>
        <div style={{position: "absolute", inset: -30, borderRadius: 80, background: C.gold, opacity: 0.18 * pulse, filter: "blur(18px)"}} />
        <div data-layout-box="s35-btn" style={{position: "relative", padding: "34px 80px", borderRadius: 60, background: C.red, color: C.white, fontFamily: FONT, fontWeight: 900, fontSize: 72, whiteSpace: "nowrap", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"}}>
          チャンネル登録
        </div>
      </div>
      <Label id="s35-sub" text="次回もニュースを一緒に深く分析" x={960} y={600} size={36} align="center" color={C.paper} />
    </>
  );
};

