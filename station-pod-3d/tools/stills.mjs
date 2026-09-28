// 指定フレームの静止画をまとめて書き出す（バンドルは1回だけ）
// 使い方: node tools/stills.mjs out/stills 120 450 900 ...
import path from "node:path";
import fs from "node:fs";
import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";

const [outDir, ...frames] = process.argv.slice(2);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const browserExecutable = process.env.REMOTION_BROWSER || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, "src/index.ts")});
const composition = await selectComposition({serveUrl, id: "Opening3D", browserExecutable, chromiumOptions: {gl: "swangle"}});
for (const f of frames.map(Number)) {
  const file = path.join(outDir, `f${String(f).padStart(5, "0")}.png`);
  await renderStill({serveUrl, composition, frame: f, output: file, browserExecutable, chromiumOptions: {gl: "swangle"}, scale: Number(process.env.SCALE || 0.5)});
  process.stdout.write(`${file}\n`);
}
