#!/bin/sh
# Запасные VP9 WebM для петель покоя (браузеры без H.264). Повторный запуск безопасен.
cd "$(dirname "$0")/../v" || exit 1
for f in di*.mp4 mi*.mp4; do
  ffmpeg -v error -y -i "$f" -c:v libvpx-vp9 -crf 36 -b:v 0 -deadline good -cpu-used 4 -row-mt 1 -g 30 -an "${f%.mp4}.webm" && echo "$f готов"
done
