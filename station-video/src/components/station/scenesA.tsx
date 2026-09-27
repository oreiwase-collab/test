import {Aurora, C, CrowdDots, Concourse, FlowField, FONT, KeyText, Label, lerp, Person, PodDefs, PodPhoto, PodSVG, rnd, rv, StudyCard, Svg} from "./kit";
import type {SceneProps} from "./kit";

/* 1 駅のど真ん中 — top-down concourse, one person stops */
export const S01: React.FC<SceneProps> = ({f, R}) => {
  const stop = rv(f, R.stop, 20);
  const px = lerp(f, 0, R.stop ?? 40, 700, 960);
  const pulse = (f - (R.stop ?? 0)) / 30;
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill="#0C111D" />
        {Array.from({length: 4}, (_, i) => (
          <rect key={i} x={330 + i * 420} y={180} width={70} height={70} fill="#1B2335" />
        ))}
        {Array.from({length: 4}, (_, i) => (
          <rect key={`b${i}`} x={330 + i * 420} y={760} width={70} height={70} fill="#1B2335" />
        ))}
        <rect x={0} y={520} width={1920} height={18} fill={C.gold} opacity={0.12} />
        <CrowdDots f={f} n={190} avoid={{x: px, y: 540, r: 70 * stop + 10}} />
        {stop > 0 ? <circle cx={px} cy={540} r={30 + (pulse % 1.4) * 60} fill="none" stroke={C.gold} strokeWidth={3} opacity={Math.max(0, 0.7 - (pulse % 1.4) * 0.5) * stop} /> : null}
        <circle cx={px} cy={540} r={17} fill={C.night} stroke={C.gold} strokeWidth={5} />
        <circle cx={px} cy={540} r={9} fill={C.gold} />
      </Svg>
      <Label id="s01-where" text="駅のコンコース（真上から）" x={150} y={110} size={28} color={C.dim} />
      <KeyText id="s01-key" text="絶対にあり得ない" x={960} y={300} size={96} reveal={rv(f, R.text, 12)} />
    </>
  );
};

/* 2 畳1枚分の箱 — pod appears in the flow, a person enters, glitch */
export const S02: React.FC<SceneProps> = ({f, R}) => {
  const box = rv(f, R.box, 12);
  const enter = rv(f, R.enter, 24);
  const g = R.glitch !== undefined && f >= R.glitch - 4 && f < R.glitch + 14 ? (f - R.glitch + 4) / 18 : 0;
  const walkerX = lerp(f, (R.enter ?? 0) - 40, (R.enter ?? 0) + 12, 520, 900);
  return (
    <>
      <Svg style={{transform: g > 0 ? `translateX(${Math.sin(f * 3) * 8}px)` : undefined}}>
        <PodDefs />
        <rect width={1920} height={1080} fill="#0B101B" />
        <g transform="translate(0 560) scale(1 0.42)">
          <rect width={1920} height={1080} fill="#101828" />
          <CrowdDots f={f} n={200} speed={1.2} avoid={{x: 960, y: 520, r: 300}} />
        </g>
        <g opacity={box} transform={`translate(0 ${(1 - box) * 40})`}>
          <PodSVG x={980} y={830} s={0.92} lit={0.25 + enter * 0.4} occupant={enter > 0.9 ? "sit" : null} door={enter > 0.2 && enter < 0.9 ? 0.8 : 0} />
          <line x1={842} y1={880} x2={1118} y2={880} stroke={C.gold} strokeWidth={3} />
          <line x1={842} y1={866} x2={842} y2={894} stroke={C.gold} strokeWidth={3} />
          <line x1={1118} y1={866} x2={1118} y2={894} stroke={C.gold} strokeWidth={3} />
        </g>
        {enter > 0.02 && enter < 0.95 ? <Person x={walkerX} y={820} scale={0.8} pose="walk" phase={f / 4} color={C.paper} /> : null}
      </Svg>
      <Label id="s02-size" text="畳1枚分" x={1150} y={720} reveal={box} chip color={C.gold} size={28} />
      <KeyText id="s02-key" text="勘違い" x={1560} y={260} size={110} width={600} reveal={rv(f, R.glitch, 8)} glitch={g} />
    </>
  );
};

/* 3 ニュース — news card with the pod photo, date, SNS spread, police */
export const S03: React.FC<SceneProps> = ({f, R}) => {
  const date = rv(f, R.date, 10);
  const photo = rv(f, R.photo, 14);
  const sns = [0, 1, 2].map((i) => rv(f, (R.sns ?? 0) + i * 9, 10));
  const police = rv(f, R.police, 10);
  return (
    <>
      <Aurora f={f} tint="rgba(39,50,74,0.9)" tint2="rgba(158,62,71,0.18)" />
      <div style={{position: "absolute", left: 150, top: 120, width: 760, height: 660, background: "#0E1422", border: "2px solid #27324A", borderRadius: 10, boxShadow: "0 30px 80px rgba(0,0,0,0.5)", overflow: "hidden"}}>
        <div style={{height: 64, background: "#161E30", display: "flex", alignItems: "center", paddingLeft: 28}}>
          <div data-layout-box="s03-news" style={{fontFamily: FONT, fontWeight: 900, fontSize: 28, color: C.paper, letterSpacing: 6}}>ニュース</div>
        </div>
        <div style={{position: "absolute", left: 0, right: 0, top: 64, bottom: 0, background: "linear-gradient(180deg,#1A2233,#0C111C)"}} />
        <div style={{opacity: photo, transform: `scale(${1.04 - photo * 0.04})`}}>
          <PodPhoto x={380} y={600} h={500} grade={0.2} />
        </div>
        <div data-layout-box="s03-note" style={{position: "absolute", left: 24, bottom: 16, fontFamily: FONT, fontWeight: 700, fontSize: 20, color: C.dim, opacity: photo}}>
          ※写真はイメージです（事件の現場ではありません）
        </div>
      </div>
      <div data-layout-box="s03-date" style={{position: "absolute", left: 1010, top: 130, opacity: date, transform: `translateX(${(1 - date) * 30}px)`, fontFamily: FONT, fontWeight: 900, fontSize: 64, lineHeight: 1.1, whiteSpace: "nowrap", color: C.white}}>
        2026年9月
      </div>
      <Label id="s03-where" text="都内の大きな駅・テレワーク用の防音個室" x={1012} y={236} size={28} reveal={date} />
      {sns.map((r, i) => (
        <div
          key={i}
          data-layout-box={`s03-sns-${i}`}
          style={{
            position: "absolute",
            left: 1010 + i * 36,
            top: 310 + i * 96,
            width: 560,
            height: 80,
            borderRadius: 12,
            background: "#161E30",
            border: "2px solid #33405A",
            display: "flex",
            alignItems: "center",
            gap: 18,
            paddingLeft: 20,
            opacity: r,
            transform: `translateY(${(1 - r) * 20}px)`,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 26,
            color: C.white,
          }}
        >
          <div style={{width: 44, height: 44, borderRadius: 22, background: ["#638A8A", "#9E3E47", "#D2A451"][i]}} />
          動画が共有されました
        </div>
      ))}
      <KeyText id="s03-police" text="警察が動く騒ぎに" x={1010} y={640} size={72} width={820} align="left" reveal={police} color="#F2D6D6" />
    </>
  );
};

/* 4 おかしな人 — crowd pointing at one person, label struck through */
export const S04: React.FC<SceneProps> = ({f, R}) => {
  const label = rv(f, R.label, 10);
  const strike = lerp(f, (R.strike ?? 0) - 5, (R.strike ?? 0) + 10, 0, 1);
  const xs = [300, 520, 740, 1180, 1400, 1620];
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill="#0B101B" />
        <ellipse cx={960} cy={760} rx={280} ry={50} fill={C.gold} opacity={0.12} />
        <path d="M860 0 L1060 0 L1180 760 L740 760 Z" fill={C.gold} opacity={0.06} />
        <rect y={760} width={1920} height={320} fill="#080C16" />
        {xs.map((x, i) => (
          <Person key={i} x={x} y={700} scale={0.95} pose="point" flip={x > 960} color="#56627A" />
        ))}
        <Person x={960} y={700} scale={1.05} pose="shrug" color={C.paper} />
        <line x1={806} y1={236} x2={806 + 308 * strike} y2={236} stroke={C.red} strokeWidth={9} strokeLinecap="round" />
      </Svg>
      <Label id="s04-label" text="おかしな人" x={960} y={206} size={46} reveal={label} align="center" />
    </>
  );
};

/* 5 心のスイッチ — brain outline with a switch; flow field inside */
export const S05: React.FC<SceneProps> = ({f, R}) => {
  const box = rv(f, R.box, 12);
  const sw = rv(f, R.switch, 8);
  return (
    <>
      <Svg>
        <defs>
          <clipPath id="s05-head">
            <path d="M560 800 L560 690 C430 650 380 520 420 400 C470 230 640 150 800 170 C980 190 1080 320 1070 470 C1066 540 1110 580 1130 620 L1080 640 L1090 720 C1060 760 990 760 950 760 L950 800 Z" />
          </clipPath>
        </defs>
        <rect width={1920} height={1080} fill={C.night} />
        <g clipPath="url(#s05-head)">
          <rect width={1920} height={1080} fill="#101829" />
          <FlowField f={f} count={120} opacity={0.55} />
        </g>
        <path d="M560 800 L560 690 C430 650 380 520 420 400 C470 230 640 150 800 170 C980 190 1080 320 1070 470 C1066 540 1110 580 1130 620 L1080 640 L1090 720 C1060 760 990 760 950 760 L950 800" fill="none" stroke={C.paper} strokeWidth={6} opacity={0.8} />
        <g transform="translate(760 420)">
          <rect x={-70} y={-120} width={140} height={240} rx={20} fill="#0B0F19" stroke={C.paper} strokeWidth={5} />
          <rect x={-40} y={-90 + sw * 100} width={80} height={80} rx={12} fill={sw > 0.5 ? C.gold : "#3A4458"} />
          <circle cx={0} cy={0} r={160} fill={C.gold} opacity={sw * 0.12} />
        </g>
        <g opacity={box} transform={`translate(${1320} ${560 + (1 - box) * 30})`}>
          <path d="M-90 -60 L60 -60 L100 -90 L-50 -90 Z" fill="#1A1E28" />
          <path d="M60 -60 L100 -90 L100 110 L60 140 Z" fill="#0C0F16" />
          <rect x={-90} y={-60} width={150} height={200} fill="#12151D" stroke="#262B38" strokeWidth={4} />
          <rect x={-70} y={-40} width={110} height={160} fill={C.gold} opacity={0.2} />
        </g>
      </Svg>
      <Label id="s05-box" text="狭い箱" x={1330} y={720} size={32} reveal={box} align="center" chip color={C.paper} />
      <KeyText id="s05-key" text="心のスイッチ" x={1420} y={240} size={80} width={760} reveal={sw} />
    </>
  );
};

/* 6 タイトル — 頭の中 × 街の仕組み */
export const S06: React.FC<SceneProps> = ({f, R}) => {
  const head = lerp(f, (R.head ?? 0) - 6, (R.head ?? 0) + 30, 0, 1);
  const city = lerp(f, (R.city ?? 0) - 6, (R.city ?? 0) + 30, 0, 1);
  const sweep = lerp(f, (R.solve ?? 0) - 6, (R.solve ?? 0) + 40, -400, 2300);
  const headLen = 1500;
  const cityLen = 1900;
  return (
    <>
      <Aurora f={f} />
      <Svg>
        <path
          d="M420 560 C340 540 300 440 330 360 C370 250 480 210 580 225 C700 245 760 330 750 430 C748 470 775 495 790 520 L755 532 L762 585 C740 610 700 610 670 610 L670 640 L470 640 L470 600"
          fill="none" stroke={C.paper} strokeWidth={7} strokeDasharray={headLen} strokeDashoffset={headLen * (1 - head)} strokeLinecap="round"
        />
        <path
          d="M1150 640 L1150 420 L1230 420 L1230 330 L1320 330 L1320 470 L1400 470 L1400 280 L1500 280 L1500 520 L1580 520 L1580 380 L1670 380 L1670 640 Z"
          fill="none" stroke={C.paper} strokeWidth={7} strokeDasharray={cityLen} strokeDashoffset={cityLen * (1 - city)} strokeLinejoin="round"
        />
        <rect x={sweep} y={0} width={220} height={1080} fill="url(#s06-sweep)" />
        <defs>
          <linearGradient id="s06-sweep" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0.08} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        </defs>
      </Svg>
      <KeyText id="s06-head" text="頭の中" x={540} y={680} size={84} width={600} reveal={rv(f, R.head, 12)} />
      <div data-layout-box="s06-x" style={{position: "absolute", left: 900, top: 380, width: 120, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 96, color: C.gold, opacity: rv(f, R.city, 12)}}>×</div>
      <KeyText id="s06-city" text="街の仕組み" x={1410} y={680} size={84} width={640} reveal={rv(f, R.city, 12)} />
    </>
  );
};

/* 7 ガラス張りの箱 — glass pod, people outside, question */
export const S07: React.FC<SceneProps> = ({f, R}) => {
  const outside = rv(f, R.outside, 20);
  const q = rv(f, R.question, 12);
  return (
    <>
      <Svg>
        <PodDefs />
        <Concourse f={f} pan={0.4} idPrefix="s07" people={false} />
        {Array.from({length: 6}, (_, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          const x = (((i * 360 + dir * f * 4.2) % 2200) + 2200) % 2200 - 140;
          return <Person key={i} x={x} y={i < 3 ? 690 : 900} scale={i < 3 ? 0.8 : 1.15} pose="walk" phase={f / 4 + i} flip={dir < 0} color={i < 3 ? "#56627A" : "#0A0E17"} opacity={outside} />;
        })}
        <PodSVG x={700} y={860} s={1.05} lit={0.55} occupant="lean" glass={0.3} />
      </Svg>
      <KeyText id="s07-q" text={"なぜ\n油断してしまう？"} x={1480} y={330} size={76} width={720} reveal={q} />
    </>
  );
};

/* 8 エバンスの実験 — study card */
export const S08: React.FC<SceneProps> = ({f, R}) => (
  <>
    <Aurora f={f} tint="rgba(39,50,74,0.8)" tint2="rgba(210,164,81,0.12)" />
    <StudyCard id="s08" f={f} R={R} org="アメリカ・コーネル大学" name="ゲイリー・エバンス" topic="部屋の広さと他人の視線の実験" year="2000年" count={300} />
  </>
);

/* 9 広さが違う部屋 — three cutaway rooms, window passers, heart lines, puzzles */
const Room: React.FC<{x: number; w: number; f: number; win: number; heart: number; puzzle: number; i: number}> = ({x, w, f, win, heart, puzzle, i}) => {
  const h = 330;
  const y = 250;
  const hr = Array.from({length: 40}, (_, k) => {
    const px = x + (k / 39) * w;
    const phase = (k + f * 0.6) % 10;
    const amp = (3 - i) * 7 * heart;
    const py = y + h + 70 - (phase < 1 ? amp * 2 : phase < 2 ? -amp : 0);
    return `${k === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`;
  }).join(" ");
  const passer = ((f * 3 + i * 90) % (w + 120)) - 60;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#161E30" stroke={C.paper} strokeWidth={5} />
      <rect x={x + w * 0.62} y={y + 40} width={w * 0.3} height={120} fill="#0A0F1A" stroke="#3A4458" strokeWidth={4} />
      <g clipPath={`url(#win${i})`} opacity={win}>
        <Person x={x + w * 0.62 + passer * 0.3} y={y + 190} scale={0.45} pose="walk" phase={f / 4} color="#7A879F" />
      </g>
      <clipPath id={`win${i}`}>
        <rect x={x + w * 0.62} y={y + 40} width={w * 0.3} height={120} />
      </clipPath>
      <rect x={x + w * 0.2} y={y + h - 90} width={w * 0.34} height={12} fill="#5C4430" />
      {Array.from({length: 4}, (_, k) => (
        <rect key={k} x={x + w * 0.22 + k * 16} y={y + h - 104} width={13} height={13} fill={[C.gold, C.teal, C.red, C.paper][k]} opacity={puzzle} transform={`rotate(${(1 - puzzle) * 40} ${x + w * 0.22 + k * 16} ${y + h - 100})`} />
      ))}
      <Person x={x + w * 0.28} y={y + h - 30} scale={0.5} pose="lean" color={C.paper} />
      <path d={hr} fill="none" stroke={C.red} strokeWidth={4} opacity={heart} />
    </g>
  );
};

export const S09: React.FC<SceneProps> = ({f, R}) => {
  const rooms = rv(f, R.rooms, 12);
  const win = rv(f, R.window, 12);
  const heart = rv(f, R.heart, 12);
  const puzzle = rv(f, R.puzzle, 12);
  const widths = [620, 440, 260];
  const xs = [150, 860, 1390];
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill={C.night} />
        <rect y={580} width={1920} height={500} fill="#0A0E18" />
        <g opacity={rooms}>
          {xs.map((x, i) => (
            <Room key={i} x={x} w={widths[i]} f={f} win={win} heart={heart} puzzle={puzzle} i={i} />
          ))}
        </g>
      </Svg>
      {["広い部屋", "中くらい", "狭い部屋"].map((t, i) => (
        <Label key={t} id={`s09-room-${i}`} text={t} x={xs[i] + widths[i] / 2} y={180} size={32} reveal={rooms} align="center" />
      ))}
      <Label id="s09-heart" text="ドキドキ・ストレスを測定" x={150} y={690} size={28} reveal={heart} color={C.dim} />
    </>
  );
};

/* 10 警戒心 約40%低下 — bar chart */
export const S10: React.FC<SceneProps> = ({f, R}) => {
  const grow = lerp(f, 0, 18, 0, 1);
  const drop = rv(f, R.bars, 24);
  const vals = [1, 0.9, 1 - 0.4 * drop];
  const names = ["広い部屋", "中くらい", "狭い部屋"];
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill={C.night} />
        <line x1={200} y1={720} x2={1080} y2={720} stroke={C.paper} strokeWidth={3} opacity={0.6} />
        {vals.map((v, i) => {
          const h = 440 * v * grow;
          return <rect key={i} x={260 + i * 280} y={720 - h} width={170} height={h} fill={i === 2 ? C.gold : "#4E5E7E"} />;
        })}
        <line x1={260 + 560} y1={280} x2={260 + 560 + 170} y2={280} stroke={C.gold} strokeDasharray="10 8" strokeWidth={3} opacity={drop} />
      </Svg>
      {names.map((t, i) => (
        <Label key={t} id={`s10-name-${i}`} text={t} x={345 + i * 280} y={740} size={30} align="center" />
      ))}
      <Label id="s10-axis" text="見られることへの警戒心" x={200} y={150} size={32} color={C.dim} />
      <div data-layout-box="s10-metric" style={{position: "absolute", left: 1200, top: 330, opacity: rv(f, R.metric, 12), transform: `translateY(${(1 - rv(f, R.metric, 12)) * 20}px)`, fontFamily: FONT, whiteSpace: "nowrap"}}>
        <div style={{fontSize: 34, fontWeight: 700, color: C.dim, marginBottom: 8}}>狭い部屋の警戒心</div>
        <div style={{display: "inline-flex", alignItems: "baseline", gap: 12}}>
          <span style={{fontSize: 44, fontWeight: 900, color: C.white}}>約</span>
          <span style={{fontSize: 190, fontWeight: 900, color: C.white, lineHeight: 1}}>40</span>
          <span style={{fontSize: 64, fontWeight: 900, color: C.gold}}>%</span>
          <span style={{fontSize: 56, fontWeight: 900, color: C.white}}>低下</span>
        </div>
      </div>
    </>
  );
};

/* 11 守られている → 勘違い — square walls morph into a womb-like circle */
export const S11: React.FC<SceneProps> = ({f, R}) => {
  const walls = rv(f, R.walls, 30);
  const safe = rv(f, R.safe, 10);
  const swap = R.glitch !== undefined && f >= R.glitch;
  const g = R.glitch !== undefined && f >= R.glitch - 3 && f < R.glitch + 14 ? (f - R.glitch + 3) / 17 : 0;
  const size = 520 - walls * 150;
  const radius = walls * size * 0.5;
  return (
    <>
      <Aurora f={f} tint="rgba(210,164,81,0.28)" tint2="rgba(158,62,71,0.2)" />
      <Svg>
        <rect x={660 - size / 2} y={500 - size / 2} width={size} height={size} rx={radius} fill="rgba(210,164,81,0.08)" stroke={C.paper} strokeWidth={7} />
        <Person x={660} y={560} scale={0.9} pose="sit" color={C.paper} />
        <circle cx={660} cy={500} r={120 + walls * 40} fill={C.gold} opacity={0.08 * walls} />
      </Svg>
      <KeyText id="s11-key" text={swap ? "勘違い" : "守られている"} x={1420} y={380} size={96} width={760} reveal={safe} glitch={g} />
    </>
  );
};

/* 12 駅の通路 — parallax concourse */
export const S12: React.FC<SceneProps> = ({f}) => (
  <Svg>
    <Concourse f={f} pan={1.2} idPrefix="s12" />
  </Svg>
);

