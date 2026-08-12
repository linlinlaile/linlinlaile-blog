## 1. Route Transition Foundation

- [x] 1.1 Add a client route-content boundary under the existing root layout and apply a short pathname-keyed enter/exit transition.
- [x] 1.2 Add reduced-motion handling so non-essential route movement is disabled or reduced when the user prefers reduced motion.
- [x] 1.3 Add the root loading fallback and keep persistent navigation, backgrounds, toaster, and music controls outside the transitioning content boundary.

## 2. Scroll And Navigation State

- [x] 2.1 Implement a client scroll coordinator that distinguishes normal route changes, hash anchors, and browser back/forward restoration.
- [x] 2.2 Persist and restore route scroll positions without overriding valid anchor targets or causing visible jumps.
- [x] 2.3 Add pending/duplicate-click protection to direct `router.push` navigation controls while preserving stable button dimensions.

## 3. Page-Specific Loading Experience

- [x] 3.1 Add a Blog loading skeleton matching the existing timeline/card layout and verify empty, loading, and error states remain distinguishable.
- [x] 3.2 Add a GitHub loading skeleton with stable repository card dimensions while server data is pending.
- [x] 3.3 Review other slow or client-data pages and add only the route-specific loading boundaries needed to avoid blank content.

## 4. Persistent Controls Continuity

- [x] 4.1 Refine `NavCard` presentation so form and size changes animate within a stable shell across home, write, and ordinary pages.
- [x] 4.2 Refine `MusicCard` presentation so home, music-page, floating, and mobile variants preserve playback state and transition without abrupt remounts.
- [x] 4.3 Verify navigation active state, drag positioning, responsive breakpoints, and music playback remain correct after repeated route changes.

## 5. Verification And Tuning

- [x] 5.1 Add or run typecheck, production build, and existing test suites after the navigation changes.
- [x] 5.2 Browser-test desktop and mobile flows for `/`, `/blog`, `/github`, `/music`, `/write`, and a blog detail, including slow loading and error fallback.
- [x] 5.3 Verify normal top reset, hash anchors, back/forward restoration, duplicate-click behavior, reduced-motion mode, and external links.
- [x] 5.4 Tune transition duration, skeleton spacing, and responsive player/navigation dimensions based on code review and build validation.
