## Why

The blog currently hydrates a large client-side shell on every route and initializes shared visual and music features before they are needed. Combined with large unoptimized images and media, this makes the mobile homepage pay for non-critical work during the first visit. The change establishes a measurable, mobile-first performance budget while preserving the existing experience.

## What Changes

- Reduce the amount of JavaScript and hydration required by the global layout and homepage.
- Defer music catalog/player setup and other non-critical effects until the feature or user interaction requires them.
- Apply responsive image loading, dimensions, and format/size guidance to homepage, article, and gallery media.
- Load heavyweight route-specific experiences such as Live2D and editing tools on demand.
- Add repeatable production-build and browser checks for LCP, initial requests, JavaScript size, and layout stability.

## Capabilities

### New Capabilities

- `mobile-first-loading`: Defines the homepage initial-loading budget and critical-resource behavior.
- `deferred-feature-loading`: Defines when optional music, animation, and route-specific features may initialize.
- `responsive-media-delivery`: Defines sizing, lazy-loading, and format behavior for blog media.

### Modified Capabilities

None.

## Impact

Affected areas include `src/layout`, the home route and card components, music hooks/player surfaces, route-specific heavy components, image rendering helpers, and Next.js build configuration. No public API or content format changes are intended; deployment remains compatible with the existing Next.js/OpenNext Cloudflare setup.
