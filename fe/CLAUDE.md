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
