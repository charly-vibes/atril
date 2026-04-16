# atril

[![tracked with wai](https://img.shields.io/badge/tracked%20with-wai-blue)](https://github.com/charly-vibes/wai)

A music stand for your project's score.

**atril** is a set of web-based viewers for the [wai](https://github.com/charly-vibes/wai) ecosystem. Where wai captures the *why* behind decisions, beads tracks *what* needs doing, and openspec defines *what the system should look like* — atril presents your specs and issues in a clean, readable interface.

Like a music stand holds the score so musicians can play, atril holds your project's specs and issues so you can read them without friction.

## Viewers

### Spec Viewer

A tablet-optimized document reader for OpenSpec files in GitHub repositories.

- Hierarchical file tree with search and branch switching
- Auto-generated table of contents and deep linking
- Beautiful typography optimized for tablet reading

### Beads Viewer

A visualization tool for issue trackers created with the [`bd`](https://github.com/charly-vibes/wai) CLI.

- Filter by status, type, and priority; search by title
- Interactive dependency graph with pan/zoom
- Shareable URLs for specific repos and issues

## Origin

Both viewers were prototyped in [jams](https://github.com/charly-vibes/jams), a collection of single-page web apps:

- [Spec Viewer prototype](https://charly-vibes.github.io/jams/spec-viewer/)
- [Beads Viewer prototype](https://charly-vibes.github.io/jams/beads-viewer/)

atril promotes them to a dedicated home as they mature into core tools for the wai workflow.

## Design

- Vanilla JavaScript, no frameworks
- Warm, readable color palette with dark/light themes
- Tablet-first responsive design
- GitHub API for data fetching (unauthenticated)
- Single-file HTML apps (self-contained)

## License

MIT
