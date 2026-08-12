## Purpose

Ensure optional capabilities consume network, JavaScript, and main-thread resources only when a visitor reaches or explicitly uses them.

## ADDED Requirements

### Requirement: Music is initialized on demand
The shared music catalog and audio controller SHALL initialize only when the music surface is needed or the visitor requests playback, and SHALL remain available across navigation once initialized.

#### Scenario: Non-music route
- **WHEN** a visitor opens an article, projects, or other non-music route without interacting with the player
- **THEN** the route does not create an audio element or request an audio file

#### Scenario: Playback intent
- **WHEN** the visitor opens the music surface or activates playback
- **THEN** the catalog and a single shared audio controller initialize and playback can start

### Requirement: Heavy route features are route-scoped
Live2D, editor, image-toolbox, and comparable heavyweight features SHALL load only for their owning route or explicit interaction and SHALL not increase unrelated route initialization.

#### Scenario: Unrelated route navigation
- **WHEN** a visitor navigates to the homepage or an article
- **THEN** Live2D and editor-only code are not initialized for that route
