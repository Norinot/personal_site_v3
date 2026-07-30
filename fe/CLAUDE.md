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
