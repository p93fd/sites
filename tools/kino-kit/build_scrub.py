#!/usr/bin/env python3
"""Плёнка для свайпа туда-сюда: все пролёты вперёд склеены в один ролик, каждый кадр — ключевой.
Каждый кадр ключевой (all-intra) => перемотка в любую точку мгновенная, кадр едет за пальцем в обе стороны.
Пишет <out>/film_<набор>.mp4 и .webm и stops.json (время каждой сцены в секундах).

Запуск: python3 build_scrub.py <папка v с d0f.mp4…> <папка out> [fps=30]
Повторный запуск безопасен.
"""
import subprocess, sys, json, os, glob
V, OUT = sys.argv[1], sys.argv[2]; FPS = int(sys.argv[3]) if len(sys.argv) > 3 else 30
os.makedirs(OUT, exist_ok=True)
def dur(p):
    return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout)
for SET, W, CRF, VP in (('d', 1600, 27, 40), ('m', 960, 28, 42)):
    segs = sorted(glob.glob(f'{V}/{SET}[0-9]f.mp4'), key=lambda p: int(os.path.basename(p)[1:-5]))
    if not segs: continue
    lst = f'{OUT}/.{SET}.txt'; open(lst, 'w').write(''.join(f"file '{os.path.abspath(s)}'\n" for s in segs))
    stops, t = [0.0], 0.0
    for s in segs: t += dur(s); stops.append(round(t, 3))
    vf = f'fps={FPS},scale={W}:-2:flags=lanczos'
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',lst,'-vf',vf,'-c:v','libx264','-preset','slow',
                    '-crf',str(CRF),'-g','1','-keyint_min','1','-sc_threshold','0','-pix_fmt','yuv420p','-movflags','+faststart','-an',
                    f'{OUT}/film_{SET}.mp4'], check=True)
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',lst,'-vf',vf,'-c:v','libvpx-vp9','-crf',str(VP),'-b:v','0',
                    '-g','1','-deadline','good','-cpu-used','4','-row-mt','1','-an',f'{OUT}/film_{SET}.webm'], check=True)
    os.remove(lst)
    json.dump({'fps': FPS, 'stops': stops}, open(f'{OUT}/stops.json', 'w'))
    print(SET, 'сцен', len(stops), 'длина', stops[-1], 'с', *(f"{os.path.getsize(f'{OUT}/film_{SET}.{e}')/1e6:.1f}МБ {e}" for e in ('mp4','webm')), flush=True)
