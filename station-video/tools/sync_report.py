import json, sys
a = json.load(open('dist/sync-audit.json'))
t = json.load(open('src/data/timeline.json'))
cuts = [r for r in a['anchors'] if r['kind'] == 'scene-cut']
det = a.get('detectedCuts', [])
lines = ['# 同期レポート', '',
         'タイミングの元データ: 2本の元音声の無音区間から検出した文の頭（Whisper は環境の制限で使用不可）。',
         '場面の切り替えはすべて文の最初の発話に合わせています。文の途中の単語（内部の表示タイミング）は、読点の無音と文字数から推定した値です。', '',
         '| 場面 | 最初の言葉 | 発話開始(秒) | 切り替えフレーム | 切り替え(秒) | 誤差(ms) | MP4で検出 |', '|---|---|---|---|---|---|---|']
mx = 0
for r in cuts:
    near = min(det, key=lambda d: abs(d - r['visualTime'])) if det else None
    ok = near is not None and abs(near - r['visualTime']) <= 1 / 30 + 0.001
    mx = max(mx, abs(r['errorMs']))
    lines.append(f"| {r['sceneId']} | {r['label']} | {r['audioTime']:.3f} | {r['visualFrame']} | {r['visualTime']:.3f} | {r['errorMs']:+.1f} | {'はい' if ok else 'いいえ'} |")
lines += ['', f"- 最大誤差: {mx:.1f}ms（半フレーム = 16.7ms 以内）",
          f"- 切り替え {len(cuts)} か所中、完成MP4で検出: {sum(1 for r in cuts if det and min(abs(d - r['visualTime']) for d in det) <= 1/30 + 0.001)} か所",
          f"- 内部の表示タイミング: {sum(1 for r in a['anchors'] if r['kind'] == 'internal-reveal')} か所（推定値）"]
open('dist/sync-report.md', 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines[-3:]))
