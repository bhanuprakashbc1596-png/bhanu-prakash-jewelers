# Bhanu Prakash Jewelers — Cinematic Website

A premium, scroll-driven single-page website for the real gold & silver
showroom **Bhanu Prakash Jewelers, N.H.B Colony, Hootagalli, Mysore**.
Scroll and cursor both drive an ultra-smooth scrubbed background film
(jewellery being assembled) behind a continuous cinematic story arc.

No build step, no framework, no dependencies. Plain HTML / CSS / JS served
over a local HTTP server so video, images and the film frames load correct.

---

## Run locally

Requires Python (3.x) or any static file server.

From this directory:

```powershell
python -m http.server 8123 --bind 127.0.0.1
```

Then open:

```
http://127.0.0.1:8123/index.html
```

Why a server and not just double-clicking the file? The page loads real
video and 60 extracted film frames. Browsers treat `file://` media as
cross-origin and block/limit seeking and playback. Running through HTTP
avoids that.

Optional — replace the empty favicon: no `favicon.ico` is present, so the
browser requests `/favicon.ico` (harmless 404 in the console).

---

## How it works

- **Cine background film.** `assets/videos/showcase.mp4` (10 s, H.264,
  keyframes every 1 s) sits `position: fixed` behind all content. Scroll
  position + cursor X position blend into a target timeline time
  (`target = scrollP + (cursorP - 0.5) * 0.6` seconds), smoothed every
  animation frame with a LERP factor of 0.10 for a "stone-by-stone" feel.
- **Self-testing scrubber.** On load the page probes whether the browser
  honours a paused `currentTime` seek. If yes → true video scrub (`fastSeek`)
  against the all-keyframe encode, so every scrub frame renders instantly.
  If no (some Chrome/Edge builds clamp paused seeks to 0.00 regardless of
  keyframes) → it silently switches to a **frame-strip scrub**: 60 stills
  pre-extracted from the film at `assets/frames/f-001..f-060.jpg`, swapped
  through the same LERP math, so the film scrubs on every machine. The page
  adds `cine.frame-mode` / `cine.video-mode` accordingly. Verified: an
  all-keyframe (`-g 1`) encode still reads `currentTime = 0` after a seek on
  this machine's browser — the clamp is the browser's, not the file's — so
  the frame strip is what guarantees motion here.
- **3D parallax & lighting.** Each frame subtly tilts toward the cursor
  (`rotateX/Y`, translate, scale 1.06) with a red cursor-tracking spotlight,
  vignette, film grain and scanline overlays, plus a 2 px red glowing
  progress bar across the top.
- **Scenes.** Every pinned section (`#jewellery`, `#collection`, `#craft`,
  `#gold-silver`, `#visit`) plays transform/opacity/size keyframes from
  `SCENES` in `js/main.js` driven by scroll progress through custom CSS
  properties.
- **Canvas particles.** Floating gold dust on the hero and above the rail.
- **Reduced motion.** `prefers-reduced-motion: reduce` hides the cine film,
  unpins scenes and paints static frames — full content, no animation.

---

## Asset manifest

```
index.html                 26.1 KB   page structure + all copy
css/styles.css             31.7 KB   layout, scenes, overlays, media styles
js/main.js                 25.8 KB   all behaviour (scenes, rail, cine, particles)

assets/images/             22 files   0.74 MB   real showroom & jewellery photos
  img-01.jpg   storefront / hero background + visit card
  img-02.jpg   necklace set            (showcase + necklaces card)
  img-03.jpg   traditional bangles     (showcase + bangles card)
  img-04.jpg   bracelet                (showcase + bracelets card)
  img-05.jpg   silver jewellery panel  (metals + silver card)
  img-06.jpg   gold jewellery          (metals + gold card)
  img-07.jpg   earrings
  img-08.jpg   workshop / craft background
  img-09.jpg   custom design work
  img-10.jpg   repair & services
  img-11..img-22  extra "From the Showroom" rail cards

assets/videos/
  showcase-intra.mp4    17.58 MB   H.264, 1920x1080, 10 s, EVERY frame a keyframe (primary)
  showcase.mp4           8.49 MB   H.264, 1920x1080, 10 s, 1 s keyframes (fallback)
  showcase.webm          5.21 MB   VP8 fallback (also available for browsers without H.264)

assets/frames/          60 files   4.34 MB   f-001..f-060.jpg (1280x720) frame-strip scrub

source film kept for reference in the project root:
  Gold_jewelry_set_being_assembled_20260921193254.mp4
```

All 87 page assets were HTTP-checked: **200 OK for every file** (22 images,
60 frames, 2 videos, HTML/CSS/JS).

---

## Timeline configuration

Scroll checkpoints and what they reveal (fractions of total scroll height):

| p      | Section / scene                | Experience                                  |
|--------|--------------------------------|---------------------------------------------|
| 0.00   | `#welcome`                     | Storefront hero — "Welcome to Bhanu Prakash Jewelers" |
| 0.18   | `#jewellery` (intro)           | Welcome transition, showcase intro          |
| 0.30   | `#jewellery` (necklace)        | Enter the jewellery world — necklace shot   |
| 0.45   | `#jewellery` (bangles)         | Discover necklaces & bangles                |
| 0.58   | `#jewellery` (bracelet)        | Bracelets & other jewellery                 |
| 0.76   | `#works`                       | Jewellery Works — category cards            |
| 0.84   | `#collection` + `#craft`       | Collection rail + craftsmanship transition  |
| 0.92   | `#gold-silver` / `#visit`      | Gold & silver story, then find the shop     |
| 1.00   | `#closing`                     | "Visit us / Return to the real store" + final "Thank You" signature |

The cine film timeline is matched to scroll: top of page ≈ film start,
bottom ≈ film end, with cursor X nudging ± the equivalent of ~60% of film
duration around it. See `SCENES` in `js/main.js` for the per-element
keyframe config (arrays of `[progress, value]` pairs for translate `ax/ay`,
scale `as`, rotate `ar`, blur `ab`, opacity `ao`).

---

## Missing assets (none required)

The site is complete with the supplied photos and the user's own film.
Suggested future upgrades (optional, not required):

- A favicon (currently browsers 404 a default `/favicon.ico`).
- A real exterior photo for the visit section's darker card (it reuses
  `img-01.jpg` by design, not by accident).
- An embedded Google Maps map widget (extra API key; the plain Google Maps
  directions button already works without one).
- Higher-resolution close-up stills of individual pieces.

No prices, purity marks, review counts, awards, or years-of-experience
claims are made anywhere — by design, to stay truthful.

---

## Verification results

Automated browser QA (real Chromium + headless, on this machine):

- **Desktop 1280 × 800 / tablet 768 × 1024 / mobile 390 × 844:**
  Zero horizontal overflow at every checkpoint (`scrollWidth ≤ clientWidth`).
- **9 scroll checkpoints (p = 0.00 → 1.00):** no layout overflow, sticky
  scenes resolve, no JS exceptions.
- **Images:** all 37 `<img>` elements resolve; every asset returns HTTP 200;
  `object-fit: cover` inside framed/ratio boxes prevents stretching and holes.
- **Dead buttons / links:** 14 anchors, 0 dead (`#hash` targets all exist);
  nav links, hero CTA, directions button, 9 filter chips, prev/next rail
  buttons, mobile toggle all functional. Nav toggle verified to flip
  `aria-expanded` and `aria-hidden`.
- **Filters:** Gold chip → 1 visible card + `is-active` chip; all others
  hidden; work-card jump-to-collection wired.
- **Keyboard:** all interactive elements are real `<button>`/`<a>`; work
  cards are `tabindex="0"` with Enter/Space activation.
- **Reduced motion:** emulated `prefers-reduced-motion: reduce` →
  cine opacity `0`, pinned scenes fall back to `position: relative`,
  matchMedia confirmed.
- **Console:** zero uncaught exceptions. The only console noise is
  `ERR_CONNECTION_REFUSED` for Google Fonts **when this machine is offline**
  (fonts degrade gracefully to Georgia/serif).
- **Cine scrub:** on this machine browsers clamp paused video seeks to 0,
  so the page self-selected `frame-mode` — mouse-right scrubbed frame
  f-007 → f-018, scrolling f-007 → f-031, back-to-top returned to f-001
  region, first frame rendered, no exceptions.

---

*© Bhanu Prakash Jewelers — TRUST • TRADITION • CRAFTSMANSHIP*