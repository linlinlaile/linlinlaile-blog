## Purpose

Provides a repeatable way to snapshot the owner's NetEase playlist into static metadata and locally cached cover assets, including playlists whose complete contents require a local authenticated session.

## ADDED Requirements

### Requirement: Sync command generates a deterministic catalog
The sync command SHALL accept the configured public playlist ID, retrieve its title and ordered track metadata, and write a valid `public/music/playlist.json` catalog containing each track's NetEase ID, title, artists, album, cover path, and local audio path when available.

#### Scenario: Successful playlist synchronization
- **WHEN** the command is run with playlist ID `17655082808` and the playlist endpoint returns valid data
- **THEN** it writes the playlist title and tracks in source order, using stable IDs and paths for every entry

### Requirement: Login credentials are local-only
The sync command MAY read a `NETEASE_COOKIE` environment variable for authenticated metadata requests, but SHALL never write, print, or include that value in generated assets or runtime client code.

#### Scenario: Authenticated playlist synchronization
- **WHEN** the command is run with a valid local `NETEASE_COOKIE`
- **THEN** the request can access the complete authorized playlist while generated files contain only public metadata and local paths

### Requirement: Covers are cached locally
The sync command SHALL download each available track cover into a deterministic path under `public/music/covers/` and SHALL reference that local path from the generated catalog.

#### Scenario: Cover download succeeds
- **WHEN** a track has a usable cover URL
- **THEN** the command stores the image locally and the catalog does not require the remote cover URL at runtime

### Requirement: Local audio is matched by NetEase ID
The sync command SHALL recognize supported local audio extensions and mark a track playable only when a file named `<netease-track-id>.<extension>` exists under `public/music/`.

#### Scenario: Track has no local file
- **WHEN** catalog metadata includes a track ID but no supported ID-named audio file exists
- **THEN** the catalog marks the track unavailable and the command reports it without failing the entire synchronization

### Requirement: Sync failures are actionable and non-destructive
The command SHALL fail with a clear diagnostic when playlist metadata cannot be retrieved or parsed, and SHALL preserve the previous catalog until a complete replacement is ready.

#### Scenario: Network or payload failure
- **WHEN** the playlist request fails, is rate-limited, or does not match the expected schema
- **THEN** the command exits unsuccessfully, explains the failure, and leaves the existing catalog unchanged
