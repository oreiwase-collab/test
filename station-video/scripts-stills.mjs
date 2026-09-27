import {bundle} from "@remotion/bundler";
import {openBrowser, renderStill, selectComposition} from "@remotion/renderer";
import fs from "node:fs";
const frames = process.argv.slice(3).map(Number);
const outDir = process.argv[2];
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: new URL("./src/index.ts", import.meta.url).pathname});
const browser = await openBrowser("chrome", {browserExecutable: process.env.BROWSER});
const comp = await selectComposition({puppeteerInstance: browser, serveUrl, id: "NarratedIllustratedVideo", browserExecutable: "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"});
for (const frame of frames) {
  try { await renderStill({puppeteerInstance: browser, composition: comp, serveUrl, frame, output: `${outDir}/f${String(frame).padStart(5, "0")}.png`, browserExecutable: "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell", scale: 0.5, logLevel: "error"}); }
  catch (e) { process.stdout.write(`\nFAIL ${frame}: ${String(e.message).split("\n")[0]}\n`); }
}

await browser.close({silent: true});
process.stdout.write("done\n");
