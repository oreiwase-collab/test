import {interpolate} from "remotion";
import type {NativeMotif} from "../types";
import {StickPerson} from "./StickPerson";

type Props = {
  motif: NativeMotif;
  accent: string;
  progress: number;
  variant: number;
};

const Desk: React.FC<Props> = ({accent, progress}) => {
  const lampGlow = interpolate(progress, [0, 0.28], [0.15, 0.72], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <rect width="1920" height="1080" fill="#0B1120" />
      <rect x="0" y="0" width="1920" height="730" fill="#11192C" />
      <rect x="0" y="730" width="1920" height="350" fill="#080C16" />
      <rect x="170" y="150" width="340" height="370" rx="8" fill="#090E1A" stroke="#27324A" strokeWidth="18" />
      <circle cx="330" cy="254" r="66" fill="#C7C1B0" opacity="0.75" />
      <rect x="1230" y="150" width="480" height="390" fill="#14261F" />
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          <rect x="1265" y={186 + row * 83} width="410" height="13" fill="#273B34" />
          {[0, 1, 2, 3, 4, 5].map((book) => (
            <rect
              key={book}
              x={1280 + book * 61}
              y={204 + row * 83}
              width={32 + (book % 2) * 10}
              height={52}
              fill={["#596856", "#6E584C", "#3E5965", "#7B684A"][book % 4]}
              opacity="0.8"
            />
          ))}
        </g>
      ))}
      <ellipse cx="930" cy="360" rx="330" ry="230" fill={accent} opacity={lampGlow * 0.16} />
      <path d="M840 110 L1020 110 L1110 420 L750 420 Z" fill="#D2A451" opacity={lampGlow * 0.13} />
      <rect x="735" y="560" width="565" height="55" rx="8" fill="#5C4430" />
      <rect x="780" y="615" width="34" height="240" fill="#3A2B22" />
      <rect x="1218" y="615" width="34" height="240" fill="#3A2B22" />
      <rect x="850" y="475" width="280" height="112" rx="10" fill="#0A0F1B" stroke="#40526A" strokeWidth="9" />
      <rect x="879" y="500" width="222" height="61" rx="4" fill="#183447" />
      <StickPerson x={610} y={655} scale={1.08} pose="sit" color={accent} phone />
      <circle cx="1180" cy="520" r="19" fill={accent} />
      <rect x="1145" y="540" width="72" height="38" rx="8" fill="#D7CCB5" />
    </>
  );
};

const City: React.FC<Props> = ({accent, progress}) => {
  const walker = interpolate(progress, [0, 1], [-120, 2040]);
  const counterWalker = interpolate(progress, [0, 1], [1740, 1040]);
  const buildings = [
    {x: 20, y: 120, w: 285, h: 590, tint: "#11182B"},
    {x: 285, y: 55, w: 275, h: 655, tint: "#15142B"},
    {x: 540, y: 175, w: 250, h: 535, tint: "#10182A"},
    {x: 770, y: 85, w: 300, h: 625, tint: "#171329"},
    {x: 1050, y: 160, w: 250, h: 550, tint: "#11192C"},
    {x: 1280, y: 40, w: 340, h: 670, tint: "#151328"},
    {x: 1600, y: 145, w: 300, h: 565, tint: "#11182B"},
  ];
  const signs = [
    {x: 150, y: 205, w: 72, h: 200, text: "酒場", color: "#C23B79"},
    {x: 420, y: 135, w: 78, h: 265, text: "カラオケ", color: "#42C5D9"},
    {x: 880, y: 190, w: 92, h: 220, text: "深夜喫茶", color: "#D2A451"},
    {x: 1470, y: 130, w: 76, h: 220, text: "ホテル", color: "#C23B79"},
  ];
  return (
    <>
      <rect width="1920" height="1080" fill="#080A18" />
      <ellipse cx="960" cy="260" rx="780" ry="310" fill={accent} opacity="0.035" />
      {buildings.map((building, buildingIndex) => (
        <g key={building.x}>
          <rect x={building.x} y={building.y} width={building.w} height={building.h} fill={building.tint} stroke="#272C46" strokeWidth="4" />
          {Array.from({length: 32}, (_, index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;
            return (
              <rect
                key={index}
                x={building.x + 35 + col * ((building.w - 70) / 4)}
                y={building.y + 55 + row * ((building.h - 100) / 8)}
                width="27"
                height="18"
                fill={(index + buildingIndex) % 5 === 0 ? (index % 2 ? "#D2A451" : "#42C5D9") : "#34364A"}
                opacity={(index + buildingIndex) % 5 === 0 ? 0.7 : 0.3}
              />
            );
          })}
        </g>
      ))}
      {signs.map((sign, index) => (
        <g key={sign.text}>
          <rect x={sign.x} y={sign.y} width={sign.w} height={sign.h} rx="8" fill="#0B1020" stroke={sign.color} strokeWidth="5" />
          <text
            data-layout-box={`native-city-sign-${index}`}
            x={sign.x + sign.w / 2}
            y={sign.y + 35}
            textAnchor="middle"
            fill={sign.color}
            fontFamily="'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif"
            fontSize="27"
            fontWeight="700"
          >
            {[...sign.text].map((character, characterIndex) => (
              <tspan key={`${character}-${characterIndex}`} x={sign.x + sign.w / 2} dy={characterIndex === 0 ? 0 : 34}>{character}</tspan>
            ))}
          </text>
        </g>
      ))}
      <path d="M0 700 C520 665 1320 670 1920 705 V1080 H0 Z" fill="#090C17" />
      <path d="M0 720 C520 690 1300 695 1920 725" stroke="#343951" strokeWidth="7" fill="none" />
      {[240, 550, 900, 1260, 1580, 1810].map((x, index) => (
        <ellipse key={x} cx={x} cy={790 + (index % 2) * 48} rx={90 + (index % 3) * 35} ry="22" fill={["#C23B79", "#42C5D9", "#D2A451"][index % 3]} opacity="0.1" />
      ))}
      <StickPerson x={walker} y={620} scale={0.9} pose="walk" color={accent} phase={progress * 26} />
      <StickPerson x={counterWalker} y={650} scale={0.66} pose="walk" color="#C23B79" phase={progress * 21 + 2} flip />
    </>
  );
};

const Stage: React.FC<Props> = ({accent, progress}) => {
  const spotlight = interpolate(progress, [0, 0.4], [0.04, 0.32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <rect width="1920" height="1080" fill="#0A0D18" />
      <path d="M0 0 H470 Q390 420 520 790 H0 Z" fill="#3E1D38" />
      <path d="M1920 0 H1450 Q1530 420 1400 790 H1920 Z" fill="#3E1D38" />
      <path d="M720 0 H1200 L1390 820 H530 Z" fill={accent} opacity={spotlight} />
      <ellipse cx="960" cy="812" rx="420" ry="96" fill={accent} opacity="0.22" />
      <rect y="820" width="1920" height="260" fill="#080B13" />
      <StickPerson x={960} y={770} scale={1.15} color={accent} />
      {[190, 420, 650, 1270, 1500, 1730].map((x, i) => (
        <g key={x} opacity="0.42">
          <circle cx={x} cy={905 + (i % 2) * 25} r="34" fill="#1B2334" />
          <rect x={x - 40} y={940 + (i % 2) * 25} width="80" height="130" rx="24" fill="#111827" />
        </g>
      ))}
    </>
  );
};

const Chart: React.FC<Props> = ({accent, progress}) => {
  const reveal = interpolate(progress, [0.12, 0.72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const values = [0.36, 0.58, 0.46, 0.72, 0.92];
  return (
    <>
      <rect width="1920" height="1080" fill="#10231D" />
      <rect x="230" y="160" width="1460" height="700" rx="20" fill="#0B1714" stroke="#2A4039" strokeWidth="8" />
      <text data-layout-box="chart-label" x="1390" y="225" fill="#F2F1EA" fontSize="52" fontWeight="800" fontFamily="sans-serif">差分</text>
      <line x1="340" y1="745" x2="1570" y2="745" stroke="#66766F" strokeWidth="6" />
      {values.map((value, index) => {
        const height = value * 430 * reveal;
        const x = 430 + index * 220;
        return (
          <g key={value}>
            <rect x={x} y={745 - height} width="120" height={height} rx="7" fill={index === values.length - 1 ? accent : "#638A8A"} />
            <circle cx={x + 60} cy={745 - height} r="11" fill="#F2F1EA" opacity={reveal} />
          </g>
        );
      })}
      <rect x="1380" y="250" width="160" height="205" rx="7" fill="#D7CCB5" />
      <circle cx="1460" cy="325" r="44" fill="none" stroke={accent} strokeWidth="10" />
      <line x1="1415" y1="400" x2="1505" y2="400" stroke="#6D6559" strokeWidth="9" />
    </>
  );
};

const Document: React.FC<Props> = ({accent, progress}) => {
  const slide = interpolate(progress, [0.08, 0.45], [210, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <rect width="1920" height="1080" fill="#101B1D" />
      <rect x="0" y="720" width="1920" height="360" fill="#0A1015" />
      <rect x="220" y="180" width="1480" height="610" rx="18" fill="#122426" stroke="#2F4748" strokeWidth="9" />
      <g transform={`translate(${slide} 0)`}>
        <rect x="620" y="270" width="700" height="440" rx="8" fill="#D7CCB5" transform="rotate(-3 970 490)" />
        <text data-layout-box="document-label" x="735" y="382" fill="#292B2A" fontSize="44" fontWeight="800" fontFamily="sans-serif">調査資料</text>
        {[0, 1, 2, 3, 4].map((line) => (
          <rect key={line} x="735" y={430 + line * 47} width={line === 4 ? 290 : 470} height="10" fill="#6F706A" opacity="0.64" />
        ))}
        <rect x="1120" y="410" width="115" height="155" fill="#15202C" />
        <circle cx="1178" cy="458" r="23" fill={accent} />
      </g>
      <circle cx="470" cy="340" r="54" fill={accent} opacity="0.3" />
      <rect x="420" y="410" width="100" height="255" rx="42" fill="#151D29" />
    </>
  );
};

const Clock: React.FC<Props> = ({accent, progress}) => {
  const angle = progress * 230;
  return (
    <>
      <rect width="1920" height="1080" fill="#0B1020" />
      <rect x="170" y="170" width="1580" height="690" rx="24" fill="#11192C" stroke="#27324A" strokeWidth="10" />
      <circle cx="960" cy="485" r="260" fill="#D7CCB5" opacity="0.92" />
      <circle cx="960" cy="485" r="230" fill="#E2DACA" stroke="#41484B" strokeWidth="12" />
      {Array.from({length: 12}, (_, i) => {
        const theta = (i / 12) * Math.PI * 2;
        const x1 = 960 + Math.sin(theta) * 190;
        const y1 = 485 - Math.cos(theta) * 190;
        const x2 = 960 + Math.sin(theta) * 216;
        const y2 = 485 - Math.cos(theta) * 216;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#363C41" strokeWidth="9" />;
      })}
      <line x1="960" y1="485" x2="960" y2="330" stroke="#1B222B" strokeWidth="18" strokeLinecap="round" transform={`rotate(${angle} 960 485)`} />
      <line x1="960" y1="485" x2="1080" y2="545" stroke={accent} strokeWidth="14" strokeLinecap="round" />
      <circle cx="960" cy="485" r="22" fill="#1B222B" />
      <ellipse cx="960" cy="850" rx="420" ry="46" fill={accent} opacity="0.13" />
    </>
  );
};

const Office: React.FC<Props> = ({accent, progress, variant}) => {
  const reveal = interpolate(progress, [0.05, 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const paperX = interpolate(progress, [0.28, 0.82], [1220, 910], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <rect width="1920" height="1080" fill={variant % 2 ? "#101821" : "#0C1421"} />
      <rect x="0" y="0" width="1920" height="690" fill="#162334" />
      {[120, 520, 920, 1320].map((x, i) => (
        <g key={x} opacity={0.72 + i * 0.05}>
          <rect x={x} y="205" width="300" height="225" fill="#0B111C" stroke="#314055" strokeWidth="10" />
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={x + 30 + col * 66}
                y={235 + row * 58}
                width="34"
                height="24"
                fill={accent}
                opacity={(row + col + i) % 3 === 0 ? 0.72 : 0.12}
              />
            )),
          )}
        </g>
      ))}
      <rect y="690" width="1920" height="390" fill="#090E18" />
      {[250, 740, 1230].map((x, i) => (
        <g key={x} transform={`translate(0 ${i % 2 ? 20 : 0})`}>
          <rect x={x} y="630" width="360" height="42" rx="5" fill="#5B4434" />
          <rect x={x + 35} y="672" width="24" height="205" fill="#382A22" />
          <rect x={x + 300} y="672" width="24" height="205" fill="#382A22" />
          <rect x={x + 108} y="542" width="170" height="94" rx="7" fill="#0A101A" stroke="#42536B" strokeWidth="7" />
          <rect x={x + 128} y="560" width="130" height="56" fill="#18374B" opacity={reveal} />
          <StickPerson x={x - 55} y={700} scale={0.84} pose="sit" color={i === 1 ? accent : "#638A8A"} phone={i === 1} />
        </g>
      ))}
      <g transform={`translate(${paperX} 0) rotate(-5 0 0)`} opacity={reveal}>
        <rect x="0" y="570" width="150" height="96" rx="5" fill="#D7CCB5" />
        {[0, 1, 2].map((line) => (
          <rect key={line} x="24" y={594 + line * 20} width={line === 2 ? 70 : 102} height="6" fill="#777368" />
        ))}
      </g>
    </>
  );
};

const Classroom: React.FC<Props> = ({accent, progress}) => {
  const boardReveal = interpolate(progress, [0.12, 0.66], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <rect width="1920" height="1080" fill="#231D19" />
      <rect x="0" y="0" width="1920" height="730" fill="#C4AF84" opacity="0.72" />
      <rect x="360" y="115" width="1200" height="420" rx="12" fill="#17372D" stroke="#6B5334" strokeWidth="20" />
      <path
        d="M520 350 C710 260 860 430 1050 300 S1370 340 1430 250"
        fill="none"
        stroke="#E8E0CB"
        strokeWidth="12"
        strokeDasharray="28 18"
        strokeDashoffset={(1 - boardReveal) * 420}
      />
      <text data-layout-box="classroom-label" x="485" y="485" fill="#F2F1EA" fontSize="48" fontWeight="800" fontFamily="sans-serif" opacity={boardReveal}>見えない差</text>
      <rect y="730" width="1920" height="350" fill="#795B3D" opacity="0.58" />
      {[390, 810, 1230].map((x, i) => (
        <g key={x}>
          <rect x={x} y={710 + i * 35} width="310" height="52" rx="8" fill="#6A4A31" />
          <rect x={x + 35} y={762 + i * 35} width="24" height="170" fill="#3D2A20" />
          <rect x={x + 250} y={762 + i * 35} width="24" height="170" fill="#3D2A20" />
          <StickPerson x={x + 155} y={700 + i * 35} scale={0.72} pose="sit" color={i === 1 ? accent : "#638A8A"} />
        </g>
      ))}
      <StickPerson x={250} y={620} scale={1.02} color="#D7CCB5" />
    </>
  );
};

const Library: React.FC<Props> = ({accent, progress, variant}) => {
  const selected = interpolate(progress, [0.18, 0.72], [0, 190], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <rect width="1920" height="1080" fill="#0C1615" />
      <rect x="120" y="105" width="1680" height="720" rx="18" fill="#132720" stroke="#3C4D3F" strokeWidth="12" />
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          <rect x="180" y={255 + row * 145} width="1560" height="18" fill="#57412E" />
          {Array.from({length: 18}, (_, book) => {
            const width = 48 + ((book + row + variant) % 3) * 9;
            const x = 200 + book * 84;
            const isSelected = row === 1 && book === 10;
            return (
              <rect
                key={book}
                x={x}
                y={160 + row * 145 + (isSelected ? selected : 0)}
                width={width}
                height="95"
                rx="3"
                fill={isSelected ? accent : ["#536457", "#6E584C", "#35515B", "#75664C"][(book + row) % 4]}
              />
            );
          })}
        </g>
      ))}
      <path d="M760 0 H1160 L1330 770 H590 Z" fill={accent} opacity="0.08" />
      <StickPerson x={960} y={795} scale={1.04} color={accent} />
    </>
  );
};

const Machine: React.FC<Props> = ({accent, progress}) => {
  const rotation = progress * 280;
  const conveyor = interpolate(progress, [0, 1], [0, 150]);
  return (
    <>
      <rect width="1920" height="1080" fill="#0B1320" />
      <rect x="0" y="0" width="1920" height="760" fill="#182433" />
      <rect x="570" y="170" width="780" height="610" rx="34" fill="#A8A79F" stroke="#4B5260" strokeWidth="18" />
      <circle cx="960" cy="480" r="230" fill="#111827" stroke="#D2D0C7" strokeWidth="36" />
      <g transform={`rotate(${rotation} 960 480)`}>
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="960"
            cy="355"
            rx="58"
            ry="92"
            fill={angle % 144 === 0 ? accent : "#6A7C89"}
            opacity="0.74"
            transform={`rotate(${angle} 960 480)`}
          />
        ))}
      </g>
      <rect x="635" y="215" width="270" height="66" rx="8" fill="#1C2C37" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={1140 + i * 58} cy="248" r="18" fill={i === 1 ? accent : "#344C5A"} />
      ))}
      <rect y="810" width="1920" height="270" fill="#090D15" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={-120 + i * 390 + conveyor}
          y="835"
          width="220"
          height="72"
          rx="10"
          fill={i % 2 ? "#D7CCB5" : "#638A8A"}
          opacity="0.65"
        />
      ))}
    </>
  );
};

const Balance: React.FC<Props> = ({accent, progress}) => {
  const tilt = interpolate(progress, [0.1, 0.78], [-7, 9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <rect width="1920" height="1080" fill="#10131F" />
      <path d="M760 0 H1160 L1390 820 H530 Z" fill={accent} opacity="0.08" />
      <rect x="930" y="280" width="60" height="520" rx="26" fill="#8C7652" />
      <polygon points="960,205 1060,330 860,330" fill="#C4AC77" />
      <g transform={`rotate(${tilt} 960 350)`}>
        <rect x="480" y="330" width="960" height="36" rx="18" fill="#C4AC77" />
        <line x1="570" y1="360" x2="470" y2="620" stroke="#9A865D" strokeWidth="12" />
        <line x1="710" y1="360" x2="810" y2="620" stroke="#9A865D" strokeWidth="12" />
        <path d="M390 620 Q640 810 890 620 Z" fill="#27324A" stroke="#C4AC77" strokeWidth="12" />
        <line x1="1210" y1="360" x2="1110" y2="620" stroke="#9A865D" strokeWidth="12" />
        <line x1="1350" y1="360" x2="1450" y2="620" stroke="#9A865D" strokeWidth="12" />
        <path d="M1030 620 Q1280 810 1530 620 Z" fill="#27324A" stroke="#C4AC77" strokeWidth="12" />
      </g>
      <circle cx="640" cy="600" r="72" fill={accent} opacity="0.8" />
      <rect x="1205" y="505" width="150" height="120" rx="12" fill="#D7CCB5" />
      <rect x="820" y="800" width="280" height="54" rx="14" fill="#6E5A3E" />
    </>
  );
};

const Network: React.FC<Props> = ({accent, progress, variant}) => {
  const nodes = [
    [960, 430],
    [560, 280],
    [1360, 280],
    [390, 650],
    [730, 730],
    [1190, 730],
    [1530, 650],
  ];
  const edges = [[0, 1], [0, 2], [0, 4], [0, 5], [1, 3], [1, 4], [2, 5], [2, 6], [4, 5]];
  const reveal = interpolate(progress, [0.06, 0.72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <rect width="1920" height="1080" fill="#09121E" />
      <circle cx="960" cy="500" r="560" fill={accent} opacity="0.035" />
      {edges.map(([a, b], index) => {
        const [x1, y1] = nodes[a];
        const [x2, y2] = nodes[b];
        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x1 + (x2 - x1) * reveal}
            y2={y1 + (y2 - y1) * reveal}
            stroke={index % 3 === variant % 3 ? accent : "#40546A"}
            strokeWidth="10"
            opacity="0.72"
          />
        );
      })}
      {nodes.map(([x, y], index) => (
        <g key={`${x}-${y}`} opacity={interpolate(reveal, [index / 10, Math.min(1, index / 10 + 0.24)], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}>
          <circle cx={x} cy={y} r={index === 0 ? 78 : 54} fill={index === 0 ? accent : "#243247"} />
          <circle cx={x} cy={y - 10} r={index === 0 ? 22 : 16} fill="#B49A78" />
          <path d={`M${x - 30} ${y + 34} Q${x} ${y + 2} ${x + 30} ${y + 34}`} fill="#121A27" />
        </g>
      ))}
    </>
  );
};

export const NativeVisual: React.FC<Props> = (props) => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
      {props.motif === "desk" && <Desk {...props} />}
      {props.motif === "city" && <City {...props} />}
      {props.motif === "stage" && <Stage {...props} />}
      {props.motif === "chart" && <Chart {...props} />}
      {props.motif === "document" && <Document {...props} />}
      {props.motif === "clock" && <Clock {...props} />}
      {props.motif === "office" && <Office {...props} />}
      {props.motif === "classroom" && <Classroom {...props} />}
      {props.motif === "library" && <Library {...props} />}
      {props.motif === "machine" && <Machine {...props} />}
      {props.motif === "balance" && <Balance {...props} />}
      {props.motif === "network" && <Network {...props} />}
    </svg>
  );
};
