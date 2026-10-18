# Сборка сайта: равномерно прореживает отрендеренные кадры под лимит файлов
import os, shutil, glob, sys
def pack(src, dst, n_out):
    fs = sorted(glob.glob(f'{src}/*.webp')); N = len(fs)
    os.makedirs(dst, exist_ok=True)
    for f in glob.glob(f'{dst}/*.webp'): os.remove(f)
    for k in range(n_out):
        i = round(k * (N - 1) / (n_out - 1)); shutil.copy(fs[i], f'{dst}/f{k:04d}.webp')
    print(dst, n_out, 'из', N)
pack('frames/d', 'site/d', 270)
if glob.glob('frames/m/*.webp'): pack('frames/m', 'site/m', 190)
