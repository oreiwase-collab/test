// 3D の部品：関節つきの人物、駅の空間、写真を正面に貼ったブース
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {continueRender, delayRender, cancelRender, staticFile} from "remotion";
import {RoundedBox} from "@react-three/drei";
import * as THREE from "three";
import {rand} from "../ui";

/* ---------------------------------------------------------------- 写真テクスチャ */

/** 依頼で指定されたステーションポッドの写真を、読み込み完了まで描画を待って使う */
export const usePodTexture = () => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender("ステーションポッドの写真"));
  useEffect(() => {
    new THREE.TextureLoader().load(
      staticFile("station-pod.png"),
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        setTex(t);
        continueRender(handle);
      },
      undefined,
      (err) => cancelRender(err),
    );
  }, [handle]);
  return tex;
};

/* ---------------------------------------------------------------- 人物 */

const Limb: React.FC<{length: number; radius: number; color: string; opacity: number}> = ({length, radius, color, opacity}) => (
  <mesh position={[0, -length / 2, 0]} castShadow>
    <capsuleGeometry args={[radius, length - radius * 2, 6, 12]} />
    <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} transparent={opacity < 1} opacity={opacity} />
  </mesh>
);

/**
 * 関節（肩・肘・股・膝）を親子関係でつないだ人物。
 * 腕は肩→肘→手、脚は股→膝→足が必ずつながる。
 */
export const Mannequin: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  phase?: number;
  walking?: boolean;
  color?: string;
  scale?: number;
  opacity?: number;
}> = ({position, rotationY = 0, phase = 0, walking = true, color = "#8FA3B8", scale = 1, opacity = 1}) => {
  const s = walking ? Math.sin(phase) : 0;
  const leg = s * 0.55;
  const kneeL = walking ? Math.max(0, Math.sin(phase + 1.3)) * 0.9 : 0;
  const kneeR = walking ? Math.max(0, Math.sin(phase + Math.PI + 1.3)) * 0.9 : 0;
  const arm = -s * 0.5;
  const bob = walking ? Math.abs(Math.cos(phase)) * 0.035 : 0;
  const mat = {color, opacity};
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <group position={[0, 0.92 + bob, 0]}>
        {/* 胴と頭 */}
        <mesh position={[0, 0.32, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.38, 6, 14]} />
          <meshStandardMaterial color={color} roughness={0.5} transparent={opacity < 1} opacity={opacity} />
        </mesh>
        <mesh position={[0, 0.78, 0]} castShadow>
          <sphereGeometry args={[0.12, 20, 16]} />
          <meshStandardMaterial color={color} roughness={0.45} transparent={opacity < 1} opacity={opacity} />
        </mesh>
        {/* 腕：肩 → 肘 → 手 */}
        {([-1, 1] as const).map((side) => (
          <group key={`arm${side}`} position={[side * 0.2, 0.56, 0]} rotation={[arm * side, 0, side * 0.06]}>
            <Limb length={0.3} radius={0.05} {...mat} />
            <group position={[0, -0.3, 0]} rotation={[-0.35 - Math.max(0, arm * side) * 0.4, 0, 0]}>
              <Limb length={0.28} radius={0.045} {...mat} />
              <mesh position={[0, -0.3, 0]}>
                <sphereGeometry args={[0.055, 12, 10]} />
                <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} />
              </mesh>
            </group>
          </group>
        ))}
        {/* 脚：股 → 膝 → 足 */}
        {([-1, 1] as const).map((side) => (
          <group key={`leg${side}`} position={[side * 0.1, 0, 0]} rotation={[leg * side, 0, 0]}>
            <Limb length={0.46} radius={0.07} {...mat} />
            <group position={[0, -0.46, 0]} rotation={[side === -1 ? kneeL : kneeR, 0, 0]}>
              <Limb length={0.44} radius={0.06} {...mat} />
              <mesh position={[0, -0.46, 0.06]}>
                <boxGeometry args={[0.1, 0.06, 0.22]} />
                <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
};

/**
 * 真上から見る群衆（簡略体を InstancedMesh で大量に描く）。
 * 位置はフレームから決まるので、毎フレーム行列を書き換える。
 */
export const CrowdInstances: React.FC<{frame: number; count?: number; stopRadius?: number}> = ({frame, count = 160, stopRadius = 1.4}) => {
  const bodies = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const col = new THREE.Color();
    const hues = ["#6E7F99", "#58677F", "#8A93A6", "#4B5A73"];
    for (let i = 0; i < count; i += 1) {
      const dir = i % 2 === 0 ? 1 : -1;
      const speed = (1.1 + rand(i) * 0.7) / 30;
      const z = -9 + rand(i + 900) * 18;
      let x = ((rand(i + 300) * 44 + dir * frame * speed) % 44 + 44) % 44 - 22;
      // 中央で立ち止まる1人のまわりは避けて通る
      if (Math.abs(x) < stopRadius && Math.abs(z) < stopRadius) x += x >= 0 ? stopRadius : -stopRadius;
      const bob = Math.abs(Math.sin(frame * 0.35 + i)) * 0.04;
      m.makeTranslation(x, 0.65 + bob, z);
      bodies.current?.setMatrixAt(i, m);
      bodies.current?.setColorAt(i, col.set(hues[i % 4]));
      m.makeTranslation(x, 1.45 + bob, z);
      heads.current?.setMatrixAt(i, m);
    }
    for (const mesh of [bodies.current, heads.current]) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  });
  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, count]} castShadow frustumCulled={false}>
        <capsuleGeometry args={[0.2, 0.9, 4, 10]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, count]} frustumCulled={false}>
        <sphereGeometry args={[0.16, 14, 10]} />
        <meshStandardMaterial color="#C9C2B0" roughness={0.5} />
      </instancedMesh>
    </group>
  );
};

/* ---------------------------------------------------------------- ブース */

/**
 * ステーションポッド。箱の正面に依頼の写真をそのまま貼る。
 * 写真の比率（948×1712）を保つ。
 */
export const Booth: React.FC<{texture: THREE.Texture; position?: [number, number, number]; rotationY?: number; glow?: number}> = ({
  texture,
  position = [0, 0, 0],
  rotationY = 0,
  glow = 0,
}) => {
  const w = 1.1;
  const h = (w * 1712) / 948;
  const d = 1.05;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <RoundedBox args={[w * 0.97, h * 0.965, d]} radius={0.03} smoothness={3} position={[0, (h * 0.965) / 2, -0.01]} castShadow receiveShadow>
        <meshStandardMaterial color="#1A1E27" roughness={0.45} metalness={0.35} />
      </RoundedBox>
      <mesh position={[0, h / 2, d / 2 + 0.002]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} transparent alphaTest={0.4} roughness={0.35} metalness={0.1} emissive="#D2A451" emissiveIntensity={glow * 0.12} emissiveMap={texture} />
      </mesh>
      <pointLight position={[0, h * 0.7, 0]} intensity={glow * 6} distance={3.5} color="#FFC977" />
    </group>
  );
};

/* ---------------------------------------------------------------- 駅の空間 */

export const StationHall: React.FC<{frame: number}> = ({frame}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 30]} />
      <meshStandardMaterial color="#141A28" roughness={0.35} metalness={0.2} />
    </mesh>
    {/* 点字ブロック */}
    <mesh position={[0, 0.005, 2.6]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[60, 0.3]} />
      <meshStandardMaterial color="#8E7236" roughness={0.8} />
    </mesh>
    {/* 奥の壁 */}
    <mesh position={[0, 3, -4]} receiveShadow>
      <planeGeometry args={[60, 6]} />
      <meshStandardMaterial color="#1B2438" roughness={0.8} />
    </mesh>
    {/* 柱 */}
    {Array.from({length: 9}, (_, i) => (
      <mesh key={`p${i}`} position={[-16 + i * 4, 2.5, -2.4]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 5, 0.7]} />
        <meshStandardMaterial color="#222C42" roughness={0.6} />
      </mesh>
    ))}
    {/* 天井の照明 */}
    {Array.from({length: 12}, (_, i) => (
      <mesh key={`l${i}`} position={[-22 + i * 4, 4.6, -0.5]}>
        <boxGeometry args={[2.2, 0.06, 0.25]} />
        <meshStandardMaterial color="#F6EBD2" emissive="#F6EBD2" emissiveIntensity={1.3} />
      </mesh>
    ))}
    {/* 案内表示（色つきのピクトグラム板） */}
    {Array.from({length: 6}, (_, i) => (
      <group key={`s${i}`} position={[-14 + i * 5.6, 3.7, -3.9]}>
        <mesh>
          <boxGeometry args={[1.8, 0.5, 0.05]} />
          <meshStandardMaterial color="#1B2A44" roughness={0.5} />
        </mesh>
        <mesh position={[-0.6, 0, 0.03]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial color={i % 2 ? "#D2A451" : "#638A8A"} emissive={i % 2 ? "#D2A451" : "#638A8A"} emissiveIntensity={0.8} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[-0.1 + k * 0.28, 0, 0.03]}>
            <planeGeometry args={[0.2, 0.08]} />
            <meshStandardMaterial color="#E8E2D2" emissive="#E8E2D2" emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>
    ))}
    {/* 奥を行き交う人（関節つき） */}
    {Array.from({length: 8}, (_, i) => {
      const dir = i % 2 ? 1 : -1;
      const x = ((rand(i + 5) * 36 + dir * frame * (0.045 + rand(i) * 0.02)) % 36 + 36) % 36 - 18;
      return (
        <Mannequin
          key={i}
          position={[x, 0, -3 + rand(i + 50) * 1.2]}
          rotationY={dir > 0 ? Math.PI / 2 : -Math.PI / 2}
          phase={frame * 0.32 + i}
          color="#55647E"
        />
      );
    })}
  </group>
);
