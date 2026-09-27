# 駅の小さな箱（Remotion プロジェクト）

`script-style-plan/台本スタイル割り.xlsx` のスタイル割りどおりに、台本35行を1シーンずつ描いた解説動画です。

## 素材

- ナレーション：`public/narration.wav`
  - 依頼時に添付された2本（1:08AM 版 129.25秒、4:13AM 版 193.93秒）を、この順につないだだけのファイルです。
  - サンプル値は元の2本と完全に一致します（無編集・無加工）。合計 323.18秒。
- ステーションポッドの写真：`public/station-pod.png`
  - 依頼時に添付された写真から、ブース部分だけを切り抜いたものです。色や形は変えていません。

## タイミング

- `inputs/asr/narration.json`：音声認識（sherpa-onnx ReazonSpeech）の文字ごとの時刻と、無音区間。
- `inputs/sync-anchors.json`：シーンの切り替え34か所、場面内の強調表示58か所。
- `src/data/timeline.json`：シーン、字幕（改行は人の手で確認済み）、強調表示のフレーム。
- 生成スクリプトは `tools/timing/` にあります。

## 使っているスキルとの違い

使用したワークフロー（build-narrated-illustrated-video-v3）は写真などの画像素材を禁止しています。今回は依頼でステーションポッドの写真の使用が指定されたため、写真1枚だけを例外として認めています。`tools/validate_project.mjs` は、その1枚と、写真を表示する `Kit.tsx` だけを許可するように変更したものです。

## コマンド

```bash
npm install
npx tsc --noEmit
node tools/validate_project.mjs --project .
node tools/audit_sync.mjs --project .
npx remotion render src/index.ts NarratedIllustratedVideo out/final.mp4 --codec=h264 --crf=18 --audio-codec=aac
node tools/audit_sync.mjs --project . --video out/final.mp4
node tools/verify_render.mjs --project . --video out/final.mp4
node tools/sync_report.mjs
```
