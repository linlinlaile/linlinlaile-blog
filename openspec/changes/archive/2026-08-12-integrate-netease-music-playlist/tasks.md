## 1. Playlist Sync Foundation

- [x] 1.1 Define the generated playlist catalog type and schema, including playlist metadata, normalized track fields, local source, cover path, and availability.
- [x] 1.2 Implement a Node/TypeScript sync script for playlist `17655082808` with a replaceable NetEase provider adapter and response validation.
- [x] 1.3 Add deterministic cover caching under `public/music/covers/`, placeholder handling, and atomic catalog writes that preserve the previous snapshot on failure.
- [x] 1.4 Add the `music:sync` package script and concise CLI diagnostics for missing files, duplicate IDs, unsupported extensions, and network/API errors.
- [x] 1.5 Support an optional local `NETEASE_COOKIE` for authenticated playlist metadata requests without persisting or logging credentials.

## 2. Local Asset Migration

- [x] 2.1 Run the sync command to produce the initial catalog and a track ID mapping for the current local audio files.
- [x] 2.2 Rename or relocate existing local audio assets to `<netease-track-id>.<extension>` and remove stale names only after verifying every playable catalog entry resolves.
- [x] 2.3 Verify generated JSON, cached covers, and local audio assets are suitable for the existing Next.js public-asset pipeline.

## 3. Shared Playback State

- [x] 3.1 Add a layout-scoped client music controller/store that loads the static catalog and owns one `HTMLAudioElement`.
- [x] 3.2 Implement current-track selection, playable queue derivation, play/pause, previous/next, progress and duration events, seeking, repeat mode, and ended-track behavior.
- [x] 3.3 Add recoverable error state for missing or undecodable local files and ensure unavailable tracks are skipped by queue navigation.

## 4. Player Surfaces

- [x] 4.1 Refactor `MusicCard` to consume shared state, display the current local cover and metadata, and preserve playback across route navigation.
- [x] 4.2 Replace the `/music` placeholder with the synchronized playlist view, including unavailable states and controls that dispatch to the shared controller.
- [x] 4.3 Make the player usable on mobile with a compact fixed surface while preserving the existing desktop draggable-card behavior.
- [x] 4.4 Keep existing card-style configuration and navigation behavior compatible with the upgraded music surfaces.

## 5. Verification and Documentation

- [x] 5.1 Test sync success, invalid playlist responses, cover failures, atomic-write behavior, duplicate IDs, and missing local files.
- [x] 5.2 Verify home-to-`/music` navigation does not duplicate audio or reset current playback, and verify repeat/queue controls around unavailable tracks.
- [ ] 5.3 Run formatting, TypeScript/build checks, and a production preview to confirm static catalog and audio assets load under the Cloudflare-compatible build.
- [x] 5.4 Document the playlist ID, local filename convention, sync command, supported extensions, and the fact that playback never streams from NetEase.
