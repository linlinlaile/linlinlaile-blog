## Context

The root layout and homepage currently contain broad client boundaries. The layout also loads the music catalog from every route, while optional visual effects and route-specific tools live beside normal page code. Public media includes large local audio and image files. The implementation must preserve Next.js 16 and the OpenNext Cloudflare deployment model.

## Goals / Non-Goals

**Goals:**

- Keep the critical homepage path small and stable on mobile.
- Make optional music and heavyweight route features demand-driven.
- Centralize responsive media behavior so dimensions and loading priority are explicit.
- Add a repeatable baseline and regression check using production output.

**Non-Goals:**

- Removing music, Live2D, animation, editing, or existing content.
- Replacing the deployment platform or introducing an image CDN dependency.
- Rewriting every page as a server component in the first iteration.

## Decisions

### Narrow client boundaries incrementally

Keep interactive cards and stores as client components, but move static composition and data reads out of the broadest client boundaries where practical. This limits hydration without requiring a risky all-at-once rewrite. A full server-component rewrite was rejected for the first iteration because the homepage uses drag/edit state across many cards.

### Gate music initialization by route and intent

Remove unconditional catalog loading from the global layout. The music page and visible player surface may request the catalog when mounted; playback creates the single audio element only on user intent. Catalog caching remains compatible with the completed music change, and navigation keeps one shared store/audio instance after initialization. An always-on preload was rejected because it spends work on visitors who never use music.

### Dynamically import heavyweight route experiences

Use route-scoped dynamic boundaries for Live2D and editor/image-toolbox code, with stable loading placeholders. This keeps the feature behavior intact while preventing unrelated routes from importing it. Splitting every small component was rejected because it would add request and complexity overhead without measurable benefit.

### Standardize media loading contracts

Use the existing image rendering path where possible, adding explicit dimensions or aspect ratios, responsive sizes, and deferred loading for below-the-fold media. Preserve direct URLs for user-uploaded content and backgrounds, but avoid eager loading except for the measured primary visual. A repository-wide bulk conversion is deferred because source ownership and visual quality vary.

### Measure before and after

Capture production build output plus browser measurements for mobile homepage LCP, CLS, initial JS, and request types. Add checks that no audio request occurs before playback intent and that optional route bundles are absent from unrelated pages. Measurements are required to choose any later image conversion or animation reduction.

## Risks / Trade-offs

- [Risk] Deferring the player can make its first appearance slightly later -> Mitigate with a lightweight placeholder and load on visible player or explicit interaction.
- [Risk] Narrowing client boundaries can expose server/client prop serialization issues -> Mitigate with incremental changes and type/build checks after each boundary change.
- [Risk] Native browser loading behavior differs across formats and deployments -> Mitigate by validating both `next start` and the Cloudflare-compatible preview.
- [Risk] Large media still affects total repository/deployment size -> Treat this phase as delivery optimization; evaluate transcoding/storage separately after baseline data.

## Migration Plan

1. Record current production metrics and bundle/request evidence.
2. Introduce deferred initialization and route-level dynamic boundaries behind existing behavior.
3. Apply media dimensions and loading policies to the highest-traffic surfaces.
4. Run build, preview, and browser regression checks; compare against the baseline.
5. Roll back by reverting the change if a route loses functionality or the measured budget regresses.
