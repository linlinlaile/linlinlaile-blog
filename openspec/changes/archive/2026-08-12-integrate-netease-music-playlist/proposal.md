## Why

The blog already has a local audio card, but its track metadata, queue, and `/music` page are disconnected. The owner's NetEase Cloud Music playlist should become the source of song names, artists, albums, and covers while local files remain the only playback source; because the complete playlist requires login, synchronization must support a local-only session cookie without making credentials part of the site runtime.

## What Changes

- Add a repeatable sync command for playlist `17655082808` that generates a static `public/music/playlist.json` catalog.
- Allow the sync command to use an optional local `NETEASE_COOKIE` for playlists whose complete contents require login, without persisting or logging the credential.
- Use NetEase track IDs as the canonical names for local audio files and map supported `.mp3`/`.m4a` files to catalog entries.
- Cache track cover images locally during synchronization.
- Expose playlist metadata and local-availability state to the full `/music` page.
- Upgrade the home mini-player to use the shared local playlist queue and show the selected track's metadata and cover.
- Add shared playback state for play/pause, previous/next, progress seeking, and repeat behavior across the home card and music page.
- Mark catalog entries without a matching local file as unavailable instead of attempting to stream from NetEase.

## Capabilities

### New Capabilities

- `netease-playlist-sync`: Synchronize a public NetEase playlist into a versioned local catalog and cached cover assets, with deterministic local-file matching and actionable failures.
- `local-music-library`: Represent and browse playlist metadata, local playback sources, and unavailable entries in the music page and mini-player.
- `shared-music-playback`: Provide shared queue and HTML audio playback state across routes and player surfaces.

### Modified Capabilities

<!-- No existing OpenSpec capabilities are present in this repository. -->

## Impact

- `scripts/` and `package.json` gain the playlist synchronization command and its runtime dependencies/configuration.
- `public/music/` gains the generated catalog, cached covers, and ID-named local audio files.
- `src/app/music/`, `src/components/music-card.tsx`, and shared client state gain the catalog view and playback controls.
- The build remains compatible with Next.js App Router and Cloudflare Workers because runtime playback reads static local assets; NetEase access is confined to the explicit sync command.
- The sync process must handle public playlist API availability, rate limits, duplicate tracks, unsupported audio extensions, and cover download failures without exposing account credentials.
