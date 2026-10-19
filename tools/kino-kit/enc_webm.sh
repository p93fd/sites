set -e
for s in 0 1 2 3 4 5 6 7; do for r in 0 1; do t=f; rv=""; [ $r = 1 ] && t=r && rv=",reverse"
 for w in 1920 1280; do p=d; us="unsharp=5:5:0.55"; crf=34; [ $w = 1280 ] && p=m && us="unsharp=3:3:0.3" && crf=36
  ffmpeg -v error -y -framerate 60 -i tmp$s/%04d.png -vf "scale=$w:-2:flags=lanczos,$us$rv" -c:v libvpx-vp9 -crf $crf -b:v 0 -deadline good -cpu-used 4 -row-mt 1 -g 30 -pix_fmt yuv420p -an seg/$p$s$t.webm
 done; done; echo s$s; done; echo ok
