# Переходы между сценами: плавная кривая скорости + честный моушн-блюр, 60 fps, вперёд и назад
import numpy as np, cv2, subprocess, os, sys, glob
INT='/home/claude/gen5/int'; OUT='/home/claude/gen5/seg'
STOPS=[8,50,118,196,290,360,452,500,596]
n_int=len(glob.glob(INT+'/i*.jpg'))
K=(n_int-1)/596
def ease(t): return 4*t*t*t if t<.5 else 1-((-2*t+2)**3)/2
def load(j):
    j=max(1,min(n_int,j)); return cv2.imread(f'{INT}/i{j:05d}.jpg').astype(np.float32)
cache={}
def get(j):
    if j not in cache:
        if len(cache)>40: cache.pop(next(iter(cache)))
        cache[j]=load(j)
    return cache[j]
def enc(frames_dir, out, w, crf, rev):
    pat=f'{frames_dir}/%04d.png'
    vf=f"scale={w}:-2:flags=lanczos"+(",unsharp=5:5:0.55" if w>1280 else ",unsharp=3:3:0.3")
    cmd=['ffmpeg','-v','error','-y','-framerate','60','-i',pat]
    if rev: vf+=',reverse'
    cmd+=['-vf',vf,'-c:v','libx264','-preset','slow','-crf',str(crf),'-pix_fmt','yuv420p','-g','30','-movflags','+faststart','-an',out]
    subprocess.run(cmd,check=True)
for s in range(len(STOPS)-1):
    a,b=STOPS[s],STOPS[s+1]; dist=b-a
    dur=min(2.6,max(1.6,1.25+dist*0.014)); n=round(dur*60)
    d=f'/home/claude/gen5/tmp{s}'; os.makedirs(d,exist_ok=True)
    for f in glob.glob(d+'/*.png'): os.remove(f)
    prev=a*K+1
    for i in range(n+1):
        pos=(a+(b-a)*ease(i/n))*K+1
        j1=round(pos); lo,hi=sorted((round(prev),j1)); prev=pos
        # моушн-блюр: среднее кадров, пройденных за этот кадр (как затвор 180°)
        span=list(range(max(lo,j1-3),j1+1)) if hi-lo>1 else [j1]
        acc=sum(get(j) for j in span)/len(span)
        cv2.imwrite(f'{d}/{i:04d}.png',np.clip(acc,0,255).astype(np.uint8))
    for rev in (0,1):
        tag='r' if rev else 'f'
        enc(d,f'{OUT}/d{s}{tag}.mp4',1920,21,rev)
        enc(d,f'{OUT}/m{s}{tag}.mp4',1280,23,rev)
    print('seg',s,n,'frames',flush=True)
# кадры остановок: тот же конвейер, что и у последних кадров роликов
for k,f in enumerate(STOPS):
    im=get(round(f*K+1)).astype(np.uint8); p=f'/home/claude/gen5/tmp_p{k}.png'; cv2.imwrite(p,im)
    for w,tag,q in ((1920,'d',82),(1280,'m',78)):
        us=",unsharp=5:5:0.55" if w>1280 else ",unsharp=3:3:0.3"
        subprocess.run(['ffmpeg','-v','error','-y','-i',p,'-vf',f'scale={w}:-2:flags=lanczos{us}','-c:v','libwebp','-quality',str(q),f'{OUT}/{tag}p{k}.webp'],check=True)
print('done')
