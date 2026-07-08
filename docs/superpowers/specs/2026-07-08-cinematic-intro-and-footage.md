# Cinematic Intro + New Footage Integration — Design

## Problem

The funnel's copy/structure already matches the brand docs (`Beschreibung des Funnels.docx`,
`Markenprofil.doc`, `Phoenix-Funnel-struktur.pdf`, `Phoenix_Color_System_with_Swatches.docx`)
closely, but the visual execution still reads as a static-photo slideshow rather than the
"Netflix-trailer" cinematic experience those docs call for. The user has produced new footage
(`~/Documents/coaching-mama/footage`, `logo`, and the root-level founder photo) intended to
fix this — but only for specific, named moments this round, not a full video overhaul (no
video compression tooling is available in this environment: no ffmpeg, no Homebrew).

## Decisions (from brainstorming)

- **Scope is deliberately narrow this round**: only the assets the user explicitly named.
  Hero, Mirror scenes, and all 4 Gateway backgrounds stay static images — even though
  matching video clips exist for most of them — because there's no way to compress video
  here and page weight is already a real concern with just two videos.
- **"Fable particle effects"** = a mythical/storybook ember burst, built by reusing the
  existing Three.js gold-dust particle system already running on the page (not a new
  bespoke effect, not a specific named tool/library).
- **The opening sequence is a one-time overlay**, not a replacement for the hero background.
  It plays, then reveals the existing hero underneath.
- **Session-scoped replay**: the intro plays once per browser session (`sessionStorage`),
  not on every navigation back to `index.html`.
- **A skip control is required** — nobody gets trapped behind a 6-second video.

## Assets and where they come from

Source files live under `~/Documents/coaching-mama` (TCC-restricted for serving — same
issue hit earlier in this project — so everything gets copied into
`~/Sites/coaching-mama/assets/` before use):

| Source | Destination | Use |
|---|---|---|
| `footage/intro_phönix_flames_being_born.mp4` | `assets/video/intro-flames.mp4` | Opening sequence video |
| `footage/rise_of_the_phönix_sand.mp4` | `assets/video/rise-sand.mp4` | New scene before "The World of the Phoenix" |
| `logo/phönix_emblem.png` (cropped) | `assets/img/phoenix-emblem.png` | Revealed at the end of the opening sequence |
| `carmen_founder.png` (resized/converted) | `assets/img/carmen-founder.jpg` | Replaces the "coming soon / Talking Head" placeholder in the Founder Circle offer scene |
| `footage/Bild-FounderCircle-Bildschirmfoto 2026-06-02 um 09.52.41.png` (resized/converted) | `assets/img/journey-woman.jpg` | Replaces the reused storm photo in the Gateway-1 CTA scene |

`phönix_emblem.png` has a baked-in "PNG VERSION / SVG VECTOR VERSION" caption band at the
bottom from wherever it was generated — this gets cropped off before use; shipping it as-is
would show that text live. The two photos get resized/re-encoded as JPEG with `sips` (no
ffmpeg needed for stills) to cut their size without visible quality loss at web dimensions.
The videos ship at original size — no tooling available to shrink them.

## Opening sequence

New markup at the very top of `<body>` in `index.html`, before the existing preloader:

```html
<div class="intro" id="intro">
  <video class="intro__video" id="introVideo" src="assets/video/intro-flames.mp4"
         muted playsinline autoplay></video>
  <img class="intro__logo" id="introLogo" src="assets/img/phoenix-emblem.png" alt="">
  <button class="intro__skip" id="introSkip" type="button">Überspringen</button>
</div>
```

Behavior (new `js/intro.js`, loaded before `js/main.js`):

1. On page load, check `sessionStorage.getItem('introSeen')`. If set, add `.intro--done` to
   `#intro` immediately (display: none via CSS) and stop — no video, no delay, existing
   preloader/hero flow proceeds exactly as it does today.
2. Otherwise, play the video. Scrolling is disabled (`overflow: hidden` on `html`) for the
   duration.
3. On the video's `timeupdate`, once `currentTime` is within ~0.4s of `duration` (or on the
   `ended` event, whichever fires first — some browsers fire `ended` late), trigger the
   ember burst: call into a new exported function from `main.js`'s existing Three.js setup,
   `window.__phoenixDust.burst()`, which temporarily spawns an additional 120 particles with
   outward velocity from screen center and gold coloring matching the existing dust
   material, decaying over ~1.8s. This reuses the existing particle system rather than
   building a second one.
4. Simultaneously, `#introVideo` fades out (CSS opacity transition) and `#introLogo` fades
   in, holds for 1.5s, then the whole `#intro` overlay fades out over 0.8s, removes
   `overflow: hidden` from `html`, sets `sessionStorage.setItem('introSeen', '1')`, and sets
   `display: none` on itself.
5. The skip button, at any point, jumps straight to step 4's end state (stop video, remove
   scroll lock, set the sessionStorage flag, hide overlay) with a quick 0.3s fade instead of
   the full sequence.
6. If `js/intro.js` fails for any reason (video can't load, autoplay blocked despite `muted`)
   a 4-second fallback timeout forces the same end state as skip — the funnel must never be
   permanently blocked by the intro.

`window.__phoenixDust` is a small addition to the existing Three.js block in `main.js`: after
building the particle system, expose `{ burst: function(){...} }` on `window` so
`intro.js` can call it without the two files needing to know about each other's internals
beyond that one function.

## Content placements

- **Founder Circle offer scene** (`index.html`, around line 146): swap `talking-head.jpg` →
  `carmen-founder.jpg`, remove the `offer__soon` "coming soon / Talking Head" `<figcaption>`
  entirely (it's a real photo now, not a placeholder), update the `alt` text.
- **Gateway-1 CTA scene** (`index.html`, around line 311): swap the reused `gw-storm.jpg` →
  `journey-woman.jpg` in `journey__media`.
- **New scene before "The World of the Phoenix"**: a new `<section class="scene scene--dark
  scene--sand">` inserted immediately before the existing `#rise-of-the-phoenix` section,
  containing a full-screen `<video>` (`rise-sand.mp4`, muted, loop, playsinline,
  `preload="none"`) with the same `scene__veil`/`scene__fade` treatment as other hero scenes,
  and no text — a pure visual beat. `preload="none"` plus an `IntersectionObserver` (new,
  small, in `main.js`) that calls `.load()` and `.play()` only once the section is within
  300px of the viewport, so the second large video never competes with the intro video on
  first paint.

## Out of scope (explicitly deferred)

- Hero, Mirror scenes, and Gateway 1/2/3/4 backgrounds stay static images — matching videos
  exist for most of these but are deliberately not used this round (page-weight cost with no
  compression tooling available).
- Video compression/optimization of the two videos used — ships at original size.
- The women-around-a-bonfire clip found in footage — doesn't map to anything requested,
  not used.

## Verification

Serve locally, confirm: intro plays once on a fresh session and is skippable; reloading
within the same session skips straight to the hero; the ember burst is visible and timed to
the video ending; the cropped logo shows no leftover caption text; Founder Circle and
Gateway-1 scenes show the new photos; the new sand-video scene only loads its video once
scrolled near; no console errors.
