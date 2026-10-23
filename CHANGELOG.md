# Changelog

Each entry describes what changed for someone using twotime. The heading has to
be the exact version from `package.json`: the release workflow copies the
matching section into the GitHub release. See README-DEV.md for how to write
an entry.

## 4.0.0

- twotime requires Node.js 24.22.1 or a later 24.x, or Node.js 26.12.1 or
  later: the first releases with the October 2026 security fixes.
- twotime is installed with pnpm from the GitHub release page instead of npm
  from the NewOrbit feed. Remove any npm-installed copy first, see the README.
- Installs as a single file instead of a dependency tree, so installation and
  start-up are much faster.
- The Targetprocess entity picker is a search prompt: start typing to filter
  the list.
