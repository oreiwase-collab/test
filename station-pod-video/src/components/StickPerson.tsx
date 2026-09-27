export type StickPose = "stand" | "walk" | "sit" | "lean" | "small" | "adult" | "point" | "cower";

type Joint = [number, number];

type Props = {
  x: number;
  y: number;
  scale?: number;
  pose?: StickPose;
  color?: string;
  phase?: number;
  flip?: boolean;
  opacity?: number;
  phone?: boolean;
  can?: boolean;
};

export const StickPerson: React.FC<Props> = ({
  x,
  y,
  scale = 1,
  pose = "stand",
  color = "#638A8A",
  phase = 0,
  flip = false,
  opacity = 1,
  phone = false,
  can = false,
}) => {
  const walking = pose === "walk";
  const sitting = pose === "sit" || pose === "lean";
  const adult = pose === "adult";
  const small = pose === "small";
  const sway = walking ? Math.sin(phase) * 19 : 0;
  const torsoTop = small ? -108 : adult ? -142 : -126;
  const hipY = sitting ? -20 : 0;
  const stroke = adult ? 18 : 14;
  const shoulderY = torsoTop + 22;

  let leftElbow: Joint = walking ? [-34 - sway * 0.25, -70] : sitting ? [-42, -58] : [-34, -70];
  let rightElbow: Joint = walking ? [34 - sway * 0.25, -68] : sitting ? [42, -56] : [34, -68];
  let leftHand: Joint = walking ? [-60 + sway, -28] : sitting ? [-68, -12] : [-60, -30];
  let rightHand: Joint = walking ? [60 - sway, -28] : sitting ? [68, -10] : [60, -30];

  if (pose === "lean") {
    leftElbow = [-42, -62];
    rightElbow = [38, -52];
    leftHand = [-62, -18];
    rightHand = [62, -14];
  }

  if (pose === "point") {
    rightElbow = [54, -88];
    rightHand = [110, -96];
  }

  if (pose === "cower") {
    leftElbow = [-30, -60];
    rightElbow = [30, -60];
    leftHand = [-12, -104];
    rightHand = [12, -104];
  }

  if (phone) {
    leftElbow = [-38, -72];
    rightElbow = [44, -70];
    leftHand = [7, -39];
    rightHand = [41, -39];
  }

  if (can) {
    rightElbow = [42, -58];
    rightHand = [72, -22];
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`} opacity={opacity}>
      {phone ? <circle cx="25" cy="-44" r="122" fill={color} opacity="0.12" /> : null}
      <circle cx="0" cy={torsoTop - 35} r={small ? 24 : adult ? 34 : 29} fill="#171A2A" stroke={color} strokeWidth="8" />
      <path d={`M0 ${torsoTop} L0 ${hipY}`} stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      <path
        d={`M-3 ${shoulderY} L${leftElbow[0]} ${leftElbow[1]} L${leftHand[0]} ${leftHand[1]}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke - 3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M3 ${shoulderY} L${rightElbow[0]} ${rightElbow[1]} L${rightHand[0]} ${rightHand[1]}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke - 3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {sitting ? (
        <>
          <path d="M0 -4 L-62 20 L-78 105" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M0 -4 L62 24 L82 105" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d={`M0 0 L${-27 - sway} 88 L${-55 - sway * 1.5} 168`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M0 0 L${28 + sway} 88 L${55 + sway * 1.5} 168`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {phone ? <rect x="7" y="-67" width="34" height="54" rx="5" fill="#9DEBFA" stroke="#F0FFFF" strokeWidth="3" /> : null}
      {can ? (
        <>
          <rect x="59" y="-48" width="28" height="52" rx="5" fill="#D7D2C8" />
          <path d="M73 -48 L87 -88" stroke="#D7D2C8" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : null}
      <circle cx={leftHand[0]} cy={leftHand[1]} r={8} fill={color} />
      <circle cx={rightHand[0]} cy={rightHand[1]} r={8} fill={color} />
    </g>
  );
};
