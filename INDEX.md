# INDEX: что где лежит

Читать первым. Дальше открывать только нужный файл и только нужные строки (номера есть в MAP.md).

## Сайты

| Папка | Что это | Живая ссылка |
|---|---|---|
| steklo | Сайт-фильм 18.10 на нейросетях (Nano Banana + Wan 2.2 через Apify): кольцо → окна → соты → тоннель → затмение с фото → кристаллы → лотос → горизонт. Конвейер и промпты: steklo/neuro/PIPELINE.md | https://p93fd.github.io/sites/steklo/ |
| steklo-3d | Первая версия steklo на своём 3D-движке (Three.js), студия рендера в steklo-3d/studio | https://p93fd.github.io/sites/steklo-3d/ |
| kino | Личный сайт-фильм, 12 видео-слайдов (выбор Александра 09.10). Код: index.html, style.css, app.js; ролики v/ собирает tools/kino-grade.sh | https://p93fd.github.io/sites/kino/ |
| sistema | Прошлая версия: 8 экранов, 3D-сцена из частиц. Отсюда шрифты, фото, legal.html для kino | https://p93fd.github.io/sites/sistema/ |
| bezlishnego | Сайт Саши («Без лишнего»), готов. Отсюда взяты документы | https://p93fd.github.io/sites/bezlishnego/ |
| dengi | Личное приложение «Деньги»: учёт трат по фото чека или скрину банка. Распознаёт в телефоне (Tesseract в vendor/), данные зашифрованы кодом в localStorage, сети нет | https://p93fd.github.io/sites/dengi/ |
| architektor | Старая версия сайта Александра, на видео-фонах. Не трогать | https://p93fd.github.io/sites/architektor/ |
| architektor-v2 | Вторая старая версия. Не трогать | https://p93fd.github.io/sites/architektor-v2/ |

Карта экранов sistema, номера строк, принятые и отклонённые решения: **MAP.md**.

## Знания

| Файл | Когда открывать |
|---|---|
| .claude/skills/my-voice/SKILL.md | Любой текст от лица Александра. Большой файл: сначала оглавление (grep '^#'), потом нужный раздел |
| research/voice-aleksandr.md | Банк его фраз A1–A10, B–G. Только grep по теме, целиком не читать |
| research/README.md | Оглавление исследований по дизайну сайтов |
| research/activetheory-ref.md, studios-ref.md | Замеры приёмов студий. Только при задаче «как у студии» |
| research/wave*.md, video-ref.md | Старые исследования. Почти не нужны |
| .claude/skills/site-10k, studio-layout, particle-scene, ru-typography, volumetric-web | Правила вёрстки и 3D. Читать скилл, когда задача по его теме |

## Инструменты

- `node tools/gen-map.mjs` пересобирает авто-блоки INDEX и MAP. Сам запускается перед каждым коммитом.
- `tools/shots.mjs` даёт скриншоты страниц. Высоты глав там старые, для sistema брать скрипт из MAP.md, раздел «Проверка».
- `tools/typograf.mjs` расставляет неразрывные пробелы.

## Правила репозитория

- Автор коммитов: `p93fd <p93fd@users.noreply.github.com>`. В конце сообщения строки Co-Authored-By и Claude-Session.
- Пуш в main, сайт обновляется через GitHub Pages за 1–2 минуты.
- Чужой код и ассеты студий не вставлять, приёмы делать своим кодом.

## Все файлы (авто)

<!-- auto:files -->
| Папка | Файлов | Вес | Текстовые файлы (строк) |
|---|---|---|---|
| . | 4 | 19 КБ | CLAUDE.md (16), INDEX.md (61), MAP.md (160), README.md (1) |
| .claude | 7 | 106 КБ | .claude/settings.json (8), .claude/skills/my-voice/SKILL.md (571), .claude/skills/particle-scene/SKILL.md (89), .claude/skills/ru-typography/SKILL.md (60), .claude/skills/site-10k/SKILL.md (94), .claude/skills/studio-layout/SKILL.md (98), .claude/skills/volumetric-web/SKILL.md (43) |
| anna | 1 | 1.7 МБ | anna/index.html (591) |
| architektor | 51 | 22.3 МБ | architektor/fx/post.js (894), architektor/index.html (1825) |
| architektor-v2 | 340 | 10.8 МБ | architektor-v2/app.js (71), architektor-v2/index.html (285) |
| bezlishnego | 46 | 22.7 МБ | bezlishnego/index.html (1488), bezlishnego/legal.html (157), bezlishnego/satin.html (1494), bezlishnego/tilda-1-oformlenie.txt (2), bezlishnego/tilda-2-stranica.txt (133) |
| dengi | 21 | 13.4 МБ | dengi/app.js (888), dengi/fonts/OFL.txt (94), dengi/index.html (199), dengi/style.css (203), dengi/sw.js (28), dengi/vendor/tesseract-core-lstm.wasm.js (283), dengi/vendor/tesseract-core-simd-lstm.wasm.js (283) |
| kino | 34 | 32.7 МБ | kino/app.js (276), kino/index.html (62), kino/style.css (62) |
| research | 11 | 599 КБ | research/README.md (153), research/activetheory-ref.md (405), research/studios-ref.md (356), research/video-ref.md (310), research/voice-aleksandr.md (587), research/wave1-eu-creative-dev.md (340), research/wave1-premium-anatomy.md (345), research/wave1-us-visual.md (421), research/wave2-asia.md (269), research/wave2-cyrillic.md (475), research/wave2-deep.md (356) |
| sistema | 27 | 1.3 МБ | sistema/app.js (706), sistema/index.html (656), sistema/legal.html (98) |
| steklo | 1158 | 110.3 МБ | steklo/index.html (364), steklo/neuro/PIPELINE.md (16) |
| steklo-3d | 487 | 26.0 МБ | steklo-3d/index.html (385), steklo-3d/studio/qa.mjs (23), steklo-3d/studio/render.mjs (20), steklo-3d/studio/scene.html (4), steklo-3d/studio/scene.js (393), steklo-3d/studio/serve.mjs (7), steklo-3d/studio/timeline.js (12) |
| tools | 5 | 12 КБ | tools/gen-map.mjs (71), tools/kino-scenes.txt (13), tools/shots.mjs (36), tools/typograf.mjs (25) |
<!-- /auto:files -->
