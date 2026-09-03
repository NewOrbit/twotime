# Changelog

Each entry describes what changed for someone using twotime. The heading has to
be the exact version from `package.json`: the release workflow copies the
matching section into the GitHub release. See README-DEV.md for how to write
an entry.

## 3.2.0

- twotime now requires Node.js 24 or later.
- Installs as a single file instead of a dependency tree, so installation and
  start-up are much faster.
- The Targetprocess entity picker is a search prompt: start typing to filter
  the list.
