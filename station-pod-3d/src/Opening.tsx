import "@fontsource/noto-sans-jp/700.css";
import "@fontsource/noto-sans-jp/800.css";
import "@fontsource/noto-sans-jp/900.css";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame, Easing} from "remotion";
import {ThreeCanvas} from "@remotion/three";
import {ContactShadows, Grid, PerspectiveCamera, RoundedBox} from "@react-three/drei";
import * as THREE from "three";
import data from "./opening.json";
import {Booth, CrowdInstances, Mannequin, StationHall, usePodTexture} from "./three/parts";
import {C, FONT, GlitchBands, KeyText, Panel, reveal, Subtitles} from "./ui";

type Vec3 = [number, number, number];
const S = data.scenes;
/** 場面内の強調表示の絶対フレーム（inputs と同じ実測値） */
const RV = (i: number, key: string): number => {
  const v = (S[i].reveals as unknown as Record<string, number>)[key];
  if (v === undefined) throw new Error(`reveal ${key} がありません`);
  return v;
};
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic)});

/** フレームごとに位置と注視点を決めるカメラ（drei の PerspectiveCamera） */
const Cam: React.FC<{pos: Vec3; target: Vec3; fov?: number; filmOffset?: number}> = ({pos, target, fov = 36, filmOffset = 0}) => {
  const ref = useRef<THREE.PerspectiveCamera>(null);
  useLayoutEffect(() => {
    ref.current?.lookAt(...target);
    ref.current?.updateProjectionMatrix();
  });
  return <PerspectiveCamera ref={ref} makeDefault position={pos} fov={fov} near={0.1} far={200} filmOffset={filmOffset} />;
};

const Canvas: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = "#090D19"}) => (
  <ThreeCanvas width={1920} height={1080} shadows gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping}} style={{background: bg}}>
    <color attach="background" args={[bg]} />
    <fog attach="fog" args={[bg, 14, 60]} />
    {children}
  </ThreeCanvas>
);

/* ------------------------------------------------ ショット1：駅コンコースを真上から */
const ShotCrowd: React.FC = () => {
  const f = useCurrentFrame();
  const kp = RV(0, "kp");
  const t = ease(f, 0, 183);
  const ring = (f % 45) / 45;
  return (
    <AbsoluteFill>
      <Canvas>
        <Cam pos={lerp3([0, 19, 8], [2.4, 11.5, 7.2], t)} target={[0, 0.6, 0]} />
        <ambientLight intensity={0.35} />
        <hemisphereLight args={["#9FB4D8", "#0B0F1A", 0.5]} />
        <spotLight position={[0, 12, 0]} angle={0.28} penumbra={0.6} intensity={120} color="#FFD591" castShadow shadow-mapSize={[1024, 1024]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[80, 50]} />
          <meshStandardMaterial color="#111827" roughness={0.7} />
        </mesh>
        <Grid position={[0, 0.01, 0]} args={[80, 50]} cellSize={1.2} cellThickness={0.6} cellColor="#1C2536" sectionSize={6} sectionThickness={1} sectionColor="#27324A" fadeDistance={80} infiniteGrid={false} />
        {[-10, 10].map((z) => (
          <mesh key={z} position={[0, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[80, 0.5]} />
            <meshStandardMaterial color="#8E7236" roughness={0.8} />
          </mesh>
        ))}
        <CrowdInstances frame={f} />
        <Mannequin position={[0, 0, 0]} walking={false} color="#D2A451" rotationY={0.4} />
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6 + ring * 1.8, 0.68 + ring * 1.8, 64]} />
          <meshBasicMaterial color="#D2A451" transparent opacity={0.7 * (1 - ring)} />
        </mesh>
      </Canvas>
      <KeyText text="絶対にあり得ない" x={960} y={640} frame={f} at={kp} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ ショット2：通路のブースに人が入る */
const ShotBooth: React.FC = () => {
  const f = useCurrentFrame();
  const tex = usePodTexture();
  const enter = RV(1, "enter") - S[1].from;
  const kp = RV(1, "kp") - S[1].from;
  const booth: Vec3 = [1.6, 0, 0];
  if (!tex) return null;
  // 通路を歩く（→ 向き）→ ブースの前で向きを変えて近づく → 中に入る
  const a = ease(f, 0, enter - 26);
  const b = ease(f, enter - 26, enter);
  const pos: Vec3 = b > 0 ? lerp3([1.6, 0, 2.0], [1.6, 0, 0.95], b) : lerp3([-1.6, 0, 2.0], [1.6, 0, 2.0], a);
  const rot = b > 0 ? Math.PI : Math.PI / 2;
  const fade = interpolate(f, [enter - 4, enter + 6], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const glow = reveal(f, enter + 8, 14);
  const t = ease(f, 0, S[1].to - S[1].from);
  const jolt = f >= kp - 1 && f < kp + 8 ? (1 - (f - kp) / 8) * 0.06 : 0;
  return (
    <AbsoluteFill>
      <Canvas bg="#0C1120">
        <Cam pos={lerp3([-2.4, 1.8, 6.6], [-1.0, 1.55, 5.0], t).map((v, i) => v + (i === 0 ? Math.sin(f * 3) * jolt : 0)) as Vec3} target={[0.9, 1.25, 0.3]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#AFC3E6", "#0B0F1A", 0.8]} />
        <directionalLight position={[-4, 7, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
        <spotLight position={[1.6, 4.2, 2.2]} angle={0.45} penumbra={0.7} intensity={40} color="#FFE0A8" castShadow />
        <StationHall frame={f} />
        <Booth texture={tex} position={booth} glow={glow} />
        {fade > 0 ? <Mannequin position={pos} rotationY={rot} phase={f * 0.3} walking={b < 1} color="#7FB0B0" opacity={fade} /> : null}
      </Canvas>
      <KeyText text="勘違い" x={520} y={250} frame={f} at={kp} size={110} glitch />
      <GlitchBands at={kp} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ ショット3：ニュース（回り込むブース＋広まる動画＋警察） */
const Phone: React.FC<{position: Vec3; rotY: number; s: number; flash: number}> = ({position, rotY, s, flash}) => (
  <group position={position} rotation={[0, rotY, 0]} scale={s}>
    <RoundedBox args={[0.34, 0.66, 0.035]} radius={0.04} smoothness={3}>
      <meshStandardMaterial color="#10141E" metalness={0.5} roughness={0.3} />
    </RoundedBox>
    <mesh position={[0, 0, 0.02]}>
      <planeGeometry args={[0.3, 0.58]} />
      <meshStandardMaterial color="#123040" emissive="#2E7F8C" emissiveIntensity={0.9 + flash} />
    </mesh>
    {[[-0.06, 0.05], [0.07, 0.13], [0.07, -0.03]].map(([x, y], i) => (
      <mesh key={i} position={[x, y, 0.025]}>
        <circleGeometry args={[0.03, 16]} />
        <meshBasicMaterial color="#D8FFF9" />
      </mesh>
    ))}
  </group>
);

const ShotNews: React.FC = () => {
  const f = useCurrentFrame();
  const tex = usePodTexture();
  const from = S[2].from;
  const pod = reveal(f, RV(2, "pod") - from, 10);
  const sns = RV(2, "sns") - from;
  const police = RV(2, "police") - from;
  const open = reveal(f, 6, 12);
  const t = ease(f, 0, S[2].to - from);
  const ang = interpolate(t, [0, 1], [0.45, -0.3]);
  const R = interpolate(t, [0, 1], [6.5, 6.0]);
  const pol = f >= police - 4;
  const blink = Math.sin(f * 0.5) > 0 ? 1 : 0;
  if (!tex) return null;
  const phones: {p: Vec3; r: number}[] = [
    {p: [1.25, 1.9, 0.3], r: -0.4},
    {p: [1.05, 0.9, 0.8], r: -0.3},
    {p: [-0.95, 2.1, -0.2], r: 0.4},
    {p: [1.6, 2.2, -0.7], r: -0.6},
    {p: [-1.1, 1.3, 0.5], r: 0.5},
    {p: [0.45, 2.25, -1.1], r: 0},
  ];
  return (
    <AbsoluteFill>
      <Canvas bg="#0A0D19">
        {/* ブースを中心に回り込み、画面上ではブースを右側（ラベルの真下）に保つ */}
        <Cam pos={[Math.sin(ang) * R, 1.45, Math.cos(ang) * R]} target={[0, 1.05, 0]} fov={34} filmOffset={-9} />
        <ambientLight intensity={0.35} />
        <spotLight position={[2.5, 5, 3.5]} angle={0.4} penumbra={0.8} intensity={60 + pod * 40} color="#FFE3B0" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-2, 2, -2]} intensity={6} color="#638A8A" />
        {pol ? (
          <>
            <pointLight position={[-1.4, 2.2, 1.6]} intensity={blink ? 14 : 2} distance={6} color="#E0344E" />
            <pointLight position={[1.4, 2.2, 1.6]} intensity={blink ? 2 : 14} distance={6} color="#3D6BE0" />
          </>
        ) : null}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#0F1422" roughness={0.3} metalness={0.4} />
        </mesh>
        <ContactShadows position={[0, 0.005, 0]} opacity={0.75} scale={6} blur={2.4} far={3} frames={1} />
        <Booth texture={tex} position={[0, 0, 0]} rotationY={-0.15} glow={pod * 0.5} />
        {phones.map((ph, i) => {
          const s = reveal(f, sns + i * 5, 10);
          return s > 0.01 ? <Phone key={i} position={[ph.p[0], ph.p[1] + Math.sin(f * 0.05 + i) * 0.04, ph.p[2]]} rotY={ph.r} s={s} flash={Math.max(0, 1 - (f - sns - i * 5) / 20)} /> : null;
        })}
      </Canvas>
      <Panel style={{left: 150, top: 140, width: 820, padding: "40px 52px", opacity: open, transform: `translateY(${(1 - open) * 20}px)`}}>
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
          <div style={{fontSize: 38, fontWeight: 700, opacity: reveal(f, sns, 10), transform: `translateX(${(1 - reveal(f, sns, 10)) * 30}px)`}}>
            <span style={{color: C.teal}}>●</span> 動画がネットに広まる
          </div>
          <div style={{fontSize: 38, fontWeight: 700, opacity: reveal(f, police, 10), transform: `translateX(${(1 - reveal(f, police, 10)) * 30}px)`}}>
            <span style={{color: blink ? "#D64860" : "#4C7BD9"}}>●</span> 警察が動く大きな騒ぎに
          </div>
        </div>
      </Panel>
      <div
        style={{position: "absolute", left: 1450, top: 100, transform: `translate(-50%, ${(1 - pod) * 12}px)`, opacity: pod, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.white, background: "rgba(9,13,25,0.85)", border: `2px solid ${C.gold}`, borderRadius: 10, padding: "4px 20px", whiteSpace: "nowrap"}}
      >
        ステーションポッド
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ 全体 */
const FontGate: React.FC = () => {
  const [h] = useState(() => delayRender("Noto Sans JP"));
  useEffect(() => {
    const all = data.captions.map((c) => c.text).join("") + "絶対にあり得ない勘違いニュース2026年9月都内の大きな駅に置かれたテレワーク用の防音個室●動画がネットに広まる警察が動く大きな騒ぎにステーションポッド";
    Promise.all([700, 800, 900].map((w) => document.fonts.load(`${w} 40px "Noto Sans JP"`, all)))
      .then(() => document.fonts.ready)
      .then(() => continueRender(h))
      .catch(() => continueRender(h));
  }, [h]);
  return null;
};

export const Opening: React.FC = () => (
  <AbsoluteFill style={{background: C.night}}>
    <FontGate />
    {/* ナレーションは無編集の元ファイル。冒頭 28.4 秒だけ再生される */}
    <Audio src={staticFile(data.audioFile)} />
    <Sequence from={S[0].from} durationInFrames={S[0].to - S[0].from} name="1 駅コンコース（真上）">
      <ShotCrowd />
    </Sequence>
    <Sequence from={S[1].from} durationInFrames={S[1].to - S[1].from} name="2 ブースに入る">
      <ShotBooth />
    </Sequence>
    <Sequence from={S[2].from} durationInFrames={S[2].to - S[2].from} name="3 ニュース">
      <ShotNews />
    </Sequence>
    <AbsoluteFill style={{pointerEvents: "none", background: "radial-gradient(ellipse 75% 70% at 50% 45%, transparent 50%, rgba(3,5,10,0.55) 100%)"}} />
    <Subtitles captions={data.captions} />
  </AbsoluteFill>
);
