## Context

The existing `MusicCard` owns an `HTMLAudioElement`, hard-codes one local file, and is only rendered on desktop. `/music` is a placeholder and `src/app/music/list.ts` is not connected to a player. The site is deployed as a Next.js App Router application on Cloudflare Workers, so runtime playback must remain static-asset based; NetEase credentials may be used only by an explicit local synchronization command.

## Goals / Non-Goals

**Goals:**

- Make the public playlist `17655082808` the metadata source through an explicit local sync command.
- Keep audio and cover assets available offline after synchronization and compatible with static deployment.
- Share one queue and one browser audio element between the home mini-player and `/music`.
- Make local-file availability and sync errors visible and recoverable.

**Non-Goals:**

- Runtime NetEase account login, private playlist access from the deployed site, or runtime audio URL extraction.
- Downloading or proxying copyrighted audio from NetEase.
- Automatic background synchronization in Cloudflare Workers.

## Decisions

### Static snapshot instead of runtime NetEase requests

The `music:sync` command runs in the repository environment and atomically replaces `public/music/playlist.json` after metadata and cover processing completes. It optionally sends a `NETEASE_COOKIE` environment variable to the metadata and cover requests for a locally authenticated session; the browser reads only local JSON and assets. The credential is never written to generated files or logs.

### ID-based local file convention

The sync process scans `public/music` for supported audio extensions and maps `<track-id>.<extension>` to the corresponding catalog entry. This avoids title/artist normalization bugs and lets the catalog distinguish metadata from playback availability.

### Generated catalog contract

The catalog contains playlist metadata plus normalized tracks: `id`, `title`, `artists`, `album`, `cover`, `source`, and `available`. `cover` and `source` are local public paths; unavailable entries have `source: null` and `available: false`.

### Shared client playback controller

Introduce a client-side music store/controller at the layout level. It owns one `HTMLAudioElement`, subscribes to its lifecycle events, derives a playable queue, and exposes commands to both `MusicCard` and `/music`. The controller must be hydrated only after the catalog is loaded and must clean up the single audio element on final unmount.

### Conservative sync dependencies

Prefer the existing Node/TypeScript toolchain and native `fetch`/filesystem APIs over adding a runtime music SDK. Any NetEase request URL and user-agent headers belong to the sync script, not public client code, and may be overridden for endpoint compatibility.

## Risks / Trade-offs

- [NetEase public endpoint changes or rate limits] -> Keep the provider adapter isolated, fail without replacing the prior snapshot, and print the endpoint/status in diagnostics.
- [A login cookie is expired or accidentally exposed] -> Keep it environment-only, never print its value, document immediate removal after sync, and fail with a normal request diagnostic.
- [A local file is missing or uses an unsupported codec] -> Mark it unavailable during sync and surface playback errors without breaking the queue.
- [Cover URLs expire or reject automated requests] -> Cache covers during sync and retain a fallback placeholder path.
- [Large playlists increase repository assets] -> Deduplicate cover downloads by track ID and only commit changed generated files.
- [A shared audio element conflicts with browser autoplay policy] -> Start playback only from explicit user gestures and preserve paused state when autoplay is rejected.

## Migration Plan

1. Rename existing local audio files to their NetEase track IDs and run the sync command to generate the initial catalog.
2. Deploy the catalog and player changes together; verify `/music`, home playback, and a missing-file entry.
3. Roll back by restoring the previous `MusicCard` and removing the generated catalog references; local audio files can remain in the repository.
