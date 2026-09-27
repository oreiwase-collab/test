#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  if (process.argv[i]?.startsWith("--")) args[process.argv[i].slice(2)] = process.argv[i + 1];
}
if (!args.project) {
  process.stderr.write("Usage: validate_project.mjs --project DIR\n");
  process.exit(1);
}

const project = path.resolve(args.project);
const timelinePath = path.join(project, "src", "data", "timeline.json");
const reportPath = path.join(project, "dist", "validation.json");
const errors = [];
const warnings = [];
const allowedMotifs = new Set([
  "desk",
  "city",
  "stage",
  "chart",
  "document",
  "clock",
  "office",
  "classroom",
  "library",
  "machine",
  "balance",
  "network",
  // このプロジェクト専用：台本35行を1シーンずつ描く StoryScenes.tsx
  "story",
]);

const walkFiles = (directory) => {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
};

const readJson = (file, label) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${label} could not be read: ${error.message}`);
    return null;
  }
};

const timeline = readJson(timelinePath, "timeline");
if (timeline) {
  for (const key of ["fps", "width", "height", "durationSeconds", "audioFile", "scenes", "captions"]) {
    if (timeline[key] === undefined) errors.push(`timeline missing ${key}`);
  }
  if (timeline.fps !== 30) warnings.push(`fps is ${timeline.fps}, expected 30`);
  if (timeline.width !== 1920 || timeline.height !== 1080) {
    warnings.push(`raster is ${timeline.width}x${timeline.height}, expected 1920x1080`);
  }
  if (!Array.isArray(timeline.scenes) || timeline.scenes.length === 0) {
    errors.push("timeline has no scenes");
  } else {
    const ids = new Set();
    timeline.scenes.forEach((scene, index) => {
      if (!scene.id) errors.push(`scene ${index} has no id`);
      if (ids.has(scene.id)) errors.push(`duplicate scene id: ${scene.id}`);
      ids.add(scene.id);
      if (!Number.isFinite(scene.start) || !Number.isFinite(scene.duration) || scene.duration <= 0) {
        errors.push(`invalid timing in ${scene.id || index}`);
      }
      if (index === 0 && Math.abs(scene.start) > 0.01) errors.push("first scene must start at 0");
      if (index > 0) {
        const prev = timeline.scenes[index - 1];
        const delta = scene.start - (prev.start + prev.duration);
        if (Math.abs(delta) > 0.05) {
          errors.push(`scene boundary mismatch before ${scene.id}: ${delta.toFixed(3)}s`);
        }
      }
      if (scene.visual?.kind !== "remotion") {
        errors.push(`${scene.id} must use visual.kind "remotion"`);
      }
      if (!allowedMotifs.has(scene.visual?.motif)) {
        errors.push(`${scene.id} uses unsupported Remotion motif: ${scene.visual?.motif || "(empty)"}`);
      }
    });
    const last = timeline.scenes.at(-1);
    const end = last.start + last.duration;
    if (Math.abs(end - timeline.durationSeconds) > 0.05) {
      errors.push(`last scene ends at ${end.toFixed(3)}s, audio timeline ends at ${timeline.durationSeconds}s`);
    }
  }

  if (!Array.isArray(timeline.captions)) {
    errors.push("captions must be an array");
  } else {
    timeline.captions.forEach((cue, index) => {
      if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.end <= cue.start) {
        errors.push(`invalid caption timing at index ${index}`);
      }
      if (cue.start < -0.01 || cue.end > timeline.durationSeconds + 0.01) {
        errors.push(`caption ${index} is outside the timeline`);
      }
      const rawLines = String(cue.text || "").trim().split(/\n+/u);
      const cleanLines = rawLines.map((line) => line.replace(/[、。]/gu, "").trim());
      if (cleanLines.length > 2) errors.push(`caption ${index} has more than two lines`);
      const longest = cleanLines.reduce((max, line) => Math.max(max, line.length), 0);
      const total = cleanLines.join("").length;
      if (longest > 22 && cleanLines.length > 1) {
        errors.push(`caption ${index} has a ${longest}-character rendered line; maximum is 22`);
      }
      if (total > 44) errors.push(`caption ${index} has ${total} rendered characters; maximum for two lines is 44`);
      if (cleanLines.length === 1 && total > 22) {
        warnings.push(`caption ${index} needs a reviewed explicit two-line break`);
      }
    });
  }
  if (timeline.timingSource === "character-weighted") {
    warnings.push("caption timing is character-weighted and requires narration-sync review");
  }

  const audioPath = path.join(project, "public", timeline.audioFile || "");
  if (!fs.existsSync(audioPath)) {
    errors.push(`audio missing: ${audioPath}`);
  } else {
    const probe = spawnSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", audioPath],
      {encoding: "utf8"},
    );
    const duration = Number(probe.stdout?.trim());
    if (probe.status !== 0 || !Number.isFinite(duration)) {
      errors.push("ffprobe could not read narration duration");
    } else if (Math.abs(duration - timeline.durationSeconds) > 0.05) {
      errors.push(`timeline/audio duration mismatch: ${timeline.durationSeconds}s vs ${duration.toFixed(3)}s`);
    }
  }
}

for (const relative of [
  "package.json",
  "src/index.ts",
  "src/Root.tsx",
  "src/Composition.tsx",
]) {
  if (!fs.existsSync(path.join(project, relative))) errors.push(`missing project file: ${relative}`);
}

const rasterExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);
const rasterFiles = walkFiles(path.join(project, "public")).filter((file) =>
  rasterExtensions.has(path.extname(file).toLowerCase()),
);
// 依頼者の指示で使うステーションポッドの実写写真だけを例外として許可する
const requestedPhotos = new Set(["public/station-pod.png"]);
for (const file of rasterFiles.filter((f) => !requestedPhotos.has(path.relative(project, f)))) {
  errors.push(`raster visual is forbidden; build it in Remotion: ${path.relative(project, file)}`);
}

const sourceFiles = walkFiles(path.join(project, "src")).filter((file) => /\.[cm]?[jt]sx?$/.test(file));
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, "utf8");
  const photoComponent = path.relative(project, file) === path.join("src", "components", "Kit.tsx");
  if (!photoComponent && /\bImg\b/.test(source) && /from\s+["']remotion["']/.test(source)) {
    errors.push(`Remotion Img import is forbidden for this all-Remotion skill: ${path.relative(project, file)}`);
  }
  if (/https?:\/\/.+\.(png|jpe?g|webp|gif|avif)/i.test(source)) {
    errors.push(`remote raster image is forbidden: ${path.relative(project, file)}`);
  }
  for (const match of source.matchAll(/<text\b([^>]*)>/g)) {
    if (!/\bdata-layout-box\s*=/.test(match[1])) {
      errors.push(
        `viewer-visible SVG text must register data-layout-box: ${path.relative(project, file)}`,
      );
    }
  }
  if (
    /<text\b[^>]*>\s*(?:店舗|拠点|人|件|社|円|％|%|倍|年|月|日|時間|分|秒)\s*<\/text>/u.test(source) ||
    /<text\b[^>]*>\s*\{(?:unit|suffix)\}\s*<\/text>/u.test(source)
  ) {
    errors.push(
      `standalone SVG unit text is forbidden; use SvgMetric or a tspan: ${path.relative(project, file)}`,
    );
  }
}

const compositionSource = fs.existsSync(path.join(project, "src", "Composition.tsx"))
  ? fs.readFileSync(path.join(project, "src", "Composition.tsx"), "utf8")
  : "";
if (!/<LayoutCollisionGuard\s*\/>/.test(compositionSource)) {
  errors.push("LayoutCollisionGuard must remain enabled in src/Composition.tsx");
}

const report = {
  ok: errors.length === 0,
  project,
  checkedAt: new Date().toISOString(),
  errors,
  warnings,
};
fs.mkdirSync(path.dirname(reportPath), {recursive: true});
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exit(report.ok ? 0 : 1);
