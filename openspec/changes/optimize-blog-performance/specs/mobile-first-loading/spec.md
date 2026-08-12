## Purpose

Define a fast, stable first visit for mobile readers while keeping the blog's existing visual layout and interactions available after the critical content is ready.

## ADDED Requirements

### Requirement: Homepage critical content loads without optional feature blocking
The homepage SHALL render its primary content and navigation without waiting for music playback, decorative animation, analytics, or route-specific editor code to initialize.

#### Scenario: First mobile visit
- **WHEN** a mobile visitor opens the homepage
- **THEN** the primary cards and navigation become usable before optional music and decorative features initialize

### Requirement: Initial loading has a measurable budget
The production homepage SHALL target an LCP of at most 2.5 seconds on a representative mobile profile, SHALL avoid loading audio files during the initial page load, and SHALL keep layout shift attributable to deferred content negligible.

#### Scenario: Performance verification
- **WHEN** the production homepage is measured with a mobile browser profile
- **THEN** LCP is at most 2.5 seconds, no audio asset is requested before playback intent, and CLS remains below 0.1
