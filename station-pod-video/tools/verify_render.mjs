#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  if (process.argv[i]?.startsWith("--")) args[process.argv[i].slice(2)] = process.argv[i + 1];
}
if (!args.project || !args.video) {
  process.stderr.write("Usage: verify_render.mjs --project DIR --video FILE\n");
  process.exit(1);
}

const project = path.resolve(args.project);
const video = path.resolve(args.video);
const reportPath = path.join(project, "dist", "delivery-report.json");
const errors = [];
if (!fs.existsSync(video)) errors.push(`video not found: ${video}`);

let probe = null;
if (errors.length === 0) {
  const result = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration:stream=index,codec_type,codec_name,width,height,r_frame_rate", "-of", "json", video],
    {encoding: "utf8"},
  );
  if (result.status !== 0) {
    errors.push(`ffprobe failed: ${result.stderr}`);
  } else {
    probe = JSON.parse(result.stdout);
  }
}

const timelinePath = path.join(project, "src", "data", "timeline.json");
const timeline = fs.existsSync(timelinePath)
  ? JSON.parse(fs.readFileSync(timelinePath, "utf8"))
  : null;
if (!timeline) errors.push(`timeline missing: ${timelinePath}`);

if (probe && timeline) {
  const videoStream = probe.streams.find((stream) => stream.codec_type === "video");
  const audioStream = probe.streams.find((stream) => stream.codec_type === "audio");
  if (!videoStream) errors.push("render has no video stream");
  if (!audioStream) errors.push("render has no audio stream");
  if (videoStream) {
    if (videoStream.codec_name !== "h264") errors.push(`video codec is ${videoStream.codec_name}, expected h264`);
    if (videoStream.width !== 1920 || videoStream.height !== 1080) {
      errors.push(`video raster is ${videoStream.width}x${videoStream.height}, expected 1920x1080`);
    }
    const [num, den] = String(videoStream.r_frame_rate || "0/1").split("/").map(Number);
    const fps = den ? num / den : 0;
    if (Math.abs(fps - 30) > 0.05) errors.push(`video fps is ${fps.toFixed(3)}, expected 30`);
  }
  if (audioStream && audioStream.codec_name !== "aac") {
    errors.push(`audio codec is ${audioStream.codec_name}, expected aac`);
  }
  const renderDuration = Number(probe.format.duration);
  if (!Number.isFinite(renderDuration)) {
    errors.push("render duration is unreadable");
  } else if (Math.abs(renderDuration - timeline.durationSeconds) > 0.25) {
    errors.push(`render duration ${renderDuration.toFixed(3)}s differs from timeline ${timeline.durationSeconds}s`);
  }
}

const report = {
  ok: errors.length === 0,
  project,
  video,
  bytes: fs.existsSync(video) ? fs.statSync(video).size : 0,
  checkedAt: new Date().toISOString(),
  errors,
  probe,
};
fs.mkdirSync(path.dirname(reportPath), {recursive: true});
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exit(report.ok ? 0 : 1);
