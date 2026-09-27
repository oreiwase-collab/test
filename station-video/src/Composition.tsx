import {Audio} from "@remotion/media";
import {useEffect, useState} from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import timelineData from "./data/timeline.json";
import {SceneRenderer} from "./components/SceneRenderer";
import {SubtitleLayer} from "./components/SubtitleLayer";
import {LayoutCollisionGuard} from "./components/LayoutCollisionGuard";
import type {Timeline} from "./types";

const timeline = timelineData as unknown as Timeline;

const Texture: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drift = ((frame / fps) % 12) / 12;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.18,
        mixBlendMode: "soft-light",
        backgroundImage:
          "radial-gradient(circle at 24% 18%, rgba(255,255,255,0.12) 0 1px, transparent 2px), radial-gradient(circle at 72% 61%, rgba(255,255,255,0.08) 0 1px, transparent 2px)",
        backgroundSize: "83px 79px, 117px 109px",
        backgroundPosition: `${drift * 18}px ${drift * 10}px, ${-drift * 12}px ${drift * 7}px`,
      }}
    />
  );
};

// Load every Noto Sans JP subset the video needs before the first frame renders.
const allText = [
  ...timeline.captions.map((c) => c.text),
  ...timeline.scenes.map((s) => s.body),
  "0123456789:%約倍低下年人ー・※（）？→×¥｜",
  "頭の中街の仕組み心のスイッチ勘違い守られている社会を科学する警察が動く騒ぎにニュース動画が共有されました",
  "駅のコンコース真上から畳1枚分おかしな人狭い箱広い部屋中くらいドキドキストレスを測定見られることへの警戒心",
  "自分だけの机と椅子まるでテレビの中写真はイメージです事件の現場ではありません都内の大きな駅テレワーク用の防音個室",
  "自由に使えた広場お金を払った人だけのブース半年間観察防犯カメラを増やしてももとの広場ブースの中迷惑行為",
  "お互いに見守り合う自然なブレーキみんなで分け合う場所有料街の共有スペースみんなのマナー自分の部屋の自由大きな隙間",
  "便利さの追求がモラルを麻痺させたなぜ私たちは個室を必要とした24時間繋がり続けるSOS働く大人の追跡調査",
  "スマホで繋がり続ける人たち仕事の連絡通信オフ1日1時間どんな気持ちになる衝動的な行動を強く望んだ人ルール解放感",
  "マナーのブレーキ隠れ家現代の隠れ家絶対に自分をコントロールできますかコメント欄で教えてください駅のあの個室に入ったらどんな気分",
  "コメントするチャンネル登録次回もニュースを一緒に深く分析アメリカ・コーネル大学ゲイリー・エバンス部屋の広さと他人の視線の実験",
  "都市の研究エドワード・ソジャ区切られた広場での人々の行動ロサンゼルスシェリー・タークル中央改札1・2番線出口東口駅前通りオフィス薬局",
].join("");

const FontGate: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading Noto Sans JP"));
  useEffect(() => {
    Promise.all([
      document.fonts.load("700 40px 'Noto Sans JP'", allText),
      document.fonts.load("900 40px 'Noto Sans JP'", allText),
    ])
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
  return null;
};

export const NarratedIllustratedVideo: React.FC = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: "#090D19", overflow: "hidden"}}>
      <FontGate />
      {(timeline.audioParts || [{file: timeline.audioFile, fromFrame: 0}]).map((part) => (
        <Sequence key={part.file} from={part.fromFrame} name={part.file} layout="none">
          <Audio src={staticFile(part.file)} />
        </Sequence>
      ))}

      {timeline.scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={Math.round(scene.start * fps)}
          durationInFrames={Math.max(1, Math.round(scene.duration * fps))}
          name={scene.id}
        >
          <SceneRenderer scene={scene} />
        </Sequence>
      ))}

      <Texture />
      <SubtitleLayer timeline={timeline} />
      <LayoutCollisionGuard />
    </AbsoluteFill>
  );
};
