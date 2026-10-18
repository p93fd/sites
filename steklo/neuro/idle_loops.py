#!/usr/bin/env python3
"""Живые петли покоя для сцен сайта-фильма из уже готовых роликов переходов.

Для сцены s берётся начало ролика ухода (s → s+1) и конец ролика прихода (s-1 → s).
Камера в покое плавно ходит по своему же 3D-пути: чуть вперёд к следующей сцене,
назад через кадр остановки, чуть к предыдущей и снова в кадр остановки.
Ход выровнен по реальному движению картинки (без провалов скорости), дробные позиции —
смешением соседних кадров. Петля начинается и заканчивается ровно на постере сцены.

Запуск: python3 idle_loops.py <папка v> <набор d|m> [сцены...]
Повторный запуск безопасен: готовые файлы перезаписываются.
"""
import subprocess, sys, json, math
import numpy as np

V, SET = sys.argv[1], sys.argv[2]
ONLY = [int(x) for x in sys.argv[3:]]
FPS, T = 30, 10.0          # петля 10 с, 30 кадров/с
TARGET = 9.0               # насколько далеко уходит камера (средняя разница с постером, 0–255)
KMAX = .42                 # не дальше этой доли ролика

def probe(p):
    o = subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries',
                        'stream=width,height,nb_read_frames', '-of', 'json', p], capture_output=True, text=True).stdout
    s = json.loads(o)['streams'][0]; return int(s['width']), int(s['height']), int(s['nb_read_frames'])

def frames(p, a, b):
    w, h, _ = probe(p)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-vf', f'select=between(n\\,{a}\\,{b})', '-vsync', '0',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)

def small(f):
    g = f[::8, ::8].astype(np.float32).mean(2); return g

def track(fr):
    """Обрезать трек там, где движение достигло TARGET; вернуть кадры и накопленное движение."""
    s0 = small(fr[0]); cum = [0.]; prev = s0
    for i in range(1, len(fr)):
        cur = small(fr[i]); cum.append(cum[-1] + float(np.abs(cur - prev).mean())); prev = cur
        if float(np.abs(cur - s0).mean()) >= TARGET: break
    n = len(cum); return fr[:n], np.array(cum)

def sample(fr, cum, x):
    """x ∈ [0,1] — доля пути, выровненная по движению."""
    if len(fr) == 1 or cum[-1] <= 0: return fr[0].astype(np.float32)
    m = x * cum[-1]; i = int(np.searchsorted(cum, m, side='right') - 1); i = max(0, min(i, len(fr) - 2))
    seg = cum[i + 1] - cum[i]; t = 0 if seg <= 0 else (m - cum[i]) / seg
    return fr[i].astype(np.float32) * (1 - t) + fr[i + 1].astype(np.float32) * t

def build(s, nscenes):
    A = B = None
    if s < nscenes - 1:
        p = f'{V}/{SET}{s}f.mp4'; n = probe(p)[2]; A = track(frames(p, 0, int(n * KMAX)))
    if s > 0:
        p = f'{V}/{SET}{s-1}f.mp4'; n = probe(p)[2]; fr = frames(p, int(n * (1 - KMAX)), n - 1)[::-1]; B = track(fr)
    ref = (A or B)[0][0]; h, w = ref.shape[:2]
    out = f'{V}/{SET}i{s}.mp4'
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', str(FPS),
                            '-i', '-', '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                            '-g', '30', '-movflags', '+faststart', '-an', out], stdin=subprocess.PIPE)
    N = int(FPS * T)
    for k in range(N):
        ph = 2 * math.pi * k / N
        if A is not None and B is not None: x = math.sin(ph)                     # вперёд → назад → в кадр
        else: x = (1 - math.cos(ph)) / 2 * (1 if A is not None else -1)        # крайние сцены: туда и обратно
        f = sample(*A, x) if x >= 0 and A is not None else sample(*B, -x) if B is not None else sample(*A, 0)
        enc.stdin.write(np.clip(f + .5, 0, 255).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait()
    return out, (len(A[0]) if A else 0), (len(B[0]) if B else 0)

if __name__ == '__main__':
    import glob, os
    nsc = len(glob.glob(f'{V}/{SET}p*.webp'))
    for s in (ONLY or range(nsc)):
        out, a, b = build(s, nsc)
        print(s + 1, os.path.basename(out), 'вперёд', a, 'назад', b, f'{os.path.getsize(out)/1e6:.1f} МБ', flush=True)
