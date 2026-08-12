## Context

See `proposal.md` for the motivation and scope. The application uses Next.js App Router with a persistent client layout that renders `NavCard`, background layers, and the music player around route content. Existing pages mix static server rendering, server-side API fetching, client-side SWR loading, and direct `router.push` calls. There is no shared route loading boundary, transition wrapper, or explicit scroll policy.

## Goals / Non-Goals

**Goals:**

- Add one consistent loading and transition contract for route content.
- Keep persistent controls mounted while route content changes.
- Make scroll behavior predictable for normal navigation, anchors, and history traversal.
- Cover slow data pages with layout-stable skeletons.
- Preserve accessibility and reduced-motion behavior.

**Non-Goals:**

- Rewriting page data fetching or changing API/cache semantics.
- Animating external links, downloads, dialogs, or editor preview state.
- Introducing a global animation library solely for this change; reuse existing motion tooling where practical.
- Changing URL structure or browser history semantics.

## Decisions

### Route content boundary

Create a client-side route content boundary under the existing root layout. The boundary owns pathname-keyed enter/exit state and renders only `{children}`; `NavCard`, backgrounds, toaster, and music UI stay outside it. This avoids remounting persistent state while allowing one visual policy for every internal route.

Use a short opacity plus small vertical offset transition. The transition must be disabled or reduced under `prefers-reduced-motion`. A CSS class/state approach is preferred for the base transition; existing Motion components can continue to animate local cards.

Alternative rejected: wrapping the entire root layout in `AnimatePresence`, because it would remount or visually reset persistent controls and backgrounds on every route change.

### Loading boundaries

Add a root `loading.tsx` for immediate fallback and route-specific loading files only where the page structure benefits from a more accurate skeleton, starting with Blog and GitHub. Skeletons use existing card, border, and color tokens and reserve stable dimensions to avoid layout shifts.

Alternative rejected: a full-screen spinner, because it hides persistent controls and gives no indication of the target page structure.

### Scroll coordinator

Add a small client coordinator subscribing to pathname/search/hash changes. It records scroll positions in `sessionStorage` keyed by history entry when leaving a route, resets normal route changes to the top after the new content is committed, and defers to native anchor scrolling when a hash is present. It must detect `popstate`/history traversal so back and forward restore positions instead of always resetting.

Alternative rejected: globally forcing `window.scrollTo(0, 0)` in a pathname effect, because that breaks anchors and browser history restoration.

### Navigation pending behavior

Use Next navigation pending state for controls that call `router.push`, and rely on the route loading boundary for `Link` navigation. Buttons should disable duplicate activation without changing their layout width. External links remain untouched.

### Persistent music and navigation layout

Keep the existing Zustand music store and singleton audio element. Refactor only the presentation boundary so home, music-page, desktop floating, and mobile player variants share a stable keyed shell and animate layout changes. Apply the same principle to the `NavCard`: preserve its outer anchor/position and animate internal form/size changes rather than remounting the card.

### Verification

Test desktop and mobile viewport navigation among `/`, `/blog`, `/github`, `/music`, `/write`, and a blog detail. Verify slow loading, error fallback, normal links, hash anchors, back/forward scroll restoration, duplicate button clicks, active music playback, and reduced-motion mode. Use production build/type checks plus browser-level smoke tests where available.

## Risks / Trade-offs

- [Risk] Client transition wrapper delays perceived content if its exit duration is too long → Keep transitions under roughly 250ms and show the loading boundary immediately.
- [Risk] Scroll restoration races with asynchronous content height → Restore after the route content commits, retry on the next animation frame when the target offset is not yet available.
- [Risk] Skeleton dimensions diverge from final cards → Reuse the same max widths, spacing tokens, and card primitives as the target pages.
- [Risk] Persistent player layout animation causes overlap on small screens → Keep separate responsive shells and test mobile breakpoints explicitly.
- [Risk] Motion preferences are ignored by existing local animations → Scope this change's route transition to reduced motion and avoid broad unrelated animation rewrites.

## Migration Plan

1. Add the route boundary, loading fallback, and scroll coordinator behind the existing root layout.
2. Add Blog/GitHub skeleton boundaries and pending states for direct navigation buttons.
3. Adjust NavCard and MusicCard shells to preserve persistent state during route changes.
4. Run typecheck/build and browser smoke tests; tune transition timing and responsive dimensions.
5. Rollback is file-level: remove the coordinator/boundary integration and route loading files; no data migration or URL rollback is required.
