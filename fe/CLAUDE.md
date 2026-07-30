# CLAUDE.md

Architectural decisions for the terminal-UI project (see `docs/terminal-ui-bruef.md`
for the full brief). Recorded here so future sessions don't relitigate them.

## Content layer (`src/content/`) — Phase 1, done

- Pattern: structured metadata (ids, dates, tags, icon-name strings, links) lives in
  typed `.ts` modules under `src/content/`; translated display strings stay in
  `src/locales/{en,hu}.json`, keyed by the same id — this is the pattern the repo
  already used for projects/apps/experience before Phase 1, just centralized.
  `content/services.ts` was brought into this same pattern (it previously declared
  services as inline literals with hardcoded translation keys); `getIcon.tsx` gained
  `users`/`code`/`server`/`cog` entries so its icons could move from literal JSX to
  icon-name strings without changing what renders.
- `content/music.ts` is the exception: tracks are **not static content**. The real
  track list is server state (`GET /songs` against a Go backend in `be/`, which is
  not part of this git repo — `be` is gitignored outright). `content/music.ts` holds
  only the `Song` type and one `fetchSongs()` function that wraps the fetch — both
  UIs must call this same function rather than each rolling their own `fetch("/songs")`,
  so the request logic (and any future change to it) stays centralized even though the
  data itself is remote, not file-based.
- `content/profile.ts` covers both the brief's "profile/bio" and "contact details"
  categories: `PROFILE` (name, handle, email, phone) and `SOCIAL_LINKS`. There's no
  separate untranslated bio blob to extract — the old UI's bio text is fully i18n'd
  already (`hero.description` in the locale files) and stays that way.
- Project case-study fields (`role`, `problem`, `work[]` — needed for the terminal's
  `projects <slug>` detail view) were deliberately **not** added in Phase 1. Phase 1
  is a pure lift-and-shift with zero visible change; those fields need real copy from
  the site owner and have no consumer until the terminal UI's project view exists, so
  they'll be added in Phase 2 alongside that view.

## Resolved brief ambiguities (decided 2026-07-30)

- **Music**: centralize the fetch (`content/music.ts::fetchSongs`), both UIs call it.
  The terminal UI's `idea.html`-style `TRACKS[]` placeholder gets replaced with real
  fetched data in Phase 2, not static content.
- **Theme systems**: the old site's theme vocabulary (`cyber/ocean/terminal/solar`,
  `localStorage["site-theme"]`) and the terminal's own (`phosphor/emerald/ice/paper`)
  are **independently persisted** — no shared state, no mapping between them, no
  transition when crossing UIs. Each UI just remembers its own last pick.
- **Contact**: the terminal UI should offer both options — an in-app send (mirroring
  the old site's validated form + `POST /contact`) and a mailto/wizard path (`idea.html`'s
  `hire` flow) — let the visitor pick.
- **Admin track upload**: must have parity in the terminal UI (same Clerk-email-gated
  visibility as `Hobbies.component.tsx`'s upload button). Placement TBD at Phase 2
  implementation time.
- **Deploy**: out of scope to verify/change. Production is an nginx server; the brief's
  Phase 5 "confirm the deploy still works" item is waived.

## Switching mechanism (decided, not yet implemented — Phase 3/4)

Top-level conditional in the app shell (`localStorage`-backed `useUiMode()` hook +
`React.lazy`), **not** a `/term` route. Reasoning: the transition overlay (Phase 4)
needs the outgoing UI to stay mounted and visible while degrading via CSS, with the
incoming UI's chunk preloading concurrently — a route change would unmount the old
tree as part of navigation, fighting that requirement for no benefit (code-splitting
doesn't need a route either, just `React.lazy`/`Suspense`). `/login` (Clerk admin
sign-in) is untouched either way.

## Terminal UI (`src/terminal/`) — Phase 2, done

Fully self-contained; the only imports crossing into the old UI's territory are
`content/*`, `i18n` (via `react-i18next`), and `@clerk/clerk-react` (both UIs already
depend on Clerk directly — no shared old-UI component is imported).

- **Own design tokens.** `Terminal.module.scss` scopes every CSS variable under a
  `.root[data-terminal-theme="…"]` selector instead of `:root[data-theme]`, so it can
  never collide with the classic site's theme vars even though both happen to use a
  `data-*-theme` attribute convention. Own `localStorage` keys: `terminal-theme`,
  `terminal-crt` (the scanline toggle — a cheap, idea.html-faithful extra, independent
  of the theme choice).
- **Boot sequence lives in Phase 4, not here.** `idea.html`'s typed-out boot log is
  explicitly a Phase 4 requirement (the transition's beat 3, "a loading sequence in the
  incoming UI's idiom") — it isn't in Phase 2's required-behavior list. So mounting the
  Terminal component today just shows the banner + ready line immediately; the animated
  boot log will be built as part of the Phase 4 overlay, not duplicated here.
- **Output model.** Unlike `idea.html` (which appends static HTML strings), each command
  pushes a typed `ViewDescriptor` into an `entries` array, and a `ViewRenderer` switch
  maps descriptors to React components at render time. This matters for `music`
  specifically: because it's live state looked up at render time rather than a frozen
  HTML snapshot, every rendered instance of the `music` output (even from old commands
  still visible in the scrollback) reflects the *current* playback state — a deliberate
  improvement over the prototype, which only wires up one live `#scope` canvas by DOM id
  and would duplicate IDs if `music` were run twice.
- **Project case-study fields** (`role`, `problem`, `work[]`) were added as real i18n
  keys (`projects.items.<id>.role/problem/work`, both locales) rather than staying in
  `idea.html`'s hardcoded English — but the copy itself is still `"TODO — …"` placeholder
  text, same convention `idea.html` used. Nobody has supplied real per-project case-study
  copy yet; replace these before shipping.
- **Contact dual-path**, per the resolved ambiguity above: `contact` command is read-only
  info + a hint; `message` is a new command with an inline form reusing the *exact same*
  `contact.*` i18n keys and `POST /contact` flow as the old site's `Contact.component.tsx`
  (same Clerk bearer token); `hire` is `idea.html`'s step-by-step wizard producing a
  `mailto:`. All three are one source of truth away from the old UI (content + i18n),
  never importing its components.
- **Admin upload parity**: `MusicView` checks `useUser()`'s email against
  `PROFILE.email` (from `content/profile.ts` — the same value `AdminLogin.tsx` hardcodes
  separately as `EMAIL_CLIENT_CHECK`; not unified across files since that constant is
  auth-gating config outside Phase 1's content-extraction scope, not "content"). When
  matched, an inline upload form (title/artist/backlink/description/file) appears next to
  the track grid inside the `music` output — chosen over a floating modal (the old UI's
  approach) because the terminal has no modal/overlay idiom elsewhere and inline output
  blocks are how everything else in this UI presents.
- **Full EN/HU parity** required a large `terminal.*` locale namespace (session labels,
  help text, wizard copy, error strings, etc.) — command *names* themselves (`about`,
  `skills`, …) stay untranslated, same as any real CLI's command names would.
- **Known pre-existing-class lint noise**: `useMusicPlayer.ts`'s two `setState`-in-effect
  calls (fetching songs on mount, and marking `playing` true when a track is selected)
  trip the experimental `react-hooks/set-state-in-effect` rule. This is the same rule,
  same false-positive class, as the one already sitting unaddressed in `Navbar.component.tsx`
  from before this project started — not a new regression, not a real bug (`tsc` is clean,
  behavior verified via Playwright).

## Switch button & mode wiring (`src/ui-switch/`, `src/HomeShell.tsx`) — Phase 3, done

- `useUiMode()` owns `localStorage["ui-mode"]` (`"classic" | "terminal"`), read once at
  init so a returning visitor who picked the terminal gets the terminal immediately —
  matches the brief's persistence requirement.
- `HomeShell.tsx` is the only new top-level file; it's what `App.tsx`'s `/` route now
  renders (previously rendered `MainContent` directly). It owns `useUiMode()` and
  conditionally renders `MainContent` or a `React.lazy`-loaded `Terminal`, each handed a
  callback prop (`onSwitchToTerminal` / `onSwitchToClassic`) rather than either UI
  reading `useUiMode()` itself — keeps the mode-switching state in exactly one place.
  `/login` is untouched.
- **`SwitchButton` is the one shared component** (`ui-switch/SwitchButton.component.tsx`),
  rendered once in `Navbar.component.tsx` (desktop + mobile menu) and once in the
  terminal's titlebar. It deliberately has its own hardcoded palette (magenta/cyan on
  near-black) independent of *both* host UIs' theme systems, so it always reads as
  something foreign, per the brief ("the one thing on the page that doesn't belong
  there") — confirmed visually in both light/dark host contexts.
  - Idle tell: a JS-driven character-scramble every 4–7s that resolves back to the real
    label over ~320ms (not a constant loop). Fully skipped when
    `prefers-reduced-motion: reduce` — verified the visible text never changes over a 6s
    window under that setting.
  - Hover/focus: CSS-only RGB channel split (layered `text-shadow`) + a scanline sweep
    pseudo-element + a brighter "armed" border/glow. Press: `scale(0.93)` + a hard color
    flash, gated by a `busyRef` debounce so rapid double-clicks can't fire twice (Phase 4
    will own the more rigorous "don't start two transitions" guard).
  - Accessibility: real `<button>`, `aria-label` always holds the true label; the
    (possibly scrambled) text lives in a separate `aria-hidden` span, so the accessible
    name never reads garbage. Verified keyboard-only activation (focus + Enter).
- **Navbar diff stayed minimal**: one new prop (`onSwitchToTerminal?`), one import, two
  render sites (desktop cluster, mobile menu) — no restructuring of existing markup.
- **Bundle check**: built `vite build` and confirmed the actual terminal component code
  (~36 KB minified) lands in its own chunk, only fetched when `React.lazy` resolves it —
  not in the eagerly-loaded main chunk. The only terminal-related bytes in the main
  chunk are the new `terminal.*` locale strings themselves (a few KB of JSON text),
  which ride along because both locale files are already loaded eagerly for the whole
  site (a pre-existing i18n pattern, not something this phase introduced).

## The transition (`ui-switch/useUiTransition.ts`, `transition.module.scss`,
## `TransitionOverlay.component.tsx`) — Phase 4, done

- **State machine, not a library.** `useUiTransition()` owns a `phase` state machine
  (`idle → corrupt → void → boot → arrive → idle`) driven by plain `setTimeout`s
  scheduled relative to when the switch was requested — no animation library. `HomeShell`
  applies a CSS class to the *currently mounted* UI's wrapper div based on `phase`
  (`.corrupting` during corrupt, `.hiddenBehindOverlay` during void/boot,
  `.arriving` during arrive), while `TransitionOverlay` is the one full-screen component
  that owns the void/static/boot visuals for the rest of the sequence. Both read from the
  same `phase` value, so there's one source of truth for the timeline.
- **No DOM snapshots.** Per the hard constraint, beat 1's "corruption" is entirely CSS:
  an SVG `<filter>` (`feColorMatrix`/`feOffset`/`feBlend`, defined inline in
  `TransitionOverlay`) does the RGB channel split on the *live* outgoing root, layered
  with a `clip-path`/`transform` jump-cut keyframe (`steps(1,end)` easing, not smooth
  interpolation, so it reads as tearing rather than a wobble) for the slice-displacement
  look, plus one-frame `invert()` flashes at a couple of keyframe marks. Beat 4 runs a
  mirrored decaying version of the same filter/clip-path on the *incoming* root. Nothing
  is ever duplicated or rasterized — this also sidesteps the real risk of literally
  cloning either UI's live tree (duplicate audio elements, duplicate Clerk state,
  duplicate interactive widgets) that a "render two copies for the glitch layers"
  approach would have created.
- **Current beat timings**: corrupt 1050ms · void 150ms · boot 700ms · arrive 400ms
  (≈2.3s total) — longer than the brief's ~1.6s starting point, tuned by eye per the
  brief's own "treat these numbers as a starting point" allowance. If retuning, the
  `.corrupting`/`.arriving` `animation-duration` values in `transition.module.scss` and
  the `BEATS` array in `useUiTransition.ts` must be changed together — the JS timer is
  what swaps the CSS class off at the end of each beat, so a mismatch either cuts an
  animation off mid-escalation or leaves it frozen on its last frame.
- **Found and fixed a real bug while verifying**: the original beat-scheduling loop
  accumulated `elapsed += beat.duration` and scheduled `setPhase(beat.phase)` at that
  mark — off by one beat, since it re-affirmed the *current* phase at the end of its own
  duration instead of scheduling the *next* phase there. Net effect: every beat visually
  ran for the *following* beat's duration, and "arrive" was clobbered entirely by
  `finish()` firing in the same tick. Fixed by accumulating durations *before* the beat
  being scheduled (see the loop starting at `i = 1`). Caught via Playwright by
  querying `data-phase` at fixed offsets, not by eye — worth knowing if this ever needs
  touching again.
- **Boot idiom is genuinely different per direction**, per the brief: going to the
  terminal reuses the real `terminal.boot.*` i18n lines in the terminal's own monospace
  font with an amber progress bar; coming back to classic renders a `ChamferBox`-framed
  "reconnecting" card in the classic site's cyan/magenta gradient and `Space Grotesk`
  font. This is the one place the transition imports a classic-UI component
  (`ChamferBox`) — deliberate, since the transition overlay isn't part of either UI's
  self-contained folder and reusing the real primitive guarantees the "current site's
  idiom" is pixel-accurate rather than approximated.
- **Audio**: stopped cleanly, not carried across. `stopAllAudio()` pauses every
  `<audio>` element in the document the moment a switch is requested. Chosen over
  carrying playback across because both UIs' music players own an independent
  `<audio>` element and `AudioContext` — and a `MediaElementSource` binding is
  permanent for the life of that element, so actually carrying a stream across would
  require hoisting a single shared `<audio>` element above both UIs permanently, a much
  bigger architectural change than "the transition" warrants.
- **Skip**: any click or keydown while `phase !== "idle"` calls `jumpToEnd`, attached at
  `document` capture phase — deferred by one `requestAnimationFrame` after
  `requestSwitch` so the initiating click doesn't immediately trip its own skip listener.
  Calls `preventDefault`/`stopPropagation` so a skip-click can't also activate whatever's
  underneath.
- **Double-click guard**: `busyRef` in `useUiTransition` ignores `requestSwitch` calls
  while a transition is already running, on top of `SwitchButton`'s own independent
  400ms debounce from Phase 3 — two independent layers.
- **Reduced motion**: skips the whole beat sequence, calls `setMode` immediately, and
  auto-finishes after a 150ms window (matching the brief's crossfade duration) with no
  overlay ever mounted.
- Verified via Playwright: full sequence beat-by-beat (querying `data-phase` directly,
  not just screenshots, after the bug above), skip-to-end, double-click guard, reduced
  motion, and confirmed the only `position:fixed` element left after a switch is the
  terminal's own permanent CRT scanline layer (not a transition leftover) with
  `document.body.style.overflow` correctly cleared.

## Post-Phase-4 fixes (user testing, same day)

- **`Terminal.component.tsx` never rendered an `<audio>` element.** `useMusicPlayer()`'s
  `audioRef` was created but never attached to a real DOM node, so every
  `audioRef.current` access silently no-op'd behind its `if (!audio) return` guards —
  playback state updated, nothing ever actually played, and `stop` had nothing to pause.
  Fixed by mounting `<audio ref={player.audioRef} />` in the shell. Reminder for next
  time: a hook owning a ref is not the same as that ref being attached anywhere.
- **Added persistent transport controls** (skip-prev, play/pause, skip-next, stop) to the
  sidebar's "now playing" section — the aside previously only let you *select* a track
  (click to play), with no way to pause/skip/stop without typing `stop` or re-running
  `music`. Matches the old UI's Hobbies player having always-visible transport controls.
- **`SwitchButton`'s clip-path was clipping its own border.** `clip-path` cuts straight
  through everything painted on the element, including a CSS `border` — so the border
  simply stopped at the two chamfered corners instead of following the cut edge. Fixed
  with the same two-layer trick the classic site's own `ChamferBox` already uses: an
  outer element (background = border color, clip-path, 1px padding) wrapping an inner
  `.face` (background = fill color, its own slightly-smaller clip-path) — the 1px ring of
  outer color showing through is the "border," and it now follows the cut on both
  corners in both UIs' hosting contexts.

## Second round of post-Phase-4 fixes (user testing, same day)

- **`.chip` (titlebar scanlines/theme toggles, and the mobile-nav command bar) had the
  exact same clip-path-clips-border bug as `SwitchButton`**, since it also combined a
  plain `border` with `clip-path` on one element. Same fix, same two-layer shape: `.chip`
  is now the outer layer (background = `--line` normally, `--accent` on hover/pressed,
  1px padding, clip-path), wrapping a `.chipFace` inner span carrying the actual
  text/background. All three usages (`Terminal.component.tsx`'s scanlines toggle, theme
  toggle, and the `.mobileNav` command chips) share this one class, so one fix covers all
  three — confirmed clean borders on desktop and on the terminal's own mobile nav bar.
- **Added a volume slider** (native `<input type="range">`, styled to match, plus a
  mute-toggle icon button) to the sidebar's music controls — `useMusicPlayer` already
  had `volume`/`setVolume` in its API from Phase 2, there was just never a control wired
  up to it.
- **Oscilloscope/mini-visualizer frequency mapping had two real, stacked bugs**,
  producing exactly what was reported: part of the circle reading as permanently maxed,
  part never moving.
  1. Bin lookup used a hard `Math.floor()` with far more sample points (128 angle steps,
     28 bars) than usable low-frequency detail at a small `fftSize` — many consecutive
     sweep positions rounded to the *same* bin, reading as a flat "stuck" plateau instead
     of real variation. Fixed by interpolating between the two nearest bins for every
     sample position (`sampleAnalyserAt` in `graphics.tsx`).
  2. The bin-index curve itself was wrong twice over before landing right: first a plain
     linear bin index (buries all the visible movement in a couple of low bins, leaves a
     silent arc for the mostly-empty high end), then an overly aggressive
     `bin = binCount^t` curve (the first quarter of the sweep covered only ~3 of 64 bins
     — exactly why a loud bass bin read as "always maxed" across a huge arc, confirmed
     by reading `getByteFrequencyData` directly and finding the first 4-5 bins reading
     150-210 nearly identically). Landed on mapping sweep position to actual **Hz** on an
     equal-per-octave (20Hz–Nyquist) curve — the same convention a real EQ uses — rather
     than a curve over raw bin *count*, since bin count alone has no relationship to how
     octaves are actually distributed across the spectrum.
  3. Also bumped `fftSize` from 64 → 2048 (128 → 1024 bins): the earlier small FFT meant
     each low bin already spanned hundreds of Hz, blurring together genuinely different
     bass content into one flat-reading bin no matter how the curve above was shaped —
     more bins were needed for the low end to have anything real to interpolate between.
  4. Widened `minDecibels`/`maxDecibels` (-100/-10, from the -100/-30 default) so loud
     bass content stops pegging at 255 as easily.
  - Verified this wasn't a rendering artifact by reading `analyser.getByteFrequencyData()`
    directly (bypassing canvas entirely) at multiple points across a real uploaded track:
    confirmed the underlying Web Audio data is genuinely live and varies substantially
    over time and playback position (as few as 40 and as many as 101 of 128 bins active
    at different moments) — the bugs were entirely in how bin data was being sampled and
    mapped to screen position, not in the audio graph itself.

## Third round: the oscilloscope's seam artifact

Even after the sampling fixes above, a straight line cut across the circle at a fixed
angle, worst when bass was loud. Root cause: the sweep drew a *closed loop* over a plain
0→1 frequency range (20Hz at one end, Nyquist at the other), then `closePath()` connected
the last point straight back to the first — but 20Hz and ~22kHz are unrelated frequencies
almost never at similar levels, so that seam was, structurally, always going to be a
jarring straight cut. Fixed by mirroring the sweep instead of wrapping it: the first half
of the loop goes 20Hz→Nyquist, the second half goes back Nyquist→20Hz, so *both* points
where the path closes (top and bottom of the circle) land on the same frequency and the
line is continuous all the way around. Also gave the circle more room to move in per the
same request — `R` from `min(h*0.36, 58)` to `min(h*0.42, 72)`, and widened the value-to-
radius range from 0.55–1.17×R to 0.5–1.25×R.
