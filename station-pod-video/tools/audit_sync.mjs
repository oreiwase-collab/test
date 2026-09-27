#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  if (process.argv[i]?.startsWith("--")) args[process.argv[i].slice(2)] = process.argv[i + 1];
}

if (!args.project) {
  process.stderr.write(
    "Usage: audit_sync.mjs --project DIR [--anchors FILE] [--video FILE] [--scene-threshold 0.04]\n",
  );
  process.exit(1);
}

const project = path.resolve(args.project);
const timelinePath = path.join(project, "src", "data", "timeline.json");
const anchorsPath = args.anchors
  ? path.resolve(args.anchors)
  : path.join(project, "inputs", "sync-anchors.json");
const reportPath = path.join(project, "dist", "sync-audit.json");
const errors = [];
const warnings = [];

const readJson = (file, label) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${label} could not be read: ${error.message}`);
    return null;
  }
};

const timeline = readJson(timelinePath, "timeline");
const anchorDocument = readJson(anchorsPath, "sync anchors");
const anchors = Array.isArray(anchorDocument) ? anchorDocument : anchorDocument?.anchors;
const auditRows = [];
let detectedCuts = [];

if (timeline && Array.isArray(anchors)) {
  const fps = Number(timeline.fps);
  const halfFrameMs = 500 / fps;
  const allowedErrorMs = halfFrameMs + 0.5;
  const sceneById = new Map(timeline.scenes.map((scene) => [scene.id, scene]));

  for (const [index, anchor] of anchors.entries()) {
    const kind = anchor.kind;
    const label = String(anchor.label || anchor.word || "").trim();
    const audioTime = Number(anchor.audioTime);
    let visualFrame;

    if (!label) errors.push(`anchor ${index} has no label`);
    if (!Number.isFinite(audioTime)) errors.push(`anchor ${index} has invalid audioTime`);
    if (kind === "scene-cut") {
      const scene = sceneById.get(anchor.sceneId);
      if (!scene) {
        errors.push(`anchor ${index} references unknown sceneId: ${anchor.sceneId || "(empty)"}`);
        continue;
      }
      visualFrame = Math.round(scene.start * fps);
    } else if (kind === "internal-reveal") {
      visualFrame = Number(anchor.visualFrame);
      if (!Number.isInteger(visualFrame) || visualFrame < 0) {
        errors.push(`anchor ${index} requires a non-negative integer visualFrame`);
        continue;
      }
    } else {
      errors.push(`anchor ${index} has unsupported kind: ${kind || "(empty)"}`);
      continue;
    }

    if (!Number.isFinite(audioTime)) continue;
    const visualTime = visualFrame / fps;
    const errorMs = (visualTime - audioTime) * 1000;
    if (Math.abs(errorMs) > allowedErrorMs) {
      errors.push(
        `${kind} "${label}" differs by ${errorMs.toFixed(1)}ms; maximum is ${allowedErrorMs.toFixed(1)}ms`,
      );
    }
    auditRows.push({
      id: anchor.id || `anchor-${String(index + 1).padStart(3, "0")}`,
      kind,
      sceneId: anchor.sceneId || null,
      label,
      audioTime,
      visualFrame,
      visualTime,
      errorMs,
    });
  }

  for (const scene of timeline.scenes.slice(1)) {
    const count = anchors.filter(
      (anchor) => anchor.kind === "scene-cut" && anchor.sceneId === scene.id,
    ).length;
    if (count !== 1) errors.push(`${scene.id} must have exactly one scene-cut anchor; found ${count}`);
  }

  if (args.video) {
    const video = path.isAbsolute(args.video) ? args.video : path.join(project, args.video);
    const threshold = Number(args["scene-threshold"] || 0.04);
    if (!fs.existsSync(video)) {
      errors.push(`video not found: ${video}`);
    } else if (!Number.isFinite(threshold) || threshold <= 0 || threshold >= 1) {
      errors.push(`invalid scene threshold: ${args["scene-threshold"]}`);
    } else {
      const detection = spawnSync(
        "ffmpeg",
        [
          "-hide_banner",
          "-i", video,
          "-an",
          "-vf", `select='gt(scene,${threshold})',metadata=print`,
          "-f", "null",
          "-",
        ],
        {encoding: "utf8", maxBuffer: 64 * 1024 * 1024},
      );
      if (detection.status !== 0) {
        errors.push(`ffmpeg scene detection failed: ${detection.stderr?.trim() || "unknown error"}`);
      } else {
        const output = `${detection.stdout || ""}\n${detection.stderr || ""}`;
        detectedCuts = [...output.matchAll(/pts_time:([0-9.]+)/g)].map((match) => Number(match[1]));
        const cutTolerance = 1 / fps + 0.001;
        for (const row of auditRows.filter((item) => item.kind === "scene-cut")) {
          const nearest = detectedCuts.reduce(
            (best, value) => (Math.abs(value - row.visualTime) < Math.abs(best - row.visualTime) ? value : best),
            Number.POSITIVE_INFINITY,
          );
          if (!Number.isFinite(nearest) || Math.abs(nearest - row.visualTime) > cutTolerance) {
            errors.push(
              `finished video has no detected hard cut near ${row.visualTime.toFixed(3)}s for "${row.label}"`,
            );
          }
        }
      }
    }
  } else {
    warnings.push("finished-video cut detection was skipped; pass --video after rendering");
  }
} else if (anchorDocument && !Array.isArray(anchors)) {
  errors.push("sync anchors must be an array or an object with an anchors array");
}

const report = {
  ok: errors.length === 0,
  project,
  anchorsFile: anchorsPath,
  checkedAt: new Date().toISOString(),
  errors,
  warnings,
  anchors: auditRows,
  detectedCuts,
};

fs.mkdirSync(path.dirname(reportPath), {recursive: true});
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exit(report.ok ? 0 : 1);
