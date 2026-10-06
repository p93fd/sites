# Wave 2 — Cyrillic and Russian-language typography for a dark premium one-page site

Date: 2026-10-06. Scope: Russian-language type market, Russian micro-typography, free Cyrillic fonts, how Russian-language studios set large Cyrillic headlines, tone of premium copy.

How to read the items: `Rule — value / example — why — source`. Each item ends with a tag:

- **[verified]** — I read it on a page fetched in this session (text of the article, or CSS/HTML of the live site, or Google Fonts metadata JSON).
- **[recalled]** — general professional knowledge, not re-read today. Treat as a hypothesis and check by eye.
- **[derived]** — my inference from verified measurements (small sample; stated as such).

Important limits of this wave:
- Studio breakdowns come from fetched HTML/CSS (font-face names, font-size, letter-spacing, line-height). I did not render the pages, so anything about how type sits over 3D is not visually confirmed.
- Almost no Russian source publishes numeric tracking or line-height values specifically for Cyrillic. The numbers in sections 2–3 are therefore mostly measurements from live Russian-language studio sites plus inference, not quoted "rules".

---

## 1. Cyrillic vs Latin: what actually differs

1. Lowercase Cyrillic has very few ascenders/descenders — most Russian lowercase letters share x-height and "to an unfamiliar eye can look a lot like small caps" — so a line of text is a flat band, not a skyline — Krista Radoeva, https://localfonts.eu/typography-basics/fonts-the-importance-of-localisation/krista-radoeva-cyrillic-script-variations-and-the-importance-of-localisation/ [verified]
2. The "заборчик" (picket fence) effect — Cyrillic is criticised for many vertical strokes and diagonals and few extenders; letters of one height form a fence — this is why a mediocre Cyrillic looks much worse than the same font's Latin — Skillbox Media, https://skillbox.ru/media/design/kak-otlichit-khoroshuyu-kirillitsu-ot-plokhoy/ [verified]
3. Upper- and lowercase share constructions in Russian Cyrillic (к/К, в/В, м/М, н/Н, т/Т, ш/Ш…) — so mixed-case headlines have less word-shape contrast than Latin; hierarchy must come from size, weight and space, not from case — Radoeva, same URL [verified]
4. Bulgarian Cyrillic has more extenders and handwriting-derived lowercase; it is a different local standard, not a "nicer Russian" — Radoeva, same URL [verified]
5. Text faces that look like upright italics are most likely Bulgarian forms; for other Cyrillic languages "such letterforms will look strange" in long text — Alexandra Korolkova (Paratype), https://info.paratype.com/how-to-understand-cyrillic/ [verified]
6. Four things decide Cyrillic quality: letter design, letter widths, spacing, stroke-weight distribution — Korolkova, same URL [verified]
7. Mixed constructions in a regular text face (some letters "handwritten", some "printed") are either a bold statement or a clear sign of unprofessional work; in a display face they are fine if the Latin does the same — Korolkova, same URL [verified]
8. Unkerned holes are structural in Cyrillic: «где» opens a white hole between г and д; «кл» and «дл» touch at the bottom and gape at the top, and kerning barely helps — check these combinations in your actual headline words — Korolkova, same URL [verified]
9. Marker letters for judging a font: Л and Д must be related (both rectangular or both triangular; a hybrid is a defect); б must not look like the digit 6 (two bends in the tail, full-height bowl); ф is either one-bowl or two-bowl but consistent between cases — Skillbox Media, same URL as item 2 [verified]
10. Descender letters Д Ц Щ д ц щ are the most frequent technical failure: in Inter the shape, size and shoulder width of the descenders change unsystematically across weights — type.today review, https://type.today/ru/journal/neo [verified]
11. Diagonals in И У к are often drawn too heavy in Latin-first fonts, producing a faint reverse contrast — type.today on Inter and Roboto, same URL [verified]
12. The breve on Й is often too small for capitals because diacritics are not optimised for uppercase — matters directly for uppercase headlines — type.today on Inter, same URL [verified]
13. Kerning defects show in pairs with Ю, З, Я: «ЮЗ», «ЮЯ» flagged in Inter — type.today, same URL [verified]
14. Pairs to check by eye in every uppercase headline: ГА, ГД, ГЛ, ТА, ТЛ, ТД, УД, УЛ, УА, РА, РД, АТ, АУ, АЧ, ЬТ, ЪТ, ГО, ТО, КО, ХО, and anything next to Д/Л/Ж/Ф — open diagonals and overhangs create holes that auto-kerning in free fonts often misses [recalled]
15. Й and Ё raise the top of the line; Д Ц Щ and у р ф lower it — with display line-height below ~0.9 these collide across lines even though "Cyrillic has no extenders" [recalled]
16. Ж, Ш, Щ, Ю, Ы, М, Ф are wide; a headline full of them runs noticeably longer than its Latin placeholder — always fit display sizes with the real Russian text, never with lorem ipsum or English [recalled]
17. Russian words are longer on average than English and text expands roughly 15–30% in translation — a layout tuned on English copy breaks; long words also make ragged-right raggier and narrow columns ugly [recalled]
18. A font's uppercase Cyrillic is usually closer in quality to its Latin than the lowercase is — one practical reason uppercase display works well with imperfect free fonts [recalled]
19. Good Cyrillic usually comes from native designers or from foundries that consult them; "many fonts on the market have good Latin and visibly unfinished Cyrillic" — Bureau Gorbunov advice, https://bureau.ru/bb/soviet/20170909/ [verified]
20. Maria Doreuli (Contrast Foundry) warns against checklist thinking: many "signs of good/bad Cyrillic" are subjective; judge Cyrillic as part of one system with the Latin — https://type.today/ru/journal/doreuli [verified]
21. Test pangrams: «Съешь же ещё этих мягких французских булок да выпей чаю»; «Широкая электрификация южных губерний даст мощный толчок подъёму сельского хозяйства» — Skillbox Media, same URL as item 2 [verified]

## 2. Tracking (letter-spacing): observed values and working ranges

Measured from live CSS of Russian-language studio and foundry sites on 2026-10-06.

22. Red Collar (RU version): display 48–130 px set at letter-spacing −0.04em (numbers, menu, awards), small headings 18 px at −0.02em — https://redcollar.ru/ [verified]
23. ONY: h1/h2 at 50–90 units with −0.02em; a 60-unit title at −0.03em; small text +0.03em — https://ony.ru/ [verified]
24. Nimax: 80 px title −0.03em; 100 px counter −0.04em; 180 px numeral −0.06em — https://nimax.ru/ [verified]
25. AIC: 14vw and 98–104 px titles at −0.04em — https://aic.ru/ [verified]
26. Brownfox (Russian foundry): 95–132 px at −0.04em; 12 px body at −0.02em — https://brownfox.org/ [verified]
27. Bureau Gorbunov: 300 px / 100vw numerals at −0.04em; a 218 px uppercase Druk XCondensed pull-quote at −0.0028em (practically zero) — https://bureau.ru/ [verified]
28. type.today: 60 px article titles at −0.2 px (≈ −0.003em) — a foundry sets its own grotesque almost untracked — https://type.today/ru [verified]
29. For comparison, a Latin-only site (Vide Infra, Graphik) goes to −0.05…−0.08em on display — tighter than any Cyrillic site in the sample — https://videinfra.com/ [verified]
30. Working range for Cyrillic display 64–200 px, mixed case: −0.02…−0.04em; go to −0.05em only on very large numerals or very wide faces — Cyrillic's dense verticals close up faster than Latin, so stay about 0.01–0.02em looser than the Latin habit [derived]
31. Uppercase display in a condensed heavy face: 0…−0.01em; do not tighten — Bureau's Druk example and the general rule that caps need air [derived]
32. "Прописные буквы всегда разрежаются, строчные — никогда" (capitals are always letterspaced, lowercase never) — Lebedev, Kovodstvo § 142, https://www.artlebedev.ru/kovodstvo/sections/142/ [verified]
33. Read § 142 as a text-size rule: on giant display the modern practice above tightens lowercase and leaves caps near zero; the rule still holds fully for small uppercase labels [derived]
34. Uppercase labels, observed: type.today +0.06em at 10–15 px; Charmer +0.08em at 11.5 px mono; Nimax +0.05…+0.1em (or 1 px) at 10–16 px; artlebedev.ru 0.5–2 px at 9–10 px — URLs above and https://charmerstudio.com/, https://www.artlebedev.ru/ [verified]
35. Working range for uppercase labels 11–13 px: +0.06…+0.10em; mono labels at the top of the range; never below +0.04em [derived]
36. Body 16–20 px: 0 (font default). Inter is the known exception: its default spacing is loose, which is why designers habitually tighten it — Tilda Education, https://tilda.education/cyrillic-fonts [verified]
37. Giant headlines want less tracking because letters stop reading as one line and fall apart; capitals at normal sizes stand too tight and want more — Shriftovik, https://shriftovik.ru/tracking_looking_for_a_balance [verified]
38. Tracking and leading move together: more line-height wants slightly more tracking; letter gaps must never exceed line gaps — Shriftovik, same URL [verified]
39. Light text on dark: Shriftovik says white-on-dark letters feel thinner and tracking is usually increased a little — same URL [verified]. The common counter-view is that light text glows and looks bolder; with `-webkit-font-smoothing: antialiased` it does thin out. Practical setting: body +0.005…+0.01em and weight 400–450, decided by eye [recalled]
40. In letterspaced text, punctuation does not take part equally: gaps to commas, exclamation marks and around hyphens need manual correction — Kovodstvo § 143, https://www.artlebedev.ru/kovodstvo/sections/143/ [verified]
41. Cancel trailing letter-spacing on centred or right-aligned tracked labels (the last letter carries an extra gap): `margin-right: -0.08em` on the element or wrap text [recalled]
42. Do not letterspace lowercase Cyrillic for "elegance" — it breaks word shapes that are already weak (item 3) [recalled]

## 3. Line-height and measure

43. Body on screen: size 12–16 pt, line-height 1.2–1.4 of the size — Artem Gorbunov, https://bureau.ru/soviet/20140630/ [verified]
44. Line-height is a function of size, line length and format: more words per line → more leading; a narrow column of short lines looks ugly even at standard leading and may be reduced — same URL [verified]
45. No universal formula: switching Verdana to Bureausans at the same 15/20 forced both size (to 20) and leading (to 27) to change, because x-height and extender length differ — Mikhail Nozik, https://bureau.ru/soviet/20180509/ [verified]
46. Short extenders invite tight leading: PT Sans is "compact, and its short extenders provoke dense line spacing" — but light faces need air around and between lines — type.today, https://type.today/ru/journal/humanist [verified]
47. Inner-and-outer rule: margins around a text block must exceed its line gaps; heading sits closer to its own paragraph than to the previous one; heading-to-paragraph gap is not smaller than the heading's own line gap — Gorbunov, https://bureau.ru/soviet/20140818/ and https://bureau.ru/soviet/20140630/ [verified]
48. Observed display line-heights: Red Collar 0.9–1.0 at 64–130 px; ONY 1.0–1.25 at 50–90; Nimax 0.95–1.0 at 80–180 px; AIC 0.92 at 14vw, 96/104 px; Brownfox 105/132 and 95/95; Bureau 0.8 on giant numerals — URLs in section 2 [verified]
49. Observed body: Red Collar 18 px / 160% and 20 px / 160%; ONY 1.3 dominant, 1.36–1.4 on large lead text; Charmer 16 px / 1.25 (serif); type.today 60/65 and 70/75 on article titles — same URLs [verified]
50. Working values, Cyrillic, uppercase display: 0.88–0.95; check Й/Ё against Д/Ц/Щ of the line above [derived]
51. Working values, Cyrillic, mixed-case display 64–160 px: 0.95–1.05; two-line headlines with у/р/ф above Й/б/ё need the top of that range [derived]
52. Working values, lead paragraph 22–32 px: 1.25–1.35; body 17–20 px on dark: 1.5–1.6; labels 11–13 px uppercase: 1.3–1.4 (Charmer uses 1.39) [derived]
53. Traditional rule quoted by Gorbunov among the "endless piggy bank": the gap between lines of capitals should not be smaller than the cap height — modern display practice (item 48) breaks it on purpose; apply it to small all-caps blocks, not to hero type — https://bureau.ru/soviet/20140818/ [verified]
54. Measure for Russian body: 55–75 characters per line on desktop, 35–45 on phones; short landing paragraphs read best at 40–60 — long Russian words make very narrow columns ragged and very wide ones tiring [recalled]
55. Columns of many narrow lines are hard to read — reduce columns and cut text instead — Tilda Education, https://tilda.education/design-mistakes [verified]
56. Section rhythm: separate semantic blocks by 120–180 px and keep gaps equal — Tilda Education, same URL [verified]
57. Hierarchy needs real contrast: 22 px vs 24 px is no hierarchy; a 1.5–2× step reads — Tilda Education, https://tilda.education/courses/landing-page/design-landing-page/ [verified]
58. Very large type suits a short phrase; a long headline should be smaller — Tilda Education, https://tilda.education/design-mistakes [verified]
59. One typeface, one colour, two weights is enough for a page — same URL [verified]

## 4. Headlines: composition and case

60. The simplest headline is a large uniform line in lowercase with an initial capital and no full stop — Gorbunov, https://bureau.ru/soviet/20140616/ [verified]
61. A large headline does not need bold; bold is needed only for contrast with small text — same URL [verified]
62. In multi-line headlines avoid hanging prepositions/conjunctions and illogical breaks: «Жизнь и удивительные приключения / Робинзона Крузо», not three ragged lines — same URL [verified]
63. A headline is one syntactic unit; splitting it by styles (one word in caps, part in bold) "often gives away amateur layout"; acceptable on a poster or book title — same URL [verified]
64. Compound headlines are fine: tag (бирка), subheading, double headline, a graphic marker — they let the main line be shorter — same URL [verified]
65. No full stop at the end of a headline; a second line that is a full sentence takes one — Bureau, https://bureau.ru/bb/soviet/20110820/ [verified]
66. No Title Case in Russian: capitalise only the first word and proper nouns («Архитектура системы продаж», not «Архитектура Системы Продаж») [recalled]
67. All caps is a device, not a default: it hurts readability and makes text longer; use it deliberately, e.g. caps in a narrow geometric grotesque with minimal letterspacing for a brutal, bold tone — Mikhail Nozik, https://bureau.ru/soviet/20260311/ [verified]
68. All-caps text with widened uneven gaps and tight leading turns to mush at speed — Kovodstvo § 141, https://www.artlebedev.ru/kovodstvo/sections/141/ [verified]
69. Lowercase-only headings are a live pattern on premium RU sites: Red Collar case titles («цифра банк», «туктук»), Nimax («полезные материалы», `text-transform: lowercase`) — https://redcollar.ru/, https://nimax.ru/ [verified]
70. In centred setting, centre the line as if punctuation did not exist, then add it; an uncompensated ellipsis skews the line — Kovodstvo § 143 [verified]
71. Punctuation takes the weight/style of the word it touches (bold comma after bold word) — Kovodstvo § 143 [verified]
72. Use the `case` OpenType feature on uppercase lines so hyphens, dashes, guillemets and brackets rise to cap height — Charmer does exactly this on its uppercase mono labels (`"case" on`) — https://charmerstudio.com/ [verified]
73. Lebedev notes the hyphen is aligned to lowercase height and looks low among capitals — the reason item 72 matters — Kovodstvo § 97, https://www.artlebedev.ru/kovodstvo/sections/97/ [verified]

## 5. Russian micro-typography for the web

74. Quotes: «ёлочки» or „лапки“ — both correct; straight "programmer" quotes only in code — Kovodstvo § 62, https://www.artlebedev.ru/kovodstvo/sections/62/ [verified]
75. Use the quotes of the language of the text; quotes are paired left/right signs — Kovodstvo § 104, https://www.artlebedev.ru/kovodstvo/sections/104/ [verified]
76. Nested quotes: «внешние „внутренние“ внешние»; typograf can be set to keep «ёлочки» at both levels and remove doubled quotes — https://github.com/typograf/typograf (docs/api_rules.md) [verified for the typograf option; nesting convention recalled]
77. An English quotation inside Russian text lives by Russian rules: Russian quotes and the full stop after the closing quote; never mix traditions in one text — Kovodstvo § 143 [verified]
78. Four horizontal strokes, four jobs: hyphen (-) inside words; minus (−) in maths, aligned to figures; en dash (–) for numeric ranges; em dash (—) between parts of a sentence — Kovodstvo § 97 [verified]
79. Em dash is set with spaces on both sides: «Дважды два — четыре»; routes too: «Москва — Санкт-Петербург» — Kovodstvo § 97 [verified]
80. The space before the dash must be non-breaking so a line never starts with «—»: `слово&nbsp;— слово` [recalled; typograf applies it automatically]
81. Numeric ranges: en dash without spaces, «2000–2009»; in words — em dash with spaces, «двадцать — тридцать» — Kovodstvo § 158 and § 97, https://www.artlebedev.ru/kovodstvo/sections/158/ [verified]
82. Phone numbers keep hyphens and spaces: +7 812 212-85-06 — Kovodstvo § 158 [verified]
83. Short prepositions and conjunctions bind to the next word with a non-breaking space; particles bind to the previous word — Kovodstvo § 62 [verified]
84. typograf rules covering this: `common/nbsp/afterShortWord` (length configurable, e.g. 3), `common/nbsp/beforeShortLastWord` (last word up to N chars), `ru/nbsp/beforeParticle` (ли, ль, же, бы, б) — https://github.com/typograf/typograf/blob/dev/docs/RULES.ru.md [verified]
85. Number + word, number + unit, day + month, «2012 г.», «тыс./млн/млрд», «руб./коп.», initials + surname, «т. д.», «г./ул./обл.», «стр./рис.», «ООО» + name — each has its own typograf nbsp rule (`common/nbsp/afterNumber`, `ru/nbsp/dayMonth`, `ru/nbsp/year`, `ru/nbsp/mln`, `ru/nbsp/rubleKopek`, `ru/nbsp/initials`, `ru/nbsp/abbr`, `ru/nbsp/addr`, `ru/nbsp/page`, `ru/nbsp/ooo`) — same URL [verified]
86. № takes a narrow non-breaking space before the number; «№№» → «№»; § likewise — typograf `ru/nbsp/afterNumberSign`, `ru/symbols/NN`, `common/nbsp/afterSectionMark` — same URL [verified]
87. Percent sits tight to the number: typograf removes the space before %, ‰ — `common/space/delBeforePercent` — same URL [verified]. Note: Russian editorial guides differ here (GOST-style sets a space); pick one and keep it site-wide [recalled]
88. Currency symbol goes after the number with a space: «100 $», «250 000 ₽»; typograf `ru/money/currency`, and `ru/money/ruble` turns «руб.» into ₽ (off by default) — same URL [verified]
89. Thousands are grouped: typograf `common/number/digitGrouping`; decimal comma, not point: `ru/number/comma` — same URL [verified]. Use a thin non-breaking space (U+202F) or nbsp between groups: «250 000» [recalled]
90. Use ready-made symbols (§ © ® ™ ° ± № ×), never emulations like (c) or x — Kovodstvo § 62; typograf converts (c)→©, x→× in «10×5», +-→± [verified]
91. Ellipsis: Lebedev wants three separate dots (...) in "noble" setting, not the single glyph (…) — Kovodstvo § 164, https://www.artlebedev.ru/kovodstvo/sections/164/ [verified]. typograf by default does the opposite (`common/punctuation/hellip` replaces three dots with …) — same RULES URL [verified]. Decide once; for display sizes three dots usually look better because the single glyph is spaced for text [recalled]
92. «?..» and «!..» (not «?…»); «!!» → «!»; «!?» → «?!» — typograf `ru/punctuation/hellipQuestion`, `exclamation`, `exclamationQuestion` [verified]
93. Letter ё, school 1 (Lebedev): use only where misreading is possible, in dictionaries, for learners, rare names; elsewhere it "only makes reading harder" — Kovodstvo § 119, https://www.artlebedev.ru/kovodstvo/sections/119/ [verified]
94. Letter ё, school 2 (Bureau Gorbunov): their own texts set ё everywhere («вёрстка», «ещё», «Артём») — visible on every fetched bureau.ru page [verified as observed practice]. For a premium site consistency is the rule: all ё or none; `eyo` restores ё automatically — https://github.com/hcodes/eyo [verified that the tool exists, linked from typograf README]
95. «вы» in lowercase in mass copy; capital «Вы» is "advertising-servile" and reads as foolishness, not respect — Kovodstvo § 165, https://www.artlebedev.ru/kovodstvo/sections/165/; Bureau agrees: «вы» for mass texts, «Вы» only for deliberately formal personal letters — https://bureau.ru/soviet/20250406/ [verified]
96. Hanging punctuation is a mark of professional work: opening quotes, brackets and bullets hang left; on a justified right edge quotes, brackets, full stops, commas hang right; hyphens hang by a third to a half; the direct-speech dash does not hang — Kovodstvo § 120, https://www.artlebedev.ru/kovodstvo/sections/120/ [verified]
97. In headlines and large blocks hanging punctuation is expected — same URL [verified]
98. Put a link before the quote marks, not around them: underlined quotes look ugly — Kovodstvo § 143; typograf `common/punctuation/quoteLink` moves quotes outside links [verified]
99. Ordinals: «25-й», not «25-ый» — typograf `ru/number/ordinals` [verified]
100. Dates: «2 мая, понедельник» in lowercase; ISO dates become DD.MM.YYYY — typograf `ru/date/weekday`, `ru/date/fromISO` [verified]
101. Hyphenation: none in headlines, labels and buttons; in body only on narrow screens; never break after one letter, never leave two letters, never split abbreviations or surnames from initials [recalled]
102. No widows: the last line of a paragraph should not be one short word; `beforeShortLastWord` in typograf plus `text-wrap: pretty` cover most cases [verified for both mechanisms; rule recalled]
103. Do not justify text on the web; left-aligned ragged text needs air on the right — Gorbunov, https://bureau.ru/soviet/20140630/ [verified for the air-on-the-right point; no-justify recalled]
104. Paragraphs on screen are separated by vertical gaps of half a line or less, not by a full blank line — Gorbunov, same URL [verified]
105. Abbreviations with spaces: «т. д.», «т. е.», «и т. п.», «P. S.» with non-breaking spaces inside — typograf `ru/nbsp/abbr`, `ru/nbsp/ps` [verified]

## 6. Tools and CSS

106. typograf (Denis Seleznev), MIT: `npm install typograf`; `new Typograf({locale: ['ru', 'en-US']}).execute(text)`; works in Node and browser, on HTML — https://github.com/typograf/typograf/blob/dev/docs/using.md [verified]
107. Rules are toggled with `tp.enableRule('ru/money/ruble')`, `tp.disableRule(...)`, wildcards allowed; settings via `tp.setSetting('common/nbsp/afterShortWord', 'lengthShortWord', 3)` — docs/api_rules.md [verified]
108. Output as characters by default; `htmlEntity: {type: 'name', onlyInvisible: true}` keeps visible characters but writes invisible ones as `&nbsp;`, `&thinsp;`, `&shy;` — best for hand-edited HTML because nbsp stay visible in source — docs/api_entities.md [verified]
109. typograf does not replace existing nbsp unless `common/nbsp/replaceNbsp` is enabled — safe to re-run on already processed copy — docs/api_nbsp.md [verified]
110. Hanging punctuation in typograf is off by default: enable `ru/optalign/*` and include `dist/typograf.css` — docs/api_optalign.md [verified]
111. Ecosystem: CLI, Gulp/Grunt, Figma plugin, VS Code extension, Remark, markdown-it — README [verified]. Run it at build time on the copy, not at runtime in the browser [recalled]
112. Lebedev Studio's «Типограф» is the reference online tool ("automatically and correctly sets all quotes, dashes and non-breaking spaces") — linked from every Kovodstvo paragraph, e.g. https://www.artlebedev.ru/kovodstvo/sections/158/ [verified that it is referenced; tool page not opened]
113. `lang="ru"` on `<html>` is mandatory: hyphenation rules are language-specific and browsers hyphenate only when `lang` is present and a dictionary exists — MDN, https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens [verified]
114. `lang="ru"` also governs OpenType `locl`: with correct language tagging Bulgarian/Serbian localized forms switch on only for those languages — Radoeva: "specify the language of the text … to automatically turn on the localised forms" — URL in item 1 [verified]. Practical consequence: never leave Russian text inside `lang="bg"`/`"sr"`, and if a font ships Bulgarian forms as its default, look for a stylistic set or `locl` switch back to international forms [recalled]
115. `text-wrap: balance` for headings: evens line lengths, supported only for short blocks (6 lines or fewer in Chromium, 10 or fewer in Firefox) — MDN, https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-style [verified]
116. `text-wrap: pretty` for paragraphs: slower algorithm that minimises orphans; has a performance cost, use on body copy only — same URL [verified]
117. `text-wrap: balance` does not know Russian prepositions — it can still leave «в», «и», «для» at a line end; nbsp from typograf must be in the text first [derived]
118. `hanging-punctuation` is not Baseline (does not work in some major browsers); `first` hangs an opening quote/bracket on the first line, `last` a closing one on the last line — MDN, https://developer.mozilla.org/en-US/docs/Web/CSS/hanging-punctuation [verified]. In practice Safari-only: add a manual fallback (negative `text-indent` or margin on a headline that starts with «) [recalled]
119. `&shy;` marks a manual break point and overrides automatic hyphenation — MDN hyphens page [verified]. Use it inside very long words in display headlines on mobile («автомати&shy;зация») [recalled]
120. `font-feature-settings`/`font-variant-*` worth setting for Russian: `"kern"`, `"case"` on uppercase lines, `tnum lnum` on prices and stats (Contrast Foundry sets `"tnum","lnum"` on totals; Vide Infra forces `"kern" 1`) — https://contrastfoundry.com/, https://videinfra.com/ [verified as observed]
121. `font-synthesis: none` — free Cyrillic families often lack italics or extreme weights; this stops the browser from faking them [recalled]
122. Subsetting: keep the `cyrillic` subset plus the glyphs Russian copy needs outside it — « » „ “ — – − № ₽ × … and nbsp/thin space; check that № and ₽ exist in the chosen font and are not falling back to a system font [recalled]
123. Zero-width joiner / nbsp inside headlines is used by ONY to control breaks in its H1 («…и&nbsp;цифровые решения для&nbsp;компаний, готовых к&nbsp;изменениям.») — https://ony.ru/ [verified]
124. Sites in the sample differ a lot in care: type.today's page carries thousands of nbsp, Charmer 54 nbsp and 80 em dashes, Suprematika 0 nbsp — nbsp density is a visible quality marker — fetched HTML of each site [verified]

## 7. Fonts: quality of Cyrillic, licence, "default" vs premium

Google Fonts availability and axes below are from the Google Fonts metadata JSON (https://fonts.google.com/metadata/fonts) fetched today [verified]. Quality verdicts are from type.today's series «Кириллица в Google Fonts» by Mikhail Strukov, Yury Ostromentsky, Ilya Ruderman (written 2020, updated four years later): https://type.today/ru/journal/neo, https://type.today/ru/journal/geo, https://type.today/ru/journal/humanist, https://type.today/ru/journal/display [verified]. Licences: all listed Google Fonts families are distributed under open licences (mostly SIL OFL) and may be self-hosted [recalled — confirm on each family's page before shipping].

Reviewed by type.today:

125. Inter — Cyrillic "did not get enough attention to detail to reach an acceptable level, it should not be used"; the 2023 update did not fix it. Problems: heavy diagonals in И У к, broken б, unsystematic Д Ц Щ descenders, small breve on Й, ЮЗ/ЮЯ kerning [verified]
126. Inter Tight — same drawing as Inter, only tighter spacing, made for display and for Google Docs; inherits every Cyrillic problem [verified]
127. Manrope — "unconvincing concept and weak execution — a bad choice for any task" [verified]
128. Roboto — Cyrillic "of little use"; if forced, use mid weights; advice is to choose something else [verified]
129. Open Sans — avoid the Cyrillic, especially lightest and boldest [verified]
130. IBM Plex Sans — "high-quality typeface, suitable for a wide range of uses" (Cyrillic by Alexandra Samulenkova); IBM Plex Mono is the monospaced sibling with Cyrillic. GF: wdth 75–100, wght 100–700 [verified]
131. Golos Text (Korolkova, Kuzmin; Paratype) — "practical, screen-optimised, with quality Cyrillic"; only caveat is Serbian ћ ђ. GF: wght 400–900, six weights to Black [verified]
132. Commissioner — "clear concept, quality execution… the Cyrillic is decent, it can be used"; the Flair axis adds entasis and suits large sizes. GF axes: FLAR, VOLM, slnt, wght 100–900 [verified]
133. PT Sans — good for long text, compact, light colour; give it air [verified]
134. Montserrat — Cyrillic "of acceptable level", suited to headlines and display; little kerning [verified]
135. Raleway — use carefully, avoid Thin; default old-style figures [verified]
136. Rubik — prefer any good DIN instead; Rubik Mono One only for display [verified]
137. Jost — "poor-quality Cyrillic, no reason to use this font" [verified]
138. Oswald, Alumni Sans, Overpass, Fira Sans, Source Sans 3, Nunito, Exo 2, Dela Gothic One, Kelly Slab — Cyrillic not recommended [verified]
139. Arsenal — "genuinely high-quality Cyrillic", better in headlines and large sizes; Yanone Kaffeesatz — quality display face; Oi and Kablammo — quality Cyrillic among display fonts [verified]
140. Noto Sans — Cyrillic was redrawn in 2024 by Jovana Jocić with Strukov consulting; type.today declines to rate it for conflict of interest. GF: wdth 62.5–100, wght 100–900 [verified]
141. Tektur — quality typeface, Cyrillic imperfect, use with care [verified]

Not reviewed by type.today (facts from Google Fonts metadata; quality not independently confirmed in this wave):

142. Geist and Geist Mono — yes, both have a Cyrillic subset on Google Fonts (added 2024-10), wght 100–900; release 1.7.0 "introduces a redesigned Cyrillic script for all Geist and Geist Mono styles" — metadata JSON and https://github.com/vercel/geist-font/releases [verified]. Whether the Google Fonts copy already contains the redesign: not checked
143. Onest — Cyrillic, wght 100–900; used by Ozon, GeekBrains and others — https://tilda.education/cyrillic-fonts [verified]. Consequence: it is becoming the mass-market default look [derived]
144. Geologica (Monokrom) — Cyrillic; axes CRSV, SHRP, slnt, wght 100–900; Tilda's expert files it under "empathetic" (funds, schools) — same Tilda URL [verified]
145. Unbounded — Cyrillic, wght 200–900; Tilda's expert: "I see it often lately… used both for its purpose and simply because it is fashionable" — same URL [verified]. Read: recognisable trend face, dates quickly [derived]
146. TikTok Sans — Cyrillic; credited to Grilli Type, Contrast Foundry, Type Network; axes opsz 12–36, slnt, wdth 75–150, wght 300–900 — metadata JSON [verified]. A width axis up to 150 with Black weight and a Russian-led foundry in the credits makes it the strongest free candidate for wide heavy display; quality needs an eyeball test on Д Л Ж Ф б [derived]
147. Roboto Flex — Cyrillic; opsz 8–144, wdth 25–151, wght 100–1000 plus parametric axes — metadata JSON [verified]. Widest design space of any free Cyrillic sans, but descends from Roboto, whose Cyrillic type.today criticises; test before use [derived]
148. Martian Mono (Roman Shamin, Evil Martians) — Cyrillic; wdth 75–112.5, wght 100–800 — metadata JSON [verified]
149. JetBrains Mono (Philipp Nurullin, Konstantin Bulenkov) — Cyrillic; wght 100–800 — metadata JSON [verified]
150. Wix Madefor Display / Text (Dalton Maag) — Cyrillic; wght 400–800 only — metadata JSON [verified]
151. Mulish — Cyrillic, wght 200–1000; Sofia Sans + Condensed + Extra Condensed (Lettersoup) — Cyrillic, wght 1–1000; Science Gothic — Cyrillic, wdth 50–200, wght 100–900 — metadata JSON [verified]. Sofia Sans Extra Condensed is the nearest free stand-in for a Druk-like condensed headline; made by a Bulgarian studio, so confirm which forms are default under `lang="ru"` [recalled]
152. No Cyrillic at all on Google Fonts (do not plan around them): Bebas Neue, Anton, Archivo, Space Grotesk, Space Mono, DM Sans, DM Mono, Plus Jakarta Sans, Sora, Outfit, Syne, Bricolage Grotesque, Instrument Sans, Figtree, Hanken Grotesk, Mona Sans, Red Hat Display — metadata JSON [verified]
153. Not on Google Fonts: Golos UI, PT Root UI, Involve, Tilda Sans — metadata JSON [verified]. Tilda Sans is described by Tilda as a variable family with an open licence — https://tilda.education/cyrillic-fonts [verified]. PT Root UI and Golos UI are free Paratype families, Involve is a free variable grotesque — licences not confirmed today (paratype.ru and the Involve repository were unreachable) [recalled]
154. Commercial, seen in use: Druk XCondensed (Bureau), Graphik LC (type.today, Vide Infra), Suisse Intl (AIC), TT Interphases Pro + Navigo (Nimax), TT Commons + custom TT RedCollar (Red Collar), Formular (Brownfox), William + Even Mono (Charmer), William Text + custom ONY One (ONY), CoFo Sans / CoFo Robert (Contrast Foundry) — fetched CSS of each site [verified]
155. TypeType trial licence: "for evaluation purposes only and is not intended for commercial use" — fine for mockups, not for the live site — https://typetype.org/licensing/ [verified]
156. Stolzl, Gramatika, Factor A, Halvar, Kazimir, Druk Cyr — commercial families (Kazimir and Druk via type.today/CSTM, Halvar via TypeType); not examined in this wave [recalled]

Overused vs premium:

157. What Russian designers call default: Roboto ("the base font many designers use by default"), Inter ("lately even more popular than Roboto among interface designers"), Open Sans; "frequently used fonts (Inter, Roboto, Arial)" are named as the thing to get away from — Tilda Education, https://tilda.education/cyrillic-fonts [verified]. Montserrat is called "fashionable and expressive" by Yandex Practicum's blog — https://practicum.yandex.ru/blog/podborka-kirillicheskih-shriftov-dlya-dizayna/ [verified] — in practice it is the template-landing font of the Russian web [recalled]
158. None of the ten premium studio/foundry sites checked uses Montserrat, Roboto, Manrope or Unbounded; every one runs a commercial or custom family. Exceptions with Inter: Suprematika (Inter Display + Vollkorn) and Shuka (Inter beside a custom Gertrude) — fetched CSS [verified]
159. Width and weight carry meaning: narrow reads careful and crafted; wide and bold reads loud and confident — Tilda Education, same URL [verified]
160. "Premium" in the Tilda guide is signalled by a refined serif in headlines (Playfair Display Italic) paired with a neutral sans — same URL [verified]. On Russian sites this exact pairing is now a cliché of beauty/infobiz landings [recalled]
161. Pairing pattern across the sample: one grotesque family for everything, plus either a mono for labels (Charmer, Brownfox, Contrast Foundry) or a serif for long text (type.today: Graphik + Spectral; ONY: custom sans + William Text; artlebedev.ru: Artemius Sans + Serif) [verified]

## 8. How Russian-language studios set large headlines (10 reference sites)

Source for every line: HTML/CSS fetched 2026-10-06. Viewport ratios are computed against a 1440 px design width [derived].

162. Red Collar — https://redcollar.ru/ — custom TT RedCollar (TypeType; references were TT Travels and Monument Extended, per https://typetype.org/blog/corporate-font-for-the-red-collar/) for display, TT Commons for text. H1 90–130 px (≈ 6–9vw), line-height 0.9–1.0, −0.04em, weight 400 — size, not boldness, does the work. Body 18–20 px / 160%, weight 500. H1 carries hand-set nbsp: «Дизайн и&nbsp;разработка AI&nbsp;native-продуктов». Case titles in lowercase. No outline text [verified]
163. ONY — https://ony.ru/ — custom ONY One + William Text Pro. H1/H2 50–90 units at 1.17–1.25, −0.02em; lead text set huge (35–55 units) at 1.29–1.4 — the "body as display" look. H1 is a full sentence with a full stop. Positive tracking +0.03em on small text [verified]
164. Charmer — https://charmerstudio.com/ — serif William Subhead for everything (16 px / 1.25, discretionary ligatures on), accent 40 px / 1.1 / −0.02em; labels in Even Mono 11.5 px uppercase, +0.08em, line-height 1.39, `"case"` on. Proof that premium does not require giant type; em dashes and «ёлочки» throughout [verified]
165. Nimax — https://nimax.ru/ — TT Interphases Pro + Navigo. Titles 80–140 px, numerals to 200 px at −0.04…−0.06em, weights 300–500; lowercase headings; 51 uppercase rules for labels at 10–16 px, +0.05…+0.1em [verified]
166. AIC — https://aic.ru/ — Suisse Intl. Fluid 14vw and 11vw display, line-height 0.92, −0.04em; fixed steps 132/120, 104/96, 80/76 px (line-height ≈ 0.91–0.95) [verified]
167. Bureau Gorbunov — https://bureau.ru/ — own Bureausans/Bureauserif; giant factoid numerals 177–400 px, 100vw numbers at line-height 0.8, −0.04em; Druk XCondensed uppercase 218 px / 171 px for student quotes. 294 nbsp on the home page [verified]
168. type.today — https://type.today/ru — Graphik LC + Spectral; specimens at 80–130 px, line-height 1.15–1.2; article titles 60/65, 70/75 px almost untracked; uppercase UI labels 10–15 px at +0.06em [verified]
169. Brownfox — https://brownfox.org/ — Formular + Formular Mono; 132/105 and 95/95 px at −0.04em; body just 12/15 px at −0.02em — big/small contrast instead of mid sizes [verified]
170. Art. Lebedev Studio — https://www.artlebedev.ru/ — own ALS families (Artemius Sans/Serif, Hauss, Hauss Black Expanded); H1 50–60 px, one 150 px counter; restrained scale, serif headings at 48 px / 1.3 [verified]
171. Suprematika — https://suprematika.ru/ — Inter Display medium, H1 90–100 px at line-height 130%, H2 72 px / 130% — loose leading on big Cyrillic, 0 nbsp in HTML; useful as the contrast case: same sizes as the others, visibly less tight and less cared for [verified]

Supporting, Latin-only: Vide Infra https://videinfra.com/ (Graphik, display via rem scale ×14–18, −0.04…−0.08em); Embacy https://embacy.io/ (H1 8.2–10.7vw, line-height 80–95%, −0.05em); Zajno https://zajno.com/ (display 12–16vw, line-height ≈ font-size); Obys https://obys.agency/ (custom "Obys" font; site is script-rendered, nothing more readable) [verified]

Patterns across the sample:

172. Hero display on desktop sits at ≈ 6–10vw for multi-word Russian headlines and 12–16vw for one or two words or numerals [derived from items 162–171]
173. Weight is regular or medium (400–500) far more often than black; the "heavy" impression comes from size and tight leading. Heavy weights appear in condensed uppercase (Druk) [verified in CSS: RC 400, Nimax 300–500, Suprematika medium]
174. Outline (stroked) text: no `-webkit-text-stroke` rules on Red Collar, ONY, Charmer, Nimax, AIC, Bureau, type.today, Brownfox, Suprematika, Vide Infra, Embacy; one rule on artlebedev.ru. Outline type is not part of the current premium RU vocabulary [verified]
175. `mix-blend-mode` appears on ONY, Bureau, artlebedev.ru, Vide Infra, Embacy — the usual way to keep type legible over moving media instead of outlines [verified that the rules exist; purpose inferred]
176. Latin + Cyrillic mixing: Russian headlines, Latin brand and product names inline (Red Collar: «AI native-продуктов», «fmec group»); labels are Russian uppercase or mono, not decorative English. English-only labels over Russian headlines are not what these sites do [verified for the cited examples; generalisation derived]
177. Type over 3D, the one documented case: Red Collar's "Endless Letter" keeps type minimal — white year markers as anchors over a Three.js scene, with a side timeline — Awwwards case study, https://www.awwwards.com/case-study-red-collars-endless-letter-website.html [verified]. The case study names no fonts or sizes
178. Text over imagery must not merge with it: darken the image with a filter of a colour contrasting the text; detail scale in the image must not match letter scale — Tilda Education, https://tilda.education/design-mistakes and https://tilda.education/courses/landing-page/design-landing-page/ [verified]
179. For 3D backgrounds the same logic gives: keep the densest, brightest part of the scene away from the headline box, or dim the scene behind text to a flat value; one-word giant type tolerates busy backgrounds, sentences do not [derived]

## 9. Tone of copy: expensive vs infobiz

180. Stop-words glue a phrase without informing: the modal «можно» says nothing; removing it exposes the questions the text never answered — rewrite with concrete scenarios — Maxim Ilyakhov, «Информационный стиль», https://bureau.ru/books/text/12 [verified]
181. Evaluations sit at the abstract end of a scale: move from the producer's evaluations → the reader's evaluations → facts → usage scenarios → photo → video → letting the reader try — each step away from abstraction persuades more than text — Ilyakhov, https://bureau.ru/books/text/18 [verified]
182. Facts make text "more objective, more respectful and more interesting" — same URL [verified]
183. Bureaucratic word-combinations («транспортное средство» for «машина») are a sign of bureaucratic thinking; the message must fit the conditions in which it is received — Kovodstvo § 141 [verified]
184. Do not address the reader by role («Водитель!») when there is no one else to talk to — Kovodstvo § 141 [verified]
185. Capital «Вы», «Все для Вас», «…потому что Вы можете себе это позволить» read as servility — Kovodstvo § 165 [verified]
186. A headline is not a formal summary; it attracts, orients ("where am I?") and organises the page — Gorbunov, https://bureau.ru/soviet/20140616/ [verified]
187. What reads expensive: short declarative sentences; numbers with units and dates; names of real tools and deliverables; one idea per screen; price stated plainly; no exclamation marks; lowercase «вы» [recalled, consistent with items 180–185]
188. What reads infobiz: intensifiers («уникальный», «эффективный», «под ключ», «без воды»), promises of transformation, stacked rhetorical questions, capitalised «Вы», triple exclamation marks, emoji bullets, countdown urgency, pain-first openings, Title Case headings [recalled]
189. Typographic tells of cheap copy: straight quotes, hyphen instead of dash, prepositions at line ends, «…» everywhere, caps for emphasis, bold scattered inside sentences — most are fixed mechanically by items 74–105 [recalled]

---

## A. Ranked shortlist: 5 font systems, free, with Cyrillic

All families are on Google Fonts with a `cyrillic` subset (metadata JSON, verified today) and can be self-hosted. Ranking criterion: independently reviewed Cyrillic quality first, display power second, freshness third.

**1. Golos Text 800–900 (display) + Golos Text 400–500 (text) + IBM Plex Mono (labels)**
Why: the only free neutral grotesque with a Black weight whose Cyrillic type.today calls quality; drawn by Paratype for screen reading; one family keeps the page calm so size and spacing do the talking. IBM Plex Mono is the mono of a family rated "high quality". Risk: closed, neutral character and association with Russian service websites — needs confident scale (−0.03em, line-height 0.95) to read as a choice.

**2. IBM Plex Sans 600–700 / Condensed (display) + IBM Plex Sans 400 (text) + IBM Plex Mono (labels)**
Why: best-reviewed Cyrillic of the free neo-grotesques, a true superfamily with a width axis (75–100) and a matching mono — engineered, systemic voice. Risk: tops out at 700, so "heavy" must come from size or the condensed width; recognisable IBM flavour.

**3. TikTok Sans wdth 125–150, wght 800–900 (display) + Golos Text or Noto Sans (text) + Martian Mono (labels)**
Why: highest ceiling for a wide, heavy, contemporary headline; width, weight and optical-size axes; Contrast Foundry in the credits; hardly used on Russian sites yet. Risk: Cyrillic quality not confirmed by an independent review in this wave — test Д Л Ж Ф Й б and the pairs from item 14 before committing.

**4. Commissioner wght 700–900 with FLAR 30–100 (display) + Commissioner 400 (text) + JetBrains Mono (labels)**
Why: type.today rates the Cyrillic usable and recommends the Flair axis for large sizes; humanist skeleton gives a more editorial, less "tech" page. Risk: softer and warmer than a classic heavy grotesque.

**5. Unbounded 600–900, short uppercase lines only (display) + Onest 400–500 (text) + Martian Mono (labels)**
Why: the wide display look that matches the awwwards reference style out of the box. Risk: both families are fashionable and widely used in Runet (Unbounded "because it is trendy", Onest on Ozon and GeekBrains), neither reviewed by type.today — the least durable of the five.

Do not use for this site: Inter / Inter Tight and Manrope (Cyrillic explicitly not recommended by type.today), Montserrat (template look), Roboto, Open Sans, Jost, Rubik, Oswald, Raleway Thin.

Paid step up if the budget allows: Graphik LC, Suisse Intl, TT Interphases Pro, Formular, CoFo Sans for text/display; Druk Cyr for condensed uppercase — each seen on the reference sites (item 154).

## B. Ready-to-use CSS for Russian typography on a dark landing page

```html
<html lang="ru">
```

```css
/* Font system 1 from the shortlist. Swap the three variables to change system. */
:root {
  --font-display: "Golos Text", "Helvetica Neue", Arial, sans-serif;
  --font-text:    "Golos Text", "Helvetica Neue", Arial, sans-serif;
  --font-mono:    "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;

  --bg:   #0b0b0c;
  --ink:  #f2f0eb;          /* off-white, not #fff: less glare on dark */
  --mute: #9a978f;

  --measure: 62ch;          /* Russian body: 55–75 characters */
}

html {
  font-size: 100%;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-text);
  font-size: clamp(1.0625rem, 0.98rem + 0.3vw, 1.25rem);   /* 17–20 px */
  font-weight: 400;
  line-height: 1.55;
  letter-spacing: 0.005em;              /* light-on-dark: a touch of air */
  font-kerning: normal;
  font-synthesis: none;                 /* no faux bold / faux italic */
  font-variant-ligatures: common-ligatures contextual;
  font-optical-sizing: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  hyphens: manual;                      /* only &shy; breaks; see mobile rule */
  overflow-wrap: break-word;
}

p, li {
  max-width: var(--measure);
  text-wrap: pretty;                    /* fewer widows; body copy only */
  hanging-punctuation: first allow-end; /* Safari only; harmless elsewhere */
}
p + p { margin-top: 0.6em; }            /* half a line, not a blank line */

/* Display headline, mixed case */
h1, .display {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(2.75rem, 8.2vw, 9rem);
  line-height: 1.0;                     /* 0.95–1.05 for Cyrillic mixed case */
  letter-spacing: -0.03em;              /* Cyrillic: stay within -0.02…-0.04em */
  text-wrap: balance;
  hyphens: none;
  margin: 0;
}

/* Display headline, uppercase */
.display--caps {
  text-transform: uppercase;
  line-height: 0.92;                    /* check Й/Ё against Д/Ц/Щ above */
  letter-spacing: -0.01em;              /* caps: do not tighten further */
  font-feature-settings: "kern" 1, "case" 1;   /* raise « » — - ( ) to cap height */
}

h2 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2rem, 4.6vw, 4.5rem);
  line-height: 1.05;
  letter-spacing: -0.025em;
  text-wrap: balance;
  hyphens: none;
  margin: 0;
}

.lead {
  font-size: clamp(1.375rem, 1.1rem + 1vw, 2rem);   /* 22–32 px */
  line-height: 1.3;
  letter-spacing: -0.01em;
  max-width: 34ch;
  text-wrap: balance;
}

/* Small tracked uppercase label */
.label {
  font-family: var(--font-mono);
  font-size: 0.75rem;                   /* 12 px */
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0.08em;               /* 0.06–0.10em */
  text-transform: uppercase;
  font-feature-settings: "kern" 1, "case" 1;
  color: var(--mute);
  hyphens: none;
  white-space: nowrap;
}
.label--center { margin-right: -0.08em; }   /* cancel trailing tracking */

/* Prices, stats, dates */
.num, .price, time {
  font-variant-numeric: lining-nums tabular-nums;
  white-space: nowrap;
}

/* Headline that starts with «: hang it by hand where hanging-punctuation is missing */
.hang-quote { text-indent: -0.52em; }
@supports (hanging-punctuation: first) {
  .hang-quote { text-indent: 0; hanging-punctuation: first; }
}

/* Never break inside these */
.nobr, abbr, .phone { white-space: nowrap; }

/* Narrow screens: allow dictionary hyphenation in body only */
@media (max-width: 480px) {
  p, li {
    hyphens: auto;
    hyphenate-limit-chars: 7 3 3;       /* word ≥ 7, min 3 before and after */
    -webkit-hyphenate-limit-before: 3;
    -webkit-hyphenate-limit-after: 3;
  }
  h1, .display { letter-spacing: -0.02em; line-height: 1.02; }
}
```

Build step for the copy (run once on the texts, not in the browser):

```js
import Typograf from 'typograf';

const tp = new Typograf({
  locale: ['ru', 'en-US'],
  htmlEntity: { type: 'name', onlyInvisible: true }   // &nbsp; stays visible in source
});
tp.setSetting('common/nbsp/afterShortWord', 'lengthShortWord', 3);
tp.setSetting('common/nbsp/beforeShortLastWord', 'lengthLastWord', 5);
tp.enableRule('common/nbsp/afterNumber');
tp.enableRule('common/number/digitGrouping');
// tp.enableRule('ru/money/ruble');      // «руб.» → ₽, if the font has ₽
// tp.enableRule('ru/optalign/*');       // hanging punctuation, needs typograf.css
// tp.disableRule('common/punctuation/hellip');  // keep three dots (Kovodstvo § 164)

export const ru = (html) => tp.execute(html);
```

Notes on the block: `hanging-punctuation` is not Baseline (MDN, verified); `text-wrap: balance` is limited to short blocks (MDN, verified); `hyphenate-limit-chars` support and the exact trailing-tracking and hang offsets are from memory — check in the target browsers and adjust the `-0.52em` to the width of « in the chosen font.

## C. 25-point proofreading checklist for Russian web copy

1. `<html lang="ru">` is set; no Russian text sits inside another `lang`.
2. Quotes are «ёлочки»; nested are „лапки“; no straight `"` anywhere in visible text.
3. Every dash between words is `—` with a non-breaking space before and a normal space after.
4. Hyphen only inside words («из-за», «кто-то», «бизнес-система»); no hyphen used as a dash.
5. Numeric ranges use `–` without spaces («2019–2026», «10–15 клиентов»); minus is `−`.
6. No line ends with a one- to three-letter preposition or conjunction (в, к, с, у, о, и, а, но, на, по, за, из, от, до, для, без, под, при).
7. Particles are tied to the previous word: «бы», «же», «ли», «ль», «б».
8. Number and unit never split: «250 000 ₽», «12 недель», «3 часа», «2026 г.».
9. Thousands are grouped with a non-breaking (thin) space; decimals use a comma.
10. ₽, № and % render in the site font, not in a fallback; № has a narrow nbsp after it; % spacing is the same everywhere.
11. Initials and surname, and «т. д.», «т. е.», «и т. п.» are tied with nbsp.
12. No full stop at the end of headlines, labels, buttons, list items of one phrase; full sentences in sub-lines keep it.
13. Headlines are sentence case: capital only on the first word and proper nouns.
14. Each multi-line headline breaks by meaning; no single word alone on the last line; no preposition at a line end.
15. No hyphenated words in headlines, labels, buttons, navigation.
16. Paragraphs have no widow (one short word on the last line).
17. Letter ё: one policy across the whole site (all or none); names and ambiguous words always carry it.
18. «вы», «ваш» in lowercase throughout.
19. Ellipsis: one form site-wide; «?..» and «!..»; no «!!!», no «?!?!».
20. Uppercase lines: letter-spacing is positive on small labels and near zero on display; `case` feature on; Й breve and Д/Ц/Щ tails do not touch neighbouring lines.
21. Every uppercase and display headline is checked by eye for holes: ГА, ГД, ТА, УД, РА, АТ, ЬТ and anything beside Д, Л, Ж, Ф; fixed with a per-pair span if needed.
22. Latin fragments inside Russian text (brand names, AI, CRM) sit in the same font and weight; quotes and punctuation around them are Russian.
23. Links stand before or inside quotes consistently; punctuation after a link is outside the link.
24. Symbols are real: × not x, © not (c), ° not o, → not ->; phone numbers as +7 000 000-00-00 and unbreakable.
25. Copy pass: no evaluative fillers («уникальный», «эффективный», «качественный», «под ключ»), no «можно/нужно» glue, no exclamation marks; every claim has a number, a name or a scenario.

## D. Unreachable or not covered sources

- fonts.google.com/knowledge (Cyrillic glossary and articles) — page is script-rendered; only the meta description was readable. No Google Fonts Knowledge content is used.
- paratype.ru (font pages for PT Root UI, Golos UI) — TLS error and empty responses. Paratype's English article on info.paratype.com was read.
- GitHub HTML pages via direct download (vercel/geist-font, simpals/onest, stasaki/Involve) — 403/404; Geist release notes were read through a second fetch; Onest and Involve licences not confirmed.
- awwwards.com — direct download reset; the Red Collar "Endless Letter" case study was read through a second fetch; the Obys case study was not.
- medium.com articles (hanging prepositions; Bulgarian Cyrillic on the web) — 403.
- readymag.com (design school, typography long-read) — tried URLs returned 404 / script shell; nothing from Readymag is used.
- pinkman.studio / pinkman.net — no response. advanced.team — blocked by Cloudflare. obys.agency, zajno.com, typetype.org/ru — script-rendered, only font names or fluid sizes readable.
- type.today "manual" articles on tracking/leading — not found (guessed URLs 404; journal index lists only recent posts). The Google Fonts Cyrillic series was read instead; episodes on serifs, scripts and display part 2 only skimmed.
- Fonts In Use Cyrillic tag — the fetched page was a generic listing, not usable.
- Cyrillicsly — only the landing text on letter skeletons was readable.
- Not searched or not found: Gerry Leonidas on Cyrillic, Cyreal, Letterhead, CSTM Fonts own site, HSE Design School, BHSAD, Bang Bang Education, Skillbox syllabi (one Skillbox Media article and one Yandex Practicum blog post were read instead), Ilyakhov's own blog (the public pages of his book on bureau.ru were read), Ilya Birman's typography layout, the body of Bureau's paid book «Типографика и вёрстка» (only public advice pages were read).
- Kovodstvo § 104 (quotes) — the page text is short; the nested-quote convention in item 76 is from memory.
