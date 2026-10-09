#!/bin/bash
# Цветокор и сборка роликов для kino/: один цвет на весь фильм (холод -> тепло), бесшовная петля.
# Повторный запуск безопасен: перезаписывает выходные файлы.
# Использование: tools/kino-grade.sh <папка с исходниками> <папка вывода>
set -e
SRC=$1; OUT=$2; mkdir -p "$OUT"
# имя  файл  старт  длина  тепло(0 холод..1 тепло)  замедление
SCENES="
s01 m1.mp4 4.1 3.8 0 2
s02 45372.mp4 2 9 0 1
s03 4383.mp4 3 9 0.1 1
s04 m1.mp4 0 4 0 2
s05 43605.mp4 1 9 0.25 1
s06 51665.mp4 0 9 0.3 1
s07 34363.mp4 1 10 0.55 1
s08 m2.mp4 0 8 0.35 1
s09 4119.mp4 0 9 0.9 1
s10 2049.mp4 4 9 0.6 1
s11 27950.mp4 1 10 0.7 1
s12 44370.mp4 6 10 0.85 1
"
echo "$SCENES" | while read n f ss len w slow; do
  [ -z "$n" ] && continue
  L=$(echo "$len*$slow" | bc)
  # баланс: холод уводит тени в бирюзу, тепло — светлые в янтарь
  cb="colorbalance=rs=$(echo "-0.06+0.07*$w"|bc -l):bs=$(echo "0.07-0.08*$w"|bc -l):rm=$(echo "-0.03+0.06*$w"|bc -l):bm=$(echo "0.03-0.06*$w"|bc -l):rh=$(echo "0.0+0.06*$w"|bc -l):bh=$(echo "0.0-0.05*$w"|bc -l)"
  sp=""; [ "$slow" != "1" ] && sp="setpts=$slow*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1,"
  G="${sp}scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,fps=24,eq=contrast=1.07:saturation=$(echo "0.62+0.2*$w"|bc -l):brightness=-0.035:gamma=0.97,$cb,vignette=angle=0.55,format=yuv420p"
  T=$(echo "$L-1"|bc -l)
  F="[0:v]trim=start=$ss:duration=$len,setpts=PTS-STARTPTS,$G,split[a][b];[a]trim=1:$L,setpts=PTS-STARTPTS[m];[b]trim=0:1,setpts=PTS-STARTPTS[h];[m][h]xfade=transition=fade:duration=1:offset=$(echo "$T-1"|bc -l),setsar=1"
  ffmpeg -nostdin -v error -y -i "$SRC/$f" -filter_complex "$F,split[d][p];[d]scale=1600:900:flags=lanczos[D];[p]scale=1024:576:flags=lanczos[P]" \
    -map "[D]" -an -c:v libx264 -preset slow -crf 25 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/$n.mp4" \
    -map "[P]" -an -c:v libx264 -preset slow -crf 28 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/$n-m.mp4"
  ffmpeg -nostdin -v error -y -i "$OUT/$n.mp4" -frames:v 1 -q:v 4 "$OUT/$n.jpg"
  echo "$n готов: $(du -h "$OUT/$n.mp4" | cut -f1) / $(du -h "$OUT/$n-m.mp4" | cut -f1)"
done
