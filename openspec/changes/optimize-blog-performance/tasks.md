## 1. Baseline and instrumentation

- [ ] 1.1 Build the production app and record route bundle sizes and static asset output.
- [ ] 1.2 Capture mobile homepage LCP, CLS, initial JavaScript, and request waterfall with audio-playback intent absent.
- [ ] 1.3 Add a repeatable browser/build check for the performance budget and no pre-intent audio request.

## 2. Global and homepage loading

- [ ] 2.1 Identify the broadest layout/home client boundaries and separate static composition from interactive state without changing visible behavior.
- [ ] 2.2 Remove unconditional music catalog initialization from the global layout and trigger it from the music surface or explicit playback intent.
- [ ] 2.3 Add stable placeholders for deferred optional content so delayed initialization does not shift the layout.
- [ ] 2.4 Verify homepage navigation, card editing, responsive layout, and music persistence after the boundary changes.

## 3. Route-scoped heavy features

- [ ] 3.1 Add dynamic route boundaries for Live2D with a fixed loading/error state.
- [ ] 3.2 Add dynamic boundaries for editor and image-toolbox-only code paths.
- [ ] 3.3 Verify unrelated routes do not initialize or request route-specific heavy bundles.

## 4. Responsive media delivery

- [ ] 4.1 Inventory homepage, article, gallery, avatar, cover, and background image call sites and their displayed geometry.
- [ ] 4.2 Add explicit dimensions/aspect ratios and responsive loading policies to the highest-traffic image surfaces.
- [ ] 4.3 Mark below-the-fold media as deferred and keep only measured primary visuals eager/high priority.
- [ ] 4.4 Verify slow-image rendering produces no meaningful layout shift and preserves uploaded/direct URL support.

## 5. Verification and rollout

- [ ] 5.1 Run formatting, TypeScript, production build, and OpenNext Cloudflare preview checks.
- [ ] 5.2 Re-run browser metrics on representative mobile and desktop profiles and compare with the baseline.
- [ ] 5.3 Confirm music playback, Live2D, editor, image toolbox, and existing navigation still work after deferred loading.
- [ ] 5.4 Document measured results, remaining media-size risks, and rollback notes in the change record.
