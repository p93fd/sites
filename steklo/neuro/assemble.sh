#!/bin/bash
# склейка роликов в один фильм: имя:сколько_кадров_брать (0 = все), первый кадр следующих роликов выкидывается
cd /home/claude/gen3; rm -rf raw tmp; mkdir -p raw tmp; n=0; first=1
for spec in a_sky:0 c3:0 b_dive:0 c6:0 c7:0 c8:37 c_space:0; do c=${spec%%:*}; take=${spec##*:}; rm -f tmp/*
  ffmpeg -v error -i $c.mp4 -vf "deflicker=mode=pm:size=5" tmp/%03d.png
  files=$(ls tmp | sort); [ "$take" != 0 ] && files=$(echo "$files" | head -n $take)
  [ $first = 0 ] && files=$(echo "$files" | tail -n +2); first=0
  for f in $files; do mv tmp/$f raw/f$(printf %04d $n).png; n=$((n+1)); done
done; echo "frames $n"
