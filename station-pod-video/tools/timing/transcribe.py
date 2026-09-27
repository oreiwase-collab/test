import json, re, sys
import numpy as np
import soundfile as sf
import sherpa_onnx

M = "/home/user/asr/sherpa-onnx-zipformer-ja-reazonspeech-2024-08-01"
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f"{M}/encoder-epoch-99-avg-1.int8.onnx",
    decoder=f"{M}/decoder-epoch-99-avg-1.int8.onnx",
    joiner=f"{M}/joiner-epoch-99-avg-1.int8.onnx",
    tokens=f"{M}/tokens.txt", num_threads=4, decoding_method="greedy_search")

def load_sil(path):
    starts, ends = [], []
    for line in open(path):
        m = re.search(r"silence_(start|end): ([\d.]+)", line)
        (starts if m.group(1) == "start" else ends).append(float(m.group(2)))
    return list(zip(starts, ends + [None] * (len(starts) - len(ends))))

out = {}
for n, wav in [(1, sys.argv[1]), (2, sys.argv[2])]:
    audio, sr = sf.read(wav, dtype="float32")
    dur = len(audio) / sr
    sil = load_sil(f"/home/user/asr/sil{n}.txt")
    # 無音の中点で区切る（解析用のみ・元音声は変更しない）
    cuts = [0.0] + [ (s + (e if e else dur)) / 2 for s, e in sil if s > 0.1 and (e or dur) < dur - 0.05 ] + [dur]
    segs = []
    for a, b in zip(cuts, cuts[1:]):
        if b - a < 0.2: continue
        chunk = audio[int(a * sr):int(b * sr)]
        st = rec.create_stream(); st.accept_waveform(sr, chunk); rec.decode_stream(st)
        r = st.result
        toks = [{"t": t, "s": round(a + ts, 3)} for t, ts in zip(r.tokens, r.timestamps)]
        if r.text.strip():
            segs.append({"start": round(a, 3), "end": round(b, 3), "text": r.text, "tokens": toks})
    out[f"part{n}"] = {"duration": dur, "segments": segs}
    print(f"part{n}", round(dur, 2), len(segs))
    for s in segs[:4] + segs[-2:]: print("  ", s["start"], s["text"])
json.dump(out, open("/home/user/asr/asr.json", "w"), ensure_ascii=False, indent=1)
