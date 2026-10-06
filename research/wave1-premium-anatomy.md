# Wave 1 — Anatomy of a $10k+ site (US/EU public evidence)

Target of application: dark, immersive, typographic one-page site for a high-ticket business consultant. Audience: established entrepreneurs and experts who are already looking for a solution.

Research date: 2026-10-06. Method: WebSearch + WebFetch on public pages, paraphrased.

**Marking**
- `[verified]` — the claim is on a page fetched in this session (URL given). "Verified" means "the source says it", not "it is true": several sources are studio/vendor blogs, and those are flagged `(secondary)`.
- `[recalled]` — from prior knowledge of the field, not fetched in this session. Treat as a working hypothesis. All concrete CSS/GLSL values marked `[recalled]` are suggested starting values, not measured facts.

**Item format:** Pattern — how it is done — why it reads premium — source.

---

## 0. What the juries actually score

- **J1. Awwwards weights** — Design 40%, Usability 30%, Creativity 20%, Content 10% — design and usability together are 70% of the score, so fundamentals outweigh novelty. `[verified]` https://www.awwwards.com/about-evaluation/
- **J2. Awwwards thresholds and process** — Honorable Mention at 6.5+ from the jury; Developer Award for sites above 7 on the developer jury; minimum 18 jurors, the 3 scores furthest from the average are dropped, voting runs 5 days — a site has to be consistently good to many eyes, not brilliant to one. `[verified]` https://www.awwwards.com/about-evaluation/
- **J3. What each Awwwards criterion means in practice** — Design: hierarchy, typography, palette, micro-details, consistency. Usability: navigation clarity, load performance, responsive, accessibility. Creativity: custom interaction patterns, 3D, sound, a concept. Content: real content, copy quality, content-design integration — this is the practical decomposition to review against. `[verified] (secondary)` https://www.utsubo.com/blog/award-winning-website-design-guide
- **J4. Where points are lost** — animation that drops frames costs more Usability than it earns in Creativity; mobile as an afterthought; missing focus states and reduced-motion support; placeholder content — every one of these is cheaper to fix than to add a new effect. `[verified] (secondary)` https://www.hontran.dev/blog/awwwards-judging-criteria
- **J5. CSS Design Awards** — three criteria: UI, UX, Innovation; Website of the Day needs an average judge score above 8.00, Special Kudos above 6 — same shape as Awwwards: two thirds is interface quality, one third is novelty. `[verified]` https://www.cssdesignawards.com/about
- **J6. FWA** — international jury assessing Innovation, Design, Creativity, Content, User experience; positioned toward experimental and immersive WebGL work — FWA rewards boldness more than Awwwards does. `[verified] (secondary; thefwa.com itself returned no readable body)` https://www.webdesignawards.io/compare/awwwards-vs-fwa
- **J7. Common denominator of winners** — one signature moment that makes a visitor stop scrolling, real content, intentional mobile design, sustained 60fps, custom interaction patterns. `[verified] (secondary)` https://www.utsubo.com/blog/award-winning-website-design-guide
- **J8. Common reasons a submission fails** — template/page-builder foundation left visible, mobile afterthought, slow load, inconsistent system across sections, no memorable moment. `[verified] (secondary)` same URL. Note: the same source claims builders disqualify a site, but the 2025 Site of the Year (Lando Norris) is built on Webflow + WebGL + Rive, and OFF+BRAND state Aether1 was built entirely in Webflow — the tool is not the tell, the default look is. `[verified]` https://www.itsoffbrand.com/our-work/lando-norris , https://tympanus.net/codrops/2026/08/17/creativity-at-enterprise-scale-without-compromise-the-offbrand-story/
- **J9. Site of the Year list 2022–2025** — 2025: Lando Norris (OFF+BRAND), Messenger (abeto); 2024: Igloo Inc (abeto), Don't Board Me (The First The Last), Opal Tadpole (Claudio Guglieri); 2023: Lusion v3 (Lusion), Noomo Agency, Mana Yerba Mate (Louis Paquet); 2022: KPR (Resn), The Other Side of Truth. `[verified]` https://www.awwwards.com/websites/sites_of_the_year/
- **J10. What those winners share** — every one is built around a single object or world that carries the idea (a helmet, an ice block, a planet, a product); none is a stack of interchangeable sections. `[recalled]` synthesis over J9 plus the case studies below.

---

## 1. What $10k / $25k / $50k buys (pricing evidence)

- **P1. Generic US agency tiers** — $5k: 3–5 pages on Framer, limited revisions, 2–3 weeks. $10k: custom WordPress build of 8–15 pages, two revision rounds, standard integrations, 5–7 weeks. $25k: strategy-led, full discovery, bespoke design system, WCAG 2.2 AA, content migration and editorial review, 2 months of support, 10–14 weeks. $50k+: custom development, complex integrations, accessibility audit, performance optimization, 3–6 months of support, 4–6+ months. `[verified]` https://www.designrush.com/agency/website-design-development/pricing
- **P2. Hours** — simple 1–5 page project: 8 strategy + 40 design + 80 development + 10 QA = 138 hours; average rate quoted $145/hr. `[verified]` same URL. My arithmetic, not the page's: 138 h × $145 ≈ $20k, i.e. a one-pager that honestly reads as "$10k" has about 70 hours of concentrated design and build visible in it.
- **P3. Roles and rates** — agency rates: senior web designer $120–250/hr, UX/UI specialist $100–300/hr, frontend developer $80–200/hr. `[verified]` https://projectcostestimator.com/blog/web-design-pricing-guide-2026
- **P4. Award-level budgets** — $30–60k / 8–12 weeks for a CSSDA WOTD or Awwwards Honorable Mention target; $60–120k / 12–18 weeks for SOTD-ready; $120–200k+ / 18–24 weeks for SOTD+SOTM. `[verified] (secondary, a studio's own estimate)` https://www.utsubo.com/blog/award-winning-website-design-guide
- **P5. Immersive brand sites take months** — 3–9 months by scope, 5–7 typical for a full brand site. `[verified] (secondary)` https://metabole.studio/en/blog/immersive-website-examples
- **P6. Counter-example on time** — the Lando Norris site (Site of the Year) was designed and built in under two months by a 30-person studio, with a "maximum impact" approach and no broad design system. `[verified]` https://tympanus.net/codrops/2026/08/17/creativity-at-enterprise-scale-without-compromise-the-offbrand-story/
- **P7. What the money is visible as** — (a) discovery turned into a single defended idea, (b) a bespoke type and spacing system, (c) one custom interaction nobody else has, (d) written copy, not filler, (e) QA across devices, (f) accessibility and performance work. In a $5k build (a)–(c) and (f) are missing. `[recalled]` synthesis of P1 + J3.
- **P8. Content takes longer than code** — the Dash Creative team reports content refinement consumed more project time than technical implementation. `[verified]` https://tympanus.net/codrops/2026/07/21/magnetic-commerce-building-the-dash-creative-website/

Reading for our case: at $10k nobody is paying for a 3D engine. They pay for a decided idea, a typographic system, one signature interaction, real copy, and zero visible defects.

---

## 2. Anatomy: sections, pacing, scroll length

- **A1. Scene logic, not page logic** — the page is sequenced like film: beats, reveals, pauses; each section is one beat with one statement — a template stacks blocks, a commission edits a sequence. `[verified] (secondary)` https://metabole.studio/en/blog/immersive-website-examples
- **A2. One defended idea** — one idea carried from the first viewport to the footer; every section either advances it or is cut. `[verified] (secondary)` same URL; echoed by Obys: story clarity drives system clarity. `[verified]` https://tympanus.net/codrops/2026/03/06/obys-the-small-studio-designing-big-digital-narratives/
- **A3. Editorial rhythm: statement, silence, statement** — Obys compare a site to long-form publication with tension, contrast and deliberate silence between strong statements — the "silence" (an almost empty viewport) is what a template never has. `[verified]` same Obys URL.
- **A4. Alternate quiet and loud sections** — Kononenko: loader and basic pages kept deliberately plain, expressive interaction only where it carries meaning; interaction gets stronger when surrounded by simplicity. `[verified]` https://tympanus.net/codrops/2026/09/18/kononenko-architectural-bureau/
- **A5. Few sections** — Igloo Inc (Site of the Year 2024) is three sections; ZERO is six stages joined by five gates; Aether1 has seven anchors; Cartier Watches & Wonders is six rooms, one per watch — premium one-pagers are 3–7 chapters, not 12 blocks. `[verified]` https://www.awwwards.com/igloo-inc-case-study.html , https://tympanus.net/codrops/2026/07/17/zero-the-engineering-behind-a-defiant-interactive-narrative/ , https://tympanus.net/codrops/2025/08/06/building-aether-1-sound-without-boundaries/ , https://www.utsubo.com/blog/best-threejs-websites-2026
- **A6. One room per item** — each offer/argument gets its own full viewport with breathing room instead of a card in a row of three. `[verified] (secondary)` https://www.utsubo.com/blog/best-threejs-websites-2026
- **A7. Recommended chapter list for a consultant one-pager** — 1 Thesis (hero) / 2 The situation the visitor is already in / 3 The system (the object assembles) / 4 Proof (2–3 cases with numbers) / 5 How the engagement runs and what it costs / 6 Who it is for and who it is not / 7 Closing invitation. Seven chapters, each one viewport of statement plus at most one viewport of detail. `[recalled]` synthesis of A5, T-section and S-section.
- **A8. First viewport composition** — one line of display type that is a claim, one small label line (who/what), one quiet CTA, the object, nothing else; navigation reduced to a wordmark and 1–2 links — Dash Creative: black background, minimal hero, effect sits behind the type to add depth without competing. `[verified]` https://tympanus.net/codrops/2026/07/21/magnetic-commerce-building-the-dash-creative-website/
- **A9. Hero that waits** — bleibtgleich'26: instead of hitting the eye on the first screen, the site waits until the visitor looks closer — restraint in the first viewport reads as confidence. `[verified]` https://tympanus.net/codrops/2026/09/23/bleibtgleich26-a-180-turn-from-brutalism-to-minimalism/
- **A10. Sticky graphic + moving text** — the proven scroll-story structure: the visual stays pinned, text blocks scroll past and act as triggers that move the visual to its next state; native scroll is not altered. Use this for chapters 2–5. `[verified]` https://pudding.cool/process/how-to-implement-scrollytelling/
- **A11. Chunking** — Apple product pages break copy into small blocks separated by whitespace and reveal one feature at a time — reading feels like less commitment. `[verified] (secondary analysis)` https://uxplanet.org/8-things-i-learned-analyzing-apples-product-pages-9a5284681b37
- **A12. Scroll-scrubbed sequence as a pinned chapter** — Apple's technique: a canvas, a preloaded frame sequence (148 frames in the analysed example), scroll fraction mapped to frame index inside a tall container; heavy assets get a light fallback on slow connections. `[verified]` https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/
- **A13. Chapter transitions carry the visual language** — Igloo: chromatic aberration, displacement and frost between scenes; HAOQI: one dot-matrix mask used for hovers, page transitions and loading; Goodgrowth: five-bar wipe revealing the title — the transition is designed once and reused, not a different fade per section. `[verified]` https://www.awwwards.com/igloo-inc-case-study.html , https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/ , https://tympanus.net/codrops/2026/08/27/goodgrowth-boot-sequences-spinning-discs-and-the-art-of-the-portfolio/
- **A14. Transitions must be interruptible** — Kononenko: the user can navigate mid-animation without a jarring result — locked animations read as a demo reel, not a product. `[verified]` https://tympanus.net/codrops/2026/09/18/kononenko-architectural-bureau/
- **A15. Navigation as part of the story** — Immersive Garden use 3D Roman numerals as chapter anchors with one-click access; OFF+BRAND treat navigation as integral to storytelling; Obys keep the logo as the one stable element across pages. `[verified]` https://www.awwwards.com/case-study-immersive-gardens-new-website.html , https://tympanus.net/codrops/2026/08/17/creativity-at-enterprise-scale-without-compromise-the-offbrand-story/ , https://tympanus.net/codrops/2026/05/14/designing-ourselves-the-new-obys-identity-and-website/
- **A16. Progress indication** — chapter index "03 / 07" in mono in a fixed corner, plus a thin progress line or the active numeral highlighted; Goodgrowth show scroll percentage as a fill on the project icon. `[verified]` for the Goodgrowth fill (URL above); the "NN / NN" convention is `[recalled]`.
- **A17. Keep an exit visible inside pinned sections** — NN/g found users need visible navigation to escape a long scroll-driven sequence. `[verified]` https://www.nngroup.com/articles/scrolljacking-101/
- **A18. Scroll-driven rules from user research** — do not change scroll direction; keep text inside altered-scroll sections minimal; include normal sections between them; avoid on mobile; most participants felt at least mild disorientation when sequences ran long. `[verified]` same NN/g URL.
- **A19. Preloader as first frame of the story** — Igloo: a real-time intro that sets the tone before the main scene; Goodgrowth: a console boot screen counting to 100 with the logo's O's swapped for 0's; ULTRAGRID: a loader so the first impression is intentional rather than a blank flash. `[verified]` https://www.awwwards.com/igloo-inc-case-study.html , Goodgrowth URL above, https://tympanus.net/codrops/2026/09/30/ultragrid-portfolio/
- **A20. Or keep the preloader plain** — Kononenko keep it simple on purpose; the rule is that it is either part of the idea or invisible, never a generic spinner. `[verified]` Kononenko URL above.
- **A21. Unlock gesture instead of an Enter button** — ZERO opens only after the visitor draws a zero; the entry action is the theme. `[verified]` ZERO URL above. For a consultant site this is too much friction; use the idea only as a scroll-triggered first assembly. `[recalled]` judgement.
- **A22. Wait for input to settle before unlocking scroll** — Goodgrowth unlock scroll after a 220 ms gap in input with a 4-second safety cap — stops the visitor from scrolling past the intro by accident. `[verified]` Goodgrowth URL above.
- **A23. Footer as a final scene** — Igloo end on an interactive particle simulation holding the links; the last viewport is designed as a destination. `[verified]` https://www.awwwards.com/igloo-inc-case-study.html
- **A24. Closing CTA convention** — the footer is one oversized line (the invitation), one action, then a small mono strip: email, city/time zone, year, legal — the same scale contrast as the hero, so the page closes the way it opened. `[recalled]`
- **A25. Loop or return** — Aether1 uses an infinite scroll where two scene instances swap at the ends; a lighter version is a "back to top" that replays the first assembly. `[verified]` for Aether1: https://tympanus.net/codrops/2025/08/06/building-aether-1-sound-without-boundaries/
- **A26. Leave things out** — Obys' own relaunch deliberately omits awards, archives and extended content and shows a curated selection. `[verified]` Obys redesign URL above.
- **A27. Scroll length** — no fetched source states a pixel length. Working rule: 7 chapters × roughly 1.5–2.5 viewports each; anything pinned longer than about 3 viewports with one idea feels stalled. `[recalled]`

---

## 3. Craft details — which ones signal premium and how they are done

- **C1. Hover transitions** — 150–200 ms, never instant, never bouncy — instant state changes and elastic bounces are named as cheap signals. `[verified] (secondary)` https://madebyevoke.com/blog/what-makes-a-website-look-expensive
- **C2. Easing with a reason** — Roman Jean-Elie uses `back.out(1.2)` only on the contact reveal so letters "pop into place"; one expressive ease in one place, calm eases everywhere else. `[verified]` https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/ Default for everything else: expo/quart out, 0.6–1.2 s for reveals. `[recalled]`
- **C3. Cursor-reactive surface with decay** — Dash Creative smooth the pointer velocity before it reaches the shader (`speedDecay: 0.86`), so distortion continues in the direction of travel; Goodgrowth's field "decays rather than resets", so the effect trails and settles — lag and decay are what make it feel physical. `[verified]` https://tympanus.net/codrops/2026/07/21/magnetic-commerce-building-the-dash-creative-website/ , Goodgrowth URL above.
- **C4. Soft falloff, no spotlight** — the pointer effect uses a soft mask and stays behind the type. `[verified]` Dash Creative URL above.
- **C5. One pointer source for everything** — HAOQI convert pointer position once per frame to 0–1 space and feed DOM readouts, camera parallax and shader from the same value — everything on screen reacts in the same frame, which is what "polish" feels like. `[verified]` HAOQI URL above.
- **C6. One loop for scroll and render** — HAOQI disable Lenis' own loop and drive it from the render loop so DOM and WebGL read the same scroll value in the same frame; no one-frame lag between text and scene. `[verified]` same URL.
- **C7. Smooth scroll library** — Lenis appears in the stack of Immersive Garden, David Whyte, Goodgrowth, MERSI, Kononenko, HAOQI, Aether1, bleibtgleich. `[verified]` respective case-study URLs. It keeps native scroll underneath. `[recalled]`
- **C8. Custom cursor** — a small dot or ring that changes state over interactive elements, optionally with a short text label ("open", "play"); hide on touch devices; never replace the cursor without a state change that means something. `[recalled]` Cursor change on interactive elements is named as a premium signal `[verified] (secondary)` madebyevoke URL above.
- **C9. Magnetic buttons** — on pointer within a radius, translate the button a fraction of the offset toward the cursor and the label a slightly larger fraction; spring back on leave; desktop only. Apply to one or two elements (main CTA, nav), not to everything. `[recalled]`
- **C10. Text scramble / decode on reveal** — HAOQI cycle characters through capitals, digits and symbols before settling, all instances on a shared 40 ms ticker, started only after entering the viewport; Igloo do it in WebGL with SDF texture offsets — reads as a system "printing" its labels. Use on mono labels only, never on body copy. `[verified]` HAOQI and Igloo URLs above.
- **C11. Line-by-line text reveals** — GSAP SplitText by lines, masked rise or blur-to-sharp; bleibtgleich blur each line with an SVG filter so letters merge and then resolve; ZERO sharpen narrative text from a blur as it appears. `[verified]` bleibtgleich and ZERO URLs above.
- **C12. Numbers and indices** — every chapter, case and step is numbered (01, 02 … or I, II, III) in mono or small caps; Immersive Garden make the Roman numerals the main 3D element. Numbering implies a finite, authored system. `[verified]` for Immersive Garden (URL above); general convention `[recalled]`.
- **C13. Grid lines and registration marks** — hairline rules (1 px, low-opacity) marking the column grid, corner ticks, coordinates or timecode in the margins — the page shows its own construction. `[recalled]` Related verified idea: Kononenko borrow the language of architectural drawings as structure, not decoration (URL above).
- **C14. HUD-style micro-copy** — live values in the corners: local time, scroll %, chapter name, pointer coordinates; HAOQI feed DOM readouts from the pointer bus. Must be real data, never fake. `[verified]` HAOQI URL above. Fake status dots are a named AI tell `[verified]` https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui
- **C15. Marquee** — one slow line of large type as a chapter divider or footer band; pauses on hover; at most one per page. `[recalled]`
- **C16. Velocity-driven type** — text stretches or skews with scroll velocity and returns to rest. `[verified]` https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/
- **C17. Sticky elements** — the label column or chapter number stays pinned while body copy scrolls; the object stays pinned while text passes (A10). `[verified]` for the sticky pattern via The Pudding URL above.
- **C18. Sound, off by default, with a designed toggle** — Goodgrowth put an animated EQ glyph as the toggle; iOS specifics they hit: AudioContext auto-suspends and the physical mute switch blocks Web Audio. `[verified]` Goodgrowth URL above.
- **C19. Sound scheduled on the audio clock** — Goodgrowth found per-frame `HTMLAudioElement.play()` calls caused stutter and moved the whole sequence to the Web Audio clock; ZERO sync a sound to the first rendered frame, not a timer. `[verified]` Goodgrowth and ZERO URLs above.
- **C20. Sound that reacts to state** — Aether1 apply a low-pass filter on hover and during transitions and drive particle intensity from an audio frequency channel; Igloo sync effects to particle movement. `[verified]` Aether1 and Igloo URLs above.
- **C21. Randomness** — reloads or repeated interactions produce slightly different motion; identical playback every time reads as a video. `[verified]` https://medium.com/@alex.streza/a-guide-on-building-awwwards-worthy-websites-c4fa710b1c43 ; Cerebrium randomize offset, speed and pulse per path so it feels organic. `[verified]` https://tympanus.net/codrops/2026/07/23/building-cerebrium-making-serverless-infrastructure-tangible/
- **C22. Easter eggs** — Immersive Garden hide a "Backstage" section and micro-interactions that reward exploration. `[verified]` Immersive Garden URL above.
- **C23. Image/visual "development" on entry** — HAOQI cards go from negative to full colour over 0.8 s, and skip straight to colour under `prefers-reduced-motion`. `[verified]` HAOQI URL above.
- **C24. Reduced motion handled** — a `prefers-reduced-motion` path that keeps content and drops movement; missing it costs Usability score. `[verified] (secondary)` hontran URL above.
- **C25. Focus states** — visible, designed `:focus-visible` (accent outline with offset) on every interactive element. `[verified] (secondary)` as a scoring factor, hontran URL; the styling is `[recalled]`.
- **C26. Selection colour** — `::selection` in the accent colour with the dark background as text colour. `[recalled]`
- **C27. Scrollbar** — either a thin custom scrollbar in the palette or hidden with a custom progress line; bleibtgleich keep a custom scrollbar that persists across transitions. `[verified]` bleibtgleich URL above.
- **C28. Loading states** — a counter 000→100 in mono, the wordmark, and the first frame of the object already forming; shaders warmed up by rendering a frame early so the first interaction does not hitch (Goodgrowth did this for WebKit). `[verified]` Goodgrowth URL above.
- **C29. Textures ready before they are visible** — ZERO decode off-thread, upload in idle time, and flush the queue before each stage transition. `[verified]` ZERO URL above.
- **C30. Favicon** — a designed monogram in SVG with a dark/light variant, not the framework default. `[recalled]`
- **C31. OG image** — a composed 1200×630 card in the site's type and colour with the thesis line; this is the first impression in messengers. `[recalled]`
- **C32. 404** — one line in the site's voice, the object in a "broken/disassembled" state, one link home. `[recalled]`
- **C33. Film finish** — fine animated grain, slight vignette, subtle chromatic offset on fast motion; HAOQI add a six-ray lens flare so glass feels filmed through a camera; UntilLabs grade with a LUT. Gives a rendered scene a photographed quality. `[verified]` HAOQI and https://tympanus.net/codrops/2025/12/10/simulating-life-in-the-browser-creating-a-living-particle-system-for-the-untillabs-website/
- **C34. No interruptions** — no popups, chat bubbles, cookie walls over content, surveys: an NN/g participant looking at a $4,000 bracelet called a feedback popup "tacky" and said it lowered her opinion of the brand. `[verified]` https://www.nngroup.com/articles/luxury-principles-ecommerce-design/
- **C35. Flawless copyediting** — NN/g list copyediting and QA as part of luxury's attention to detail; one typo cancels the effect of the shader. `[verified]` same URL.
- **C36. Consistent spacing units** — section paddings from one scale (not 48 px here and 73 px there); elements aligned to one grid. `[verified] (secondary)` madebyevoke URL above.
- **C37. Timing obsession** — Obys: small changes in timing, spacing and behaviour made a significant difference; "simple and effortless" required constant adjustment. `[verified]` Obys redesign URL above.

---

## 4. Typography and art direction

- **T1. Type is the structure** — Obys treat typography, grid, composition and hierarchy as the core method; "you can break the grid only if you understand it". `[verified]` https://tympanus.net/codrops/2026/03/06/obys-the-small-studio-designing-big-digital-narratives/
- **T2. A custom or distinctive typeface** — Obys drew their own neo-grotesque (OTF Obys NG) for text and display. For us: a licensed display face with character, not the default system/Inter stack. `[verified]` Obys redesign URL above.
- **T3. Huge display sizes** — "huge font sizes" is on every list of award traits; Kononenko: oversized typography, precise compositions, generous negative space. `[verified]` Streza and Kononenko URLs above.
- **T4. Extreme scale contrast** — the page uses two sizes far apart (a display line and a small label) and little in between; cheap pages have headings and body of similar size. `[verified] (secondary)` madebyevoke URL above.
- **T5. Starting values** — display: `clamp()` around 9–14vw on desktop for the main line, 13–18vw on mobile for 1–3 words; body 16–20 px; label 10–12 px. Ratio between display and label of roughly 10:1 or more. `[recalled]`, suggested values, not sourced.
- **T6. Tight display, loose labels** — slightly negative letter-spacing on headings; line-height 1.6–1.8 on body `[verified] (secondary)` madebyevoke. Display line-height about 0.9–1.0, labels uppercase with positive tracking around 0.08–0.14em `[recalled]`.
- **T7. Display + mono/small-caps labels** — a display face for statements, a monospaced or small-caps face for indices, labels, metadata, timestamps; the two voices never swap roles. HAOQI's CLI-style decoding labels and dot-matrix language are an instance. `[verified]` for HAOQI (URL above); the pairing rule `[recalled]`.
- **T8. Type scale by ratio** — a consistent mathematical scale (1.25 / 1.414 / 1.5). `[verified] (secondary)` madebyevoke URL above.
- **T9. At most two typefaces** — three or more faces used inconsistently is a cheap tell. `[verified] (secondary)` same URL.
- **T10. Colour restraint** — near-monochrome plus one accent, applied with precision. `[verified] (secondary)` madebyevoke; "one dominant, one accent, one neutral" `[verified]` https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui
- **T11. Depth in dark UI without glow** — depth comes from typography, contrast and surface levels, not decorative glows. `[verified]` same Fountain Institute URL.
- **T12. One atmosphere across scenes** — Cerebrium use one custom HDRI across all 3D environments so separate scenes read as one brand. `[verified]` Cerebrium URL above.
- **T13. Text stays in the DOM** — HAOQI keep all text as DOM (structure, responsiveness, accessibility) and let WebGL handle visuals; Kononenko treat the DOM as source of truth and mirror it into WebGL. `[verified]` HAOQI and Kononenko URLs above.
- **T14. Text over 3D, method A: composite text after tone mapping** — ZERO run a deferred text pass after tone mapping so letters stay crisp and unaffected by bloom/grade. With DOM text this is automatic: the canvas sits behind. `[verified]` ZERO URL above.
- **T15. Text over 3D, method B: the scene yields** — when a text block is active, the object moves aside, dims, defocuses or thins out behind the copy; the effect sits behind typography (Dash Creative). `[verified]` Dash URL; the choreography rule `[recalled]`.
- **T16. Text over 3D, method C: cheap depth of field** — Aether1 fake depth of field by changing the particle `smoothstep` instead of a post pass; soft, out-of-focus particles behind text raise legibility for nearly free. `[verified]` Aether1 URL above.
- **T17. Text over 3D, method D: local scrim** — a soft radial/linear dark gradient under the text block only, never a visible box. `[recalled]`
- **T18. Legibility is not optional in luxury** — NN/g: bold visual experiments belong in decorative areas; functional content keeps sufficient contrast and scannable layout; Rolex cited as balancing minimal branding with large clear imagery and readable content. `[verified]` https://www.nngroup.com/articles/luxury-principles-ecommerce-design/
- **T19. Type as geometry** — letters become masks for video or the portal itself (Roman Jean-Elie: text cut out as a hole via SVG `fill-rule: evenodd`). `[verified]` URL above.
- **T20. Composed, not filled** — MERSI: pages are composed like a book spread; images are material, not content blocks; each project feels individually considered. `[verified]` https://tympanus.net/codrops/2026/07/27/between-print-and-digital-the-making-of-mersis-website/
- **T21. Whitespace doubled** — increase padding by 50–100% and double section gaps versus a normal build. `[verified] (secondary)` madebyevoke URL above.
- **T22. Flexible grid for odd formats** — MERSI rebuilt the grid so portrait images strengthen the composition instead of being forced into a standard layout. `[verified]` MERSI URL above.

---

## 5. Storytelling: the 3D object as plot, not decoration

- **O1. The object is the metaphor of the offer** — Igloo: each project is an ice block grown by a crystal algorithm (name = form = content); Cerebrium: data paths and a shield stand for flow and protection; Lando Norris: the helmet is the anchor; UntilLabs: a particle system built from a real photograph that echoes their science. `[verified]` Igloo, Cerebrium, OFF+BRAND, UntilLabs URLs above.
- **O2. Motion explains the idea** — Obys: motion "is not decorative. It helps explain the idea." Test for every animation: what sentence does it say. `[verified]` Obys redesign URL above.
- **O3. Technology is never the point** — OFF+BRAND on Trevor Noah's site: flat 2D with curated WebGL; "technology never became the point". `[verified]` OFF+BRAND URL above.
- **O4. Every hover has a purpose** — Noomo (Site of the Year users' choice): every interaction and hover has its own purpose. `[verified]` https://medium.com/@noomo-agency/noomo-agency-website-of-the-year-winner-on-awwwards-aad757327994
- **O5. Interactions express the concept** — MERSI's flip, grid repositioning and split-screen each express materiality and composition; Kononenko limit expressive interaction to moments that carry meaning. `[verified]` MERSI and Kononenko URLs above.
- **O6. The object changes state per chapter** — the same object transforms through the sections (Roman Jean-Elie's portal across five sections; ZERO's promise → shatter → burn → tunnel → city); the visitor watches one thing become another. `[verified]` both URLs above.
- **O7. Abstract made tangible** — Unseen turn geology or data into explorable worlds; Cerebrium embody "fast, precise, modular, built to scale" instead of drawing a diagram. `[verified]` https://tympanus.net/codrops/2026/07/20/the-craft-behind-memorable-digital-experiences-inside-unseen-studio/ , Cerebrium URL above.
- **O8. One centrepiece dignifies a dry subject** — Hubtown: one 3D monolith with a mouse-reveal repositions a corporate site; Oryzo: "sell one object properly". `[verified] (secondary)` https://www.utsubo.com/blog/best-threejs-websites-2026
- **O9. Camera authored, not interpolated** — Cerebrium bake camera moves from Cinema 4D; Aether1 bake nearly all motion with 200 keyframes between anchors. Authored framing per chapter is what separates a directed scene from a spinning model. `[verified]` both URLs above.
- **O10. Start from what exists, cut the rest** — Roman Jean-Elie: his original centrepiece effect ended up minor; emotional impact over technical complexity. `[verified]` URL above.
- **O11. The object responds and remembers** — Cerebrium's shield lights up locally under the pointer and "remembers" it briefly; a responsive object reads as a system, a looping one as a video. `[verified]` Cerebrium URL above.
- **O12. Application to a particle site for a "systems architect"** — the particles are the client's business: chapter 1 loose cloud (operations without a system) → chapter 2 the cloud follows the cursor (everything depends on the owner) → chapter 3 particles lock into a structure (the system) → chapter 4 the structure runs without pointer input (it works without the owner) → chapter 7 structure holds, calm. Each state must be nameable in one sentence that also appears as the chapter's headline. `[recalled]` synthesis of O1, O6, O11.
- **O13. Decoration test** — remove the canvas and read the page. If nothing is lost, the 3D is decoration. If a chapter's claim becomes harder to believe, it is plot. `[recalled]`

---

## 6. Trust and selling for a high-ticket service

- **S1. Order of asks follows trust** — NN/g hierarchy: relevance and credibility first, then preference over alternatives, only then personal information. A contact form in the first viewport asks for level 3 before levels 1–2 exist. `[verified]` https://www.nngroup.com/articles/commitment-levels/
- **S2. Four credibility factors** — design quality, up-front disclosure, comprehensive and current content, connection to the rest of the web (third-party references are more credible than self-praise). `[verified]` https://www.nngroup.com/articles/communicating-trustworthiness/
- **S3. Show the price or a frame for it** — NN/g: price is the most-needed information for business buyers; hiding it sends them to competitors and reads as evasive; for custom work show sample prices for typical scenarios or a range. `[verified]` https://www.nngroup.com/articles/show-price/ , https://www.nngroup.com/articles/b2b-trust-from-b2c/
- **S4. Price lets the right people self-select** — David C. Baker's site is cited for transparent pricing that lets prospects self-select before contact. `[verified] (secondary)` https://www.consultingsuccess.com/best-consulting-websites
- **S5. Problem first, credentials second** — the site competes with the doubt in the prospect's mind, not with other consultants. `[verified] (secondary)` same URL.
- **S6. Proof = specific cases with measurable results** — case studies with numbers, named testimonials, client logos. `[verified] (secondary)` same URL; names, photos or video for testimonials `[verified]` https://cxl.com/blog/how-to-build-a-high-converting-landing-page/
- **S7. Real photography of the real person** — NN/g: authentic photos of actual people outperform stock; users expect heightened authenticity and plain, conversational language. `[verified]` https://www.nngroup.com/articles/about-us-information-on-websites/
- **S8. Plain language** — clear copy is perceived as honest; define specialised terms. `[verified]` https://www.nngroup.com/articles/b2b-trust-from-b2c/
- **S9. Reading level** — Unbounce professional-services data: pages at 5th–6th grade reading level convert at 12.9% versus 6.6% at 8th–9th grade; this is lead-gen landing-page data, not high-ticket consulting specifically. `[verified]` https://unbounce.com/conversion-benchmark-report/professional-services-conversion-rate/
- **S10. How much text** — same Unbounce page: ideal word count 275–745 for professional services. CXL: long form wins for high price and high consideration, yet a shorter page lifted demo bookings from 3.53% to 5.85% for a cybersecurity firm; pages fail when they are superficial for their audience, not because they are short. `[verified]` Unbounce URL above, https://cxl.com/blog/long-form-or-short-form/
- **S11. Resolution for our case** — few words on the surface (statement per chapter), depth one click or one scroll below (case detail, engagement terms). Roughly 300–700 words visible on the main line. `[recalled]` synthesis of S10 + A11.
- **S12. One action** — only one possible action on the page, repeated at logical intervals. `[verified]` https://cxl.com/blog/how-to-build-a-high-converting-landing-page/
- **S13. Short form** — 1–3 fields; every extra field adds friction. `[verified]` same URL.
- **S14. Explain why you ask** — people comply more and trust more when a reason is given for requested information. `[verified]` https://www.nngroup.com/articles/b2b-trust-from-b2c/
- **S15. Offer more than one contact channel** — email, messenger, form, call booking. `[verified]` same URL; booking tool to remove friction `[verified] (secondary)` consultingsuccess URL above.
- **S16. CTA wording for an expensive, considered purchase** — CXL recommends action-oriented, high-contrast buttons `[verified]`. For a luxury register the wording should be a calm, specific next step ("Discuss your case", "Request a diagnostic call") in a quiet outlined or text-link style with an arrow, not "Buy now" urgency. `[recalled]`, consistent with NN/g's "deep personal connection" principle: enable appointment booking with a person `[verified]` https://www.nngroup.com/articles/luxury-principles-ecommerce-design/
- **S17. CTA placement** — a quiet one in the hero for visitors who are ready, one after proof, the main one as the closing scene; a persistent small link in the nav. `[verified]` for "above the fold and throughout" (CXL URL above); the three-point placement `[recalled]`.
- **S18. Exclusivity stated, not performed** — luxury depends on controlled access; say who the work is for, who it is not for, and how many engagements run at once. No countdown timers. `[verified]` for the exclusivity principle (NN/g luxury URL above); the application `[recalled]`.
- **S19. Brand story throughout, not on an About page** — NN/g: share history and values across the site. `[verified]` same NN/g URL.
- **S20. Reassure before the ask** — Apple pages resolve hesitations directly before the purchase step; for us: what happens after the call, how long, what it costs, what if it is not a fit. `[verified] (secondary)` uxplanet URL above.
- **S21. Translate features into consequences** — Apple map specs to relatable outcomes ("3 hours longer to watch…"); for us: not "automation of sales", but what the owner stops doing on Monday. `[verified] (secondary)` same URL.
- **S22. Desktop vs mobile reality** — Unbounce professional services: mobile is 81% of visits and converts at 8.3% versus 11.6% on desktop. The mobile version is the majority experience. `[verified]` Unbounce URL above.
- **S23. What to leave out** — stock photos, logo walls of unknown brands, "trusted by 500+" without names, star ratings, pop-ups, chat widgets, urgency timers, long bios, lists of every service, awards rows. `[recalled]`, consistent with C34, A26, S7.

---

## 7. Mobile: how award winners degrade heavy WebGL

- **M1. Same story, lower fidelity** — ZERO's adaptive quality manager changes pixel ratio, blur samples, geometry and text resolution while the narrative stays identical on every device. `[verified]` https://tympanus.net/codrops/2026/07/17/zero-the-engineering-behind-a-defiant-interactive-narrative/
- **M2. Frame-time driven tiers** — ZERO: rolling buffer of frame times, downgrade above 22 ms average, upgrade below 12 ms, with a cooldown so it does not oscillate; three tiers LOW/MEDIUM/HIGH. `[verified]` same URL.
- **M3. Drop quality during expensive moments** — ZERO temporarily lower pixel ratio and disable blur during the heaviest interaction. `[verified]` same URL.
- **M4. Cap device pixel ratio** — cap at 2× on high-DPI phones or trade resolution for frame rate; post-processing at half resolution roughly doubles frame rate. `[verified] (secondary)` https://www.utsubo.com/blog/threejs-best-practices-100-tips
- **M5. Mobile budgets** — under about 100 draw calls and 100,000 vertices per frame on mobile. `[verified] (secondary)` same URL.
- **M6. Particles in one draw call** — UntilLabs: 60,000 particles as `GL_POINTS` in a single draw call at 60 fps, with positions packed into textures (payload about 604 KB instead of a 20 MB JSON). `[verified]` UntilLabs URL above.
- **M7. Fake the expensive effects** — Aether1: depth of field via particle smoothstep, bloom as a pre-made billboard texture, glass via matcap + Fresnel, low-poly proxies for raycasting; target was 60 fps on an iPhone SE (2020). `[verified]` Aether1 URL above.
- **M8. Downscale simulations** — Aether1 run the fluid cursor at 7.5% of screen resolution. `[verified]` same URL.
- **M9. Half-rate, half-res passes** — HAOQI run their flare pass at half resolution on alternating frames and switch it off off-screen. `[verified]` HAOQI URL above.
- **M10. Compress everything** — ZERO: about 1 GB of source to under 10 MB with DRACO + KTX2/ETC1S and atlases, decoders self-hosted; Goodgrowth: one GLB from 9.7 MB to 182 KB; Immersive Garden: KTX, channel packing, gltf-transform. `[verified]` respective URLs above.
- **M11. Replace interactions that need a mouse** — MERSI skip the flip transition and the grid animation on mobile and use a clip-path wipe; The Pudding: replace hover with fixed text/annotations on touch. `[verified]` MERSI URL, https://pudding.cool/process/responsive-scrollytelling/
- **M12. Keep scroll-story only where the transition means something** — otherwise stack the content; avoid steppers and swipe/tap carousels. `[verified]` same Pudding URL.
- **M13. No `vh` for scroll sections** — mobile browser bars resize the viewport and make triggers jump; compute heights from `window.innerHeight` on load/resize. `[verified]` same URL. Modern alternative: `svh`/`dvh` units `[recalled]`.
- **M14. Shorter pacing on phones** — mobile readers tire sooner; shorten sequences. `[verified]` same Pudding URL. NN/g: altered scroll is worse on small screens. `[verified]` scrolljacking URL above.
- **M15. Design touch from the start** — Dash Creative regret adapting cursor-driven interaction to touch late. `[verified]` Dash URL above.
- **M16. Test on real cheap devices** — ZERO hit 16-bit `mediump` precision bugs on Adreno/Mali GPUs and needed explicit `highp`; a single 157 ms spike was the difference on a budget Android. `[verified]` ZERO URL above.
- **M17. Touch scroll** — Aether1 use Lenis with `syncTouch`; Goodgrowth fixed a drag bug by committing exactly one step per gesture. `[verified]` both URLs above.
- **M18. HTML first, 3D second** — meaningful content renders before the 3D bundle arrives. `[verified] (secondary)` https://www.utsubo.com/blog/best-threejs-websites-2026
- **M19. Handle context loss** — stop the loop and show a fallback when the GPU context is lost (backgrounded tab). `[verified] (secondary)` utsubo tips URL above.
- **M20. Startup time is part of the design** — Cerebrium moved from WebGPU back to WebGL because shader compilation delayed start by about 20 seconds. `[verified]` Cerebrium URL above.
- **M21. Measure, do not guess** — Goodgrowth spent time optimising shaders when the real cause was audio scheduling. `[verified]` Goodgrowth URL above.
- **M22. Performance targets claimed for award-level sites** — LCP under 1.5 s, CLS under 0.05, INP under 100 ms, page weight under 3 MB, sustained 60 fps. `[verified] (secondary, a studio's stated targets)` https://www.utsubo.com/blog/award-winning-website-design-guide

---

## 8. Thirty cheap tells and the fix for each

Sources for the tells marked (F) https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui , (V) https://www.vibe0.com.au/blog/how-to-tell-if-a-website-is-vibe-coded , (E) https://madebyevoke.com/blog/what-makes-a-website-look-expensive — all `[verified]`. Others are `[recalled]`.

| # | Tell | Fix |
|---|------|-----|
| 1 | Purple-to-blue gradient on text and buttons (F, V) | One accent chosen from the brand idea, used on under 5% of pixels |
| 2 | Inter or Geist as the only typeface (V) | A display face with character + a mono for labels |
| 3 | Pill buttons with large radius everywhere (V) | One button style: sharp or 2 px radius, outline or text + arrow |
| 4 | Lucide/emoji icons as bullets and nav (F, V) | No icons, or one custom set; numbers and labels instead |
| 5 | Everything in cards (F) | Group with whitespace, rules and type; cards only for clickable objects |
| 6 | Decorative glow in dark mode (F) | Depth from contrast, surface levels, grain; glow only on the object |
| 7 | Neon palette where nothing is prioritised (F) | One dominant, one accent, one neutral |
| 8 | Coloured side stripes on every block (F) | Accent has a rule: it marks only the current/active thing |
| 9 | Status dots that mean nothing (F) | Only real, labelled live data in the HUD |
| 10 | Three feature cards in a row with icon + title + two lines | One claim per viewport, numbered |
| 11 | Headings and body close in size (E) | Display vs label at 10:1; cut the middle sizes |
| 12 | Every pixel filled (E) | Double section gaps; allow near-empty viewports |
| 13 | Inconsistent paddings, off-grid elements (E) | One spacing scale, visible grid, audit with an overlay |
| 14 | No hover states, or instant ones (E) | 150–200 ms transitions on every interactive element |
| 15 | Bouncy/elastic animation on everything (E) | Calm ease-out; one expressive ease in one place |
| 16 | Identical fade-up on every block | Reveal types by role: lines mask up, labels decode, object assembles |
| 17 | Stock photography (E) | Real portrait, or no photography at all |
| 18 | Three or more typefaces (E) | Two faces, fixed roles |
| 19 | Builder badge, builder domain, default meta/generator tags (V) | Custom domain, clean head, own favicon and OG |
| 20 | Default favicon and no OG image | Designed monogram + composed share card |
| 21 | Generic spinner or blank flash while loading | Counter + wordmark + first frame of the object |
| 22 | 3D that ignores the content (same loop in every section) | Object state per chapter tied to the headline |
| 23 | 3D that covers the text or fights it | Scene yields: move, dim or defocus behind copy |
| 24 | Frame drops on scroll, fans spinning | Adaptive tiers, DPR cap, measure frame time |
| 25 | Phone version is the desktop shrunk, or a static image | Same story, lighter scene, touch-specific interaction |
| 26 | Default blue focus ring or none; default selection colour; default scrollbar | Designed focus, `::selection`, thin scrollbar or progress line |
| 27 | Filler copy: "Unlock your potential", "We help you grow" | Specific claims with numbers and a named situation |
| 28 | Pop-up, chat bubble, cookie wall on arrival | None; a single-line cookie note at most |
| 29 | Urgent CTA style ("Get started now!", big filled gradient button in every section) | One calm action, three placements |
| 30 | Em-dash-heavy, symmetrical "It's not X — it's Y" copy and section labels like "Features / Testimonials / FAQ" | Rewrite in the owner's spoken voice; chapter names that are statements |

---

## 9. Reference sites (signature move in two lines)

URLs of the sites themselves are `[recalled]` unless they appear in the cited source; the breakdown is `[verified]` from the cited case study where given.

1. **Lando Norris** — https://landonorris.com — Awwwards Site of the Year 2025. A rotating 3D helmet as the single anchor, speed-themed cinematic scroll; Webflow + WebGL + Rive, built in under two months. Source: https://www.itsoffbrand.com/our-work/lando-norris
2. **Igloo Inc** — https://igloo.inc — Site of the Year 2024. Three sections; each project is a procedurally grown ice block; UI rendered in WebGL with scramble/glitch text; frost and chromatic transitions; footer is a particle scene. Source: https://www.awwwards.com/igloo-inc-case-study.html
3. **Messenger (abeto)** — https://messenger.abeto.co — Site of the Year 2025. A small real-time planet you walk around; the world is the navigation. Source: https://metabole.studio/en/blog/immersive-website-examples
4. **Lusion v3** — https://lusion.co — Site of the Year 2023. Physics-driven objects that react to the cursor, seamless scene-to-page transitions. `[recalled]` breakdown; listing verified at https://www.awwwards.com/websites/sites_of_the_year/
5. **Noomo Agency** — https://noomoagency.com — Site of the Year 2023 (users' choice). Upward scroll from banner to projects, "pixels and glass" theme, handwritten logo from team signatures; every hover has a purpose. Source: Noomo Medium URL above.
6. **Immersive Garden** — https://immersive-g.com — Bas-relief 3D and Roman numerals as chapter anchors; one-click navigation; hidden Backstage section. Source: https://www.awwwards.com/case-study-immersive-gardens-new-website.html
7. **Obys Agency** — https://obys.agency — Own typeface, logo as the constant element that transforms on entry, dark-to-light shift, motion as system, awards deliberately omitted. Source: Obys redesign URL above.
8. **Active Theory** — https://activetheory.net — WebGL transitions that carry a project preview into a full-screen experience. Source: metabole URL above.
9. **ZERO** — case study https://tympanus.net/codrops/2026/07/17/zero-the-engineering-behind-a-defiant-interactive-narrative/ — Six scroll stages joined by five hold-to-pass gates; opens by drawing a zero; text composited after tone mapping; adaptive quality tiers.
10. **Aether1 (OFF+BRAND)** — case study https://tympanus.net/codrops/2025/08/06/building-aether-1-sound-without-boundaries/ — A fictional earbud as the product-plot; seven anchors on an infinite loop; baked camera; sound-reactive particles; 60 fps on iPhone SE.
11. **Cerebrium** — https://cerebrium.ai — Serverless infrastructure made tangible: flowing network paths and a pointer-reactive shield; camera baked from Cinema 4D; one HDRI for all scenes. Source: Cerebrium URL above.
12. **Until Labs** — https://untillabs.com — 60,000-particle living system built from a real photograph, curl-noise motion, LUT grade; the particle site closest to our case. Source: UntilLabs URL above.
13. **HAOQI.DESIGN** — https://haoqi.design — DOM text over mirrored WebGL images, one dot-matrix language for hover/transition/loading, CLI-style decoding labels, glass centrepiece with lens flare. Source: HAOQI URL above.
14. **Goodgrowth** — case study https://tympanus.net/codrops/2026/08/27/goodgrowth-boot-sequences-spinning-discs-and-the-art-of-the-portfolio/ — Console boot preloader with a 0–100 count, five-bar title wipe, decaying chromatic hover smear, sound on the Web Audio clock with an EQ toggle.
15. **Kononenko Architectural Bureau** — case study https://tympanus.net/codrops/2026/09/18/kononenko-architectural-bureau/ — Oversized type and negative space; calm visual system with aggressive motion; interruptible transitions; quiet sections around expressive ones.
16. **MERSI** — case study https://tympanus.net/codrops/2026/07/27/between-print-and-digital-the-making-of-mersis-website/ — Architecture-book layout on the web: composed spreads, cover flip into the case, horizontal case scroll; mobile version drops the flip.
17. **bleibtgleich'26** — case study https://tympanus.net/codrops/2026/09/23/bleibtgleich26-a-180-turn-from-brutalism-to-minimalism/ — A quiet first screen that waits; blur-merge line reveals; rotary dial navigation; persistent custom scrollbar; live multiplayer cursors.
18. **Dash Creative** — case study https://tympanus.net/codrops/2026/07/21/magnetic-commerce-building-the-dash-creative-website/ — Black minimal hero; a single shader behind the type that drags video with the cursor's momentum; restraint over feature count.
19. **Hubtown (Unseen Studio)** — https://hubtown.co.in — One 3D monolith with mouse-reveal turns a property developer's corporate site into a cinematic one. Source: https://www.utsubo.com/blog/best-threejs-websites-2026
20. **Cartier Watches & Wonders** — https://www.cartier.com/watchesandwonders — Six self-contained 3D rooms, one per watch: one room per item instead of one long scroll. Source: same utsubo URL.

Consultant personal-brand references (function, not visual craft): **David C. Baker** https://davidcbaker.com (transparent pricing, prospects self-select) and **Kevin Whelan** https://kevin.me (content-rich pre-qualification). `[verified] (secondary)` https://www.consultingsuccess.com/best-consulting-websites. Honest gap: no fetched source showed a consultant site that is premium in the Awwwards sense; the visual bar has to be borrowed from studio and luxury sites, the selling logic from these.

---

## 10. Scoring rubric — run against screenshots and a screen recording

Score each criterion 0–10. Weights follow the Awwwards proportions (J1) adapted for a selling page. A page reads as $10k at a weighted total of 8.0 or higher with no single criterion below 6. The thresholds are my calibration `[recalled]`, borrowing the 6.5 / 8.0 lines from J2 and J5.

| # | Criterion | Weight | 0–3 | 4–6 | 7–8 | 9–10 |
|---|-----------|--------|-----|-----|-----|------|
| R1 | First viewport | 12% | Template hero: heading, sub, two buttons, gradient | Clean but could belong to anyone | One claim, one object, clear hierarchy, quiet CTA | Screenshot alone is recognisable as this person and this idea |
| R2 | Typography system | 14% | One default face, similar sizes | Two faces, weak scale contrast | Display + mono roles fixed, scale contrast 10:1, tight display | Type itself is the image; every size is on the scale |
| R3 | Composition, grid and whitespace | 10% | Filled, off-grid, uneven paddings | Aligned but uniform blocks | Visible grid, composed viewports, deliberate empty space | Each viewport works as a poster |
| R4 | Colour and material | 6% | Many colours, glow, gradients | Restrained but generic dark | Near-mono + one accent, grain/depth | Accent has a rule and never breaks it |
| R5 | Object as plot | 12% | Background loop unrelated to copy | Reacts to scroll, no meaning | State per chapter matches the headline | Remove the canvas and the argument weakens |
| R6 | Pacing and chapter transitions | 10% | Same block rhythm, same fade | Sections differ, transitions default | 5–7 beats with quiet/loud alternation, one designed transition | Feels edited; nothing could be cut |
| R7 | Text legibility over the scene | 6% | Text fights particles | Readable with effort | Scene yields behind every text block | Contrast passes everywhere, including mobile |
| R8 | Craft details | 8% | Defaults: focus, selection, scrollbar, favicon, loader | Some hovers, default rest | Hover/focus/selection/loader/OG/404 all designed | Details share one language (indices, labels, decode) |
| R9 | Copy and proof | 10% | Filler, no numbers, no names | Real but generic claims | Specific cases, named results, price frame, owner's voice | A buyer can decide to call from the text alone |
| R10 | CTA and path | 4% | Many competing buttons or form in hero | One CTA, loud | One calm action in three places, short form | Next step and what follows are explicit |
| R11 | Mobile | 5% | Shrunk desktop or broken | Works, scene removed | Same story, lighter scene, touch interaction | Feels designed for the phone first |
| R12 | Performance and smoothness (needs recording) | 3% | Visible jank, long blank load | Mostly smooth | 60 fps, designed loading, no layout shift | Smooth on a mid-range phone |

How to run: capture 7 desktop screenshots (one per chapter), 7 mobile ones, the hover state of the CTA, the loader, the tab strip (favicon), the share card, and a 30-second scroll recording. Score R1–R11 from stills, R12 from the recording.

---

## 11. Twenty changes that move a good particle site to $10k (by impact)

1. **Tie every particle state to a chapter headline** (O12, O13). The cloud must say the sentence the headline says; otherwise it is a screensaver.
2. **Rebuild the type system: one display face + one mono, 10:1 scale contrast** (T2–T7). This is the largest visible share of the 40% design weight.
3. **Rewrite the first viewport as one claim + one label + one quiet CTA + the object** (A8, A9, R1).
4. **Cut to seven chapters, one statement per viewport, and insert two near-empty "silence" viewports** (A3–A7).
5. **Make the scene yield under text: move, thin or defocus particles behind every copy block** (T13–T17).
6. **Replace filler with proof: 2–3 cases with numbers and names, a real portrait, a price frame** (S3, S6, S7).
7. **Design one transition and reuse it between all chapters** (A13), and make it interruptible (A14).
8. **Number everything and add the mono label layer: chapter index, progress "03 / 07", live HUD values** (C12–C14, A16).
9. **Add adaptive quality tiers with a DPR cap, and a mobile scene that tells the same story with fewer particles** (M1–M6).
10. **One calm CTA in three places with a three-field form or a booking link; state what happens after** (S12–S17, S20).
11. **Designed loader: counter, wordmark, first assembly of the object; warm up shaders** (A19, C28).
12. **Pointer physics: smoothed velocity with decay feeding the particles; soft falloff** (C3–C5).
13. **Line-by-line masked reveals for display type and decode effect for labels only; remove uniform fade-ups** (C10, C11).
14. **Film finish: grain, vignette, slight grade on the canvas** (C33).
15. **Close the page as a scene: oversized invitation line, the object at rest, mono footer strip** (A23, A24).
16. **Defaults pass: focus-visible, `::selection`, scrollbar, favicon, OG image, 404, reduced-motion path** (C24–C32).
17. **Sync scroll and render in one loop; kill any one-frame lag between text and canvas** (C6).
18. **Remove everything that interrupts: pop-ups, chat, badges, extra buttons, icon rows, cards** (C34, tells 4, 5, 28).
19. **Doubled spacing on one scale with visible hairline grid** (T21, C13, C36).
20. **Optional sound layer, off by default, with a designed toggle** (C18–C20). Last because it adds risk on iOS and little to selling.

---

## 12. Unreachable or unverified sources

- **thefwa.com** (`/about/`, `/article/the-all-new-fwa-2016`) — pages return only metadata to the fetcher (client-rendered). FWA criteria taken from a secondary comparison page.
- **cssdesignawards.com/judging-criteria** — 404; criteria taken from `/about`.
- **nngroup.com/articles/trustworthy-design/** — 404 (content obtained from `/articles/communicating-trustworthiness/`). **nngroup.com/articles/luxury-terrible-ecommerce/** — 404.
- **awwwards.com/sites/lusion-v3, /sites/lando-norris, /sites/opal-tadpole** — fetch blocked (permission request not answered); per-criterion scores of winners and the Developer Award sub-criteria weights were therefore not obtained. The Developer Award sub-criteria are not listed on the evaluation page that was fetched.
- **blog.getdiffer.com/design-tips-vibe-coded-project** — 403.
- **Fetch quota ran out** before these were read: Codrops case studies The Sleepers, Lesse Studio, "More Than a Portfolio", Shopify Editions Spring '26, Bisous, Trionn, Shader.se.
- **Not reached at all** (no fetch attempted or no usable page found): studio blogs of Resn, Locomotive, Dogstudio/DEPT, Buck, Instrument, Work & Co, Pentagram, Ueno; Darkroom/Studio Freight engineering write-ups; Lusion's own case studies (only a short third-party summary was read); Active Theory beyond one engineering article; Bloomberg and NYT interactive write-ups; Baymard (its research is e-commerce checkout focused and nothing applicable was fetched); visually premium personal sites of US/EU consultants and coaches.
- **Weak evidence flagged in text** — utsubo.com, metabole.studio, hontran.dev, madebyevoke.com, webdesignawards.io, consultingsuccess.com and uxplanet.org are vendor or individual blogs; their numbers (budgets, performance targets, tiers) are their own claims. A "40 percent higher session time" claim on metabole.studio was left out because the page gives no source for it.
