import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {NativeVisual} from "./NativeVisual";
import {StoryScene} from "./StoryScenes";
import type {Scene} from "../types";

const motionTransform = (
  motion: Scene["motion"],
  progress: number,
): string => {
  if (motion === "slow-push") return `scale(${1.015 + progress * 0.035})`;
  if (motion === "drift-left") {
    return `scale(1.045) translateX(${24 - progress * 48}px)`;
  }
  if (motion === "drift-right") {
    return `scale(1.045) translateX(${-24 + progress * 48}px)`;
  }
  if (motion === "reveal") return `scale(${1.035 - progress * 0.015})`;
  return "scale(1)";
};

const ChapterCard: React.FC<{scene: Scene; progress: number}> = ({
  scene,
  progress,
}) => {
  const title = scene.headline || scene.body.slice(0, 34);
  const chapterMatch = scene.body.match(/第([0-9０-９一二三四五六七八九十]+)章/u);
  const chapter = chapterMatch ? chapterMatch[1] : "";
  const reveal = interpolate(progress, [0.05, 0.28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 50% 25%, rgba(210,164,81,0.16), transparent 25%), linear-gradient(180deg, #0B101D 0%, #11192C 100%)",
        fontFamily: "'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
      }}
    >
      <div
        data-layout-box="chapter-label"
        style={{
          width: 230,
          height: 230,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(242,241,234,0.23), transparent 68%)",
          display: "grid",
          placeItems: "center",
          transform: `translateY(${-95 + (1 - reveal) * 28}px)`,
          opacity: reveal,
        }}
      >
        <div
          style={{
            width: 74,
            height: 104,
            background: "#D7CCB5",
            clipPath: "polygon(15% 0, 85% 0, 100% 18%, 83% 30%, 83% 100%, 17% 100%, 17% 30%, 0 18%)",
            boxShadow: "0 18px 60px rgba(210,164,81,0.22)",
          }}
        />
      </div>
      <div
        data-layout-box="chapter-title"
        style={{
          marginTop: 18,
          color: "rgba(242,241,234,0.52)",
          fontSize: 24,
          letterSpacing: 12,
          opacity: reveal,
        }}
      >
        {chapter ? `第${chapter}章` : "章"}
      </div>
      <div
        style={{
          width: 820,
          height: 2,
          margin: "26px 0 28px",
          background: "linear-gradient(90deg, transparent, rgba(242,241,234,0.25), transparent)",
          transform: `scaleX(${reveal})`,
        }}
      />
      <div
        style={{
          maxWidth: 1280,
          color: "#F2F1EA",
          fontSize: 66,
          lineHeight: 1.35,
          fontWeight: 800,
          letterSpacing: 2,
          textAlign: "center",
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 22}px)`,
          textShadow: "0 7px 28px rgba(0,0,0,0.55)",
        }}
      >
        {title}
      </div>
    </AbsoluteFill>
  );
};

const Headline: React.FC<{scene: Scene; progress: number}> = ({scene, progress}) => {
  if (!scene.headline || scene.type === "chapter") return null;
  const reveal = interpolate(progress, [0.12, 0.34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <div
      data-layout-box={`headline-${scene.id}`}
      style={{
        position: "absolute",
        top: 128,
        left: 150,
        maxWidth: 940,
        color: "#F2F1EA",
        fontFamily: "'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
        fontSize: scene.type === "data" ? 66 : 54,
        fontWeight: 800,
        lineHeight: 1.3,
        letterSpacing: 1,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 24}px)`,
        textShadow: "0 5px 22px rgba(0,0,0,0.65)",
      }}
    >
      <div style={{width: 74, height: 5, backgroundColor: scene.accent, marginBottom: 22}} />
      {scene.headline}
    </div>
  );
};

export const SceneRenderer: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const durationFrames = Math.max(1, Math.round(scene.duration * fps));
  const progress = frame / Math.max(1, durationFrames - 1);

  if (scene.type === "chapter") {
    return <AbsoluteFill><ChapterCard scene={scene} progress={progress} /></AbsoluteFill>;
  }

  const transform = motionTransform(scene.motion, progress);
  return (
    <AbsoluteFill style={{backgroundColor: "#090D19"}}>
      <AbsoluteFill style={{transform, transformOrigin: "center center"}}>
        {scene.visual.motif === "story" ? (
          <StoryScene scene={scene} />
        ) : (
          <NativeVisual
            motif={scene.visual.motif}
            accent={scene.accent}
            progress={progress}
            variant={scene.visual.variant || 0}
          />
        )}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 46%, transparent 30%, rgba(4,7,14,0.24) 75%, rgba(4,7,14,0.7) 100%), linear-gradient(180deg, rgba(3,5,10,0.1), rgba(3,5,10,0.26))",
        }}
      />
      <Headline scene={scene} progress={progress} />
    </AbsoluteFill>
  );
};
