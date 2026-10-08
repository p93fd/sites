# INDEX: что где лежит

Читать первым. Дальше открывать только нужный файл и только нужные строки (номера есть в MAP.md).

## Сайты

| Папка | Что это | Живая ссылка |
|---|---|---|
| sistema | Личный сайт Александра, 8 экранов, одна 3D-сцена из частиц. В работе | https://p93fd.github.io/sites/sistema/ |
| bezlishnego | Сайт Саши («Без лишнего»), готов. Отсюда взяты документы | https://p93fd.github.io/sites/bezlishnego/ |
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
| . | 4 | 13 КБ | CLAUDE.md (16), INDEX.md (53), MAP.md (134), README.md (1) |
| .claude | 7 | 106 КБ | .claude/settings.json (8), .claude/skills/my-voice/SKILL.md (571), .claude/skills/particle-scene/SKILL.md (89), .claude/skills/ru-typography/SKILL.md (60), .claude/skills/site-10k/SKILL.md (94), .claude/skills/studio-layout/SKILL.md (98), .claude/skills/volumetric-web/SKILL.md (43) |
| architektor | 51 | 22.3 МБ | architektor/fx/post.js (894), architektor/index.html (1825) |
| architektor-v2 | 340 | 10.8 МБ | architektor-v2/app.js (71), architektor-v2/index.html (285) |
| bezlishnego | 46 | 22.7 МБ | bezlishnego/index.html (1488), bezlishnego/legal.html (157), bezlishnego/satin.html (1494), bezlishnego/tilda-1-oformlenie.txt (2), bezlishnego/tilda-2-stranica.txt (133) |
| research | 11 | 599 КБ | research/README.md (153), research/activetheory-ref.md (405), research/studios-ref.md (356), research/video-ref.md (310), research/voice-aleksandr.md (587), research/wave1-eu-creative-dev.md (340), research/wave1-premium-anatomy.md (345), research/wave1-us-visual.md (421), research/wave2-asia.md (269), research/wave2-cyrillic.md (475), research/wave2-deep.md (356) |
| sistema | 27 | 1.3 МБ | sistema/app.js (706), sistema/index.html (656), sistema/legal.html (98) |
| tools | 3 | 10 КБ | tools/gen-map.mjs (71), tools/shots.mjs (36), tools/typograf.mjs (25) |
<!-- /auto:files -->
