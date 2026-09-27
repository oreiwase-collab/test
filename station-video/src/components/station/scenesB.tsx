import {Aurora, C, Concourse, FlowField, FONT, KeyText, Label, lerp, Person, PodDefs, PodPhoto, PodSVG, rnd, rv, Skyline, StudyCard, Svg} from "./kit";
import type {SceneProps} from "./kit";

/* 13 黒くて四角い箱 — the real pod photo standing beside the concourse */
export const S13: React.FC<SceneProps> = ({f, R}) => {
  const booth = rv(f, R.booth, 12);
  return (
    <>
      <Svg>
        <Concourse f={f} pan={0.9} idPrefix="s13" />
        <ellipse cx={1420} cy={920} rx={260} ry={40} fill="#000" opacity={0.5 * booth} />
      </Svg>
      <div style={{opacity: booth, transform: `translateY(${(1 - booth) * 20}px)`}}>
        <div style={{position: "absolute", left: 1150, top: 250, width: 540, height: 680, background: "radial-gradient(ellipse at 50% 60%, rgba(210,164,81,0.22), transparent 70%)"}} />
        <PodPhoto x={1420} y={930} h={640} grade={0.32} />
      </div>
      <Label id="s13-note" text="※写真はイメージです" x={1640} y={300} size={22} color={C.dim} reveal={booth} />
    </>
  );
};

/* 14 ドアを閉めた瞬間 — inside the pod, the door closes and the noise drops */
export const S14: React.FC<SceneProps> = ({f, R}) => {
  const door = rv(f, R.door, 14);
  const quiet = rv(f, R.quiet, 24);
  const desk = rv(f, R.desk, 12);
  const blur = 1 + door * 9;
  const bars = Array.from({length: 9}, (_, i) => {
    const loud = 0.35 + 0.65 * Math.abs(Math.sin(f / 3 + i * 1.7));
    return loud * (1 - quiet * 0.82);
  });
  return (
    <>
      <Svg>
        <defs>
          <filter id="s14-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
          <clipPath id="s14-glass">
            <rect x={980} y={110} width={760} height={760} />
          </clipPath>
        </defs>
        <rect width={1920} height={1080} fill="#151A25" />
        <g clipPath="url(#s14-glass)">
          <g filter="url(#s14-blur)" opacity={1 - door * 0.45}>
            <Concourse f={f} pan={1} idPrefix="s14" people signText={false} />
          </g>
          <rect x={980} y={110} width={760} height={760} fill="#0B0F18" opacity={door * 0.35} />
        </g>
        {/* door leaf sliding shut */}
        <rect x={980 + 760 * (1 - door) * 0.9} y={110} width={760} height={760} fill="rgba(143,166,184,0.08)" stroke="#2F3545" strokeWidth={14} />
        <rect x={980} y={110} width={760} height={760} fill="none" stroke="#0B0E14" strokeWidth={22} />
        {/* interior wall, desk, chair */}
        <rect x={0} y={0} width={980} height={1080} fill="#171C27" />
        <rect x={80} y={120} width={820} height={8} fill="#FFFFFF" opacity={0.6} />
        <ellipse cx={480} cy={560} rx={380} ry={200} fill={C.gold} opacity={0.05 + desk * 0.12} />
        <rect x={220} y={600} width={520} height={30} rx={4} fill="#5C4430" />
        <rect x={250} y={630} width={24} height={260} fill="#3A2B22" />
        <rect x={690} y={630} width={24} height={260} fill="#3A2B22" />
        <rect x={420} y={500} width={170} height={104} rx={8} fill="#0A0F1B" stroke="#40526A" strokeWidth={6} />
        <rect x={436} y={516} width={138} height={70} fill="#1D3A4F" />
        <rect x={120} y={700} width={150} height={24} rx={6} fill="#2A3040" />
        <rect x={120} y={724} width={20} height={170} fill="#1F2430" />
        <Person x={210} y={760} scale={0.95} pose="lean" color={C.paper} flip />
      </Svg>
      <div data-layout-box="s14-meter" style={{position: "absolute", left: 700, top: 170, width: 200, height: 150, display: "flex", alignItems: "flex-end", gap: 8, padding: 14, background: "rgba(9,13,25,0.8)", borderRadius: 10, boxSizing: "border-box"}}>
        {bars.map((b, i) => (
          <div key={i} style={{flex: 1, height: `${Math.max(6, b * 100)}%`, background: i > 6 ? C.red : C.teal, borderRadius: 3}} />
        ))}
      </div>
      <Label id="s14-desk" text="自分だけの机と椅子" x={480} y={400} size={32} reveal={desk} align="center" chip color={C.gold} />
    </>
  );
};

/* 15 テレビ画面の中の出来事 — over-the-shoulder, outside becomes a screen */
export const S15: React.FC<SceneProps> = ({f, R}) => {
  const suit = rv(f, R.suit, 16);
  const safe = rv(f, R.safe, 16);
  const tv = rv(f, R.tv, 14);
  return (
    <>
      <Svg>
        <defs>
          <clipPath id="s15-glass">
            <rect x={520} y={120} width={1200} height={640} rx={tv * 40} />
          </clipPath>
          <pattern id="s15-scan" width={4} height={6} patternUnits="userSpaceOnUse">
            <rect width={4} height={2} fill="#000" opacity={0.35} />
          </pattern>
        </defs>
        <rect width={1920} height={1080} fill="#10141D" />
        <g clipPath="url(#s15-glass)">
          <g transform={tv > 0 ? `translate(${Math.sin(f * 1.3) * 3 * tv} 0)` : undefined}>
            <Concourse f={f} pan={0.6} idPrefix="s15" people={false} />
            {Array.from({length: 5}, (_, i) => {
              const x = (((i * 430 + f * 6.5) % 2100) + 2100) % 2100 - 120;
              return (
                <g key={i} opacity={suit}>
                  <Person x={x} y={740} scale={1.1} pose="walk" phase={f / 3.5 + i} color="#2B3244" />
                  <path d={`M${x} ${740 - 142} L${x - 7} ${740 - 110} L${x} ${740 - 70} L${x + 7} ${740 - 110} Z`} fill={C.red} opacity={0.8} />
                </g>
              );
            })}
          </g>
          <rect x={520} y={120} width={1200} height={640} fill="url(#s15-scan)" opacity={tv} />
          <rect x={520} y={120} width={1200} height={640} fill="#6FB7B7" opacity={tv * 0.06} />
        </g>
        <rect x={520} y={120} width={1200} height={640} rx={tv * 40} fill="none" stroke={tv > 0.5 ? "#2A2F3B" : "#0B0E14"} strokeWidth={18 + tv * 20} />
        {/* inner walls glowing with the sense of safety */}
        <rect x={0} y={0} width={520} height={1080} fill="#171C27" />
        <rect x={1720} y={0} width={200} height={1080} fill="#171C27" />
        <rect x={0} y={0} width={1920} height={120} fill="#171C27" />
        <rect x={500} y={100} width={1240} height={680} fill="none" stroke={C.gold} strokeWidth={6} opacity={safe * 0.6} />
        {/* over-the-shoulder silhouette */}
        <circle cx={360} cy={700} r={120} fill="#07090F" />
        <path d="M120 1080 C140 880 250 820 360 820 C470 820 600 880 620 1080 Z" fill="#07090F" />
      </Svg>
      <Label id="s15-tv" text="まるでテレビの中" x={1120} y={60} size={32} reveal={tv} align="center" color={C.gold} />
    </>
  );
};

/* 16 個人の心 → 社会全体 — camera pulls back from the pod to the city */
export const S16: React.FC<SceneProps> = ({f, R}) => {
  const pull = lerp(f, (R.pull ?? 0) - 8, (R.pull ?? 0) + 70, 0, 1);
  const eased = 1 - Math.pow(1 - pull, 3);
  const s = 1.25 - eased * 1.0;
  return (
    <>
      <Svg>
        <PodDefs />
        <g opacity={eased}>
          <Skyline f={f} idPrefix="s16" drift={0.2} />
        </g>
        <rect width={1920} height={1080} fill={C.night} opacity={1 - eased} />
        <g transform={`translate(960 ${720 + eased * 160}) scale(${s}) translate(-960 -720)`}>
          <rect x={560} y={720} width={800} height={30} fill="#1A2233" opacity={1 - eased * 0.4} />
          <PodSVG x={960} y={720} s={0.9} lit={0.6} occupant="sit" />
        </g>
      </Svg>
      <KeyText id="s16-a" text="心の中" x={560} y={140} size={72} width={560} reveal={1 - rv(f, R.pull, 20) * 0.35} />
      <div data-layout-box="s16-arrow" style={{position: "absolute", left: 890, top: 140, width: 140, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 72, color: C.gold, opacity: rv(f, R.pull, 12)}}>→</div>
      <KeyText id="s16-b" text="街の仕組み" x={1370} y={140} size={72} width={640} reveal={rv(f, R.pull, 12)} />
    </>
  );
};

/* 17 街の作りそのもの — top-down city map warped by a generative field */
export const S17: React.FC<SceneProps> = ({f, R}) => {
  const warp = rv(f, R.city, 30);
  const blocks = Array.from({length: 7 * 4}, (_, i) => ({c: i % 7, r: Math.floor(i / 7)}));
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill="#0E1320" />
        {blocks.map(({c, r}, i) => {
          const skew = Math.sin(c * 0.9 + r * 1.3 + f / 40) * 18 * warp;
          return (
            <rect key={i} x={120 + c * 245 + skew} y={330 + r * 170 - skew * 0.5} width={200} height={130} rx={4}
              fill={rnd(i) > 0.7 ? "#1D2A3A" : "#172030"} stroke="#2A3548" strokeWidth={3}
              transform={`rotate(${skew * 0.15} ${220 + c * 245} ${395 + r * 170})`} />
          );
        })}
        {Array.from({length: 40}, (_, i) => {
          const lane = i % 4;
          const x = ((rnd(i) * 1900 + f * (2 + (i % 3))) % 1900) + 10;
          return <circle key={i} cx={x} cy={308 + lane * 170} r={6} fill={C.paper} opacity={0.6} />;
        })}
        <g opacity={0.2 + warp * 0.6}>
          <FlowField f={f} count={110} color={C.gold} opacity={0.45} seed={3} />
        </g>
      </Svg>
      <KeyText id="s17-key" text="街の作りが変わった" x={960} y={120} size={80} width={1100} reveal={warp} />
    </>
  );
};

/* 18 ソジャの調査 — study card */
export const S18: React.FC<SceneProps> = ({f, R}) => (
  <>
    <Aurora f={f} tint="rgba(39,50,74,0.8)" tint2="rgba(99,138,138,0.16)" />
    <StudyCard id="s18" f={f} R={R} org="都市の研究" name="エドワード・ソジャ" topic="区切られた広場での人々の行動" year="1996年" place="ロサンゼルス" />
  </>
);

/* 19 広場をフェンスで囲み、ブースに区切る — top-down plaza */
export const S19: React.FC<SceneProps> = ({f, R}) => {
  const fence = lerp(f, (R.fence ?? 0) - 6, (R.fence ?? 0) + 30, 0, 1);
  const grid = lerp(f, (R.booths ?? 0) - 6, (R.booths ?? 0) + 30, 0, 1);
  const months = rv(f, R.months, 12);
  const per = 2 * (1120 + 600);
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill="#0C121C" />
        <rect x={400} y={160} width={1120} height={600} fill="#15202A" />
        {Array.from({length: 8}, (_, i) => (
          <circle key={i} cx={460 + (i % 4) * 330} cy={i < 4 ? 210 : 710} r={26} fill={C.green} stroke="#2C4A3C" strokeWidth={6} />
        ))}
        {Array.from({length: 26}, (_, i) => {
          const cx = 460 + ((rnd(i) * 1000 + Math.sin(f / 40 + i) * 60 * (1 - grid)) % 1000);
          const cy = 220 + ((rnd(i * 3) * 480 + Math.cos(f / 50 + i) * 40 * (1 - grid)) % 480);
          return <circle key={i} cx={cx} cy={cy} r={11} fill="#8894AE" />;
        })}
        <rect x={400} y={160} width={1120} height={600} fill="none" stroke={C.paper} strokeWidth={8} strokeDasharray={`${per * fence} ${per}`} />
        {Array.from({length: 5}, (_, i) => (
          <line key={`v${i}`} x1={400 + (i + 1) * (1120 / 6)} y1={160} x2={400 + (i + 1) * (1120 / 6)} y2={160 + 600 * grid} stroke={C.gold} strokeWidth={5} />
        ))}
        {Array.from({length: 2}, (_, i) => (
          <line key={`h${i}`} x1={400} y1={160 + (i + 1) * 200} x2={400 + 1120 * grid} y2={160 + (i + 1) * 200} stroke={C.gold} strokeWidth={5} />
        ))}
        <g opacity={months} transform="translate(1600 300)">
          {Array.from({length: 6}, (_, i) => (
            <rect key={i} x={(i % 2) * 70} y={Math.floor(i / 2) * 70} width={56} height={56} rx={6} fill={i < Math.round(months * 6) ? C.gold : "#27324A"} />
          ))}
        </g>
      </Svg>
      <Label id="s19-fence" text="自由に使えた広場" x={400} y={96} size={32} />
      <Label id="s19-booth" text="お金を払った人だけのブース" x={1520} y={92} size={30} reveal={rv(f, R.booths, 12)} align="right" chip color={C.gold} />
      <Label id="s19-months" text="半年間 観察" x={1668} y={520} size={30} reveal={months} align="center" />
    </>
  );
};

/* 20 防犯カメラが増えても逸脱は約3倍 */
const Camera: React.FC<{x: number; y: number; o: number}> = ({x, y, o}) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <rect x={-6} y={-40} width={12} height={40} fill="#3A4458" />
    <rect x={-40} y={-66} width={80} height={36} rx={8} fill="#2A3040" stroke="#56627A" strokeWidth={3} />
    <circle cx={30} cy={-48} r={10} fill="#0A0F1B" stroke={C.teal} strokeWidth={3} />
    <circle cx={-26} cy={-58} r={4} fill={C.red} />
  </g>
);

export const S20: React.FC<SceneProps> = ({f, R}) => {
  const cams = Array.from({length: 12}, (_, i) => rv(f, (R.cameras ?? 0) + i * 5, 8));
  const bars = lerp(f, (R.bars ?? 0) - 6, (R.bars ?? 0) + 24, 0, 1);
  const metric = rv(f, R.metric, 12);
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill={C.night} />
        {cams.map((o, i) => (
          <Camera key={i} x={190 + (i % 4) * 150} y={260 + Math.floor(i / 4) * 150} o={o} />
        ))}
        <line x1={1000} y1={700} x2={1700} y2={700} stroke={C.paper} strokeWidth={3} opacity={0.6} />
        <rect x={1060} y={700 - 130 * bars} width={200} height={130 * bars} fill="#4E5E7E" />
        <rect x={1400} y={700 - 390 * bars} width={200} height={390 * bars} fill={C.red} />
      </Svg>
      <Label id="s20-cam" text="防犯カメラを増やしても" x={190} y={140} size={32} reveal={cams[0]} />
      <Label id="s20-b1" text="もとの広場" x={1160} y={720} size={30} align="center" reveal={bars} />
      <Label id="s20-b2" text="ブースの中" x={1500} y={720} size={30} align="center" reveal={bars} />
      <div data-layout-box="s20-metric" style={{position: "absolute", left: 1000, top: 120, opacity: metric, transform: `translateY(${(1 - metric) * 20}px)`, display: "inline-flex", alignItems: "baseline", gap: 12, fontFamily: FONT, whiteSpace: "nowrap"}}>
        <span style={{fontSize: 40, fontWeight: 900, color: C.dim}}>迷惑行為</span>
        <span style={{fontSize: 44, fontWeight: 900, color: C.white}}>約</span>
        <span style={{fontSize: 130, fontWeight: 900, color: C.white, lineHeight: 1}}>3</span>
        <span style={{fontSize: 60, fontWeight: 900, color: C.gold}}>倍</span>
      </div>
    </>
  );
};

/* 21 見守り合う自然なブレーキが壊れる */
export const S21: React.FC<SceneProps> = ({f, R}) => {
  const walls = rv(f, R.walls, 24);
  const label = rv(f, R.label, 12);
  const cut = lerp(f, (R.cut ?? 0) - 4, (R.cut ?? 0) + 20, 0, 1);
  const xs = [300, 620, 940, 1260, 1580];
  const headY = 500;
  return (
    <>
      <Svg>
        <rect width={1920} height={1080} fill="#0B101B" />
        <rect y={760} width={1920} height={320} fill="#080C16" />
        {xs.map((a, i) =>
          xs.slice(i + 1).map((b, j) => {
            const k = i * 5 + j;
            const gone = cut > rnd(k * 7) * 0.9;
            if (gone) return null;
            const mid = (a + b) / 2;
            return <path key={`${i}-${j}`} d={`M${a} ${headY} Q${mid} ${headY - 80 - (b - a) * 0.18} ${b} ${headY}`} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="10 8" opacity={0.7} />;
          }),
        )}
        {xs.slice(0, -1).map((x, i) => (
          <rect key={i} x={x + 150} y={720 - 420 * walls} width={20} height={420 * walls} fill="#262B38" stroke="#3A4458" strokeWidth={3} />
        ))}
        {xs.map((x, i) => (
          <Person key={i} x={x} y={680} scale={0.95} pose="stand" color={i % 2 ? "#7A879F" : C.paper} />
        ))}
      </Svg>
      <Label id="s21-label" text="お互いに見守り合う＝自然なブレーキ" x={960} y={170} size={38} reveal={label} align="center" color={C.gold} />
    </>
  );
};

/* 22 昔の待合室 — sepia concourse with a shared bench and crossing gazes */
export const S22: React.FC<SceneProps> = ({f, R}) => {
  const gaze = lerp(f, (R.gaze ?? 0) - 6, (R.gaze ?? 0) + 20, 0, 1);
  const seats = [560, 760, 960, 1160, 1360];
  return (
    <>
      <Svg>
        <Concourse f={f} pan={0.3} idPrefix="s22" people={false} sepia />
        <rect x={470} y={690} width={980} height={28} rx={6} fill="#6B4E32" />
        <rect x={500} y={718} width={20} height={120} fill="#4A3522" />
        <rect x={1400} y={718} width={20} height={120} fill="#4A3522" />
        {seats.map((x, i) => (
          <Person key={i} x={x} y={740} scale={0.85} pose="sit" color={i % 2 ? "#C9B28C" : "#E3D2AF"} />
        ))}
        {seats.map((a, i) =>
          seats.slice(i + 1).map((b, j) => (
            <path key={`${i}${j}`} d={`M${a} 545 Q${(a + b) / 2} ${500 - (b - a) * 0.12} ${b} 545`} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="8 8" opacity={0.7 * gaze} />
          )),
        )}
      </Svg>
      <Label id="s22-label" text="みんなで分け合う場所" x={960} y={330} size={36} align="center" color={C.paper} />
    </>
  );
};

/* 23 ひとりぼっちになれるカプセル — pods rise out of the shared floor */
export const S23: React.FC<SceneProps> = ({f, R}) => {
  const xs = [360, 760, 1160, 1560];
  return (
    <>
      <Svg>
        <PodDefs />
        <rect width={1920} height={1080} fill={C.night} />
        <rect y={760} width={1920} height={320} fill="#0D121E" />
        <ellipse cx={960} cy={770} rx={900} ry={60} fill={C.teal} opacity={0.08} />
        {xs.map((x, i) => {
          const r = rv(f, (R.rise ?? 0) + i * 10, 18);
          return (
            <g key={i} transform={`translate(0 ${(1 - r) * 260})`} opacity={r}>
              <PodSVG x={x} y={790} s={0.55} lit={0.35} occupant="sit" />
            </g>
          );
        })}
      </Svg>
      {xs.map((x, i) => (
        <Label key={i} id={`s23-yen-${i}`} text="¥ 有料" x={x + 20} y={330} size={30} align="center" chip color={C.gold} reveal={rv(f, (R.yen ?? 0) + i * 6, 10)} />
      ))}
      <Label id="s23-floor" text="街の共有スペース" x={960} y={720} size={30} align="center" color={C.dim} reveal={rv(f, R.rise, 12)} />
    </>
  );
};

/* 24 マナーと自由がぶつかり、隙間が生まれる */
export const S24: React.FC<SceneProps> = ({f, R}) => {
  const manner = rv(f, R.manner, 14);
  const free = rv(f, R.free, 14);
  const push = lerp(f, R.free ?? 0, (R.crack ?? 0) - 6, 0, 1);
  const crack = lerp(f, (R.crack ?? 0) - 4, (R.crack ?? 0) + 14, 0, 1);
  const g = R.crack !== undefined && f >= R.crack - 3 && f < R.crack + 12 ? 1 : 0;
  const cx1 = 700 + push * 90 - crack * 60;
  const cx2 = 1220 - push * 90 + crack * 60;
  return (
    <>
      <Aurora f={f} tint="rgba(99,138,138,0.25)" tint2="rgba(210,164,81,0.2)" />
      <Svg style={{transform: g ? `translateX(${Math.sin(f * 2.1) * 7}px)` : undefined}}>
        <rect x={360} y={250} width={1200} height={440} rx={220} fill="none" stroke={C.paper} strokeWidth={6} opacity={0.6} />
        <circle cx={cx1} cy={470} r={200} fill={C.teal} opacity={0.35 * manner} />
        <circle cx={cx2} cy={470} r={200} fill={C.gold} opacity={0.35 * free} />
        <path d="M960 250 L930 340 L985 410 L935 500 L990 590 L950 690" fill="none" stroke={C.white} strokeWidth={6} strokeDasharray={600} strokeDashoffset={600 * (1 - crack)} />
        <path d="M960 250 L930 340 L985 410 L935 500 L990 590 L950 690 L1010 690 L1045 590 L990 500 L1040 410 L985 340 L1020 250 Z" fill="#05070C" opacity={crack} />
      </Svg>
      <Label id="s24-manner" text="みんなのマナー" x={600} y={450} size={36} align="center" reveal={manner} color={C.white} />
      <Label id="s24-free" text="自分の部屋の自由" x={1330} y={450} size={36} align="center" reveal={free} color={C.white} />
      <KeyText id="s24-gap" text="大きな隙間" x={960} y={140} size={72} width={700} reveal={crack} glitch={g ? (f % 17) / 17 : 0} />
    </>
  );
};
