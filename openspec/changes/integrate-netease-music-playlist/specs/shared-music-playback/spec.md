## Purpose

Provides one playback queue and audio state shared by the home mini-player and the full music page so navigation does not reset the listener's current track.

## ADDED Requirements

### Requirement: Playback state is shared across player surfaces
The system SHALL maintain one current track, playing state, progress, duration, and queue position for all player surfaces mounted by the site.

#### Scenario: Navigate while playing
- **WHEN** a visitor starts a local track and navigates between the home page and `/music`
- **THEN** the current track and playback state remain synchronized and audio is not duplicated

### Requirement: Queue controls operate on local playable tracks
The player SHALL support play/pause, previous, next, progress seeking, and a documented repeat mode, skipping entries that are unavailable locally.

#### Scenario: Next track reaches unavailable entry
- **WHEN** the next queue entry has no local source
- **THEN** the player skips it and selects the next playable entry according to the active repeat mode

### Requirement: Ended tracks follow repeat behavior
The player SHALL select the next playable track when a track ends, or stop at the queue boundary when repeat is disabled.

#### Scenario: Track ends in repeat-all mode
- **WHEN** the final playable track ends while repeat-all is active
- **THEN** playback wraps to the first playable track and continues

### Requirement: Audio errors are recoverable
The player SHALL expose a user-visible error state for a missing or unsupported local file and SHALL leave other tracks available.

#### Scenario: Browser cannot decode a local file
- **WHEN** the selected local source emits an audio error
- **THEN** the player reports that the track cannot be played and allows selecting another track
