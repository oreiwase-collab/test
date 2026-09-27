// dist/sync-audit.json から dist/sync-report.md を作る
import fs from "node:fs";
const audit = JSON.parse(fs.readFileSync("dist/sync-audit.json", "utf8"));
const cuts = audit.detectedCuts || [];
const near = (t) => cuts.reduce((b, v) => (Math.abs(v - t) < Math.abs(b - t) ? v : b), Infinity);
const rows = audit.anchors.map((a) => {
  const d = a.kind === "scene-cut" ? near(a.visualTime) : null;
  return `| ${a.kind === "scene-cut" ? "カット" : "強調"} | ${a.sceneId} | ${a.label} | ${a.audioTime.toFixed(3)} | ${a.visualFrame} | ${a.visualTime.toFixed(3)} | ${a.errorMs.toFixed(1)} | ${d === null ? "—" : Number.isFinite(d) ? `${d.toFixed(3)}（${((d - a.visualTime) * 1000).toFixed(0)}ms）` : "未検出"} |`;
});
const maxErr = Math.max(...audit.anchors.map((a) => Math.abs(a.errorMs)));
const cutRows = audit.anchors.filter((a) => a.kind === "scene-cut");
const missing = cutRows.filter((a) => !Number.isFinite(near(a.visualTime)) || Math.abs(near(a.visualTime) - a.visualTime) > 1 / 30 + 0.001);
fs.writeFileSync("dist/sync-report.md", [
  "# 同期レポート",
  "",
  `- 時刻の基準: ${"inputs/asr/narration.json"}（ReazonSpeech の文字時刻＋無音検出の発話開始）`,
  `- 同期ポイント: ${audit.anchors.length} か所（カット ${cutRows.length}、場面内の強調 ${audit.anchors.length - cutRows.length}）`,
  `- 最大誤差: ${maxErr.toFixed(1)} ms（許容は半フレーム 16.7 ms）`,
  `- 完成MP4で検出できなかったカット: ${missing.length} か所${missing.length ? `（${missing.map((m) => m.sceneId).join(", ")}）` : ""}`,
  `- 監査結果: ${audit.ok ? "OK" : "NG"}${audit.errors.length ? `\n- エラー: ${audit.errors.join(" / ")}` : ""}`,
  "",
  "| 種類 | シーン | 語 | 発話(秒) | フレーム | 画面(秒) | 誤差(ms) | MP4で検出したカット |",
  "|---|---|---|---|---|---|---|---|",
  ...rows,
  "",
].join("\n"));
console.log("written", missing.length, "missing");
