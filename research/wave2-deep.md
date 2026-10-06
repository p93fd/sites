# Wave 2 — Deep pass: gaps left by wave 1

Target: Three.js one-page site, ~28,000 GPU particles on a u×v grid morphing sphere → funnel → DNA helix → wave horizon → galaxy by scroll; thin line structures, per-particle depth of field, bloom, fixed-position chapter text driven by scroll progress, Russian copy, high-ticket business consultant. Must read as a $10,000 commission.

Research date: 2026-10-06. Method: WebSearch + WebFetch on public pages, paraphrased. Nothing already covered in wave 1 is repeated unless a new number or API detail was found.

**Marking**
- `[verified]` — read on a page fetched in this session (URL given). Pages are read through a summarising fetcher, so short code lines are as the fetcher returned them; re-check against the source before pasting into production. `(secondary)` = vendor/individual blog whose numbers are its own claims.
- `[recalled]` — prior knowledge, not confirmed on a fetched page. All `[recalled]` snippets and values are starting points, not measured facts.

**Item format:** Technique — exact how — when to use — source.

---

## 1. Case studies and studio write-ups not read in wave 1

### The Sleepers (Codrops, 2026-07)
C1. **Threshold-map wipe as the one signature transition** — full-screen pass; a greyscale texture is the per-pixel threshold: `reveal = step(tex.r, uProgress)`; add a tint that only appears late with `pow(uProgress, 5.)`. Swap the texture (swirl, noise, radial) to change the character without new code. — Use for intro reveal and for chapter boundaries so every cut shares one language. — https://tympanus.net/codrops/2026/07/10/the-sleepers-creating-an-atmospheric-webgl-experience-with-lightweight-techniques/ `[verified]`
C2. **World-space height fog with a soft band** — `fog = smoothstep(wPos.y - uSmooth, wPos.y + uSmooth, uFogY)`, clamp 0–1; pass world position as a varying. — For the "wave horizon" chapter: fade particles into the background colour below a horizon line instead of uniform distance fog. — same URL `[verified]`
C3. **Animated fog edge from a tiling noise texture** — sample `noise(vec2(wPos.x*f + uTime, wPos.z*f + uTime))` and add it to `uFogY` inside the smoothstep; one texture fetch, no procedural noise. — Makes the horizon breathe at near-zero cost on mobile. — same URL `[verified]`
C4. **Horizon sphere with the same fog shader** — wrap the scene in a sphere that uses the identical fog function: transparent above the fog line, fog colour below. — Hides the hard end of a particle plane. — same URL `[verified]`
C5. **Infinite field from one recycled chunk (3×3 around camera)** — a single tile is cloned and repositioned as the camera moves. — For the wave/galaxy chapters if the camera travels: keep 28k particles, never allocate more. — same URL `[verified]`

### More Than a Portfolio (Codrops, 2026-04)
C6. **Free scroll ↔ snap-block mode switch** — GSAP Observer unifies wheel/touch/trackpad; a state machine swaps between free scrub and locked "page-turn" moments mid-site. — If one chapter (e.g. the offer) must lock while others scrub. — https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/ `[verified]`
C7. **Low-resolution shader passes on phones** — expensive passes render to a smaller target and are composited at full resolution; reported as invisible to the user. — Bloom and any blur on mobile. — same URL `[verified]`
C8. **Full-screen overlay in NDC** — vertex shader writes `gl_Position = vec4(position.xy, 0.0, 1.0)`; no camera matrices, so it never drifts. — Scrim, vignette, wipe quads. — same URL `[verified]`
C9. **Ink-bleed reveal parameters** — `fbm(vUv*4.0 - uTime*0.4)` drives the edge; hover 0–0.45, click 0–4.5; noise amplitude 0.8–2.3 and softness 1.2–2.2 grow with expansion; `smoothstep` for the alpha edge. — Menu or contact overlay that opens organically. — same URL `[verified]`
C10. **Low-pass filter on context change** — music is user-toggled, no autoplay; opening a project applies a low-pass so the world sounds "next door", lifting it on return. — Cheap, strong spatial cue if sound exists. — same URL `[verified]`

### Shopify Editions Spring '26 (Codrops, 2026-06)
C11. **Scroll drives uniforms, never framework renders** — high-frequency values (camera, offsets, transition progress, post) are read from refs inside the render loop. — Rule for any stack: scroll → plain variables → uniforms in the same frame. — https://tympanus.net/codrops/2026/06/26/engineering-the-web-experience-behind-shopifys-spring-26-edition-everywhere/ `[verified]`
C12. **One runtime tier as the main knob (0–3)** — 0: no WebGL or blocklisted GPU → static fallback; 1: minimum WebGL, smallest assets; 2: reduced textures, simpler transitions; 3: full desktop. — Replace scattered `if (isMobile)` checks with one integer. — same URL `[verified]`
C13. **Density-weighted asset variants per tier** — point clouds exported at 1024/512/256 variants; the tier picks the file. — For our grid: three u×v sizes built from the same generator. — same URL `[verified]`
C14. **DPR clamped by quality level and viewport size** — not blindly `window.devicePixelRatio`; memory pressure is prioritised over peak benchmark on phones. — same URL `[verified]`
C15. **Reduced motion inside the same system** — the simulation keeps running for pointer response; only scroll-driven splats are removed. — Keeps atmosphere without large scroll-linked motion. — same URL `[verified]`
C16. **Poster until first frame + context-loss recovery** — poster stays visible until the first rendered frame; `webglcontextlost` recovery is called out for mobile Safari. — same URL `[verified]`
C17. **One preset object per scene** — camera, environment, point cloud, post, mobile offsets and transition behaviour live in one preset shared by the tuning playground and production. — For us: one JSON per chapter (camera, focus distance, bloom, palette, text zone). — same URL `[verified]`
C18. **Fixed loop + runtime step clamp** — expensive loops have a fixed max with a runtime clamp to avoid performance cliffs. — Any raymarch/blur loop. — same URL `[verified]`

### Shader.se (Codrops, 2026-05) — WebGPU in production
C19. **Scenes as FBO chain, rendered last-to-first** — each scene renders to its own target and may receive the next scene's texture; scenes outside the scroll range skip their pass entirely; a "render offset" starts a scene's target slightly before it is visible. — If chapters ever become separate scenes. — https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/ `[verified]`
C20. **Screen-space sampling of the next scene** — `screenUv = screenCoordinate / resolution; return texture(nextSceneTexture, screenUv)`; any mesh becomes a window into the next chapter regardless of its shape. — Portal-style chapter change. — same URL `[verified]`
C21. **Camera fitted to a plane** — distance `= viewportAspect < planeAspect ? h/2/tan(fov/2) : w/2/(tan(fov/2)*viewportAspect)`, then ×0.9; move along the plane normal. — Ending a zoom exactly on a framed element. — same URL `[verified]`
C22. **Post order and in-canvas UI** — final compose pass: film grain, chromatic aberration, bloom; UI laid out inside the canvas (`@pmndrs/uikit`) so post-processing applies to it. Stack: TSL compiled to WebGPU with WebGL fallback, Lenis with custom snapping. — same URL `[verified]`

### Trionn (Codrops, 2026-07)
C23. **Lenis driven from `gsap.ticker`; Three.js renders on ScrollTrigger updates, not continuously** — direct render loop (no R3F) for explicit control of shared resources. — https://tympanus.net/codrops/2026/07/15/the-architecture-behind-trionn-coordinating-gsap-three-js-lenis-and-web-audio/ `[verified]`
C24. **Idle-time warm-up** — `renderer.compile(scene, cam)` and texture warm-up before a section becomes visible. — Removes the first-scroll hitch. — same URL `[verified]`
C25. **Preload in idle batches** — 371 WebP frames loaded in `requestIdleCallback` batches of 20, each prepared with `img.decode()` before display. — Any image set (case screenshots, portrait). — same URL `[verified]`
C26. **`will-change` only while animating** — set `willChange: "filter, opacity"` at tween start, remove on complete. — same URL `[verified]`
C27. **Exponential decay instead of tweens for many small highlights; pointer rotation** — `rot.x += (target + mouse.y*0.22 - rot.x) * 0.06`. — same URL `[verified]`
C28. **Reduced motion slows, does not stop** — spin speed is reduced under `prefers-reduced-motion`. — same URL `[verified]`
C29. **Enlarged invisible hit areas** — transparent stroke much wider than the visible one. — Thin links, small mono labels, chapter dots. — same URL `[verified]`

### Smaller reads
C30. **Dragonfly (Studio Freight)** — one canvas with split composition (multiple canvases judged too heavy); each section renders its texture only when in view, then custom post; scroll-based fold reveal with `clip-path`; ScrollTrigger scrub synced through Lenis; two header variants to hold rhythm; typefaces Non Natural Grotesk + Mondwest on black. — https://www.awwwards.com/case-study-dragonfly-by-studio-freight.html `[verified]`
C31. **Tempus (Darkroom)** — one shared rAF: `Tempus.add(cb, { order, fps })`, `fps` absolute (`30`) or relative (`'50%'`); `Tempus.add(({time}) => lenis.raf(time))`; GSAP: `gsap.ticker.remove(gsap.updateRoot); Tempus.add(({time}) => gsap.updateRoot(time/1000))`; `Tempus.patch()` absorbs stray rAF calls. — One ordered loop: scroll → GSAP → uniforms → render. — https://github.com/darkroomengineering/tempus `[verified]`
C32. **14islands — proxy elements** — DOM elements stay in normal flow; WebGL objects are drawn in their place; the scroll position is animated on the main thread so both move together. Three working levels: no JS, JS without WebGL, full WebGL. Capability guess is by screen size because feature detection does not predict performance. — https://www.14islands.com/journal/progressive-enhancement-with-webgl-and-react `[verified]`
C33. **r3f-scroll-rig mechanics** — `getBoundingClientRect()` once on mount, then IntersectionObserver + ResizeObserver; camera FOV set so 1 px = 1 unit; `frameloop="demand"` with `requestRender()`; every tracked item needs a predictable height (CSS aspect ratio) to avoid shift; with post-processing set `globalRender={false}`. — https://github.com/14islands/r3f-scroll-rig `[verified]`
C34. **Basement — control texture for a particle grid** — one texture, three channels: R = where the logo/button texture is drawn, G = how far a particle may move, B = where the effect may grow; a flow buffer stores direction-to-pointer in RG and strength in B, with fade so particles do not track the cursor 1:1. — Pointer interaction that respects text zones: paint the text rect into G = 0. — https://basement.studio/post/shipping-ship-behind-the-particle-shader-effect-for-vercels-conf `[verified]`
C35. **Basement — SVG first, canvas later** — animated SVG letters play while the shader loads, then swap to the canvas; antialiasing on the letter texture makes the swap invisible. — Intro that never shows an empty screen. — same URL `[verified]`
C36. **Edan Kwan — stars and budget tricks** — blinking stars from high-octave simplex noise with aggressive `pow()`; procedural blue noise instead of a texture; heavy background rendered across several frames to avoid mobile crashes; lower resolution and sample counts on mobile; specular with FBM "imperfection". — https://medium.com/@edankwan/lost-in-parallel-universe-dba640efd39a `[verified]`
C37. **Active Theory — follower chains** — `pos.xyz += (followPos - pos.xyz) * lerp` per chain link gives flowing tubes/trails; hybrid CPU spawn + GPU simulation; post stack: tinted Perlin colour, vignette, RGB aberration, depth-buffer DOF. — https://medium.com/active-theory/neon-a-webgl-installation-fdf540c42152 `[verified]`
C38. **Active Theory — adaptive, not responsive** — branch on device capability at runtime: reduce particle count, remove post, simplify maths; not on screen size alone. — https://medium.com/active-theory/mira-exploring-the-potential-of-the-future-web-e1f7f326d58e `[verified]`
C39. **Immersive Garden** — camera path authored in Blender and replayed in Three.js; noise patterns baked in advance; server-side KTX compression and channel packing. — https://www.awwwards.com/case-study-david-whyte-experience-by-immersive-garden.html , https://www.awwwards.com/case-study-immersive-gardens-new-website.html `[verified]`
C40. **Bruno Simon 2025 portfolio** — automatic quality preset on mobile (blur and depth of field off, shadow map smaller); one UI click sound with playback-rate variation; WebGPU + TSL in production. — https://www.awwwards.com/brunos-portfolio-case-study.html `[verified]`
C41. **Bisous** — four-column grid; sans for brand + mono for "production" labels; letter-by-letter randomised opacity reveal; cinematic loader that sets the visual language. — https://tympanus.net/codrops/2026/06/29/inside-bisous-designing-an-editorial-experience-for-cinematic-cgi/ `[verified]`
C42. **Lesse Studio** — no GSAP/Framer Motion; framework transitions + scroll actions, server-rendered HTML with no hydration shift. Lesson for us: text layer must be complete in HTML before any JS. — https://tympanus.net/codrops/2026/06/05/the-making-of-the-new-lesse-studio-website-clarity-performance-and-intentionality/ `[verified]`
C43. **Dreamy GPGPU particles — simulation constants** — `velocity *= 0.7`; return force `+= dir * 0.0003`; pointer push when `dist < 0.1`: `+= pushDir * (1.0 - dist/0.1) * 0.0023 * uMouseSpeed`; fragment alpha from speed `clamp(length(vel), 0.04, 0.8)`; additive; bloom threshold 0.2, strength 0.8. — https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/ `[verified]`
C44. **alien.js as reference implementations** — ready shaders for bloom (incl. HDR and dithered variants), motion blur, afterimage, fake DOF with bokeh, volumetric light, anamorphic flare, chromatic aberration, film grain, MSDF text. — Read before writing any of these from scratch. — https://github.com/alienkitty/alien.js `[verified]`

---

## 2. Text and WebGL together

T1. **DOM-first mirrored text** — real HTML stays in the document; mark elements with a data attribute; hide them with `color: transparent` (still selectable, readable by screen readers and crawlers); build the WebGL copy from `getComputedStyle` + `getBoundingClientRect`. — Only for the few words that need shader effects; everything else stays DOM. — https://tympanus.net/codrops/2025/06/05/how-to-create-responsive-and-seo-friendly-webgl-text/ `[verified]`
T2. **Pixel-perfect camera** — `fov = 2 * atan((viewportHeight/2) / cameraDistance) * 180/π` → 1 world unit = 1 CSS px. — Required for any DOM↔WebGL overlay. — same URL `[verified]`
T3. **troika unit conversion** — `letterSpacing` and `lineHeight` are in em: divide computed px by font size; `anchorX = "0%"`, `anchorY = "50%"`, `maxWidth = bounds.width`; read `innerText`; y = `bounds.top + lenis.actualScroll`; redo all on resize. — same URL `[verified]`
T4. **troika facts** — SDF atlas generated at runtime in a worker; parses `.ttf/.otf/.woff` (woff2 not listed); `sdfGlyphSize` default 64; default font Roboto; `preloadFont({font, characters}, cb)`; missing glyphs trigger automatic fallback-font download. — For Russian copy: ship your own Cyrillic `.woff/.ttf`, preload with the exact character set, raise `sdfGlyphSize` to 128 for large display type. — https://protectwise.github.io/troika/troika-three-text/ `[verified]` (128 advice `[recalled]`)
T5. **MSDF shader** — `median(r,g,b) = max(min(r,g), min(max(r,g), b))`; `sigDist = median - 0.5; alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0., 1.)`; atlas from `msdf-bmfont-xml`. — Sharp WebGL text at any scale; generate the atlas with the Cyrillic range. — https://tympanus.net/codrops/2019/10/10/create-text-in-three-js-with-three-bmfont-text/ `[verified]`
T6. **Mask reveal for WebGL text** — fragment: discard when the line-local `uv.y` is above `uProgress`; vertex: `position.y -= uHeight * (1.0 - uProgress)`. — WebGL equivalent of the DOM masked line reveal. — URL in T1 `[verified]`
T7. **Normalised DOM rect → shader uniform** — `{x: b.x/W, y: b.y/H, w: b.width/W, h: b.height/H}` into a `vec4`, kept current with ResizeObserver. — The transport for every "scene yields under text" trick below. — https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/ `[verified]`
T8. **Scene yields: dim and shrink particles inside the text rect** — in the particle vertex shader, after projection:
```glsl
vec2 uv = gl_Position.xy / gl_Position.w * 0.5 + 0.5;
vec2 c  = uTextRect.xy + uTextRect.zw * 0.5;          // rect in GL uv (y up)
vec2 d  = abs(uv - c) - uTextRect.zw * 0.5;
float inside = 1.0 - smoothstep(0.0, uFeather, length(max(d, 0.0)));   // uFeather ≈ 0.12
float y = inside * uTextOn;                            // uTextOn eased 0..1 per chapter
vAlpha       *= mix(1.0, 0.2, y);
gl_PointSize *= mix(1.0, 0.6, y);
```
— Text stays readable without a box behind it. `[recalled]`
T9. **Scene yields: move the object, not the text** — per chapter, offset the particle group (or use `camera.setViewOffset`) so the mass sits on the opposite half from the copy; ease the offset with the chapter progress. — Default for desktop; on phones push the object up and place copy in the lower third. `[recalled]`
T10. **Scene yields: focus pull** — while copy is on screen set the focus distance in front of or behind the object so circles of confusion grow and per-pixel brightness falls; return focus during the transition. — Uses the existing per-particle DOF, no new pass. `[recalled]`
T11. **Scene yields: exposure dip** — `uExposure *= mix(1.0, 0.55, textVisible)`, bloom strength × 0.6 over the same curve. — Fast global safety net, especially for the galaxy chapter. `[recalled]`
T12. **Soft scrim** — fixed pseudo-element behind copy: `radial-gradient(ellipse at 30% 50%, rgba(5,6,10,.78), rgba(5,6,10,0) 70%)`; no hard edge, no card. — When T8–T11 are not enough on small screens. `[recalled]`
T13. **Keep DOM text out of bloom and tone mapping** — DOM sits above the canvas, so it is never bloomed; if text is drawn in WebGL, composite it after tone mapping. — wave 1 (ZERO case) covers the WebGL variant; restated because it decides T1 vs plain DOM. `[recalled]`
T14. **Contrast floor** — body text 4.5:1, large display 3:1, measured against the brightest frame of that chapter (screenshot at peak bloom), on a phone too. `[recalled]`
T15. **Particles forming a number or word** — rasterise text to an offscreen canvas after `await document.fonts.load(...)`, keep pixels with alpha > 128 on a 2 px lattice, map lattice points to the grid as an extra morph target:
```js
const c = Object.assign(document.createElement('canvas'), {width: 1024, height: 256});
const x = c.getContext('2d'); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
x.font = '700 200px "Display"'; x.fillText('250 000', 512, 128);
const d = x.getImageData(0, 0, 1024, 256).data, pts = [];
for (let y = 0; y < 256; y += 2) for (let X = 0; X < 1024; X += 2)
  if (d[(y*1024 + X)*4 + 3] > 128) pts.push((X-512)/256, (128-y)/256, 0);
// target[i] = pts[(i * 7919) % (pts.length/3)] + small jitter
```
— One "hero number" moment (price, result, year) is a stronger proof beat than another abstract shape. `[recalled]`; pixel-threshold sampling of an image into particles is `[verified]` at https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/ (threshold `#22`, luminance weights 0.21/0.72/0.07 for size)
T16. **Sync rule** — read the same animated scroll value (`lenis.scroll` / `lenis.progress`) for DOM transforms and uniforms in one callback; native scroll events arrive irregularly and produce jitter. — URL in T1 `[verified]`
T17. **Fixed chapter text from progress** — per chapter `[s, e]` on 0..1: `a = smoothstep(s, s+f, p) * (1.0 - smoothstep(e-f, e, p))`, `f` ≈ 0.03–0.05; write `opacity` and a 12–24 px `translateY`; set `inert` when `a < 0.01`. `[recalled]`

---

## 3. Intro, chapter transitions, sound, cursor, magnetic buttons

I1. **Loader that is part of the story** — DOM/SVG animation starts immediately; the canvas takes over when ready, with matching antialiasing so the swap is unseen. — https://basement.studio/post/shipping-ship-behind-the-particle-shader-effect-for-vercels-conf `[verified]`
I2. **Compile before reveal** — `await renderer.compileAsync(scene, camera)` (uses `KHR_parallel_shader_compile`); render one hidden frame of each chapter state before lifting the loader. — https://threejs.org/docs/pages/WebGLRenderer.html `[verified]`
I3. **First-load order and timings** — 0.0 s background + wordmark (HTML, no JS); 0.2–1.2 s counter/line tied to real progress but never shorter than ~1.0 s; 1.2–2.6 s particles assemble into the sphere; 1.8 s headline lines rise (stagger 80–120 ms); 2.6 s label + CTA + scroll hint; total ≤ 3 s, skip the long version on repeat visits (`sessionStorage`). `[recalled]`
I4. **One transition reused** — the threshold-map wipe (C1) or the `clip-path` fold (C30) for DOM; for the particle scene the equivalent "one move" is the same turbulence envelope on every morph. `[verified]` sources in C1/C30; the reuse rule is `[recalled]`
I5. **Sound is opt-in** — autoplay with sound is blocked until the user has interacted; muted autoplay is always allowed; an `AudioContext` created at load must be resumed in a click handler: `button.addEventListener('click', () => ctx.resume())`. — https://developer.chrome.com/blog/autoplay `[verified]`
I6. **Sound restraint** — ambient off by default, visible mute control, remember the choice in the session, sounds only on key interactions (not on every hover/scroll); track mute rate as a quality signal. — https://supadark.com/notes/5-best-practices-for-designing-web-sound-effects `[verified]` (secondary)
I7. **Sound details that read as craft** — low-pass on state change (C10); one click sample with random playback rate (C40); synthesised pluck: three oscillators at `f`, `2f`, `3f` into a feedback delay (`delayTime 0.14`, feedback gain ramp to `0.32 + intensity*0.12` in 0.05 s); `AnalyserNode.getByteFrequencyData` can drive a visual parameter. — Trionn URL in C23 `[verified]`
I8. **Sound housekeeping** — fade master gain over ~0.3 s on toggle, suspend on `visibilitychange`, never start audio from scroll alone on iOS. `[recalled]`
I9. **Cursor: dot + ring** — two elements; ring follows with `last = lerp(last, client, 0.2)` per frame; over a link it enters a "stuck" state at the link centre and grows by `scale(1.08)` per frame up to the link bounds; optional simplex wobble (range 4, scale 150). — https://tympanus.net/codrops/2019/01/31/custom-cursor-effects/ `[verified]`
I10. **Cursor: modern minimal recipe** — `const xTo = gsap.quickTo(el, 'x', {duration: 0.4, ease: 'power3'})` (same for y), call on `pointermove`; enable only under `@media (hover: hover) and (pointer: fine)`; keep the native cursor on form fields; hide on `pointerleave` of the document. `[recalled]` (GSAP's own "Custom Cursor with gsap.quickTo()" pen exists: https://codepen.io/GreenSock/pen/dyjywaZ, not fetched)
I11. **Magnetic button formula** — trigger radius `rect.width * 0.7`; target `x = (mouse.x + scrollX - (rect.left + rect.width/2)) * 0.3` (same for y); follow with lerp `0.1`; inner label counter-moves by `-0.6 ×` the button offset; outside the radius target = 0. — https://raw.githubusercontent.com/codrops/MagneticButtons/master/src/js/demo1/buttonCtrl.js `[verified]`
I12. **Magnetic label swap timings** — on enter: text out 0.15 s `Power2.easeIn` (opacity 0, y −20 %), then in 0.2 s `Expo.easeOut` from y 100 %; mirrored on leave. — same URL `[verified]`
I13. **Hover distortion from velocity, not from hover alone** — pass smoothed scroll/pointer velocity as a uniform; stretch is strongest at the viewport centre and fades to the edges; edge smoothing of lines grows with velocity to read as motion blur. — https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/ `[verified]`
I14. **Per-letter random-opacity reveal for labels** — letters fade in in random order rather than left to right. — Bisous URL in C41 `[verified]`
I15. **Hit areas** — C29. Apply to chapter dots, sound toggle and footer links (min 44×44 px target `[recalled]`).

---

## 4. Particle look beyond the basics

P1. **Lit sphere impostor from a point sprite** —
```glsl
vec3 N; N.xy = gl_PointCoord * 2.0 - 1.0;
float m = dot(N.xy, N.xy); if (m > 1.0) discard;
N.z = sqrt(1.0 - m);
float diffuse = max(0.0, dot(uLightDir, N));
```
— Gives each particle a "solid bead" look; use on the nearest, in-focus particles only. — https://mmmovania.blogspot.com/2011/01/point-sprites-as-spheres-in-opengl33.html `[verified]`
P2. **Impostor for additive blending (no discard)** — keep the soft disc alpha, multiply colour by `mix(1.0, 0.35 + 0.65*diffuse, uSolid * inFocus)` and add `pow(max(dot(N, H), 0.), 32.) * 0.6` specular; fade `uSolid` to 0 as the circle of confusion grows so bokeh stays flat discs. — One uniform switches the system between "light points" (galaxy) and "beads" (DNA). `[recalled]`
P3. **Matcap on the impostor normal** — `vec3 mc = texture2D(uMatcap, N.xy * 0.5 + 0.5).rgb;` one 256 px texture gives metal/pearl/glass shading with no lights. — Premium "material" feel for the helix chapter. `[recalled]`
P4. **Iridescence** — `float f = pow(1.0 - N.z, 3.0); col += f * (0.5 + 0.5*cos(6.2831*(uHue + f*0.6 + vec3(0., .33, .67))));` — thin-film rim on beads; keep amplitude low (≤ 0.25) on a restrained palette. `[recalled]`
P5. **Per-particle colour variation** — `hue += (hash(aSeed) - 0.5) * 0.06; value *= mix(0.6, 1.4, hash(aSeed + 1.))`; let 2–4 % of particles take the accent colour at 3× brightness. — Removes the "one flat colour" tell while keeping near-mono. `[recalled]`
P6. **Speed-driven alpha** — `alpha = clamp(speed, 0.04, 0.8)`; moving particles glow, resting ones recede. — Dreamy URL in C43 `[verified]`
P7. **Twinkle** — `pow(noise(pos * highFreq + t), k)` with large `k` gives rare bright blinks. — Galaxy chapter. — Edan Kwan URL in C36 `[verified]`
P8. **Motion blur for point sprites (stretch along screen velocity)** — vertex: project the current and previous positions (previous = same morph evaluated at `progress - dProgress`, time `- dt`), `v = (ndcNow - ndcPrev) * 0.5 * uResolution`; `stretch = 1.0 + min(length(v) * uShutter / size, 4.0)`; `gl_PointSize = size * stretch`; pass `vDir = normalize(v)`. Fragment:
```glsl
vec2 p = gl_PointCoord * 2.0 - 1.0; p.y = -p.y;
vec2 q = vec2(dot(p, vDir), dot(p, vec2(-vDir.y, vDir.x)) * vStretch);
float a = smoothstep(1.0, 0.0, length(q)) / vStretch;   // energy-conserving
```
— Streaks only during morphs and fast scroll; `uShutter` 0.5 ≈ 180° shutter. `[recalled]`
P9. **Afterimage (ping-pong feedback), three.js built-in** — `new AfterimagePass(0.96)`; shader: `old *= damp * when_gt(old, 0.1); out = max(new, old)`; two half-float targets, nearest filter. — Trails for free; drive `damp` from the morph envelope (0.0 at rest → 0.85–0.92 in transition) so resting shapes stay crisp. — https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/shaders/AfterimageShader.js , https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/postprocessing/AfterimagePass.js `[verified]` (damp scheduling `[recalled]`)
P10. **Trails as geometry** — follower chain per head particle: `pos += (followPos - pos) * lerp` (C37); 6–12 followers on 300–600 "comet" particles reads as light threads without a feedback buffer. `[verified]` formula; counts `[recalled]`
P11. **Temporal accumulation when idle** — when scroll velocity ≈ 0, jitter the camera sub-pixel and blend `mix(history, current, 0.1)`; reset on movement. — Smooths bokeh noise on still frames; skip on mobile. `[recalled]`
P12. **Volumetric light (screen-space radial blur of the bright pass)** —
```glsl
vec2 d = (vUv - uLightUv) * uDensity / float(N); vec2 uv = vUv; float w = 1.0; vec3 c = vec3(0.);
for (int i = 0; i < N; i++) { uv -= d; c += texture2D(tBright, uv).rgb * w * uWeight; w *= uDecay; }
gl_FragColor = vec4(c * uExposure, 1.0);
```
N 32–48 at quarter resolution, density ≈ 0.9, decay 0.95–0.97, weight ≈ 0.5, exposure 0.2–0.4. — One chapter only (funnel throat or galaxy core). `[recalled]`; reference implementation listed at alien.js (C44) `[verified]`
P13. **Anamorphic streak** — blur the bright pass horizontally only (wide kernel, 1/8 resolution), tint slightly, add at 0.1–0.2. — Cinematic accent for the galaxy core. `[recalled]`; alien.js lists an example `[verified]`
P14. **Shadows/occlusion inside the cloud (cheap)** — darken by normalised depth through the shape (`occl = smoothstep(near, far, viewDepth)`; `col *= mix(1.0, 0.35, occl)`) and tint far particles toward the background hue. — Gives volume without a shadow map. `[recalled]`
P15. **True soft shadows on particles** — render particles from the light into a depth target and sample it in the particle shader (the approach associated with Edan Kwan's "The Spirit": curl noise + noise derivatives + triangle "new particles"). Costly; only for a tier-3 hero state. — repo description `[verified]` https://github.com/edankwan/The-Spirit ; shadow-map detail `[recalled]`
P16. **"Liquid" surface** — screen-space fluid: render impostor depth, blur it (bilateral), rebuild normals from depth derivatives, shade with fresnel + environment. — Too heavy for a scroll page; noted as the technique behind "solid blob" particle looks. `[recalled]`
P17. **Noise-edged fog on particles** — apply C2/C3 to particle alpha in world space for the horizon chapter. `[verified]` source in C2
P18. **Bloom reference values** — three.js example: `UnrealBloomPass(res, strength 1, radius 0.5, threshold 0)` with ACES and exposure from a slider; dreamy particles: threshold 0.2, strength 0.8. — Two sane starting points to bracket from. — https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/webgl_postprocessing_unreal_bloom.html , C43 `[verified]`
P19. **Line glow without a pass** — draw each line twice with additive blending: core 1 px at full brightness, halo 4–6 px at 0.08–0.15 alpha with a `smoothstep` profile across the width; fade lines by the same depth/DOF factor as particles. `[recalled]`
P20. **Lines that smear with speed** — widen the edge smoothing of line fragments with scroll velocity (I13). `[verified]`
P21. **Blue-noise dither for gradients and bokeh** — generate blue noise procedurally (no texture import) and use it as the dither/jitter source. — Edan Kwan URL in C36 `[verified]` (that he does it); implementation `[recalled]`

---

## 5. Tone mapping, colour management, WebGPU state

K1. **Colour management is on by default** — `THREE.ColorManagement.enabled = true`; hex/CSS colours are converted sRGB → Linear-sRGB on set (`setHex(0x808080)` → `r = 0.214`); direct `.r/.g/.b` writes are taken as linear. — https://threejs.org/manual/en/color-management.html `[verified]`
K2. **Custom shaders** — uniforms built from `THREE.Color` are already linear; a `ShaderMaterial` rendered straight to screen needs `#include <colorspace_fragment>` at the end of `main()`; `RawShaderMaterial` must convert itself. — same URL `[verified]` (add `#include <tonemapping_fragment>` before it if tone mapping is wanted without a composer `[recalled]`)
K3. **With post-processing, conversion happens once, in `OutputPass`** — it reads `renderer.toneMapping` and `renderer.outputColorSpace` and sets defines (`AGX_TONE_MAPPING`, `NEUTRAL_TONE_MAPPING`, `ACES_FILMIC_TONE_MAPPING`, `SRGB_TRANSFER`, …). Order: `RenderPass → bloom → (afterimage, CA, grain in linear) → OutputPass`. — https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/postprocessing/OutputPass.js `[verified]`
K4. **Composer default target is half-float, no MSAA** — `new WebGLRenderTarget(w*pr, h*pr, { type: HalfFloatType })`; pixel ratio is captured from the renderer at construction, change later with `composer.setPixelRatio()`. — https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/postprocessing/EffectComposer.js `[verified]`
K5. **MSAA** — to get it, pass your own target with `samples: 4`; for a scene of soft additive point sprites MSAA buys nothing, keep `samples: 0` and spend the budget on DPR; only thin `Line2` lines benefit. `[recalled]`
K6. **Precision rule** — sRGB targets are fine at 8 bits; linear targets need ≥ 12 bits → half float. — URL in K1 `[verified]`
K7. **Renderer constants and defaults** — `toneMapping` default `NoToneMapping`; options `Linear`, `Reinhard`, `Cineon`, `ACESFilmic`, `AgX`, `Neutral`, `Custom`; `toneMappingExposure = 1`; `outputColorSpace = SRGBColorSpace`; constructor defaults `antialias: false`, `stencil: false`, `depth: true`, `powerPreference: 'default'`; newer releases add `outputBufferType` (`HalfFloatType` for HDR). — https://threejs.org/docs/pages/WebGLRenderer.html `[verified]`
K8. **Which curve** — ACES: more contrast, darkens, shifts hues toward primaries (orange → yellow); AgX: neutral, lower contrast, flatter, good base for a grade; Khronos PBR Neutral (`NeutralToneMapping`): faithful brand colour, made for product/"3D inside 2D". All are effectively free. — https://discourse.threejs.org/t/tone-mapping-overview/75204 `[verified]`
K9. **Choice for this site** — AgX + a small contrast/saturation lift in the grade if the palette is near-mono with one accent; Neutral if the accent must match a CSS brand colour exactly; ACES only if the blown-out film look is wanted. Exposure 0.9–1.2 with HDR bloom. `[recalled]`
K10. **pmndrs/postprocessing alternative** — renderer `{ powerPreference: "high-performance", antialias: false, stencil: false, depth: false }`; `new EffectComposer(renderer, { frameBufferType: HalfFloatType })`; leave `renderer.toneMapping = NoToneMapping` and finish with `ToneMappingEffect`; effects in one `EffectPass` are merged into a single shader. — https://github.com/pmndrs/postprocessing `[verified]`
K11. **Half-float is not guaranteed on phones** — rendering to float targets needs `EXT_color_buffer_float` / `EXT_color_buffer_half_float`; float blending needs `EXT_float_blend`; check and fall back to 8-bit + tone-map-in-material. — https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices `[verified]`
K12. **WebGL 1 is gone** — WebGL 2 required since r163. — URL in K7 `[verified]`
K13. **WebGPU in three.js, autumn 2026** — entry point `three/webgpu` + `three/tsl` since r171; the manual still calls `WebGPURenderer` experimental; it falls back to WebGL 2 automatically (`renderer.backend.isWebGPUBackend`, `forceWebGL: true` to test); requires `await renderer.init()` or `setAnimationLoop`; `ShaderMaterial`, `RawShaderMaterial`, `onBeforeCompile` and `EffectComposer` do not run on it on either backend; post uses `RenderPipeline` (renamed from `PostProcessing` in r183). — https://www.utsubo.com/blog/webgpu-threejs-migration-guide `[verified]` (secondary)
K14. **Browser coverage** — Chrome/Edge desktop since 113; Safari 26 on macOS/iOS/iPadOS/visionOS; Firefox 141 (Windows), 145 (Apple Silicon); ~87 % global. — URL in K13 (secondary) and https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/ `[verified]`
K15. **Proof it ships** — Shader.se (C22) and Bruno Simon's portfolio (C40) run TSL/WebGPU in production with WebGL fallback. `[verified]`
K16. **Verdict for this site** — stay on `WebGLRenderer` + GLSL: the site is already written as `ShaderMaterial`, 28k vertex-shader particles do not need compute, and a port means rewriting every shader and the whole post chain in TSL. Revisit only if a GPGPU simulation with 200k+ particles becomes the concept. `[recalled]` judgement on `[verified]` facts

---

## 6. Performance on real devices

F1. **Adaptive quality algorithm (drei `PerformanceMonitor`)** — sample fps every 250 ms; collect 10 averages; bounds `[40, 60]` (or `[60, 100]` on > 100 Hz displays); if > 75 % of samples are above the upper bound → incline, below the lower → decline; `factor` starts 0.5, moves ±0.1; after too many flip-flops → `fallback` and stop monitoring. — https://raw.githubusercontent.com/pmndrs/drei/master/src/core/PerformanceMonitor.tsx `[verified]`
F2. **Vanilla version** —
```js
let acc = 0, n = 0, dpr = Math.min(devicePixelRatio, 2), flips = 0;
function sample(dtMs) {                       // call every frame
  acc += dtMs; if (++n < 45) return;
  const avg = acc / n; acc = n = 0;
  const budget = 1000 / refreshHz;            // measure refreshHz once at start
  if (avg > budget * 1.25 && dpr > 0.75) setDpr(dpr -= 0.25), flips++;
  else if (avg < budget * 1.05 && dpr < maxDpr && flips < 3) setDpr(dpr += 0.25), flips++;
}
```
`setDpr` → `renderer.setPixelRatio`, `composer.setPixelRatio`, update `uResolution` and point-size scale. Order of sacrifice: DPR → afterimage/CA → bloom resolution → particle count. `[recalled]`
F3. **GPU tier at startup** — `const t = await getGPUTier()` → `tier` 0 (< 15 fps or blocklisted/no WebGL), 1 (≥ 15), 2 (≥ 30), 3 (≥ 60), plus `isMobile`, `type` (`BENCHMARK`, `FALLBACK`, `BLOCKLISTED`, `WEBGL_UNSUPPORTED`…). Caveats: iOS hides the GPU model; the benchmark data source stopped updating in December 2025. — Use as the initial preset only; let F2 correct it. — https://github.com/pmndrs/detect-gpu `[verified]`
F4. **Screen size is a legitimate fallback heuristic** — 14islands assume larger screen = stronger device because detection is unreliable. — URL in C32 `[verified]`
F5. **Particle budgets by tier** — tier 3: 28k + all post; tier 2: 28k, half-res bloom, no afterimage; tier 1 / phones: 12–16k (drop every second u or v row so the grid stays regular), bloom at 1/4 res, DOF kept (it is in the vertex shader), DPR ≤ 1.5; tier 0: poster. `[recalled]` — direction confirmed by C12/C13/C38/C40 `[verified]`
F6. **Numbers studios quote** — ~100 draw calls on mobile; DPR cap 2; half-resolution post roughly doubles frame rate when fill-bound; `mediump` fragment shaders up to 2× faster on Adreno. — https://www.utsubo.com/blog/threejs-best-practices-100-tips `[verified]` (secondary)
F7. **Precision** — fragment `highp` is optional on some mobile GPUs: `#ifdef GL_FRAGMENT_PRECISION_HIGH precision highp float; #else precision mediump float; #endif`; keep position maths in the vertex shader. — MDN URL in K11 `[verified]`
F8. **iOS Low Power Mode halves rAF to ~30 fps; Safari caps at 60 fps** — so: all motion on delta time, damping frame-rate independent, and the adaptive loop must compare against the *measured* refresh interval, otherwise it will strip quality from a perfectly capable iPhone. Battery Status API is deprecated, so there is no direct detection. — https://motion.dev/magazine/when-browsers-throttle-requestanimationframe , https://github.com/darkroomengineering/lenis `[verified]` (the adaptive-loop consequence is `[recalled]`)
F9. **Context loss is normal on iOS** — backgrounding Safari drops the context since iOS 17 (reported as intentional). Handle `webglcontextlost` (call `preventDefault()` `[recalled]`), show the poster, and on `webglcontextrestored` rebuild; the blunt but working fallback is `location.reload()` inside the lost handler. Test with `renderer.forceContextLoss()`. — https://discourse.threejs.org/t/context-lost-when-backgrounding-safari-on-ios-17-developer-beta-8/55772 , URL in K7 `[verified]`
F10. **Viewport units** — `svh` (toolbars shown) and `lvh` (toolbars hidden) are stable; `dvh` follows the toolbar but is throttled, not 60 fps, and causes layout jank; supported Chrome 108, Firefox 101, Safari 15.4. — Fixed canvas and fixed chapter layer: `height: 100lvh`; content sized to the visible area: `100svh`; never `dvh` for anything animated. — https://web.dev/blog/viewport-units `[verified]`
F11. **Do not resize the renderer when only the address bar moved** — on touch devices ignore `resize` where width is unchanged and height changes < ~120 px; `ScrollTrigger.config({ ignoreMobileResize: true })` does the same for triggers; `ScrollTrigger.normalizeScroll()` moves scrolling to the JS thread and stops the address bar from showing/hiding. — https://gsap.com/docs/v3/Plugins/ScrollTrigger/ `[verified]` (the 120 px guard is `[recalled]`)
F12. **Canvas backing size** — size from `ResizeObserver` with `{ box: "device-pixel-content-box" }` (`devicePixelContentBoxSize`) to avoid moiré at fractional DPR. — MDN URL in K11 `[verified]`
F13. **Never block the GPU thread per frame** — no `getError`, `getParameter`, `checkFramebufferStatus`, `readPixels` in the loop. — same URL `[verified]`
F14. **Tiled mobile GPUs** — `gl.invalidateFramebuffer` on depth/stencil you will not reuse; budget VRAM per pixel of canvas rather than per device. — same URL `[verified]`
F15. **Fonts** — WOFF2 only; `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the display face `[recalled syntax]`; `font-display: swap` for brand display type, `optional` for body; `unicode-range` subsets so Latin and Cyrillic load separately; fallback metric overrides (`size-adjust`) to cut shift. — https://web.dev/articles/font-best-practices `[verified]`
F16. **Cyrillic subset ranges** — basic Cyrillic `U+0400-045F`, plus `U+0490-0491, U+04B0-04B1, U+2116` (№) as in Google Fonts' `cyrillic` subset; gate intro text reveals on `document.fonts.ready` so SplitText measures the real face. `[recalled]`
F17. **Core Web Vitals targets** — LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile, mobile and desktop separately. — https://web.dev/articles/vitals `[verified]`
F18. **LCP on an immersive page is the headline, not the canvas** — LCP candidates are images, video posters, CSS background images and text blocks; canvas is not listed; `opacity: 0` elements and full-viewport backgrounds are excluded. — So the H1 must be in HTML and painted (not at opacity 0 waiting for JS) within 2.5 s; start the reveal from a clip/translate mask, not from `opacity: 0`. — https://web.dev/articles/lcp `[verified]` (the mask advice is `[recalled]`)
F19. **Poster strategy** — CSS gradient or a ≤ 30 KB AVIF/WebP of the first particle frame under the canvas; canvas fades in on its first rendered frame; the same poster is the tier-0, context-lost and reduced-data fallback. — pattern confirmed in C16 `[verified]`; sizes `[recalled]`
F20. **Load order** — inline critical CSS + HTML text → fonts → `import('three')` after first paint → build geometry in idle time → `compileAsync` → reveal. Three.js is not on the critical path for LCP. `[recalled]`
F21. **`content-visibility: auto` + `contain-intrinsic-size: auto 800px`** — skips rendering of off-screen DOM while keeping it in the accessibility tree and find-in-page; demo result 232 ms → 30 ms rendering; Chrome 85, Firefox 125, Safari 18. — Use on long in-flow sections (cases, FAQ, footer); do not put it on the fixed chapter layer. — https://web.dev/articles/content-visibility `[verified]`
F22. **Render on demand when nothing moves** — scroll-rig and Trionn render only when needed (C23, C33). For a cloud with idle drift: full rate while scrolling or pointer-active, then drop to 30 fps after ~2 s idle (`Tempus` `fps: 30`, C31), stop when the tab is hidden or the canvas is off-screen. `[verified]` sources; the idle policy is `[recalled]`
F23. **INP hygiene** — no synchronous geometry builds or shader compiles in input handlers; split the five target-shape generators across idle callbacks or a worker (Shopify decodes in workers, C11). `[verified]` pattern; application `[recalled]`

---

## 7. Scroll engineering

S1. **Lenis 1.3.26 — options added since older write-ups** — `autoRaf` (false), `autoToggle` (false), `anchors` (false | ScrollToOptions), `allowNestedScroll` (false), `naiveDimensions` (false), `stopInertiaOnNavigate` (false), `prevent(node)`, `virtualScroll(e)`, `touchInertiaExponent` (1.7); properties `scroll`, `animatedScroll`, `targetScroll`, `actualScroll`, `progress`, `velocity`, `lastVelocity`, `direction`, `isScrolling`, `limit`. — https://github.com/darkroomengineering/lenis `[verified]`
S2. **Canonical Lenis + GSAP wiring** — `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);` — do not also pass `autoRaf: true`. — same URL `[verified]`
S3. **Recommended settings for this page** — `new Lenis({ lerp: 0.1, wheelMultiplier: 1, syncTouch: false, anchors: true })`; read `lenis.progress` as the single 0..1 source for particles and chapter text; add your own second-stage damping on the *morph* progress, not on the scroll. `[recalled]` recommendation on `[verified]` defaults
S4. **Touch: keep it native** — `syncTouch` defaults to false, i.e. Lenis leaves touch scrolling to the browser; it is flagged unstable on iOS < 16. Native momentum is what phone users expect and keeps the compositor thread scrolling; smooth the *result* (uniform damping), not the finger. — same URL `[verified]`; rationale `[recalled]`
S5. **Trade-off stated by a studio that builds this** — JS-driven scroll is slower than native but is perceived as smoother when DOM and WebGL move at one speed; cost: harder accessibility and page transitions. — 14islands URL in C32 `[verified]`
S6. **`lenis/snap`** — `new Snap(lenis, { type: 'proximity' | 'mandatory' | 'lock', distanceThreshold: '50%', debounce: 500, lerp, duration, easing, onSnapStart, onSnapComplete })`; `snap.add(px)`, `snap.addElement(el, { align: 'start' | 'center' | 'end' })`, `next()`, `previous()`, `goTo(i)`. — For chapters: `type: 'proximity'`, `distanceThreshold: '20%'`–`'30%'`, `debounce` 300–500 ms so the page settles on a composed frame but never fights the user. — https://github.com/darkroomengineering/lenis/blob/main/packages/snap/README.md `[verified]` (the 20–30 % suggestion is `[recalled]`)
S7. **GSAP snap** — `snap: { snapTo, duration: {min: 0.2, max: 3}, delay, ease: 'power3', directional: true, inertia: true }`; `scrub: 0.5` = playhead takes 0.5 s to catch up; `anticipatePin` 0–1; `fastScrollEnd` threshold 2500 px/s. — https://gsap.com/docs/v3/Plugins/ScrollTrigger/ `[verified]`
S8. **CSS scroll snap** — `scroll-snap-type: y proximity` (may snap) vs `mandatory` (must snap; content taller than the viewport can become unreachable); Baseline since 2022; not compatible with Lenis smooth wheel — use it only on the native-scroll (touch / reduced-motion) path. — https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type , Lenis README `[verified]`
S9. **CSS scroll-driven animations in 2026** — Chrome/Edge 115+, Safari 26+, Firefox still not in stable (MDN marks it not Baseline); they run off the main thread. Syntax: `animation: reveal linear; animation-timeline: view(); animation-range: entry 25% cover 50%;` or `animation-timeline: scroll(root block)`; declare `animation` *before* `animation-timeline`. — https://developer.chrome.com/docs/css-ui/scroll-driven-animations , https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/ , https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline `[verified]`
S10. **Where to use them here** — progress bar, chapter counter, and in-flow section reveals inside `@supports (animation-timeline: view())`, wrapped in `@media not (prefers-reduced-motion)`; fixed chapter text that must stay in lockstep with shader uniforms stays on the JS progress value (CSS timelines follow native scroll, uniforms follow Lenis' smoothed value — they would drift). — wrapper `[verified]` (WebKit URL); the drift reasoning `[recalled]`
S11. **JS API** — `new ScrollTimeline({ source: document.documentElement })`, `new ViewTimeline({ subject })`, used as `el.animate(keyframes, { timeline, rangeStart, rangeEnd })`. — Chrome URL in S9 `[verified]`
S12. **Keyboard** — keep real document scroll (Lenis does) so Space/PageDown/arrows/Home/End work; add chapter links as real `<a href="#ch-3">` and let `anchors: true` or `lenis.scrollTo('#ch-3', { duration: 1.2 })` animate them; on `focusin` of an element inside a chapter, scroll to that chapter so focus is never on invisible content. — `scrollTo` API `[verified]` (S1 URL); focus handling `[recalled]`
S13. **Mode switching** — GSAP Observer to swap free scrub and locked steps (C6). `[verified]`
S14. **One clock** — a single ordered loop (C31 or `gsap.ticker`): Lenis → GSAP → uniforms → render; Tempus `order` makes the sequence explicit. `[verified]`

---

## 8. Personal-brand, advisory and boutique-firm sites (US/EU, 2023–2026)

Honest scope: pages were read as text through the fetcher, so type faces, sizes and motion could not be seen; "visual tier" below comes from the curator that listed the site (Awwwards, a1.gallery) where one exists. Use rows 1–6 for visual bar and restraint, rows 7–16 for selling logic. All `[verified]` by fetching the URL unless noted.

W1. **Dragonfly** (crypto fund; Studio Freight; Awwwards SOTD) — https://dragonfly.com — First viewport: numbered section "01 About" + one sentence ("Eight years in… access and influence to teams with global aspirations"). Type: Non Natural Grotesk + Mondwest on black (case study). Proof: indexed list of 100+ portfolio names, cheque range "$3M to $30M+". CTA: one-word verbs — "View", "Browse", "Join". Left out: AUM, returns, testimonials, thesis essay. Case study: https://www.awwwards.com/case-study-dragonfly-by-studio-freight.html
W2. **Montfort** (commodity trading/investment; Immersive Garden; Awwwards SOTD 7.62, animations 9.0) — https://mont-fort.com — First viewport: one definitional sentence ("Montfort is a global commodity trading and asset investment company.") + sub + a single link CTA "Who we are". Proof: numbered sections 1–4 and four statistics. Palette of two colours (#29648e, #f4f6f8). Left out: testimonials, team, pricing, cases. Score page: https://www.awwwards.com/sites/montfort
W3. **New Layer Capital** (fund; built by Obys) — https://nlc.obys.agency — First viewport: name + one-line positioning. Type: bold sans, key phrases coloured inside sentences. Proof: four big numbers ($1B, 15+, 75+ years, since 2013), founder quotes with names, portfolio grid with years. CTA: "Invest With Us", "Connect Now". Left out: team photos, fund terms, blog.
W4. **Benchmark** — https://www.benchmark.com — Entire site: two office addresses and one social link. No nav, no portfolio, no copy. The limit case of "what is left out" as a status signal.
W5. **Founders Fund** — https://foundersfund.com — First viewport: the name only; nav of four words (Portfolio, Team, Manifesto, Anatomy of Next); one featured line about one company. Left out: tagline, numbers, about, form.
W6. **Thrive Capital** — https://www.thrivecap.com — One sentence of description, one nav item ("Info"), a clock/date readout. Left out: everything else.
W7. **Partech** (EU VC; a1.gallery pick for big type) — https://www.partechpartners.com — First viewport: all-caps wordless-space headline "INDEPENDENTINTHOUGHT." + "Putting ambition in motion." CTA: "Discover Portfolio". Proof: three recent deals with amounts and dates. Left out: AUM, returns.
W8. **Designer Fund** (a1.gallery: minimal typographic) — https://www.designerfund.com — First viewport: one long sentence headline ("We back exceptional founders and empower them with design to improve the world.") + scope sentence. Proof: eight flagship names (Stripe, Notion, Linear, Framer…) before the full list. Left out: fund size, process.
W9. **Side Stage Ventures** (a1.gallery: dark typographic) — https://sidestage.vc — Headline in first person plural ("We're building the seed fund we wish we had…"), label "a founder-led seed fund". Nav: three items. CTA: lowercase "get in touch". Proof: founder quotes with faces, press links. Left out: FAQ, blog, fees.
W10. **Mochary Method** (CEO coaching) — https://www.mocharymethod.com — Headline is a thesis, not a promise: "Founding a company is easy; scaling it is hard." Proof: two named CEO quotes (Reddit, Coinbase), client cards with founder, coach, stage, capital raised. Price stated: "1:1 coaching engagements begin at $10,000/month." CTA: "Request coaching". Left out: blog, free assessment, lead magnet.
W11. **April Dunford** (positioning consultant) — https://www.aprildunford.com — Headline: "Practical positioning that accelerates marketing and sales." Sub names the buyer's situation. Proof: logo grid, four named executive quotes, two books. CTA: "Contact April", "Let's Work Together". Left out: pricing, process timeline, blog on the home page.
W12. **Jim Collins** (advisor/author) — https://www.jimcollins.com — First viewport: name + one-sentence role ("a student and teacher of exceptional human endeavor and a Socratic advisor to leaders"). Proof: book covers and "25 years of rigorous research". CTA: "learn more" only. Left out: testimonials, newsletter capture, prices.
W13. **Benedict Evans** (UK analyst) — https://www.ben-evans.com — Headline is a question: "What matters in tech?" + one first-person sentence. Proof: one number (~200,000 newsletter readers). CTA: "SUBSCRIBE". Left out: clients, speaking form, testimonials.
W14. **Reboot** (CEO coaching firm) — https://www.reboot.io — Philosophy line carries the brand: "Better Humans Make Better Leaders…" Proof: named quotes (Brad Feld, Nathan Barry), press logos. CTA: "Work with us", "Inquire here". Left out: pricing.
W15. **Daniel Priestley** (UK entrepreneur/educator) — https://www.danielpriestley.com — Headline: "Get known. Get oversubscribed." Proof: 20+ media logos, podcast claim, event photos. CTAs are many ("Become a Key Person Of Influence", "Get More Leads", "Book Daniel To Speak"). Useful as the counter-example: more offers and logos, lower perceived tier than W10–W13.
W16. **Acquisition.com** (Hormozi) — https://www.acquisition.com — Headline is a question ("Do You Want to Scale Your Business?"), proof is four numbers (81 businesses, 97.1 % NPS, 12,000 participants, $250M+). CTA: "I'm ready to scale". Left out: testimonials on the home page. Direct-response tier: effective, not premium-looking.
W17. **Strategyzer** (EU strategy firm) and **Simon Sinek / Esther Perel** — https://www.strategyzer.com , https://simonsinek.com , https://www.estherperel.com — product-led personal brands: first viewport sells the current product (playbooks, app, tour), not the person; many nav items. Useful only to see how the page changes once the business is products, not engagements.

**Patterns across the set** `[verified]` observations, synthesis mine:
W18. **The higher the ticket and status, the fewer words above the fold** — W4–W6 show a name or one sentence; W1–W3 one sentence + one link.
W19. **Headline forms that recur at the top tier** — a definition ("X is a …"), a thesis ("… is easy; … is hard."), or a question; never a benefit stack.
W20. **Proof is names and numbers, typeset, not decorated** — indexed lists, 3–4 large figures, quotes with full name and company; carousels and star ratings appear only in the lower tier.
W21. **CTA wording is short and plain** — "Request coaching", "get in touch", "Invest With Us", "Who we are"; one verb phrase repeated, no urgency language.
W22. **What the top tier omits** — pricing tables, lead magnets, pop-ups, chat, FAQ walls, logo carousels, blog previews, multiple competing buttons. W10 is the instructive exception: a single stated price floor acts as a filter.
W23. **Gap that remains** — no individual consultant or coach site was found that is also an Awwwards-class WebGL piece; the WebGL-grade references in finance/advisory are firms (W1–W3). A particle site for a solo consultant is therefore a differentiator, and the copy/proof conventions should be taken from W10–W13.

---

## 9. Accessibility and resilience

A1. **DOM is the source of truth** — all copy in semantic HTML (`<main>`, one `<h1>`, a `<section aria-labelledby>` + `<h2>` per chapter, real `<a>`/`<button>`); the canvas is decoration. Three levels must work: no JS, JS without WebGL, full WebGL. — 14islands URL in C32, Codrops URL in T1 `[verified]`
A2. **In-flow sections with sticky content beat `position: fixed` text** — give each chapter a tall in-flow `<section>` whose content is `position: sticky; top: 0; height: 100svh`; scroll length, anchors, focus order, find-in-page and no-JS reading come for free, and the visual result equals fixed text. If the fixed layer is kept, mirror its order in the DOM and manage `inert`. `[recalled]`
A3. **Hide without removing** — `color: transparent` keeps text selectable and readable by assistive tech when a WebGL copy is drawn; never `display: none` for content that should be read. — URL in T1 `[verified]`
A4. **Canvas semantics** — `<canvas aria-hidden="true">` (or `role="presentation"`), no tabindex; pointer effects must not be the only way to get information. `[recalled]`
A5. **Skip link** — first focusable element; positioned off-screen (not `display: none`, not zero-size), becomes clearly visible on focus; targets `<main id="content">`. — https://webaim.org/techniques/skipnav/ `[verified]`
A6. **Inactive chapters** — set `inert` (and `aria-hidden="true"`) on chapter text whose opacity is ~0 so Tab does not land on invisible links; remove both when it becomes active. `[recalled]`
A7. **Pause control is a requirement, not a nicety** — WCAG 2.2.2: motion that starts automatically, lasts > 5 s and runs alongside other content needs a way to pause, stop or hide it unless essential. The idle particle drift qualifies → add a small "motion: on/off" toggle next to the sound toggle. — https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html `[verified]`
A8. **Reduced motion = reduce, do not remove** — replace movement with fades/dissolves; parallax and zoom are the named vestibular triggers; listen for changes: `const mq = matchMedia('(prefers-reduced-motion: reduce)'); mq.addEventListener('change', apply)` (parentheses required). — https://web.dev/articles/prefers-reduced-motion `[verified]`
A9. **Reduced-motion recipe that keeps atmosphere** — native scroll (Lenis off; it honours the setting by default), no scroll-scrubbed morph: each chapter cross-fades to its finished shape over 400–600 ms when it becomes active; turbulence and camera travel off; idle drift at ~25 % amplitude or frozen; DOF, colour and bloom unchanged; text appears by opacity only. Precedents: Trionn slows instead of stopping (C28), Shopify keeps the simulation but drops scroll-driven impulses (C15). `[verified]` precedents; recipe `[recalled]`
A10. **No-WebGL / weak-GPU path** — tier 0 from `detect-gpu` (`WEBGL_UNSUPPORTED`, `BLOCKLISTED`, < 15 fps) or a failed context → per-chapter poster images (five stills of the shapes) behind the same text; `failIfMajorPerformanceCaveat: true` on a probe context detects software rendering. — https://github.com/pmndrs/detect-gpu , https://threejs.org/docs/pages/WebGLRenderer.html `[verified]` (option exists); the poster set is `[recalled]`
A11. **Context-lost path** — same poster, then rebuild or reload (F9). `[verified]`
A12. **`<noscript>` and print** — `<noscript>` style that makes all chapter text visible in flow; a print stylesheet that drops the canvas and fixed positioning. `[recalled]`
A13. **Focus visibility over a moving scene** — `:focus-visible` ring with 3:1 contrast against both the dark background and bright particles: double ring (`outline: 2px solid #fff; box-shadow: 0 0 0 4px #000`). `[recalled]`
A14. **SEO: content in the initial HTML** — Google renders JS but in a second phase; server-rendered or static HTML is still recommended and is the only thing other crawlers see; links must be `<a href>`; do not use `#fragment` routes to hold distinct content (fragments for in-page chapters are fine); do not ship `noindex` and remove it with JS; fingerprint JS/CSS file names. — https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics `[verified]`
A15. **Head for a Russian one-pager** — `<html lang="ru">`, unique `<title>` and meta description in the HTML, `<link rel="canonical">`, and Open Graph: `og:title`, `og:type` (`website`), `og:url`, `og:image` (+ `og:image:width`, `og:image:height`, `og:image:alt`), `og:locale` in `language_TERRITORY` form → `ru_RU`. — https://ogp.me/ `[verified]`
A16. **Share card and structured data** — 1200×630 image rendered from the real particle frame + the headline in the site's display face; `twitter:card = summary_large_image`; JSON-LD `Person` (name, jobTitle, url, sameAs) and/or `ProfessionalService`. Messengers and VK/Telegram read OG tags without running JS, so they must be static. `[recalled]`
A17. **Off-screen DOM stays accessible with `content-visibility: auto`** — unlike `visibility: hidden`, it remains in the accessibility tree and searchable. — URL in F21 `[verified]`

---

## Top 25 concrete changes for the described site

Ordered by impact per unit of effort. References point to items above.

1. **Make the scene yield under every text block** — pass the active text rect as `uTextRect` (T7) and dim/shrink particles inside it (T8); add the exposure dip (T11). Half a day; fixes the largest legibility risk.
2. **Compose each chapter off-axis** — shift the particle group / view offset so the mass and the copy never share a half of the screen; phones: object up, copy in the lower third (T9).
3. **Fix the colour pipeline order** — half-float composer (K4), `RenderPass → bloom → OutputPass` (K3), `renderer.toneMapping = AgXToneMapping` (or Neutral for exact brand accent), exposure 0.9–1.2 (K8, K9), with an 8-bit fallback when half-float is not renderable (K11).
4. **Put the headline in HTML and let it be the LCP element** — visible without JS, revealed by mask not by `opacity: 0` (F18); load three.js after first paint (F20).
5. **Tier integer + adaptive DPR measured against the real refresh interval** — `detect-gpu` for the starting tier (F3), the loop in F2, and the Low Power Mode guard (F8); mobile budget from F5.
6. **`100lvh` canvas, ignore address-bar resizes** (F10, F11) — removes the most visible iOS glitch (particles jumping scale while scrolling).
7. **Handle context loss with a poster** (F9, F19, A11) — otherwise returning to the tab on iPhone shows a black page.
8. **One ordered loop** — Lenis → GSAP → uniforms → render, single clock (S2, S14, C31); read `lenis.progress` once per frame for both text and shader (T16).
9. **Chapters as tall in-flow sections with sticky content** instead of fixed text (A2) + skip link (A5) + `inert` on inactive chapters (A6).
10. **Proximity snap to composed frames** — `lenis/snap` `type: 'proximity'`, threshold 20–30 %, debounce 300–500 ms (S6).
11. **Reduced-motion and "motion off" path** — cross-fade between finished shapes, drift at 25 % or frozen, native scroll (A8, A9); the toggle also satisfies WCAG 2.2.2 (A7).
12. **Warm-up before reveal** — `compileAsync` + one hidden frame per chapter state (I2, C24); loader runs on DOM/SVG and hands over to the canvas (I1, I3).
13. **Motion streaks only during morphs** — afterimage with `damp` tied to the morph envelope (P9); on tier 3 add velocity stretch (P8).
14. **Per-particle variety** — hue ±0.03, value 0.6–1.4, 2–4 % accent particles at 3× (P5); speed-driven alpha (P6).
15. **"Bead" material for one chapter** — impostor lighting on in-focus particles for the DNA helix (P1, P2), optional matcap (P3); keep the galaxy as pure light points. Gives the shapes different materials, not only different positions.
16. **A hero number built from the particles** — one extra morph target sampled from canvas text (T15) at the proof chapter.
17. **Horizon chapter: height fog with a noise edge** (C2, C3, P17) and a horizon sphere (C4) instead of a hard particle plane edge.
18. **One signature wipe** — threshold-map pass (C1) for the intro reveal and for the entry to the final CTA scene.
19. **Line glow in-shader** — two additive draws per line, depth/DOF-faded like particles (P19); smear with velocity (P20).
20. **Cyrillic font delivery** — WOFF2, preload the display face, `unicode-range` subset, metric-matched fallback, reveal gated on `document.fonts.ready` (F15, F16).
21. **Magnetic CTA + cursor on fine pointers only** — formula from I11 (radius 0.7 w, pull 0.3, lerp 0.1, label −0.6), cursor via `quickTo` (I10), enlarged hit areas (C29).
22. **First viewport and proof in the top-tier grammar** — one definitional or thesis headline, one label, one plain CTA (W18, W19, W21); proof as 3–4 typeset numbers and named quotes (W20); state the price floor once as a filter (W10, W22).
23. **Static head** — `lang="ru"`, title/description/canonical, OG with `ru_RU` and a 1200×630 card from a real frame, JSON-LD `Person` (A14–A16).
24. **Idle policy** — full rate while scrolling/pointer-active, 30 fps after 2 s idle, stop when hidden (F22); `will-change` only during tweens (C26).
25. **Optional sound, last** — off by default, context resumed on the toggle click (I5), ambient bed + low-pass on chapter change (C10) + one click sample with rate variation (C40); fade and suspend rules (I8).

---

## Sources still unreachable or without usable content

- **Blocked by robots.txt:** https://github.com/protectwise/troika/tree/main/packages/troika-three-text (docs site read instead); https://www.khronos.org/webgl/wiki/HandlingContextLost (three.js forum thread used instead; `preventDefault()` detail is therefore `[recalled]`); https://www.linkedin.com/pulse/particle-love-edan-kwan .
- **404 / wrong path:** https://threejs.org/manual/en/webgpurenderer.html (WebGPU status taken from utsubo, a secondary source, plus WebKit); first guess at the Codrops MagneticButtons source path (correct path found and read).
- **Reachable but no technical content:** Codrops profiles of Lusion (2026-04), Unseen Studio (2026-07), Studio Freight (2026-07), makemepulse (2026-07); Robin Payot spotlight (tools only); The-Spirit README (two lines — particle count, shadow and motion-blur implementation live in source files that were not read); Lesse Studio and Bisous case studies (stack and design notes, no rendering parameters); caniuse scroll-timeline page (data not exposed to the fetcher; versions taken from Chrome and WebKit docs).
- **No public technical write-up found in this session:** Resn, Locomotive, Dogstudio/DEPT, Hello Monday, Merci-Michel (older entries exist in https://github.com/luruke/awesome-casestudy — 2015–2022, titles only were read), Aristide Benoist, Patrick Schroen beyond the alien.js example index, Lusion's own case studies and Edan Kwan's talks (only the 2020-era Medium post was readable), Darkroom posts on Hamo and Satus (only Lenis, Tempus and the Dragonfly case study were read).
- **Sites that returned only metadata:** https://www.winwithoutpitching.com (meta title "Sell and price like the expert you are" only); https://www.thrivecap.com (one sentence + one nav item — may be the whole page or a client-rendered shell).
- **Not visually inspected:** every site in section 8 was read as text; typefaces, sizes, motion and first-viewport composition need a manual look or screenshots before being used as visual references.
- **Awwwards per-site score pages** other than Montfort were not attempted (blocked in wave 1).
