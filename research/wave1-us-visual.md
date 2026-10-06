# Wave 1 — US visual web design craft rules

Purpose: actionable rules from US courses, schools and reference texts, for building a dark, premium, typographic landing site.
Collected 2026-10-06 from public pages only. Nothing behind a paywall is stated or guessed.

Format of every rule: **Rule** — value/number — why — source + URL — tag.

- `[verified]` = the value was read on the fetched page (or in the official token/source file) during this run.
- `[recalled]` = stated from general knowledge; the page was not fetched or could not be rendered. Check before relying on exact numbers.

Notes on two "verified via official source file" cases:
- Material Design 3 site (m3.material.io) is JS-only and did not render; M3 numbers below were read from Google's own token files in `material-components/material-web` (`tokens/versions/v0_192/_md-sys-motion.scss`, `_md-sys-typescale.scss`, `_md-sys-state.scss`).
- Apple HIG pages are JS-only; numbers were read from Apple's own JSON behind those pages (`developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`).
- Refactoring UI numeric defaults: Tailwind CSS default theme (authored by Wathan/Schoger) read from `tailwindlabs/tailwindcss/packages/tailwindcss/theme.css`.

---

## 1. Typography

### 1.1 Sizes and scale

- R1. **Body text on the web is 15–25 px** — not 12–14 — screens are read from further away than paper; tiny body is a 90s habit — Butterick, Practical Typography, https://practicaltypography.com/point-size.html — [verified]
- R2. **Desktop body: 18–24 px for text-heavy pages, 14–20 px for interaction-heavy pages** — pick by how much reading the page demands — Erik Kennedy, Learn UI Design, https://www.learnui.design/blog/mobile-desktop-website-font-size-guidelines.html — [verified]
- R3. **Mobile body: 16–20 px text-heavy, 16–18 px interaction-heavy; start at 17 px and adjust** — go down if lines fall under ~30 characters, up if there is long reading — Erik Kennedy, same URL — [verified]
- R4. **Page titles: 30–50 px desktop, 28–40 px mobile, in a heavier weight** — as a starting range for product/UI pages (a display-led landing page goes well above this; see R10, R11) — Erik Kennedy, same URL — [verified]
- R5. **Secondary text is about 2 px smaller than body** (13–14 px on mobile) — a visible but quiet step down — Erik Kennedy, same URL — [verified]
- R6. **Use about 4 font sizes in total: header, body, secondary, one wildcard** — more sizes blur the hierarchy — Erik Kennedy, same URL — [verified]
- R7. **No more than 3 sizes (small/medium/large); at most 2 elements may be "large"** — if everything is big nothing is — NN/g, https://www.nngroup.com/articles/visual-hierarchy-ux-definition/ and https://www.nngroup.com/articles/principles-visual-design/ — [verified]
- R8. **You do not need a modular/golden-ratio scale; sizes must be clearly distinguishable and used consistently** — small text moves a few px at a time, large text jumps many sizes; the same role gets the same size on every page — Erik Kennedy, https://www.learnui.design/blog/why-beginning-designers-dont-need-grids-type-scales-color-theory.html — [verified]
- R9. **Hand-picked scale as a working default: 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128 px** — non-linear: tight steps at the bottom, big jumps at the top — Tailwind default theme (Wathan/Schoger), https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css — [verified]
- R10. **Material 3 display/headline sizes: 57/64, 45/52, 36/44 (display); 32/40, 28/36, 24/32 (headline); body 16/24, 14/20, 12/16; labels 14/20, 12/16, 11/16** (size/line-height in px) — a tested reference ladder when you need one — Material Design 3 tokens, https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-typescale.scss — [verified]
- R11. **Vercel Geist heading steps: 72, 64, 56, 48, 40, 32, 24, 20, 16, 14** — 8 px steps at the top of the range; each class pre-sets size, line-height, letter-spacing and weight together — Vercel Geist, https://vercel.com/geist/typography — [verified]
- R12. **Fluid type with clamp(): `font-size: clamp(1rem, 0.75rem + 1.5vw, 2rem)`** — scales with the viewport but never below/above safe bounds; keep a rem term so user zoom still works — web.dev Learn Design, https://web.dev/learn/design/typography — [verified]
- R13. **Use fluid sizing via clamp() for responsive typography** — listed as a baseline craft item — Rauno Freiberg, Web Interface Guidelines, https://interfaces.rauno.me/ — [verified]
- R14. **Raise heading size by the smallest increment that makes a visible difference; emphasize headings with space above and below first, then weight, then size** — whitespace is "both subtle and effective"; size jumps are the crude tool — Butterick, https://practicaltypography.com/headings.html — [verified]
- R15. **At most 3 heading levels, 2 is better** — more levels and the reader loses orientation — Butterick, same URL — [verified]
- R16. **Apple minimums/defaults: iOS default 17 pt, minimum 11 pt; macOS default 13 pt, minimum 10 pt** — floor for any caption or legal text — Apple HIG Typography, https://developer.apple.com/design/human-interface-guidelines/typography — [verified]
- R17. **Form inputs at least 16 px on mobile** — iOS Safari zooms the page on focus below 16 px — Vercel Web Interface Guidelines, https://vercel.com/design/guidelines; Rauno, https://interfaces.rauno.me/ — [verified]

### 1.2 Line-height

- R18. **Body line-height 120–145% of size** — 110% is cramped, 170% falls apart; fonts that run small need less — Butterick, https://practicaltypography.com/line-spacing.html — [verified]
- R19. **Use unitless line-height; 1.5 is the friendly body default** — proportional to font-size; easier for dyslexic readers — Josh W. Comeau, https://www.joshwcomeau.com/css/custom-css-reset/; web.dev, https://web.dev/learn/design/typography — [verified]
- R20. **Headings need a smaller line-height than body** — 1.5 on a large heading looks loose — Josh W. Comeau, same URL — [verified]
- R21. **Line-height falls as size rises: 16px → 1.5, 20px → 1.4, 24px → 1.33, 30px → 1.2, 36px → 1.11, 48 px and above → 1.0** — exact defaults of the Tailwind scale — Tailwind default theme (Wathan/Schoger), https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css — [verified]
- R22. **Self-adjusting line-height: `line-height: calc(1em + 0.5rem)`** — gives ~1.5 at body size and automatically tightens toward ~1.1 at display sizes — Josh W. Comeau, https://www.joshwcomeau.com/css/custom-css-reset/ — [verified]
- R23. **Line-height depends on measure: ~1.65 at 66ch; shorter lines tolerate different values** — the eye needs more help finding the next line on long lines — web.dev, https://web.dev/learn/design/typography — [verified]
- R24. **Loose leading for wide columns/long passages; tight leading only for 1–2 lines; never tight for 3+ lines** — Apple HIG Typography, https://developer.apple.com/design/human-interface-guidelines/typography — [verified]
- R25. **M3 line-height ratios: display 57/64 = 1.12, headline 32/40 = 1.25, body 16/24 = 1.5, label 11/16 = 1.45** — the same "bigger = tighter" curve from another system — Material Design 3 tokens, https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-typescale.scss — [verified]

### 1.3 Letter-spacing

- R26. **All caps and small caps get +5–12% tracking: `letter-spacing: 0.05em`–`0.12em`** — caps are designed to follow lowercase, not each other; most important at small sizes — Butterick, https://practicaltypography.com/letterspacing.html — [verified]
- R27. **Lowercase body gets no tracking; add it only below ~9 pt; remove (tighten) it at headline sizes** — Butterick, same URL — [verified]
- R28. **Over-tracking test: if another letter fits in the gap, it is too much** — Butterick, same URL — [verified]
- R29. **Tracking tokens: −0.05em, −0.025em, 0, +0.025em, +0.05em, +0.1em** — negative for display, positive for caps/labels — Tailwind default theme (Wathan/Schoger), https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css — [verified]
- R30. **Tracking is per-size, not global. SF Pro: +41/1000 em at 6 pt, +12 at 10 pt, 0 at 12 pt, −11 at 14 pt, −20 at 16 pt, −26 at 17 pt (tightest), −23 at 20 pt** — small text is opened up, text sizes are tightened — Apple HIG Typography tracking table, https://developer.apple.com/design/human-interface-guidelines/typography — [verified]
- R31. **Once the optical size switches to a Display cut, extra tightening is no longer added: SF Pro goes back to +3 at 24 pt, +14 at 28–30 pt, and to 0 at 80 pt and above** — a display cut already has tight spacing drawn in; do not stack negative tracking on top of a display font blindly — Apple HIG, same URL — [verified]
- R32. **M3 tracking: display-large (57 px) −0.25 px; headlines 0; body-large (16 px) +0.5 px; body-medium (14 px) +0.25 px; labels 11–12 px +0.5 px** — small labels are opened by roughly 4% — Material Design 3 tokens, https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-typescale.scss — [verified]
- R33. **A humanist sans may want about −1% letter-spacing in headers** — example given for Source Sans — Erik Kennedy, https://www.learnui.design/blog/7-rules-for-creating-gorgeous-ui-part-2.html — [verified]
- R34. **Large display type in a text-cut grotesque (Inter, Helvetica-like): about −0.02em to −0.04em at 48–96 px** — text cuts are spaced for 14–18 px and look gappy when enlarged — common practice at Linear/Vercel-style sites; no fetched page states this number — [recalled]

### 1.4 Measure, wrapping, rag

- R35. **Measure 45–90 characters per line, or 2–3 lowercase alphabets** — long lines make the return sweep hard; the single most common layout flaw in responsive sites — Butterick, https://practicaltypography.com/line-length.html — [verified]
- R36. **Desktop body: 50–75 characters per line** — Erik Kennedy, https://www.learnui.design/blog/mobile-desktop-website-font-size-guidelines.html — [verified]
- R37. **Set measure in `ch`: `max-inline-size: 66ch`** — relative to the font, survives size changes — web.dev, https://web.dev/learn/design/typography — [verified]
- R38. **`text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs, `overflow-wrap: break-word` on both** — balanced headline lines, no orphans, no overflow — Josh W. Comeau, https://www.joshwcomeau.com/css/custom-css-reset/ — [verified]
- R39. **`text-wrap: balance` only works up to six wrapped lines** — it is for headings, not body — Chrome for Developers, https://developer.chrome.com/docs/css-ui/css-text-wrap-balance — [verified]
- R40. **Tidy the rag and line breaks; no widows/orphans; glue units and names with `&nbsp;`** — Vercel Web Interface Guidelines, https://vercel.com/design/guidelines — [verified]
- R41. **All caps for less than one line only; never a paragraph** — caps are slower to read — Butterick, https://practicaltypography.com/all-caps.html and https://practicaltypography.com/summary-of-key-rules.html — [verified]
- R42. **Centered text sparingly; headings are not centered by default** — Butterick, https://practicaltypography.com/headings.html — [verified]

### 1.5 Weight and hierarchy

- R43. **Build hierarchy with weight and color before size** — 2–3 text colors (primary dark, grey secondary, lighter grey tertiary) and 2 weights do most of the work — Refactoring UI (Wathan/Schoger), https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886 — [verified]
- R44. **Two weights: 400–500 for normal text, 600–700 for emphasis; nothing under 400 for UI text** — thin weights are illegible small — Refactoring UI, same URL; Rauno, https://interfaces.rauno.me/ — [verified]
- R45. **Avoid Ultralight/Thin/Light; use Regular, Medium, Semibold, Bold; a thin custom font needs a larger size** — Apple HIG Typography, https://developer.apple.com/design/human-interface-guidelines/typography — [verified]
- R46. **Medium headings sit at weight 500–600** — Rauno, https://interfaces.rauno.me/ — [verified]
- R47. **Only the page title gets every "up-pop" at once; everything else mixes up-pop and down-pop** — e.g. a huge number set light and low-contrast, or a small label set bold caps — up-pop tools: size, contrast, weight, caps, margin; down-pop: the opposites — Erik Kennedy, https://www.learnui.design/blog/7-rules-for-creating-gorgeous-ui-part-2.html — [verified]
- R48. **The bigger the type, the lighter its style may be: size and contrast trade off** — applies to giant background words and display numerals — Erik Kennedy / Anthony Hobday, https://www.learnui.design/blog/spice-up-designs.html — [verified]
- R49. **Never change weight, size or case on hover/selected** — it shifts layout; change color, background, shadow or underline instead — Erik Kennedy, same part-2 URL; Rauno, https://interfaces.rauno.me/ — [verified]
- R50. **Labels are secondary: make the label smaller, lower-contrast or lighter, and the value strong; often drop the label entirely ("12 left in stock" instead of "In stock: 12")** — `label: value` gives every item equal emphasis — Refactoring UI, https://www.refactoringui.com/previews/labels-are-a-last-resort — [verified]
- R51. **Bold or italic, never both; minimal use of either; no underline except links** — Butterick, https://practicaltypography.com/summary-of-key-rules.html — [verified]
- R52. **Body text first: the quality of the page is decided by how the body looks** — set size, line spacing, line length, font for body before touching display — Butterick, https://practicaltypography.com/typography-in-ten-minutes.html — [verified]

### 1.6 Font choice and pairing

- R53. **A second font is optional; most pages tolerate two, few three, almost none four** — Butterick, https://practicaltypography.com/mixing-fonts.html — [verified]
- R54. **Minimize the number of typefaces even in a highly custom interface** — too many obscure hierarchy and look inconsistent — Apple HIG Typography, https://developer.apple.com/design/human-interface-guidelines/typography — [verified]
- R55. **Before adding a second typeface, exhaust the first: weights, widths, optical sizes, case, size** — Google Fonts Knowledge, "Pairing typefaces", https://fonts.google.com/knowledge/choosing_type/pairing_typefaces (text read from https://github.com/google/fonts/tree/main/cc-by-sa/knowledge) — [verified]
- R56. **A pair must be distinct but harmonious: similar x-height, contrast and width ("siblings/cousins"); when in doubt, serif + sans** — too similar reads as a mistake, too different competes — Google Fonts Knowledge (citing Jessica Hische and Jason Santa Maria), same URL — [verified]
- R57. **Any two identifiably different fonts can be mixed; serif + sans is not mandatory, and lower contrast between fonts can work better than higher** — Butterick, https://practicaltypography.com/mixing-fonts.html — [verified]
- R58. **Reliable shortcut: pair fonts by the same designer** — Butterick, same URL — [verified]
- R59. **Give every font one fixed role and written usage rules** (e.g. "accent font: subheads only, uppercase, bold") — the role consistency is what keeps three fonts from looking messy — Erik Kennedy, https://www.learnui.design/blog/guide-pairing-fonts.html; Butterick, mixing-fonts — [verified]
- R60. **Start from brand adjectives, pick fonts that convey them subtly, never a novelty font; choose the body font first** — body has the tighter constraints — Erik Kennedy, https://www.learnui.design/blog/guide-pairing-fonts.html — [verified]
- R61. **A good body font is "boring": high x-height, open counters** — it must never call attention to itself — Erik Kennedy, same URL — [verified]
- R62. **Display cut for headings, text cut for body from one family (Linear: Inter Display for headings, Inter for body)** — more expression in headings without a second family — Linear, https://linear.app/now/how-we-redesigned-the-linear-ui — [verified]
- R63. **Use a variable font with optical sizing: one file, continuous weights, letterforms adapt to point size** — Apple HIG Typography, https://developer.apple.com/design/human-interface-guidelines/typography; web.dev, https://web.dev/learn/design/typography — [verified]
- R64. **Avoid system fonts and overused defaults for brand text (Times New Roman, Arial signal indifference); professional fonts pay for themselves** — Butterick, https://practicaltypography.com/typography-in-ten-minutes.html — [verified]

### 1.7 Details and rendering

- R65. **Curly quotes, real apostrophes, real ellipsis `…`, proper en/em dashes; straight marks only for feet/inches** — straight quotes are the fastest tell of unedited text — Butterick, summary-of-key-rules; Typewolf Cheatsheet, https://www.typewolf.com/cheatsheet; Vercel guidelines — [verified]
- R66. **En dash unspaced for ranges; em dash for breaks; never quotation marks for emphasis** — Typewolf Cheatsheet, https://www.typewolf.com/cheatsheet — [verified]
- R67. **Real small caps only (`font-variant: small-caps` uses the font's OpenType small caps if present; otherwise it fakes them); small caps get tracking like caps** — fakes are too tall and too light — Butterick, https://practicaltypography.com/small-caps.html — [verified]
- R68. **`font-variant-numeric: tabular-nums` for numbers that are compared or that change (prices, timers, tables)** — digits stop jittering — Vercel, https://vercel.com/design/guidelines; Rauno, https://interfaces.rauno.me/ — [verified]
- R69. **`-webkit-font-smoothing: antialiased` and `text-rendering: optimizeLegibility`** — thinner, crisper light-on-dark text on macOS; kerning/ligatures on — Rauno, https://interfaces.rauno.me/; Josh W. Comeau reset — [verified]
- R70. **Kerning always on** — Butterick, https://practicaltypography.com/summary-of-key-rules.html — [verified]
- R71. **Preload critical fonts, subset with `unicode-range`, limit variable axes to what is used; `font-display: swap` or `fallback`** — no flash, no layout shift — Vercel, https://vercel.com/design/guidelines; web.dev, https://web.dev/learn/design/typography — [verified]
- R72. **Align on the letters, not the punctuation: hang opening quotes outside the text edge** — punctuation is markup on the text, visually lighter — Erik Kennedy, https://www.learnui.design/blog/3-pro-tips-on-alignment.html — [verified]
- R73. **When scaling text in an animation, scale the wrapper, not the text node; add `translateZ(0)` or `will-change: transform` if artifacts appear** — Vercel, https://vercel.com/design/guidelines — [verified]

### 1.8 Cyrillic

No US source in scope publishes Cyrillic-specific setting rules (Google Fonts Knowledge has only a glossary entry: https://fonts.google.com/knowledge/glossary/cyrillic — [verified] that it contains no rules). The points below are general knowledge and must be checked by eye.

- R74. **Check the font's Cyrillic before choosing it: к, ж, л, д, я, ф, б, у and the italic forms** — many Latin-first families ship a weak or mechanically derived Cyrillic — [recalled]
- R75. **Cyrillic lowercase has few ascenders/descenders and many verticals, so text looks denser and more "square": give it slightly more line-height and slightly less negative tracking than the same Latin setting** — [recalled]
- R76. **Cyrillic all caps need at least the same +5–12% tracking as Latin caps, usually the upper half of the range** — wide forms (Ш, Щ, Ж, Ю, Ы) clog quickly — Butterick's range is [verified] for caps in general; the Cyrillic adjustment is [recalled]
- R77. **Russian words run longer than English: test headlines with real copy and allow one more line; rely on `text-wrap: balance` and `&nbsp;` after short prepositions** — [recalled]
- R78. **Subset fonts for the languages actually used (Latin + Cyrillic ranges)** — "subset fonts based on relevant content and languages" — Rauno, https://interfaces.rauno.me/ — [verified]

---

## 2. Layout and space

- R79. **Whitespace is the default state: start with too much and remove, do not add it at the end** — "double your whitespace" — Erik Kennedy, https://www.learnui.design/blog/7-rules-for-creating-gorgeous-ui-part-1.html — [verified]
- R80. **Vertical padding around a text row about equal to the text height (12 px text → 12 px above and below); 15 px title-to-rule; 25 px between separate lists** — concrete numbers from his worked example — Erik Kennedy, same URL — [verified]
- R81. **Spacing encodes grouping: less space between a header and its content, more space between groups; add borders/backgrounds only when space is not enough** — NN/g, https://www.nngroup.com/articles/visual-hierarchy-ux-definition/ — [verified]
- R82. **Use fewer borders: separate with a shadow, a different background, or more space** — borders add noise and make a layout feel busy — Refactoring UI, https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886 — [verified]
- R83. **"Structure should be felt, not seen": fewer separators, softer and lower-contrast dividers, dimmer navigation so content leads** — Linear, https://linear.app/now/behind-the-latest-design-refresh — [verified]
- R84. **Spacing base unit 0.25 rem (4 px); everything is a multiple** — Tailwind default theme (Wathan/Schoger), https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css — [verified]
- R85. **Spacing scale that is non-linear: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256 px; adjacent steps differ by at least ~25%** — removes "is 13 or 14 px better" decisions — Refactoring UI book; no public page fetched states these numbers — [recalled]
- R86. **Content-width tokens: 672, 768, 896, 1024, 1152, 1280 px (42–80 rem)** — pick a max width per content type instead of filling the screen — Tailwind default theme, same URL — [verified]
- R87. **Content dictates its own width; the layout follows. Align instead of worshipping a 12-column grid** — a rigid grid means nothing at 320 px — Erik Kennedy, https://www.learnui.design/blog/why-beginning-designers-dont-need-grids-type-scales-color-theory.html — [verified]
- R88. **Mobile side margins 16 px** (iOS and Android default) — Erik Kennedy, same URL — [verified]
- R89. **If a design looks sloppy or cluttered, it is under-aligned** — alignment "buys cleanness"; centering two items together is also alignment — Erik Kennedy, https://www.learnui.design/blog/3-pro-tips-on-alignment.html — [verified]
- R90. **Left-aligned text gives a strong left edge and only a weak right edge; do not right-align an image to a ragged text block and expect it to look aligned** — Erik Kennedy, same URL — [verified]
- R91. **Every element aligns to something on purpose: grid, baseline, edge or optical center; nudge ±1 px when the eye disagrees with the math** — Vercel, https://vercel.com/design/guidelines — [verified]
- R92. **Linear spent its effort aligning labels, icons and buttons on both axes; "you feel it after a few minutes"** — invisible alignment is the premium signal — Linear, https://linear.app/now/how-we-redesigned-the-linear-ui — [verified]
- R93. **Most important content top and leading side; aligned items read as related, indented items as subordinate** — Apple HIG Layout, https://developer.apple.com/design/human-interface-guidelines/layout — [verified]
- R94. **Balance by visual area, not element count; symmetric = stable, asymmetric = energetic, radial = focal point** — choose one deliberately per section — NN/g, https://www.nngroup.com/articles/principles-visual-design/ — [verified]
- R95. **Max 2 primary + 2 secondary colors and max 3 contrast levels in a simple layout** — "if everything is contrasted, nothing stands out" — NN/g, https://www.nngroup.com/articles/visual-hierarchy-ux-definition/ — [verified]
- R96. **Intrinsic responsive grid: `grid-template-columns: repeat(auto-fill, minmax(15em, 1fr))`; breakpoints in em, set by content** — web.dev Learn Design, https://web.dev/learn/design/macro-layouts — [verified]
- R97. **Check the layout on mobile, laptop and ultra-wide (zoom the browser to 50%)** — Vercel, https://vercel.com/design/guidelines — [verified]
- R98. **Child radius ≤ parent radius; nested curves are concentric (inner = outer − padding)** — mismatched nested corners look amateur — Vercel, same URL — [verified]
- R99. **Icons drawn for 16–24 px look chunky when scaled 3–4×; put the small icon in a shaped, tinted container instead** — Refactoring UI, https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886 — [verified]
- R100. **Hit target at least 24 px (44 px on mobile), even if the visual is smaller; no dead zones between list items (grow padding instead of gaps)** — Vercel, https://vercel.com/design/guidelines; Rauno, https://interfaces.rauno.me/ — [verified]
- R101. **`scroll-margin-top` on headings so anchor links do not hide under a sticky header** — Vercel, same URL — [verified]
- R102. **Three button tiers: primary = solid high-contrast, secondary = outline or low-contrast fill, tertiary = looks like a link** — hierarchy, not semantics, decides the style — Refactoring UI, same Medium URL — [verified]

---

## 3. Color

### 3.1 Building a palette

- R103. **You need 8–10 greys, 5–10 shades of each primary, and several accent scales; a 5-swatch generator palette is not enough** — Refactoring UI, https://www.refactoringui.com/previews/building-your-color-palette — [verified]
- R104. **True black looks unnatural: start from a very dark grey and step up to white** — Refactoring UI, same URL — [verified]
- R105. **Define shades up front (100–900, base = 500): pick base, then darkest and lightest, then 700/300, then fill 800/600/400/200. No `lighten()`/`darken()` on the fly** — otherwise 35 near-identical blues — Refactoring UI, same URL — [verified]
- R106. **Base shade = the one that works as a button background; darkest = text; lightest = tinted background** — Refactoring UI, same URL — [verified]
- R107. **Trust your eyes over the math, but stop adding shades** — Refactoring UI, same URL — [verified]
- R108. **Design in grayscale first; then add one accent color; at most two** — forces spacing and hierarchy to work before color hides problems — Erik Kennedy, https://www.learnui.design/blog/7-rules-for-creating-gorgeous-ui-part-1.html — [verified]
- R109. **Darker variant = brightness down + saturation up; lighter variant = brightness up + saturation down** — this is how shadows and highlights behave on real objects — Erik Kennedy, https://www.learnui.design/blog/color-in-ui-design-a-practical-framework.html — [verified]
- R110. **Shift hue along with brightness: darker variants toward red 0° / green 120° / blue 240°, lighter toward yellow 60° / cyan 180° / magenta 300°** — keeps variants rich instead of muddy — Erik Kennedy, same URL — [verified]
- R111. **An overpowering color is fixed by lowering saturation first** — Erik Kennedy, https://www.learnui.design/blog/the-hsb-color-system-practicioners-primer.html — [verified]
- R112. **Build scales in a perceptually uniform space (Lab/LCH/OKLCH), not HSL** — equal HSL lightness is not equal perceived lightness (blues look dark, yellows light) — Stripe, https://stripe.com/blog/accessible-color-systems; Linear, https://linear.app/now/how-we-redesigned-the-linear-ui — [verified]
- R113. **Derive a whole theme from three inputs: base color, accent color, contrast** — Linear replaced 98 per-theme variables with these — Linear, same URL — [verified]
- R114. **A stepped scale gives guaranteed contrast: any two steps 5 apart pass small text (4.5:1), 4 apart pass large text/icons (3:1)** — no pair-by-pair checking — Stripe, https://stripe.com/blog/accessible-color-systems — [verified]
- R115. **12-step scale with fixed jobs: 1–2 backgrounds, 3–5 component bg (rest/hover/active), 6–8 borders (subtle/element/hover), 9–10 solid fills, 11 low-contrast text, 12 high-contrast text** — every color decision becomes a lookup — Radix Colors (WorkOS), https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale — [verified]
- R116. **Keep chroma out of the chrome: Linear limited how much blue enters the neutral calculations for a "more neutral and timeless" look, then moved from cool blue-grey toward warmer grey** — Linear, https://linear.app/now/how-we-redesigned-the-linear-ui and https://linear.app/now/behind-the-latest-design-refresh — [verified]
- R117. **One color = one meaning across the page** — do not use the interactive color on non-interactive text — Apple HIG Color, https://developer.apple.com/design/human-interface-guidelines/color — [verified]

### 3.2 Dark theme construction

- R118. **Reserve pure black and pure white for the darkest shadows and brightest highlights only** — users will not name it, but tinted near-black "feels harmonious" — web.dev (Adam Argyle), https://web.dev/articles/building/a-color-scheme — [verified]
- R119. **Dark surface ladder, tinted with the brand hue: `hsl(H 10% 10%)`, `hsl(H 10% 15%)`, `hsl(H 5% 20%)`, `hsl(H 5% 25%)`** — four surfaces, +5% lightness per step, very low saturation — web.dev, same URL — [verified]
- R120. **Dark text colors: primary `hsl(H 15% 85%)`, secondary `hsl(H 5% 65%)`** — off-white, slightly tinted, not #fff — web.dev, same URL — [verified]
- R121. **Brand/accent in dark: halve the saturation and divide lightness by 1.5** — a light-theme accent vibrates on dark — web.dev, same URL — [verified]
- R122. **Elevation in dark = lighter surface, not a bigger shadow: base surfaces are dimmer and recede, elevated surfaces are brighter and advance** — Apple HIG Dark Mode, https://developer.apple.com/design/human-interface-guidelines/dark-mode — [verified]
- R123. **Higher surfaces are brighter because they catch more light** — the same rule as flat design in light mode — Erik Kennedy, https://www.learnui.design/blog/7-rules-for-creating-gorgeous-ui-part-1.html — [verified]
- R124. **Material dark: elevation is shown with a semi-transparent overlay whose alpha grows with elevation (lighter and more colorful closer to the light)** — Material Components docs, https://github.com/material-components/material-components-android/blob/master/docs/theming/Dark.md — [verified]
- R125. **Material 2 dark numbers: base surface #121212; white overlay 5% at 1dp, 7% at 2dp, 8% at 3dp, 9% at 4dp, 11% at 6dp, 12% at 8dp, 14% at 12dp, 15% at 16dp, 16% at 24dp; text 87% / 60% / 38% white** — page m2.material.io did not render — Material Design 2 dark theme, https://m2.material.io/design/color/dark-theme.html — [recalled]
- R126. **Contrast: never below 4.5:1; aim for 7:1 for custom foreground/background pairs, especially small text** — Apple HIG Dark Mode, https://developer.apple.com/design/human-interface-guidelines/dark-mode — [verified]
- R127. **WCAG floors: 4.5:1 small text, 3:1 large text and icons** — Stripe, https://stripe.com/blog/accessible-color-systems; NN/g, https://www.nngroup.com/articles/text-over-images/ — [verified]
- R128. **Prefer APCA over WCAG 2 for judging contrast** — it models perception better, which matters most for light text on dark — Vercel, https://vercel.com/design/guidelines — [verified]
- R129. **Small text is the weak point of dark mode; the light-mode advantage grows as text gets smaller** — on a dark page keep small text larger, heavier and higher-contrast than you would on white — NN/g, https://www.nngroup.com/articles/dark-mode/ — [verified]
- R130. **In dark mode lighten text and neutral icons (and darken them in light mode) to raise content contrast** — what Linear did in its redesign — Linear, https://linear.app/now/how-we-redesigned-the-linear-ui — [verified]
- R131. **Soften white areas inside images shown on a dark page** — they glow; darken slightly or apply a CSS brightness filter — Apple HIG Dark Mode; web.dev, https://web.dev/learn/design/theming — [verified]
- R132. **Avoid a very bright object on a very dark background, especially if it flashes** — eyes adapted to dark are hurt by it — Apple HIG Color, https://developer.apple.com/design/human-interface-guidelines/color — [verified]
- R133. **Set `color-scheme: dark` on `<html>` and `<meta name="theme-color">` to the page background** — native scrollbars, form controls and browser chrome match the page — Vercel, https://vercel.com/design/guidelines; web.dev, https://web.dev/learn/design/theming — [verified]
- R134. **Explicitly set `background-color` and `color` on native `<select>`** — Windows dark-mode contrast bug — Vercel, same URL — [verified]
- R135. **Hover/active/focus states must have more contrast than rest** — on dark that means lighter, not darker — Vercel, same URL — [verified]
- R136. **Interaction state layers: hover 8%, focus 12%, pressed 12%, dragged 16% of the content color over the surface** — a ready formula for hover tints on dark — Material Design 3 tokens, https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-state.scss — [verified]

### 3.3 Accent, text on color, gradients

- R137. **Never grey text on a colored background: lower the opacity of white text, or hand-pick a color with the background's hue and adjusted saturation/lightness** — grey on color looks washed out and loses contrast — Refactoring UI, https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886 — [verified]
- R138. **Tint borders, shadows and text toward the background hue on any non-neutral background** — Vercel, https://vercel.com/design/guidelines — [verified]
- R139. **Accent color is used sparingly; a site reads as "blue" though it is mostly grey** — Refactoring UI, https://www.refactoringui.com/previews/building-your-color-palette — [verified]
- R140. **60/30/10 split (dominant / secondary / accent) as a sanity check on accent quantity** — interior-design rule widely repeated in US design teaching; no page in this run states it — [recalled]
- R141. **Accent borders: a 3–4 px colored top or left edge on a card/alert adds interest without graphic skill** — Refactoring UI, same Medium URL (the px value is [recalled]; the technique is [verified]) — [verified]
- R142. **Gradients between distant hues go grey in the middle in sRGB; interpolate in a perceptual space: `linear-gradient(to right in oklch, …)` (≈91% support late 2025) or generate many stops** — Josh W. Comeau, https://www.joshwcomeau.com/css/make-beautiful-gradients/ — [verified]
- R143. **Gradient fading into dark bands visibly: use an image (with noise) instead of a CSS gradient; for glows use a radial gradient, not a scaled/blurred rectangle** — Vercel, https://vercel.com/design/guidelines; Rauno, https://interfaces.rauno.me/ — [verified]
- R144. **A background gradient that gently changes brightness gives natural dimensionality** — natural light is never even — Butterick, https://practicaltypography.com/color.html — [verified]
- R145. **Mesh gradients: easy to recolor and still "go together"; use different meshes to brand sub-products or sections** — Erik Kennedy, https://www.learnui.design/blog/mesh-gradients.html — [verified]
- R146. **Text over an image: 35% black overlay on the whole image, or a floor fade from 0% black mid-image to ~20% at the bottom, or blur under the text; text white only** — Erik Kennedy, https://www.learnui.design/blog/7-rules-for-creating-gorgeous-ui-part-2.html — [verified]
- R147. **Text over media must still reach 4.5:1; a radial dark overlay behind the text fixes it without changing the image mood** — NN/g, https://www.nngroup.com/articles/text-over-images/ — [verified]
- R148. **Use Display P3 for richer accent color on capable screens, and check that P3 gradients do not clip on sRGB** — Apple HIG Color, https://developer.apple.com/design/human-interface-guidelines/color; Vercel Geist uses P3 where supported, https://vercel.com/geist/colors — [verified]
- R149. **Style `::selection`, and do not put gradients in it** — Rauno, https://interfaces.rauno.me/ — [verified]

---

## 4. Depth and material

- R150. **One light source for the whole page, from above** — light from below "looks freaky"; top edges lighter, bottom edges darker, shadows fall down — Erik Kennedy, https://www.learnui.design/blog/7-rules-for-creating-gorgeous-ui-part-1.html — [verified]
- R151. **Every shadow shares the same x:y offset ratio (e.g. y = 2 × x)** — otherwise elements look lit by different suns — Josh W. Comeau, https://www.joshwcomeau.com/css/designing-shadows/ — [verified]
- R152. **Give shadows a vertical offset instead of a big blur/spread** — reads as light from above, not as a fuzzy outline — Refactoring UI, https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886 — [verified]
- R153. **As elevation rises: offset up, blur up, opacity down** — Josh W. Comeau, same URL — [verified]
- R154. **Layer shadows, doubling each step: `0 1px 1px, 0 2px 2px, 0 4px 4px, 0 8px 8px, 0 16px 16px`; 4–6 layers; ~12% alpha per layer as a baseline, less per layer as you add layers** — one blurred shadow cannot imitate real falloff — Tobias Ahlin (cited by Comeau as the origin), https://tobiasahlin.com/blog/layered-smooth-box-shadows/ — [verified]
- R155. **Tune character: sharp shadow = alpha falling 0.25 → 0.05 across layers; diffuse = the reverse; decouple blur from y-offset to change apparent distance** — Tobias Ahlin, same URL — [verified]
- R156. **At least two layers: ambient + direct light** — Vercel, https://vercel.com/design/guidelines — [verified]
- R157. **Never pure transparent black for shadows; use the background's hue, less saturated and darker (bg `hsl(220 100% 80%)` → shadow `hsl(220 60% 50%)`)** — black shadows look like grey dirt on color — Josh W. Comeau, https://www.joshwcomeau.com/css/designing-shadows/ — [verified]
- R158. **Dark-theme shadow: `hsl(H 50% 3%)` at strength 0.8 (vs 0.02 on light)** — shadows are nearly invisible on dark, so they must be far stronger and can carry hue — web.dev, https://web.dev/articles/building/a-color-scheme — [verified]
- R159. **Shadow tokens (two-layer, negative spread): md `0 4px 6px -1px /0.1, 0 2px 4px -2px /0.1`; lg `0 10px 15px -3px /0.1, 0 4px 6px -4px /0.1`; xl `0 20px 25px -5px /0.1, 0 8px 10px -6px /0.1`; 2xl `0 25px 50px -12px /0.25`** — negative spread keeps the shadow under the element — Tailwind default theme (Wathan/Schoger), https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css — [verified]
- R160. **Combine border and shadow; a semi-transparent border sharpens the edge** — on dark, a 1 px `rgba(255,255,255,0.06–0.12)` border does the job a shadow does on light (the alpha range is [recalled]; the rule is [verified]) — Vercel, https://vercel.com/design/guidelines — [verified]
- R161. **Inset highlight on the top edge (`inset 0 1px rgb(255 255 255 / 0.05–0.1)`) makes a dark surface look lit from above** — Tailwind ships `inset-shadow` tokens `inset 0 1px rgb(0 0 0 / 0.05)` [verified]; the white-on-dark variant is common practice — [recalled]
- R162. **A border that "catches the light" at a couple of points (gradient border) reads as a metal edge; a gradient border says "what is inside is important"** — Erik Kennedy / Anthony Hobday, https://www.learnui.design/blog/spice-up-designs.html — [verified]
- R163. **Inset = inputs, pressed buttons, slider tracks; outset = buttons, cards, popups, dropdowns** — pick the direction by what the element is — Erik Kennedy, part-1 URL — [verified]
- R164. **Glass: `backdrop-filter: blur(16px)`; extend the backdrop element to 200% height and mask it back with `mask-image: linear-gradient(to bottom, black 0% 50%, transparent 50% 100%)`** — so the blur samples content that is near, not only directly behind; add `pointer-events: none` — Josh W. Comeau, https://www.joshwcomeau.com/css/backdrop-filter/ — [verified]
- R165. **Glass edge: a 4–6 px strip under the bar with `backdrop-filter: blur(12px) brightness(0.96)`** — imitates the thickness of the pane — Josh W. Comeau, same URL — [verified]
- R166. **More blur is better for glass over busy backgrounds; add a low-opacity or gradient stroke for thickness; text on glass must still pass contrast** — showcase glass keeps the background too legible — NN/g, https://www.nngroup.com/articles/glassmorphism/ — [verified]
- R167. **Thicker (more opaque) material for text and fine detail, thinner for context; under clear glass over bright content add a 35% dark dimming layer** — Apple HIG Materials, https://developer.apple.com/design/human-interface-guidelines/materials — [verified]
- R168. **Glass belongs on the navigation/control layer, not on content; use sparingly** — Apple HIG Materials, same URL — [verified]
- R169. **Large `blur()` values are expensive; use them on few, small layers** — Rauno, https://interfaces.rauno.me/ — [verified]

---

## 5. Motion

### 5.1 Easing

- R170. **ease-out for anything entering or responding to the user (dropdowns, modals, entrance animations on marketing pages)** — fast start feels responsive, slow end lets the eye settle — Emil Kowalski, https://animations.dev/learn/animation-theory/the-easing-blueprint and https://emilkowal.ski/ui/7-practical-animation-tips; NN/g, https://www.nngroup.com/articles/animation-duration/ — [verified]
- R171. **ease-in-out for elements already on screen that move or morph** — natural accelerate/decelerate — Emil Kowalski, same URLs; https://emilkowal.ski/ui/good-vs-great-animations — [verified]
- R172. **Avoid ease-in for UI** — slow start reads as lag — Emil Kowalski, same URLs — [verified]
- R173. **`ease` for hover changes of color/background/opacity; `linear` only for constant motion (marquee, progress, hold-to-confirm, spinners)** — Emil Kowalski, easing-blueprint URL — [verified]
- R174. **Built-in CSS curves are too weak; use custom cubic-beziers** — Emil Kowalski, https://emilkowal.ski/ui/good-vs-great-animations — [verified]
- R175. **Strong ease-out candidates: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-like), `cubic-bezier(0.23, 1, 0.32, 1)` (quint), `cubic-bezier(0.19, 1, 0.22, 1)`** — the values from easings.co-style sets that Emil points to; the fetched pages name the tool, not these numbers — [recalled]
- R176. **iOS-sheet curve: `transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)`** — the curve and 500 ms used in Vaul to match iOS — Emil Kowalski, https://emilkowal.ski/ui/building-a-drawer-component — [verified]
- R177. **Stripe entrance: 800 ms, `cubic-bezier(.2, 1, .2, 1)`, `translateY(100%) → 0`, fill forwards** — a long duration is fine when the curve is front-loaded — Stripe, https://stripe.com/blog/connect-front-end-experience — [verified]
- R178. **Material 3 easing set: emphasized/standard `cubic-bezier(0.2, 0, 0, 1)`; emphasized-decelerate `cubic-bezier(0.05, 0.7, 0.1, 1)`; emphasized-accelerate `cubic-bezier(0.3, 0, 0.8, 0.15)`; standard-decelerate `cubic-bezier(0, 0, 0, 1)`; standard-accelerate `cubic-bezier(0.3, 0, 1, 1)`; legacy `cubic-bezier(0.4, 0, 0.2, 1)`** — Material Design 3 tokens, https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-motion.scss — [verified]
- R179. **M3 usage: decelerate curves for entering, accelerate curves for exiting, emphasized/standard for on-screen moves; exits shorter than entrances** — guidance text lives on the JS-only page https://m3.material.io/styles/motion/easing-and-duration — [recalled]
- R180. **Tailwind defaults: transition 150 ms `cubic-bezier(0.4, 0, 0.2, 1)`; ease-out `cubic-bezier(0, 0, 0.2, 1)`; ease-in `cubic-bezier(0.4, 0, 1, 1)`** — Tailwind default theme, https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css — [verified]
- R181. **Choose easing by what changes (size, distance, trigger), not one curve for everything** — Vercel, https://vercel.com/design/guidelines — [verified]

### 5.2 Duration

- R182. **UI animations stay under 300 ms; 180 ms feels clearly more responsive than 400 ms** — Emil Kowalski, https://emilkowal.ski/ui/7-practical-animation-tips and https://emilkowal.ski/ui/you-dont-need-animations — [verified]
- R183. **Interaction feedback 200 ms at most** — Rauno, https://interfaces.rauno.me/ — [verified]
- R184. **100 ms for simple feedback (toggle, checkbox); 200–300 ms for substantial changes (modal); 400 ms is very slow; at 500 ms it "feels like a real drag"; a 250 → 300 ms change is noticeable** — NN/g, https://www.nngroup.com/articles/animation-duration/ — [verified]
- R185. **Find the shortest duration that is not jarring** — NN/g, same URL — [verified]
- R186. **Hover: in fast, out slow — 125–150 ms entering, 400–450 ms leaving; general hover range 125–250 ms** — snappy response, relaxed release — Josh W. Comeau, https://www.joshwcomeau.com/animation/css-transitions/ — [verified]
- R187. **Modal: ease-out in, quicker ease-in out** — Josh W. Comeau, same URL — [verified]
- R188. **M3 duration tokens: short 50/100/150/200 ms; medium 250/300/350/400 ms; long 450/500/550/600 ms; extra-long 700/800/900/1000 ms** — small elements short, large-area or full-screen moves long — Material Design 3 tokens, https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-motion.scss — [verified]
- R189. **Stripe keeps animations under 500 ms as a rule** (the 800 ms entrance above is the exception with a front-loaded curve) — Stripe, https://stripe.com/blog/connect-front-end-experience — [verified]
- R190. **Loading indicators: show after ~150–300 ms delay, keep for at least ~300–500 ms** — avoids flicker — Vercel, https://vercel.com/design/guidelines — [verified]
- R191. **Dropdown close delay ~300 ms so a diagonal mouse path does not close it** — Josh W. Comeau, https://www.joshwcomeau.com/animation/css-transitions/ — [verified]
- R192. **First tooltip has a delay; the next ones in the same group open instantly with no animation (`transition-duration: 0ms`)** — Emil Kowalski, https://emilkowal.ski/ui/7-practical-animation-tips; Vercel guidelines — [verified]

### 5.3 What and how to animate

- R193. **Animate `transform` and `opacity` only; never `width/height/top/left/margin/padding`; treat `background-color`, shadows and blurs as costly** — compositor-only properties avoid layout and paint — web.dev, https://web.dev/articles/animations-guide; Emil Kowalski, https://emilkowal.ski/ui/great-animations; Vercel guidelines — [verified]
- R194. **Never `transition: all`; list the properties** — Vercel, https://vercel.com/design/guidelines — [verified]
- R195. **Never animate from `scale(0)`; start at 0.9+ with opacity 0 (dialogs 0.8 → 1, buttons/small 0.9 → 1)** — nothing real appears from nothing — Emil Kowalski, https://emilkowal.ski/ui/7-practical-animation-tips and https://emilkowal.ski/ui/css-transforms; Rauno, https://interfaces.rauno.me/ — [verified]
- R196. **Press state: `scale(0.97)` on `:active` with a 150 ms ease-out transition** — the button "listens" — Emil Kowalski, https://animations.dev/learn/animation-theory/the-easing-blueprint — [verified]
- R197. **Set `transform-origin` to where the element comes from (popover from its trigger, not center)** — Emil Kowalski, 7-practical-animation-tips; Vercel guidelines — [verified]
- R198. **Translate in percentages of the element's own size (`translateY(100%)`), not fixed px** — works for any height — Emil Kowalski, https://emilkowal.ski/ui/css-transforms — [verified]
- R199. **Use CSS transitions, not keyframes, for anything that can be interrupted** — transitions retarget mid-flight, keyframes jump — Emil Kowalski, https://emilkowal.ski/ui/building-a-toast-component — [verified]
- R200. **Animations must be interruptible and cancelable by input** — Emil Kowalski, great-animations; Vercel guidelines; Apple HIG Motion, https://developer.apple.com/design/human-interface-guidelines/motion — [verified]
- R201. **Add `filter: blur(2px)` during a crossfade to hide the awkward middle** — Emil Kowalski, 7-practical-animation-tips — [verified]
- R202. **Reveal with `clip-path: inset(0 0 100% 0)` → `inset(0 0 0 0)` instead of animating height** — GPU-accelerated, no layout shift; works for text and image reveals — Emil Kowalski, https://emilkowal.ski/ui/the-magic-of-clip-path — [verified]
- R203. **Stacked depth: each layer behind is scaled down by 0.05 and offset 14 px** (`scale(0.95)`, `scale(0.9)`) — Emil Kowalski, building-a-toast-component — [verified]
- R204. **Hover lift: trigger on a static parent, move the child** — otherwise the element moves out from under the cursor and flickers — Josh W. Comeau, https://www.joshwcomeau.com/animation/css-transitions/ — [verified]
- R205. **Hover styles only inside `@media (hover: hover)`** — no stuck hover on touch — Rauno, https://interfaces.rauno.me/ — [verified]
- R206. **`will-change: transform` only on elements that will animate, and sparingly** — fixes the text "snap" at start/end but costs GPU memory — Josh W. Comeau, css-transitions; web.dev animations-guide — [verified]
- R207. **Do not drive drag/scroll positions through an inherited CSS variable on a big subtree; set `transform` directly on the element** — variable changes recalc all children — Emil Kowalski, building-a-drawer-component — [verified]
- R208. **Preference order: CSS, then Web Animations API, then JS libraries** — Vercel, https://vercel.com/design/guidelines — [verified]
- R209. **Theme switch must not trigger transitions** — Rauno, https://interfaces.rauno.me/ — [verified]

### 5.4 Springs

- R210. **Springs for movement (position, scale, gestures); not for color or opacity** — Josh W. Comeau, https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/ — [verified]
- R211. **Most good springs do not bounce: high friction/damping gives smooth "molasses" motion** — Josh W. Comeau, same URL — [verified]
- R212. **Example parameters: stiffness 235, damping 10 (design-system spring); sandbox default mass 1.75, tension 200, friction 12** — Josh W. Comeau, https://www.joshwcomeau.com/animation/linear-timing-function/ and spring-physics URL — [verified]
- R213. **Native CSS springs via `linear()` with ~25–50+ points; store as a custom property with a `cubic-bezier` fallback inside `@supports`** — ~88% support Oct 2025; three max-accuracy springs cost ~1.3 kB — Josh W. Comeau, linear-timing-function URL — [verified]
- R214. **Motion tokens: ~80% of transitions should use the shared easing tokens** — if more than 20% are custom, the tokens are wrong — Josh W. Comeau, same URL — [verified]
- R215. **Common Framer Motion/Motion starting point: `type: "spring", stiffness: 300–400, damping: 30`, or `duration` + `bounce: 0–0.2`** — Emil's course lessons are JS-rendered/paid and could not be read — [recalled]

### 5.5 Entrance choreography, stagger, scroll

- R216. **Stagger with `animation-delay` plus `animation-fill-mode: backwards` (or `both`)** — elements hold their first keyframe during the delay instead of flashing in place — Josh W. Comeau, https://www.joshwcomeau.com/animation/keyframe-animations/ — [verified]
- R217. **Stagger step 30–80 ms per item, total sequence under ~500–700 ms; distance 8–24 px with opacity 0 → 1** — common practice; no fetched page gives these numbers — [recalled]
- R218. **Trigger entrance once with IntersectionObserver, then disconnect** — Stripe fires at full visibility and never replays — Stripe, https://stripe.com/blog/connect-front-end-experience — [verified]
- R219. **Scroll-linked motion in CSS: `animation-timeline: view()` + `animation-range: entry 25% cover 50%` (declare `animation-timeline` after the `animation` shorthand)** — runs off the main thread, no scroll listeners — Chrome for Developers, https://developer.chrome.com/docs/css-ui/scroll-driven-animations — [verified]
- R220. **Scrolljacking disorients most users: keep it below the fold, vertical only, with little text, never on mobile, and mix it with normal scrolling** — worst case is hijacked scroll plus animated text — NN/g, https://www.nngroup.com/articles/scrolljacking-101/ — [verified]
- R221. **Animate only to clarify cause/effect or for deliberate delight; ask "what is the purpose"; the more often a thing is seen, the less it animates; never animate keyboard-triggered actions** — Emil Kowalski, https://emilkowal.ski/ui/you-dont-need-animations; Rauno, https://rauno.me/craft/interaction-design; Vercel guidelines — [verified]
- R222. **Elements enter and leave from the same direction** — spatial consistency — Emil Kowalski, you-dont-need-animations; Apple HIG Motion — [verified]
- R223. **Pause looping animations and videos when off-screen** — Rauno, https://interfaces.rauno.me/ — [verified]
- R224. **Looping background video: `<video autoplay muted loop playsinline>`, not GIF; provide a still for reduced motion; autoplay motion longer than 5 s needs a pause control** — Vercel, https://vercel.com/design/guidelines — [verified]
- R225. **Target 60 fps; test on iOS Low Power Mode and Safari, with CPU throttling** — Emil Kowalski, great-animations; Vercel guidelines — [verified]
- R226. **Avoid sustained oscillation, especially around 0.2 Hz (one cycle per 5 s)** — people are most sensitive to that frequency; keep amplitude low — Apple HIG Motion, https://developer.apple.com/design/human-interface-guidelines/motion — [verified]

### 5.6 Reduced motion

- R227. **Under `prefers-reduced-motion: reduce` remove: parallax, scroll-reveal from off-screen, animated gradients, background video, autoplay, attention-grabbing loops. Keep: functional feedback, fades, loading placeholders** — vestibular triggers are large movement and things moving at different speeds than the scroll — web.dev, https://web.dev/articles/prefers-reduced-motion — [verified]
- R228. **Replace movement with an opacity fade instead of removing feedback entirely** — Emil Kowalski, https://emilkowal.ski/ui/great-animations — [verified]
- R229. **Write motion inside `@media (prefers-reduced-motion: no-preference)` so "no motion" is the default** — Josh W. Comeau, https://www.joshwcomeau.com/animation/linear-timing-function/ — [verified]
- R230. **Motion is never the only carrier of information** — Apple HIG Motion, https://developer.apple.com/design/human-interface-guidelines/motion — [verified]

---

## 6. Tells of cheap, template or AI-generated design, and the fix

Each line: tell → fix → source.

- R231. **Pure #000 background and pure #fff text → tinted near-black (`hsl(H 10% 10%)`) and off-white (`hsl(H 15% 85%)`)** — Refactoring UI palette; web.dev color scheme (R104, R118–R120) — [verified]
- R232. **One big blurry `rgba(0,0,0,…)` shadow → layered, offset, hue-matched shadow with a consistent light direction** — Comeau; Ahlin; Vercel (R151–R157) — [verified]
- R233. **Borders around everything → spacing, background steps, soft low-contrast dividers** — Refactoring UI; Linear (R82, R83) — [verified]
- R234. **Hierarchy by size alone, everything bold → weight + color tiers, one loud element per view** — Refactoring UI; Kennedy; NN/g (R43, R47, R7) — [verified]
- R235. **Grey text on a colored or gradient surface → same-hue tint or translucent white** — Refactoring UI (R137) — [verified]
- R236. **Light/thin font weights for elegance → 400+ and get elegance from size, spacing and tracking** — Refactoring UI; Apple; Rauno (R44, R45) — [verified]
- R237. **All-caps labels with default tracking, or caps paragraphs → +0.05–0.12em, one line max** — Butterick (R26, R41) — [verified]
- R238. **Big headings with body line-height (1.5) and default tracking → 1.0–1.2 line-height, tightened tracking, balanced wrap** — Tailwind scale; Comeau; Butterick (R21, R27, R38) — [verified]
- R239. **Full-width paragraphs → 45–75 characters** — Butterick; Kennedy (R35, R36) — [verified]
- R240. **Straight quotes, three dots, hyphens as dashes, fake small caps → real typographic characters** — Butterick; Typewolf; Vercel (R65–R67) — [verified]
- R241. **Too many fonts or a novelty font → one family with a display cut, or two fonts with written roles** — Butterick; Kennedy; Apple (R53, R59, R60) — [verified]
- R242. **Tiny icons scaled up 3–4× → icon at native size inside a tinted shape** — Refactoring UI (R99) — [verified]
- R243. **Everything animates, 500 ms+, default `ease`/`ease-in-out`, `transition: all`, pop-in from `scale(0)` → under 300 ms, custom ease-out, listed properties, 0.9+ start scale** — Emil Kowalski; Vercel; NN/g (R174, R182, R194, R195) — [verified]
- R244. **Popovers scaling from center → origin-aware `transform-origin`** — Emil Kowalski (R197) — [verified]
- R245. **Layout shifts on hover (weight change) and on load (fonts, images, skeletons that do not match) → fixed weights, preloaded fonts, explicit image dimensions, skeletons that mirror content** — Kennedy; Rauno; Vercel (R49, R71) — [verified]
- R246. **Banded dark gradients and muddy mid-gradient grey → noise/image gradients, radial glows, OKLCH interpolation** — Vercel; Rauno; Comeau (R142, R143) — [verified]
- R247. **Glass cards with weak blur over busy backgrounds, glass on content → heavy blur, stroke for thickness, glass only on navigation** — NN/g; Apple (R166, R168) — [verified]
- R248. **Mismatched nested radii → concentric radii** — Vercel (R98) — [verified]
- R249. **Light scrollbars and white native controls on a dark page → `color-scheme: dark`, `theme-color`** — Vercel (R133) — [verified]
- R250. **Dead zones, non-clickable things that look clickable, focus ring missing → full hit targets, visible `:focus-visible` ring (use `box-shadow` for the ring)** — Vercel; Rauno — [verified]
- R251. **Template sameness: "we swapped ugly for boring" — hamburger over full-bleed stock photo, the same grid everyone uses → make at least one deliberate, non-template decision per page** — Butterick, https://practicaltypography.com/websites.html — [verified]
- R252. **AI output is weakest exactly where premium lives: bold, novel, tightly constrained designs outside its training data; one-shot prompting skips the process that produces good design** — Erik Kennedy, https://www.learnui.design/blog/wheres-the-ai-design-renaissance.html — [verified]
- R253. **Typical AI-generated landing page look: purple-to-blue gradient on near-black, Inter everywhere at default tracking, three equal feature cards with emoji or stock icons, glow behind every card, centered everything, uniform section rhythm → pick one accent, a display face, asymmetric layout, vary section density, one hero idea** — observation from general practice; no source in this run lists it — [recalled]
- R254. **Colored blobs/shapes with no relation to the brand → backgrounds must "match your brand or motif"; solve it one level up: "how do great designs make backgrounds interesting, and which technique fits here?"** — Erik Kennedy / Hobday, spice-up-designs; Kennedy, mesh-gradients — [verified]

---

## 7. Process: how these teachers critique a page

- R255. **Squint test: blur the page (5–20 px) or squint; what you see first, second, third must match the importance order you wrote down beforehand** — NN/g, https://www.nngroup.com/articles/visual-hierarchy-ux-definition/; Erik Kennedy, https://www.learnui.design/blog/squint-test-ui-design-case-study.html — [verified]
- R256. **Write the page goals and the 1-2-3 priority list before designing** — "if you have not defined goals you can only meet them by accident" — Erik Kennedy, same URL — [verified]
- R257. **Grayscale pass first, color last** — Erik Kennedy, 7-rules part 1 — [verified]
- R258. **Design every state, not the happy screen: empty, sparse, dense, error, loading; short, average and very long content** — Vercel, https://vercel.com/design/guidelines; Kennedy's CRUD check — [verified]
- R259. **Copy the best work to learn ("be a parrot until you can mimic the best"); keep a reference set** — Erik Kennedy, 7-rules part 2; Shift Nudge has a lesson "Using Reference Material", https://shiftnudge.com/curriculum — [verified]
- R260. **Daily full-screen iterations and stress tests of environment, appearance and hierarchy; designers and engineers paired; no workshops** — Linear, https://linear.app/now/how-we-redesigned-the-linear-ui — [verified]
- R261. **Review animations later with fresh eyes; slow them down and step frame by frame; inspect and rebuild animations you admire** — Emil Kowalski, great-animations and css-transforms — [verified]
- R262. **Specify motion as a table: element, trigger, property, duration in ms, easing** — unambiguous handoff — NN/g, https://www.nngroup.com/articles/animation-duration/ — [verified]
- R263. **Visual polish changes perceived usability and trust (aesthetic-usability effect)** — the business case for the last 10% of craft — NN/g, https://www.nngroup.com/articles/aesthetic-usability-effect/ (page not fetched in this run) — [recalled]
- R264. **Shift Nudge public curriculum as a critique checklist (lesson titles only, content is paid): Font Size, Font Weight, Hierarchy, Titles & Body, Callouts; Grids & Containers, Implicit Grid, Negative Space, Alignment, Optics vs. Math, High & Low Density, Scale/Weight/Hierarchy; Contrast & Accessibility, Structural vs. Interactive color, Gradients, Nifty Shades of Grey, White & Almost White, Secrets of Dark UI; Subtlety is Key, Corner Radius, Borders & Dividers, Depth/Lighting/Shadow, Opacity & Blur, Marketing Site Style** — walk a page through these headings in order — Shift Nudge (MDS), https://shiftnudge.com/curriculum — [verified]
- R265. **Pre-ship checklist from Vercel: reduced-motion variant, focus states, hit targets, no layout shift, curly quotes, tabular numbers, `color-scheme`, layered shadows, concentric radii, hover/active contrast, banding** — Vercel, https://vercel.com/design/guidelines — [verified]

---

## Top 25 rules for a dark premium typographic landing page

1. Background is tinted near-black, never #000: `hsl(H 10% 10%)`; pure black and white only for deepest shadow and brightest highlight (R118, R119, R104).
2. Surface ladder +5% lightness per level (10 / 15 / 20 / 25%), saturation 5–10%; elevation = lighter surface, not a bigger shadow (R119, R122).
3. Text is off-white `hsl(H 15% 85%)`, secondary `hsl(H 5% 65%)`; hierarchy by 2–3 text tiers and 2 weights before size (R120, R43, R44).
4. Contrast floor 4.5:1, target 7:1 for small text; small text on dark is the weak spot, so keep it larger and never below weight 400 (R126, R129, R44).
5. One accent; in dark halve its saturation and lower lightness; use it rarely (R121, R139).
6. Body 18–22 px, measure 45–75 characters (`max-inline-size: 66ch`), line-height 1.45–1.6 (R2, R35–R37, R18).
7. Display headings: line-height 1.0–1.15, tightened tracking, `text-wrap: balance` (R21, R27, R38).
8. Tracking is per size: negative on display, zero on body, +0.05–0.12em on all-caps labels (R26, R29, R30).
9. All caps only for labels under one line, always tracked; use real small caps or none (R41, R67).
10. One family with a display cut and a text cut, or two fonts with written roles; variable font with optical sizing (R62, R59, R63).
11. Few sizes: about 4 roles, with big jumps at the top of the scale and one dominant element per view (R6, R7, R9).
12. Double the whitespace; group by proximity; fewer borders, softer dividers: "structure felt, not seen" (R79, R81–R83).
13. Align everything to something on purpose; fix the last 1 px optically; hang punctuation (R89, R91, R72).
14. One light source from above; every shadow and highlight obeys it (R150, R151).
15. Layered shadows (4–6 layers, doubling), hue-tinted and much stronger on dark; pair with a 1 px semi-transparent border (R154, R158, R160).
16. Concentric radii; child radius ≤ parent (R98).
17. Gradients in OKLCH, glows as radial gradients, dark fades as images with noise to avoid banding (R142, R143).
18. Glass only on the navigation layer, with heavy blur and an edge highlight (R164–R168).
19. Animate transform and opacity only; never `transition: all` (R193, R194).
20. Custom ease-out for entrances (e.g. `cubic-bezier(0.05, 0.7, 0.1, 1)` or `cubic-bezier(0.32, 0.72, 0, 1)`), ease-in-out for on-screen moves, never ease-in (R170–R178).
21. Durations: 100–150 ms hover/press, 200–300 ms UI, up to 500–800 ms only for large hero entrances with a front-loaded curve; hover in fast, out slow (R182–R188, R177).
22. Never start from `scale(0)`; start at 0.9+ with opacity; press = `scale(0.97)`; correct `transform-origin` (R195–R197).
23. Entrance choreography: reveal once on view, stagger with `backwards` fill, clip-path reveals for text; no scrolljacking (R216, R218, R202, R220).
24. Reduced motion: drop parallax and scroll reveals, keep fades; write motion inside `no-preference` (R227–R229).
25. Typographic hygiene and platform polish: curly quotes, real dashes, `tabular-nums`, `&nbsp;`, antialiasing, preloaded subsetted fonts, `color-scheme: dark` (R65, R68, R69, R71, R133).

---

## Sources that were paywalled, unreachable or only partly readable

- **Refactoring UI book and videos** — paid. Used only the public Medium article, two public previews (`/previews/building-your-color-palette`, `/previews/labels-are-a-last-resort`) and Tailwind's default theme. The book's spacing scale and other book-only numbers are marked [recalled].
- **Shift Nudge (MDS)** — lessons paid. Only the public curriculum page (lesson titles) was read; "the 16 principles" are mentioned on the homepage but not listed publicly.
- **Learn UI Design course (Erik Kennedy)** — paid. Free blog articles were read. Two guessed URLs returned 404 (`spacing-and-layout-ui-design`, `the-ultimate-guide-to-dark-mode-design`, `font-pairing`); the real pairing article is `guide-pairing-fonts.html`. The "Complete Guide to Font Sizes" landing chapter has no numbers on its first page; numbers came from the responsive-web chapter.
- **animations.dev (Emil Kowalski)** — course paid; free lessons are JS-rendered. Only "The Easing Blueprint" returned text; `spring-animations` and `timing-and-purpose` returned empty shells. Emil's own blog articles were read instead.
- **Material Design 3 site (m3.material.io)** and **Material 2 dark theme page (m2.material.io)** — JS-only, no content. M3 values taken from Google's token files; M2 dark-theme overlay percentages are [recalled].
- **Apple HIG** — JS-only pages; content read from Apple's JSON data files for typography, layout, color, dark-mode, motion, materials.
- **Google Fonts Knowledge** — JS-only; pairing lesson read from the `google/fonts` repository. The Cyrillic entry is a glossary definition with no setting rules.
- **Rauno Freiberg, "Invisible Details of Interaction Design"** (`rauno.me/craft/invisible-details`) — server error 500. `interfaces.rauno.me` and `rauno.me/craft/interaction-design` were read.
- **Flux Academy (Ran Segall)** — courses paid; guessed blog URLs 404; the blog index was reachable but shows only teasers. No rules recorded.
- **Design+Code** — site returned an empty shell (JS-only). No rules recorded.
- **SuperHi** — course catalogue page only; no craft rules stated publicly on it. No rules recorded.
- **Frontend Masters, Design for Developers (Sarah Drasner)** — video paid; the public repo README lists only resources (slides are PDFs, not read). No rules recorded.
- **Josh W. Comeau, CSS for JS Developers / Whimsical Animations** — courses paid; free blog posts were read.
- **Typewolf** — pairing lookbooks and the Flawless Typography Checklist are paid; `type-pairing-tips` 404. Only the free Cheatsheet was read. **Fonts In Use** was not fetched.
- **Linear** — two design articles read; `design-for-the-ai-age` is about AI product form, no visual rules. **Stripe** — two engineering/design blog posts read.
- **Vercel Geist** — typography and colors pages list class names and usage but not the numeric line-height/tracking values in the fetched HTML.
- **NN/g aesthetic-usability effect** — not fetched (fetch tool hit its session limit); marked [recalled].
- **Utopia fluid type (Clearleft)** — reachable, but UK, outside the US scope; not used for rules.
- Tooling note: the page-fetch tool hit a session limit midway; the remaining pages were downloaded directly and read as text, so they are still [verified].
