"""timeline.json / sync-anchors.json / narration.json を生成する。
字幕の改行は台本の文言のまま人の手で決め、時刻はナレーションの実測に合わせる。"""
import json, sys
sys.argv = ['align']
exec(open('/home/user/asr/align.py').read().split("if __name__ == '__main__':")[0])

FPS = 30
DUR = 323.181917
PROJ = '/home/user/test/station-pod-video'

# 行ごとの字幕（改行は確認済み、句読点なし）
CAP = {
1: ["たくさんの人が行き交う\n駅のど真ん中で", "服を脱ぐなんて絶対に\nあり得ないと思いますよね"],
2: ["でもたった畳1枚分の\n小さな箱に入るだけで", "人間の脳は信じられない\n勘違いを起こしてしまいます"],
3: ["2026年9月\n都内の大きな駅に置かれた", "テレワーク用の防音個室\n「ステーションポッド」の中で", "服を脱いで外に見せびらかすような\n動画がネットに広まり", "警察が動く\n大きな騒ぎになりました"],
4: ["おかしな人が自分勝手に暴れただけ\nと片付けるのは簡単です"],
5: ["だがこのとんでもない行動を\n引き起こしたのは", "狭い箱に入ったときに\n誰もが持っている", "心のスイッチが\n入ってしまったからでした"],
6: ["いったい私たちの頭と\n普段暮らしている街の中で", "何が起きていたのか\n一緒に解き明かしていきましょう"],
7: ["なぜ人は\nすぐ外を大勢の人が歩いているのに", "ガラス張りの箱の中で\n油断してしまうのでしょうか"],
8: ["アメリカのコーネル大学の\nゲイリーエバンスという研究者が", "2000年に300人の街の人を\n集めて実験を行いました"],
9: ["広さが違う部屋に人を入れ\n窓の外を他人が通り過ぎる様子を見せながら", "ドキドキする度合いやストレスを測りつつ\n難しいパズルを解かせたのです"],
10: ["すると部屋が狭くなればなるほど", "外から見られていることへの警戒心が\n約40パーセントも下がりました"],
11: ["壁が体にぴったり近づく\n狭い部屋に入ると", "人間の脳は守られていると\n勘違いしてしまうのです"],
12: ["駅の通路を思い浮かべてみてください"],
13: ["大勢の人の足音が響き\n人と人が肩をぶつけそうになりながら", "歩いているすぐ横に\n黒くて四角い電話ボックスのような", "箱がポツンと立っています"],
14: ["重いドアをパタンと閉めた瞬間\nさっきまでのうるさい音が", "遠くのうなり声のように消えて\n目の前には自分だけの机と椅子だけが残ります"],
15: ["ガラスのすぐ向こう側を\nスーツ姿の大人が早歩きで通り過ぎているのに", "壁に囲まれている安心感のせいで\n外の世界がまるで", "テレビ画面の中の出来事のように\n遠く感じてしまうのです"],
16: ["ここまでは個人の心の内側の話です", "では社会全体の仕組みから\nこの景色を眺めると", "何が見えてくるでしょうか"],
17: ["この問題は\n1人の勘違いだけでなく", "街の作りそのものが変わってしまったことが\n原因でもあります"],
18: ["都市について研究していた\nエドワードソジャという学者が", "1996年に\nロサンゼルスの街で調査を行いました"],
19: ["誰もが自由に使えた広場を\nフェンスで囲み", "お金を払った人だけが入れる\n小さなブースに区切った場所で", "半年間にわたって\n人々の様子を観察したのです"],
20: ["防犯カメラをたくさん\n増やしたにもかかわらず", "ブースの中でルールを破る\nいたずらや迷惑行為は", "もとの広場の約3倍に\n増えてしまいました"],
21: ["広場を細かく区切って\n個室にしてしまうと", "お互いに見守り合う\n自然なブレーキが壊れてしまうのです"],
22: ["昔の駅のベンチや待合室は\nみんなで机や椅子を分け合い", "お互いの目がある場所でした"],
23: ["ところが便利さとプライバシーを\nどんどん進めた結果", "街の共有スペースの中に「お金を払って\nひとりぼっちになれるカプセル」が", "置かれるようになりました"],
24: ["みんなで使う場所のマナーと\n自分の部屋のような自由さが", "狭いカプセルの中でぶつかり合って", "大きな隙間が駅のホームに\n生まれてしまったのです"],
25: ["便利さを追い求めた仕組みが\n皮肉にもみんなのモラルを", "麻痺させてしまったことは分かりました", "ではそもそもなぜ私たちは\nそんな個室を必要としたのでしょうか"],
26: ["駅の小部屋で起きた事件は\nただの恥知らずな悪ふざけではなく", "24時間スマホで誰かと繋がり続ける\n疲れから逃げ出そうとしたSOSでもありました"],
27: ["学者のシェリータークルが\n2011年に働く大人200人を", "追いかけた調査があります"],
28: ["仕事の連絡をスマホでずっと\n受け続けなければいけない人たちを", "1日1時間だけ通信を止めた\n閉まり切った部屋に入れて", "どんな気持ちになるかを調べました"],
29: ["すると約70パーセントの人が\n社会のルールを守ることよりも", "誰にも邪魔されない\nすっきりした解放感を優先し", "普段ならしないような\n衝動的な行動を強く望みました"],
30: ["繋がり続ける息苦しさから\n逃げ込める隠れ家を見つけたとき", "人はマナーのブレーキまで\n一緒に外してしまうのです"],
31: ["あの駅の箱は\n周りの目や連絡の通知に疲れ果てた私たちが", "人混みの中でひとりきりになるために\n作った現代の隠れ家でした"],
32: ["あなたはあの狭い箱に\n1人で入ったとき", "絶対に自分をコントロールできると\n言い切れますか"],
33: ["社会を科学する"],
34: ["もしあなたが駅のあの個室に入ったら\nどんな気分になるか", "ぜひコメント欄で教えてください"],
35: ["次回もニュースを一緒に\n深く分析したい方は", "チャンネル登録をお願いします"],
}

# 場面内の強調表示（キー, 台本中の語）
REV = {
1: [('kp', '絶対')],
2: [('enter', '箱に入る'), ('kp', '勘違い')],
3: [('pod', 'ステーションポッド'), ('sns', '動画がネット'), ('police', '警察')],
4: [('strike', '片付ける')],
5: [('switch', '心のスイッチ')],
6: [('title2', '街の中で')],
7: [('kp', '油断')],
8: [('name', 'ゲイリーエバンス'), ('year', '2000年'), ('n', '300人')],
9: [('window', '窓の外'), ('heart', 'ドキドキ'), ('puzzle', '難しいパズル')],
10: [('bars', '外から見られて'), ('metric', '約40')],
11: [('safe', '守られている'), ('kp', '勘違い')],
13: [('pod', '黒くて四角い')],
14: [('mute', '遠くのうなり声'), ('desk', '目の前には')],
15: [('suit', 'スーツ姿'), ('tv', 'テレビ画面')],
16: [('pull', 'では社会全体')],
17: [('kp', '街の作り')],
18: [('year', '1996年'), ('city', 'ロサンゼルス')],
19: [('fence', 'フェンス'), ('booths', '小さなブース'), ('half', '半年間')],
20: [('bars', 'ブースの中で'), ('metric', '約3倍')],
21: [('walls', '個室に'), ('kp', '自然なブレーキ')],
22: [('eyes', 'お互いの目')],
23: [('pods', '共有スペース'), ('yen', 'お金を払って')],
24: [('free', '自分の部屋'), ('crash', 'ぶつかり合って'), ('crack', '大きな隙間')],
25: [('kp1', '麻痺'), ('kp2', 'そもそもなぜ')],
26: [('net', '24時間'), ('kp', 'SOS')],
27: [('year', '2011年'), ('n', '200人')],
28: [('room', '1日1時間'), ('door', '閉まり切った')],
29: [('metric', '約70'), ('scale', '解放感')],
30: [('cut', '隠れ家'), ('brake', 'マナーのブレーキ')],
31: [('glow', '現代の隠れ家')],
32: [('kp', '言い切れますか')],
34: [('type', 'どんな気分')],
35: [('btn', 'チャンネル登録')],
}

TYPE = {8: 'document', 18: 'document', 27: 'document', 10: 'data', 20: 'data', 29: 'data', 6: 'quote', 25: 'quote', 33: 'quote'}
MOTION = {3: 'static', 8: 'static', 10: 'static', 18: 'static', 20: 'static', 25: 'static', 27: 'static', 29: 'static', 34: 'static', 35: 'static', 12: 'drift-left', 13: 'drift-left', 17: 'drift-right', 31: 'drift-right'}

def f(t): return round(t * FPS)

def phrase_time(row, phrase):
    return snap_onset(find(row, phrase))

# 各行の開始（波形上の発話開始）
starts = []
for i in range(len(rows)):
    starts.append(0.0 if i == 0 else snap_onset(char_time(row_start_idx[i])))

scenes, anchors, reveals_all = [], [], []
for i, r in enumerate(rows):
    n = i + 1
    st_f = 0 if i == 0 else f(starts[i])
    en_f = f(DUR) if i == len(rows) - 1 else f(starts[i + 1])
    sid = f'scene-{n:03d}'
    rev = {}
    for key, ph in REV.get(n, []):
        t = find(i, ph)
        rev[key] = f(t)
        anchors.append({'id': f'reveal-{n:03d}-{key}', 'kind': 'internal-reveal', 'sceneId': sid,
                        'label': ph, 'audioTime': round(t, 3), 'visualFrame': f(t)})
    scenes.append({
        'id': sid, 'start': round(st_f / FPS, 4), 'duration': round((en_f - st_f) / FPS, 4),
        'type': TYPE.get(n, 'illustration'), 'headline': '', 'body': r[1],
        'motion': MOTION.get(n, 'slow-push'), 'accent': '#D2A451',
        'visualNotes': r[6], 'visual': {'kind': 'remotion', 'motif': 'story', 'variant': n},
        'reveals': rev,
    })
    if i > 0:
        anchors.append({'id': f'cut-{n:03d}', 'kind': 'scene-cut', 'sceneId': sid,
                        'label': norm(r[1])[:8], 'audioTime': round(starts[i], 3)})

# 字幕
caps = []
for i, r in enumerate(rows):
    n = i + 1
    cues = CAP[n]
    joined = ''.join(norm(c) for c in cues)
    assert joined == norm(r[1]), (n, joined, norm(r[1]))
    idx = 0
    cstarts = []
    for c in cues:
        t = char_time(row_start_idx[i] + idx)
        cstarts.append(starts[i] if idx == 0 else snap_onset(t))
        idx += len(norm(c))
    last_char_t = char_time(row_start_idx[i] + idx - 1)
    speech_end = min([ss for ss, se in SIL if ss >= last_char_t] + [DUR])
    row_end = min(speech_end + 0.35, starts[i + 1] if i + 1 < len(rows) else DUR)
    for k, c in enumerate(cues):
        s = cstarts[k]
        e = cstarts[k + 1] if k + 1 < len(cues) else row_end
        caps.append({'start': round(f(s) / FPS, 4), 'end': round(f(e) / FPS, 4), 'text': c})

timeline = {
    'version': 1, 'projectTitle': '駅の小さな箱', 'fps': FPS, 'width': 1920, 'height': 1080,
    'audioFile': 'narration.wav', 'durationSeconds': round(DUR, 6),
    'timingSource': 'inputs/asr/narration.json（sherpa-onnx ReazonSpeech の文字時刻＋無音検出の発話開始）',
    'scenes': scenes, 'captions': caps,
}
json.dump(timeline, open(f'{PROJ}/src/data/timeline.json', 'w'), ensure_ascii=False, indent=2)
json.dump({'version': 1, 'timingSource': 'inputs/asr/narration.json', 'anchors': anchors},
          open(f'{PROJ}/inputs/sync-anchors.json', 'w'), ensure_ascii=False, indent=2)
import os
os.makedirs(f'{PROJ}/inputs/asr', exist_ok=True)
json.dump({'engine': 'sherpa-onnx zipformer-ja-reazonspeech-2024-08-01 (int8, greedy)',
           'note': '2本の音声を無編集で連結した narration.wav 上の絶対時刻。無音区間は ffmpeg silencedetect -40dB/0.25s。',
           'tokens': toks, 'silences': SIL},
          open(f'{PROJ}/inputs/asr/narration.json', 'w'), ensure_ascii=False)
print(len(scenes), 'scenes', len(caps), 'captions', len(anchors), 'anchors')
for s in scenes: print(s['id'], s['start'], s['duration'], s['reveals'])
