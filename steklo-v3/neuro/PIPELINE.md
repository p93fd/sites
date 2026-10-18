# Нейро-конвейер сайта-фильма

Так собран steklo. Повторяется для любого клиента за ~40 минут и ~$2 кредитов Apify (хватает бесплатного плана).

## Шаги
1. **8 ключевых кадров** — Apify-актор `imageaibot/nanobanana-api` (Nano Banana, 2K, 16:9, ~$0.07 за кадр).
   Запуск: `operation: generate` → taskId; затем `operation: query` с taskId → imgUrl.
   Общий стиль в начале каждого промпта: «Full-frame photorealistic cinematic film still, 16:9, no letterbox. Deep navy-black monolithic background, cold palette of royal blue #4155e8, sky blue #76b7ff and ice white, transparent crystal glass with refraction and chromatic dispersion, volumetric haze, sparse thin vertical light streaks far in the background, minimal, ultra premium, no text, no logos, no people.» + сцена.
2. **7 видео-переходов** — Apify-актор `danitn11/wan22-lightning-image-to-video` (Wan 2.2): `imageUrl` = кадр N, `endImageUrl` = кадр N+1, 720p, 5 с (~$0.18 за ролик). Одновременно не больше 3 запусков на бесплатном плане.
   Промпт описывает только движение: «Smooth continuous cinematic camera move. <что во что превращается>. No cuts.»
3. **Склейка** — ffmpeg режет каждый ролик в webp, у роликов 2–7 первый кадр выкидывается (он равен последнему кадру предыдущего). Итого 561 кадр: `d/` 1280px, `m/` 960px.
4. **Сайт** — index.html: прокрутка → номер кадра, плавное перетекание между кадрами, текст привязан к кадрам (`data-f="от,до"`), на телефоне широкие сцены показываются с отъездом.

## Сцены steklo
k1 кольцо → k2 три окна → k3 монолит из сот → k4 тоннель → k5 затмение → k6 поле кристаллов → k7 лотос → k8 горизонт.

## Версия 3 (18.10, по разбору образца)
- Что даёт плавность и качество образца: один непрерывный пролёт (переход = пролёт сквозь объект), единая тёмная гамма, зерно и пыль поверх всего, объёмные лучи, боке, инерция прокрутки.
- Сцены: n1 небо над облаками → n2 три окна на облаках → соты → n4 изогнутый тоннель из световых плиток (сгенерирован по кадру образца research/refs/tunnel-a.jpg) → n5 чёрный шар в тоннеле (фото) → n6 темнота с лучами и пылью (вместо кристаллов, по research/refs/rays.jpg) → n7 лучи крест-накрест с цветком света → лотос → горизонт.
- Ролики c1…c8, тоннель c4 — 8 секунд. Перед нарезкой каждый ролик проходит ffmpeg deflicker (убирает вспышки яркости между кадрами).
- Поверх фильма в браузере рисуются зерно и пыль (canvas #grain).
