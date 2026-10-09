#!/bin/bash
# Цветокор и сборка роликов для kino/: тёмный минималистичный стиль на весь фильм, бесшовная петля.
# Повторный запуск безопасен: перезаписывает выходные файлы.
# Использование: tools/kino-grade.sh <папка исходников> <папка вывода> <файл сцен> [только_имя]
# Строка файла сцен: имя файл старт длина замедление яркость насыщенность
set -e
SRC=$1; OUT=$2; LIST=$3; ONLY=$4; mkdir -p "$OUT"
grep -v '^\s*#' "$LIST" | while read n f ss len slow br sat; do
  [ -z "$n" ] && continue
  [ -n "$ONLY" ] && [ "$ONLY" != "$n" ] && continue
  L=$(echo "$len*$slow" | bc -l)
  sp=""; [ "$slow" != "1" ] && sp="setpts=$slow*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1,"
  G="${sp}scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,fps=24,eq=contrast=1.1:saturation=$sat:brightness=$br:gamma=0.82,colorbalance=rs=-0.06:bs=0.05:rm=-0.03:bm=0.03:rh=0.02:bh=-0.01,curves=all='0/0 0.5/0.4 1/0.82',vignette=angle=0.62,format=yuv420p"
  T=$(echo "$L-1"|bc -l)
  F="[0:v]trim=start=$ss:duration=$len,setpts=PTS-STARTPTS,$G,split[a][b];[a]trim=1:$L,setpts=PTS-STARTPTS[m];[b]trim=0:1,setpts=PTS-STARTPTS[h];[m][h]xfade=transition=fade:duration=1:offset=$(echo "$T-1"|bc -l),setsar=1"
  ffmpeg -nostdin -v error -y -i "$SRC/$f" -filter_complex "$F,split[d][p];[d]scale=1600:900:flags=lanczos[D];[p]scale=1024:576:flags=lanczos[P]" \
    -map "[D]" -an -c:v libx264 -preset slow -crf 24 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/$n.mp4" \
    -map "[P]" -an -c:v libx264 -preset slow -crf 27 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/$n-m.mp4"
  ffmpeg -nostdin -v error -y -i "$OUT/$n.mp4" -frames:v 1 -q:v 4 "$OUT/$n.jpg"
  echo "$n готов: $(du -h "$OUT/$n.mp4" | cut -f1) / $(du -h "$OUT/$n-m.mp4" | cut -f1)"
done
