import "@fontsource/noto-sans-jp/500.css";
import "@fontsource/noto-sans-jp/700.css";
import "@fontsource/noto-sans-jp/800.css";
import "@fontsource/noto-sans-jp/900.css";
import {useEffect, useState} from "react";
import {Audio} from "@remotion/media";
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

const timeline = timelineData as Timeline;

// 画面内の固定文言（テロップ・ラベル）も含めて、使う文字をすべて先に読み込む
const EXTRA_TEXT =
  "絶対にあり得ない勘違いニュース2026年9月都内の大きな駅に置かれたテレワーク用の防音個室動画がネットに広まる警察が動く大きな騒ぎにステーションポッド" +
  "おかしな人心のスイッチ頭の中街の仕組み油断研究の紹介アメリカ・コーネル大学研究者ゲイリー・エバンス調査の年集めた街の人300人広い部屋中くらいの部屋狭い部屋" +
  "外から見られていることへの警戒心約40％低下守られているのりば出口改札乗換中央口個人の心社会全体の仕組み街の作りそのもの都市について研究学者エドワード・ソジャ1996ロサンゼルス" +
  "半年間ルールを破るいたずらや迷惑行為もとの広場ブースの中約3倍自然なブレーキ¥有料みんなのマナー自分の部屋の自由大きな隙間モラルを麻痺そもそもなぜSOS" +
  "働く大人を追いかけた調査シェリー・タークル2011200人1時間約70％ルール解放感言い切れますか社会を科学するコメント駅のあの個室に入ったら、どんな気分になる？｜チャンネル登録";

const FontGate: React.FC = () => {
  const [handle] = useState(() => delayRender("Noto Sans JP の読み込み"));
  useEffect(() => {
    const all = timeline.captions.map((c) => c.text).join("") + EXTRA_TEXT;
    Promise.all(
      [500, 700, 800, 900].map((w) => document.fonts.load(`${w} 40px "Noto Sans JP"`, all)),
    )
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, [handle]);
  return null;
};

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

export const NarratedIllustratedVideo: React.FC = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: "#090D19", overflow: "hidden"}}>
      <FontGate />
      <Audio src={staticFile(timeline.audioFile)} />

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
