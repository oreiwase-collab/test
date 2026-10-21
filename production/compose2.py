#!/usr/bin/env python3
"""Composite the 13 Kling clips into the final 1080x1920 60fps video per brief v2.

Usage: python3 compose2.py CLIPDIR AUDIO OUT.mp4 --font PATH [--preview t1,t2,...]
CLIPDIR holds c01.mp4 .. c13.mp4. With --preview, writes JPG stills at those times instead.
"""
import argparse, json, math, os, random, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 60
NFRAMES = 2828                     # ceil(47.131 * 60)
HOLDS = [4, 6, 4, 6, 4, 2]         # one "koma" = one drawing; ~13.8 koma/s, restarts at every cut

INK, ACCENT = (46, 35, 20), (146, 68, 44)
CREAM, RED, PAPER = (239, 228, 196), (155, 24, 44), (234, 211, 172)
STRIP, MARK = (238, 222, 188), (176, 48, 42)
ACCENT_ON_DARK = (226, 128, 98)   # accent on dark wood: same hue, lighter so it stays readable

# (start, end, clip, remap points [(shot time u, clip time s)] or None for identity, text colour, ticket time)
SHOTS = [
    (0.00, 2.41, 1, None, INK, None),
    (2.41, 6.95, 2, None, INK, None),
    (6.95, 11.48, 3, None, INK, None),
    (11.48, 14.89, 4, [(0, 0), (1.08, 1.95), (1.60, 2.60), (3.41, 4.0)], CREAM, 13.32),
    (14.89, 17.49, 5, None, INK, None),
    (17.49, 20.50, 6, [(0, 0), (0.06, 1.20), (0.41, 2.30), (3.01, 3.0)], INK, None),
    (20.50, 23.65, 7, None, INK, None),
    (23.65, 27.50, 8, None, INK, None),
    (27.50, 29.70, 9, [(0, 0), (1.70, 2.50), (2.20, 3.0)], CREAM, None),
    (29.70, 33.20, 10, [(0, 0), (1.51, 1.40), (2.30, 2.30), (2.60, 3.30), (3.50, 4.0)], CREAM, None),
    (33.20, 38.50, 11, None, INK, 36.63),
    (38.50, 41.72, 12, None, INK, None),
    (41.72, 47.14, 13, [(0, 0), (4.46, 3.40), (5.30, 5.20), (5.42, 5.30)], CREAM, None),
]

def L(text, t0, t1, y=0, size=100, color=None, x=90, kind="line", accent=None):
    return dict(text=text, t0=t0, t1=t1, y=y, size=size, color=color, x=x, kind=kind, accent=accent)

TEXT = {
    1: [L("仕事で急な", 0.00, 1.00, 300), L("トラブル", 1.04, 1.80, 430, 130, ACCENT), L("が起きたとき、", 1.82, 2.21, 590)],
    2: [L("パニックになって", 2.61, 3.40, size=84, kind="strip"),
        L("更にそのトラブルを", 3.46, 4.45, size=84, kind="strip", accent="トラブル"),
        L("大きくしてしまう", 4.51, 5.40, size=84, kind="strip", accent="大きく"),
        L("人がいる一方で、", 5.46, 6.52, size=84, kind="strip")],
    3: [L("周囲には気付かれずに", 7.13, 8.40, size=80, kind="strip"),
        L("通常運転", 8.53, 8.75, size=96, kind="stamp"),
        L("でトラブルを", 9.45, 10.00, size=80, kind="strip"),
        L("おさめられる人がいる。", 10.00, 11.15, size=76, kind="strip")],
    4: [L("予定が少し", 11.80, 12.50, 260), L("狂っただけで", 12.56, 13.30, 390),
        L("イライラ", 13.32, 13.32, 650, 150, kind="ticket"), L("する人もいれば、", 13.97, 14.62, 840, 72, x=None)],
    5: [L("まあいいや", 15.03, 15.70, 300, 130, ACCENT), L("で済ませられる", 15.73, 16.40, 460), L("人もいます。", 16.43, 17.13, 590)],
    6: [L("近年の", 17.95, 18.45, 0, 84, kind="page"), L("脳科学や", 18.48, 19.10, 0, 84, ACCENT, kind="page"),
        L("心理学の", 19.12, 19.74, 0, 84, ACCENT, kind="page"), L("実験で、", 19.76, 20.29, 0, 84, kind="page")],
    7: [L("その違いは", 20.72, 21.47, 0, 72, kind="page"), L("生まれつき", 21.77, 22.30, 0, 72, kind="page"),
        L("の性格では", 22.30, 23.10, 0, 72, kind="page"), L("なく、", 23.10, 23.46, 0, 72, kind="page"),
        L("", 22.97, 23.37, kind="slash")],
    8: [L("頭の中の情報の", 23.84, 25.03, 260, 96), L("処理の仕方に", 25.05, 25.74, 390, 116, ACCENT),
        L("あることが", 25.76, 26.25, 540, 96), L("分かってきました。", 26.27, 27.08, 660, 92)],
    9: [L("メンタルが", 27.87, 28.35, 300), L("安定している人は、", 28.37, 29.47, 430, 92)],
    10: [L("我慢して", 29.84, 30.47, 240), L("感情を押し殺して", 30.71, 31.80, 360, accent="押し殺して"),
         L("いるわけでは", 31.80, 32.37, 480), L("ありません。", 32.39, 32.89, 600), L("", 32.00, 32.20, kind="cross")],
    11: [L("そこには、", 33.53, 34.09, 210), L("脳の仕組みを", 34.38, 35.15, 320), L("上手に使いこなす、", 35.17, 36.31, 430, 92),
         L("明確な理由", 36.63, 36.63, 660, 130, kind="ticket"), L("があったのです。", 37.16, 38.10, 810, 72, x=None)],
    12: [L("今回は、", 38.94, 39.46, 240, 96, x=200), L("具体的な", 39.77, 40.37, 370, 96, x=200),
         L("実験データを", 40.39, 41.19, 500, 110, ACCENT, x=200), L("もとに、", 41.21, 41.52, 650, 96, x=200)],
    13: [L("いつも心が", 41.92, 42.54, 230), L("安定している人と、", 42.56, 43.83, 350, 92),
         L("そうでない人の", 44.13, 44.98, 470), L("決定的な違いを", 45.00, 46.16, 590, accent="違い")],
}
# right-page text block (x, first baseline y, line pitch) per book shot; set from the clip frames
PAGE = {6: (590, 640, 108), 7: (590, 560, 96)}

FONT_PATH = None
_fcache = {}
def font(size):
    if size not in _fcache:
        f = ImageFont.truetype(FONT_PATH, size)
        try: f.set_variation_by_name("Bold")
        except Exception: pass
        _fcache[size] = f
    return _fcache[size]

def beat_frames():
    out = []
    for s0, s1, *_ in SHOTS:
        f, f1 = round(s0 * FPS), min(NFRAMES, round(s1 * FPS))
        k = 0
        while f < f1:
            h = min(HOLDS[k % len(HOLDS)], f1 - f)
            out.append((f, h)); f += h; k += 1
    return out

def vignette_mask():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
    m = np.clip(1.0 - 0.67 * np.clip((d - 0.45) / 0.55, 0, 1) ** 1.6, 0.33, 1.0)
    return m[..., None]

def ease_out(x):
    x = min(1.0, max(0.0, x)); return 1 - (1 - x) ** 3

def typed(text, t, t0, t1):
    if t < t0: return ""
    if t1 <= t0: return text
    n = len(text)
    return text[: min(n, int(math.floor(n * (t - t0) / (t1 - t0))) + 1)]

def text_width(s, size):
    f = font(size); return sum(f.getlength(c) + size * 0.04 for c in s)

def draw_text(img, s, x, y, size, color, full=None, accent=None, shadow=False):
    d = ImageDraw.Draw(img); f = font(size)
    full = full or s
    a0 = full.find(accent) if accent else -1
    cx = x
    for i, ch in enumerate(s):
        col = (ACCENT_ON_DARK if shadow else ACCENT) if (a0 >= 0 and a0 <= i < a0 + len(accent)) else color
        if shadow: d.text((cx + 3, y + 4), ch, font=f, fill=(20, 12, 6))
        d.text((cx, y), ch, font=f, fill=col)
        cx += f.getlength(ch) + size * 0.04          # ~4% open tracking: typewriter feel
    return cx

_strip_cache = {}
def strip_image(text, size, seed):
    key = (text, size)
    if key in _strip_cache: return _strip_cache[key]
    rnd = random.Random(seed)
    w = int(text_width(text, size) + size * 1.2); h = int(size * 1.55)
    im = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0))
    pts = []
    for i in range(0, w + 1, 18): pts.append((20 + i, 20 + rnd.randint(-6, 6)))
    for i in range(0, h + 1, 14): pts.append((20 + w + rnd.randint(-6, 6), 20 + i))
    for i in range(w, -1, -18): pts.append((20 + i, 20 + h + rnd.randint(-6, 6)))
    for i in range(h, -1, -14): pts.append((20 + rnd.randint(-6, 6), 20 + i))
    burn = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ImageDraw.Draw(burn).polygon(pts, fill=(70, 38, 18, 255))
    im.alpha_composite(burn.filter(ImageFilter.GaussianBlur(5)))
    inner = [(x + (5 if x < 20 + w / 2 else -5), y + (5 if y < 20 + h / 2 else -5)) for x, y in pts]
    ImageDraw.Draw(im).polygon(inner, fill=STRIP + (255,))
    _strip_cache[key] = im
    return im

def speckle_reveal(im, p, seed):
    """Brown dust gathering into the strip as p goes 0 -> 1."""
    if p >= 1: return im
    rng = np.random.default_rng(seed)
    noise = rng.random((im.height // 6 + 1, im.width // 6 + 1)).repeat(6, 0).repeat(6, 1)[: im.height, : im.width]
    a = np.asarray(im).copy()
    a[..., 3] = (a[..., 3] * (noise < max(0.0, p))).astype(np.uint8)
    return Image.fromarray(a)

def ticket_image(text, size):
    w = int(text_width(text, size) + size * 1.4); h = int(size * 1.9)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=26, fill=RED + (255,))
    d.rounded_rectangle([18, 18, w - 19, h - 19], radius=16, fill=PAPER + (255,))
    d.rounded_rectangle([28, 28, w - 29, h - 29], radius=12, outline=RED + (255,), width=3)
    draw_text(im, text, int(size * 0.7), int((h - size * 1.3) / 2), size, (25, 15, 10))
    return im

def stack_layout(items, t, top=230, gap=22):
    """Strips/stamps stack upward: the newest sits lowest, older ones rise to make room."""
    heights = [int(it["size"] * 1.55) + (30 if it["kind"] == "stamp" else 0) for it in items]
    bottom = top + sum(heights) + gap * (len(items) - 1)
    ys, y = {}, bottom
    for it, h in reversed(list(zip(items, heights))):
        if t >= it["t0"] - 0.1:
            y -= h; ys[id(it)] = y; y -= gap
    return ys

def render(t, i, bg):
    s0, s1, clip, remap, base, tblur = SHOTS[i]
    u = t - s0
    img = bg.convert("RGB")
    if tblur is not None and t >= tblur:                           # keyword ticket: background goes soft
        img = img.filter(ImageFilter.GaussianBlur(7 * ease_out((t - tblur) / 0.2)))
    a = np.asarray(img).astype(np.float32) * VIG                   # vignette on picture only, not on text
    img = Image.fromarray(a.clip(0, 255).astype(np.uint8)).convert("RGBA")
    items = TEXT[i + 1]
    stack = [it for it in items if it["kind"] in ("strip", "stamp")]
    ys = stack_layout(stack, t) if stack else {}
    pages = [it for it in items if it["kind"] == "page"]
    for n, it in enumerate(items):
        k = it["kind"]
        if k in ("line", "page"):
            s = typed(it["text"], t, it["t0"], it["t1"])
            if not s: continue
            col = it["color"] or base
            if k == "page":
                px, py, pitch = PAGE[i + 1]; x, y = px, py + pages.index(it) * pitch
            else:
                x = it["x"] if it["x"] is not None else int((W - text_width(it["text"], it["size"])) / 2)
                y = it["y"]
            draw_text(img, s, x, y, it["size"], col, it["text"], it["accent"], shadow=(base == CREAM and k == "line"))
        elif k in ("strip", "stamp"):
            if id(it) not in ys: continue
            st = strip_image(it["text"], it["size"], n + i * 10 + (99 if k == "stamp" else 0))
            if k == "strip":
                st = speckle_reveal(st, (t - (it["t0"] - 0.1)) / 0.2, n + i)
            layer = Image.new("RGBA", st.size, (0, 0, 0, 0)); layer.alpha_composite(st)
            s = typed(it["text"], t, it["t0"], it["t1"])
            draw_text(layer, s, 20 + int(it["size"] * 0.6), 20 + int(it["size"] * 0.12), it["size"], INK, it["text"], it["accent"])
            x0 = 70 if k == "strip" else (W - st.width) // 2
            img.alpha_composite(layer, (x0, ys[id(it)]))
            if k == "stamp":
                p = ease_out((t - 8.75) / 0.4)
                if p > 0:
                    box = [x0 - 14, ys[id(it)] - 8, x0 + st.width + 14, ys[id(it)] + st.height + 8]
                    ImageDraw.Draw(img).arc(box, -100, -100 + 360 * p, fill=MARK, width=8)
        elif k == "ticket":
            if t < it["t0"]: continue
            tk = ticket_image(it["text"], it["size"]); dt = t - it["t0"]
            sc = 1.12 - 0.12 * ease_out(dt / 0.15)
            tk2 = tk.resize((int(tk.width * sc), int(tk.height * sc)))
            if dt < 0.1:
                al = np.asarray(tk2).copy(); al[..., 3] = (al[..., 3] * 0.5).astype(np.uint8); tk2 = Image.fromarray(al)
            img.alpha_composite(tk2, ((W - tk2.width) // 2, it["y"] - tk2.height // 2))
        elif k == "slash" and t >= it["t0"]:
            p = ease_out((t - it["t0"]) / (it["t1"] - it["t0"]))
            px, py, pitch = PAGE[i + 1]
            x0, y0 = px - 10, py + 3 * pitch - 10              # lower-left of line 3 ("の性格では")
            x1, y1 = px + 380, py + pitch + 10                 # upper-right of line 2 ("生まれつき")
            ImageDraw.Draw(img).line([(x0, y0), (x0 + (x1 - x0) * p, y0 + (y1 - y0) * p)], fill=MARK, width=7)
        elif k == "cross" and t >= it["t0"]:
            p = (t - it["t0"]) / (it["t1"] - it["t0"]); d = ImageDraw.Draw(img); cx, cy, r = CROSS
            q = min(1, p * 2); d.line([(cx - r, cy - r), (cx - r + 2 * r * q, cy - r + 2 * r * q)], fill=MARK, width=26)
            q = max(0, min(1, p * 2 - 1))
            if q > 0: d.line([(cx + r, cy - r), (cx + r - 2 * r * q, cy - r + 2 * r * q)], fill=MARK, width=26)
    out = img.convert("RGB")
    if u < 0.3:                                                    # cut: whole frame blurred, eases to sharp
        out = out.filter(ImageFilter.GaussianBlur(14 * (1 - ease_out(u / 0.3))))
    return out

CROSS = (540, 1200, 230)

class ClipReader:
    """Pre-scales one clip to 1080x1920 frames on disk, then loads single frames on demand."""
    def __init__(self, path):
        import tempfile, glob as _g
        j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                       "stream=r_frame_rate", "-of", "json", path], capture_output=True, text=True).stdout)
        n, dd = j["streams"][0]["r_frame_rate"].split("/"); self.fps = float(n) / float(dd)
        self.dir = tempfile.mkdtemp(prefix="cr_")
        subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf",
                        f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}",
                        "-q:v", "2", os.path.join(self.dir, "%04d.jpg")], check=True)
        self.files = sorted(_g.glob(os.path.join(self.dir, "*.jpg"))); self.n = len(self.files)
    def at(self, ts):
        k = max(0, min(self.n - 1, int(ts * self.fps)))
        return Image.open(self.files[k]).convert("RGB")

def src_time(i, u):
    pts = SHOTS[i][3]
    if not pts: return u
    for (u0, s0), (u1, s1) in zip(pts, pts[1:]):
        if u <= u1: return s0 + (s1 - s0) * (u - u0) / (u1 - u0) if u1 > u0 else s1
    return pts[-1][1]

def main():
    global FONT_PATH, VIG
    ap = argparse.ArgumentParser()
    ap.add_argument("clipdir"); ap.add_argument("audio"); ap.add_argument("out")
    ap.add_argument("--font", required=True); ap.add_argument("--preview", default="")
    a = ap.parse_args()
    FONT_PATH = a.font; VIG = vignette_mask()
    beats = beat_frames()
    shot_of = lambda t: max(i for i, s in enumerate(SHOTS) if s[0] <= t + 1e-9)
    if a.preview:
        cache = {}
        for ts in [float(x) for x in a.preview.split(",")]:
            f = max(b for b, _ in beats if b <= round(ts * FPS)); tb = f / FPS; i = shot_of(tb)
            if i not in cache: cache[i] = ClipReader(os.path.join(a.clipdir, f"c{SHOTS[i][2]:02d}.mp4"))
            im = render(tb, i, cache[i].at(src_time(i, tb - SHOTS[i][0])))
            im.resize((540, 960)).save(os.path.join(os.path.dirname(a.out) or ".", f"prev_{ts:05.2f}.jpg"), quality=80)
        return
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-i", a.audio, "-map", "0:v", "-map", "1:a",
                            "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
                            "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-frames:v", str(NFRAMES),
                            "-movflags", "+faststart", a.out], stdin=subprocess.PIPE)
    reader, cur = None, -1
    for k, (f, h) in enumerate(beats):
        tb = f / FPS; i = shot_of(tb)
        if i != cur:
            reader = None; reader = ClipReader(os.path.join(a.clipdir, f"c{SHOTS[i][2]:02d}.mp4")); cur = i
        im = render(tb, i, reader.at(src_time(i, tb - SHOTS[i][0])))
        b = im.tobytes()
        for _ in range(h): enc.stdin.write(b)
        if k % 50 == 0: print(f"{k}/{len(beats)} t={tb:.2f}", flush=True)
    enc.stdin.close(); enc.wait()
    print("done", a.out, "exit", enc.returncode)

if __name__ == "__main__":
    main()
