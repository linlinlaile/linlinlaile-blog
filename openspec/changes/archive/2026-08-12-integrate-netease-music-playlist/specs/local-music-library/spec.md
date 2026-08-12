## Purpose

Defines how the blog presents a synchronized playlist and its local playback availability without streaming audio from NetEase.

## ADDED Requirements

### Requirement: Music page displays synchronized playlist metadata
The `/music` page SHALL load the static catalog and display the playlist title, track cover, song title, artist, album, order, and whether a local audio source is available.

#### Scenario: Catalog loads successfully
- **WHEN** a visitor opens `/music`
- **THEN** the page renders the catalog in playlist order and uses local cover paths

### Requirement: Only local sources are playable
The music page and player SHALL play audio only from a catalog entry's local source path and SHALL not request or proxy a NetEase audio URL.

#### Scenario: Playable entry selected
- **WHEN** a visitor selects a track with a local source
- **THEN** playback uses that local source and the selected entry becomes the current track

### Requirement: Unavailable entries remain understandable
The music page SHALL keep tracks without local audio visible, identify them as unavailable, and prevent playback controls from starting them.

#### Scenario: Unavailable entry selected
- **WHEN** a visitor selects a track marked unavailable
- **THEN** the UI indicates that the local file is missing and does not start audio
