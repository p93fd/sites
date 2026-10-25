# INDEX: что где лежит

Читать первым. Дальше открывать только нужный файл и только нужные строки (номера есть в MAP.md).

## Сайты

| Папка | Что это | Живая ссылка |
|---|---|---|
| mbsea2 | Сайт Arti made by sea слайдами 26.10: 7 слайдов (главная, цифры, добыча, этапы, товары, почему мы, заявка), текст с mbsea.ru, нарисованные водоросли SVG, карточки, переходы | https://p93fd.github.io/sites/mbsea2/ |
| mbsea | Сайт-фильм Arti made by sea (водоросли, опт для мастеров) 25.10: подводный 3D-мир, 11 глав — лес ламинарии → лист срезан руками → цех → гель → банка 1 кг → протокол → отзывы WB → набор мастера → опт → вопросы → выход на поверхность и заявка на прайс | https://p93fd.github.io/sites/mbsea/ |
| steklo | Сайт-фильм v5 18.10: 9 сцен, свайп = сцена (8 свайпов), пролёт между сценами, 3D-иконки, кольцо кейсов. Конвейер: steklo/neuro/PIPELINE.md | https://p93fd.github.io/sites/steklo/ |
| steklo-v4 | v4 (прокрутка 22 экрана) + все кадры и ролики в neuro/ | https://p93fd.github.io/sites/steklo-v4/ |
| steklo-v3 | Версия v3 (шар в тоннеле, Unbounded) | https://p93fd.github.io/sites/steklo-v3/ |
| steklo-v2 | Прошлая нейро-версия (кольцо, кристаллы) | https://p93fd.github.io/sites/steklo-v2/ |
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
| . | 4 | 28 КБ | CLAUDE.md (16), INDEX.md (77), MAP.md (174), README.md (1) |
| .claude | 8 | 110 КБ | .claude/settings.json (8), .claude/skills/kino-sayt/SKILL.md (42), .claude/skills/my-voice/SKILL.md (571), .claude/skills/particle-scene/SKILL.md (89), .claude/skills/ru-typography/SKILL.md (60), .claude/skills/site-10k/SKILL.md (94), .claude/skills/studio-layout/SKILL.md (98), .claude/skills/volumetric-web/SKILL.md (43) |
| .memory | 5 | 11 КБ | .memory/INDEX.md (11), .memory/conventions.md (10), .memory/dead-ends.md (44), .memory/decisions.md (36), .memory/state.md (9) |
| anna | 1 | 2.0 МБ | anna/index.html (578) |
| architektor | 51 | 22.3 МБ | architektor/fx/post.js (894), architektor/index.html (1825) |
| architektor-v2 | 340 | 10.8 МБ | architektor-v2/app.js (71), architektor-v2/index.html (285) |
| bezlishnego | 46 | 22.7 МБ | bezlishnego/index.html (1488), bezlishnego/legal.html (157), bezlishnego/satin.html (1494), bezlishnego/tilda-1-oformlenie.txt (2), bezlishnego/tilda-2-stranica.txt (133) |
| dengi | 21 | 13.4 МБ | dengi/app.js (888), dengi/fonts/OFL.txt (94), dengi/index.html (199), dengi/style.css (203), dengi/sw.js (28), dengi/vendor/tesseract-core-lstm.wasm.js (283), dengi/vendor/tesseract-core-simd-lstm.wasm.js (283) |
| kino | 34 | 32.7 МБ | kino/app.js (276), kino/index.html (62), kino/style.css (62) |
| mbsea | 34 | 1.1 МБ | mbsea/app.js (146), mbsea/index.html (393), mbsea/world.js (560) |
| mbsea2 | 37 | 2.0 МБ | mbsea2/index.html (350) |
| orva | 49 | 1.7 МБ | orva/app.js (170), orva/film.js (173), orva/index.html (375) |
| orva-v3 | 53 | 1.7 МБ | orva-v3/app.js (136), orva-v3/index.html (381), orva-v3/world.js (532) |
| research | 15 | 963 КБ | research/README.md (153), research/activetheory-ref.md (405), research/studios-ref.md (356), research/video-ref.md (310), research/voice-aleksandr.md (587), research/wave1-eu-creative-dev.md (340), research/wave1-premium-anatomy.md (345), research/wave1-us-visual.md (421), research/wave2-asia.md (269), research/wave2-cyrillic.md (475), research/wave2-deep.md (356) |
| sistema | 27 | 1.3 МБ | sistema/app.js (706), sistema/index.html (656), sistema/legal.html (98) |
| steklo | 899 | 213.0 МБ | steklo/f/seq.json (1), steklo/index.html (321), steklo/live.js (124), steklo/lotus.js (117), steklo/neuro/PIPELINE.md (41), steklo/particles.js (129), steklo/player.js (123), steklo/swipe.js (180) |
| steklo-3d | 487 | 26.0 МБ | steklo-3d/index.html (385), steklo-3d/studio/qa.mjs (23), steklo-3d/studio/render.mjs (20), steklo-3d/studio/scene.html (4), steklo-3d/studio/scene.js (393), steklo-3d/studio/serve.mjs (7), steklo-3d/studio/timeline.js (12) |
| steklo-v2 | 1158 | 110.3 МБ | steklo-v2/index.html (364), steklo-v2/neuro/PIPELINE.md (16) |
| steklo-v3 | 1413 | 120.0 МБ | steklo-v3/index.html (380), steklo-v3/neuro/PIPELINE.md (22) |
| steklo-v4 | 1817 | 104.0 МБ | steklo-v4/index.html (352), steklo-v4/neuro/PIPELINE.md (29) |
| steklo-v5 | 1818 | 86.4 МБ | steklo-v5/index.html (355), steklo-v5/neuro/PIPELINE.md (35), steklo-v5/studio/icons.html (4), steklo-v5/studio/icons.js (81), steklo-v5/studio/render_icons.mjs (9) |
| steklo-v9 | 1 | 23 КБ | steklo-v9/index.html (266) |
| tools | 17 | 82 КБ | tools/gen-map.mjs (71), tools/kino-kit/README.md (36), tools/kino-kit/engine/live.js (124), tools/kino-kit/engine/particles.js (129), tools/kino-kit/engine/swipe.js (148), tools/kino-kit/engine/template.html (267), tools/kino-scenes.txt (13), tools/shots.mjs (36), tools/typograf.mjs (25) |
<!-- /auto:files -->
