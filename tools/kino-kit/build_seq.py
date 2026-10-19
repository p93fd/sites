#!/usr/bin/env python3
"""Кадры для холста (как у Apple): все пролёты подряд -> webp-кадры.
d/  — 1280x720 (компьютер, планшет горизонтально)
p/  — 540x1080, центр кадра (телефон вертикально, полная чёткость по высоте)
seq.json — fps, число кадров, кадр каждой сцены.
Запуск: python3 build_seq.py <папка с d0f.mp4…> <папка out> [fps=20]. Повторный запуск безопасен.
"""
import subprocess, sys, json, os, glob
V, OUT = sys.argv[1], sys.argv[2]; FPS = int(sys.argv[3]) if len(sys.argv) > 3 else 20
segs = sorted(glob.glob(f'{V}/d[0-9]f.mp4'), key=lambda p: int(os.path.basename(p)[1:-5]))
def dur(p): return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout)
stops, t = [0], 0.0
for s in segs: t += dur(s); stops.append(round(t * FPS))
lst = f'{OUT}/.list.txt'; os.makedirs(OUT, exist_ok=True); open(lst,'w').write(''.join(f"file '{os.path.abspath(s)}'\n" for s in segs))
for sub, vf, q in (('d', f'fps={FPS},scale=1280:720:flags=lanczos', 72), ('p', f'fps={FPS},crop=540:1080:690:0,unsharp=3:3:0.4', 70)):
    d = f'{OUT}/{sub}'; os.makedirs(d, exist_ok=True)
    for f in glob.glob(f'{d}/*.webp'): os.remove(f)
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',lst,'-vf',vf,'-c:v','libwebp','-quality',str(q),'-compression_level','5',f'{d}/%04d.webp'], check=True)
os.remove(lst)
n = len(glob.glob(f'{OUT}/d/*.webp')); stops = [min(s, n - 1) for s in stops]
json.dump({'fps': FPS, 'n': n, 'stops': stops}, open(f'{OUT}/seq.json','w'))
sz = lambda s: sum(os.path.getsize(f) for f in glob.glob(f'{OUT}/{s}/*.webp')) / 1e6
print('кадров', n, 'сцены', stops, f'd {sz("d"):.1f} МБ, p {sz("p"):.1f} МБ')
