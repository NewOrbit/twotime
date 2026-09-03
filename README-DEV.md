# Twotime Developer Guide

This section has been added for the benefit of developers needing to do any work on the utility.

## Go-to people

Tom Hyde - repo administrator
Ian French - latest developer to do any work on the utility

## Preparation

Clone the repo: `git clone https://github.com/NewOrbit/twotime.git`

This repo uses [pnpm](https://pnpm.io/installation). Any recent version will do:
pnpm reads the `packageManager` field in `package.json` and switches itself to
the version pinned there. Do not use `npm install`, which ignores
`pnpm-lock.yaml`.

Change directory to the cloned repo, install dependencies and sanity-check the build, e.g. from PowerShell:

```powershell
cd twotime
pnpm install
pnpm run prepublishOnly
```

## Developing the code

1. From the root of the repo, i.e. the same folder as this README:
1. Ensure the `package.json` file contains the correct name and version.
1. `pnpm run typecheck`, then `pnpm run lint`, then `pnpm run test`.

Nothing is compiled to an intermediate folder, so there is nothing to delete
between runs.

## Testing

Tests use Node's built-in test runner (`node:test`) with `node:assert/strict`,
and run straight from the TypeScript sources with no build step:

```powershell
pnpm run test
pnpm run test:watch
```

Fixtures are plain `describe` / `it` blocks. There is no `.each` helper in
`node:test`, so table-driven cases are an array and a `for...of` loop that
declares one `it()` per case. Keep the loop _outside_ `it()`, so every case is
an independent test and a failure in one does not mask the rest.

Multi-column tables get a named, labelled-tuple array so each column is
self-documenting; single-value tables inline the array in the `for` header:

```ts
const cases: [input: string, hours: number, minutes: number][] = [/* ... */];
for (const [input, hours, minutes] of cases) {
    /* it(...) */
}

for (const version of ["1.0.0", "0.5.0"]) {
    /* it(...) */
}
```

Assertions use `node:assert/strict` (`deepStrictEqual` / `strictEqual`). Note
this is deliberately strict about keys whose value is `undefined`, matching the
behaviour of the alsatian suite this replaced.

`pnpm run test` does **not** type-check: Node erases types without checking
them, so `pnpm run typecheck` is a separate gate and both run in CI.

## How the package is built

The published package is a single self-contained file, `dist/twotime.cjs`, produced by `pnpm run bundle`, which runs rolldown straight from `src/index.ts` with no `tsc` emit step. Type checking is a separate gate (`pnpm run typecheck`, i.e. `tsc --noEmit`), because Node's native type stripping erases types without checking them. Bundling means users installing the package get one file with no dependency tree, which makes both installation and cold start dramatically faster (an unbundled install was ~23,000 files, and on Windows every file paid a Defender scan on first run).

Because of this, **all runtime dependencies deliberately live in `devDependencies`**. They are compiled into the bundle at build time and must not be moved back to `dependencies`, or users would download them for nothing. If you add a new runtime package, install it as a dev dependency and then _run_ the bundle (`node dist/twotime.cjs --help`). A clean build is not evidence that it works: several dependencies are still CommonJS, interop problems with them surface only when the file is executed, and no bundler warns about it.

The output is CommonJS because it starts faster. rolldown, esbuild and rollup were all built and timed against each other in Aug 2026. rolldown produced the smallest bundle, and its CommonJS output reached the first prompt about 5 ms sooner than its ESM output, because Node's ESM loader costs more at startup than `require` even for one self-contained file. So `.cjs` is deliberate but not load-bearing, and `--format esm` remains a supported switch if there is ever a reason. esbuild is the obvious fallback if rolldown disappoints, but note its ESM output needs a `createRequire` banner to survive this dependency graph.

## Running the code

There are several new scripts added to `package.json` to enable running the utility with one of the arguments, for example starting a timer:

```powershell
pnpm run start
```

Other features can be tested by running `node` directly against the TypeScript
sources. Node 24 strips the types natively, so there is no build step:

```powershell
node src/index.ts --help
node src/index.ts pause
```

This works because the sources are kept free of non-erasable TypeScript syntax
(no `enum`, no namespaces, no parameter properties), enforced by the
`erasableSyntaxOnly` compiler option.

Where an enum would previously have been used, the repo idiom is a const object
paired with a type of the same name, which keeps call sites identical while
erasing cleanly:

```ts
export const EntityType = { BUG: "Bug", TASK: "Task" } as const;
export type EntityType = (typeof EntityType)[keyof typeof EntityType];
```

`EntityType.BUG` still works as a value and `: EntityType` still works as a
type. Two consequences worth knowing: `@typescript-eslint/no-redeclare` is
switched off in `eslint.config.mjs` because it flags this pattern (TypeScript
itself still reports genuine redeclarations as TS2451), and unlike an `enum` the
type is not nominal: a bare `"Bug"` is assignable to `EntityType`.

## Continuous integration

CI is GitHub Actions, in `.github/workflows`. `pr.yml` runs the reusable `verify.yml` job on every pull request, whatever branch it targets: install, build, test, lint. The release workflow calls the same job, so the checks on a pull request and the checks behind a release cannot drift apart. The Azure Pipelines build is gone.

The repository is public on purpose: twotime has been MIT-licensed with public source since 2020, and the GitHub release asset is now the primary way people install it. Do not make the repository private without first putting another distribution channel in its place.

## Publishing the code

Releases are automated. Merging a pull request to master that changes the version in `package.json` makes `draft-release.yml` create a **draft** GitHub release titled `v<version>`.

The draft carries one asset, `neworbit-twotime-<version>.tgz`, packed from the bundle that `verify.yml` built and tested, and attested with `actions/attest-build-provenance`. The body is the matching `## <version>` section of `CHANGELOG.md`; when there is no such section, GitHub's generated notes are used instead. An `Install or upgrade` section holding the exact `pnpm add -g` command for that version is appended to the body either way.

The draft is regenerated on every push to master until someone publishes it, so there is no point editing it by hand. Change the notes in `CHANGELOG.md` and push; the next run replaces the draft.

A version with a pre-release part, such as `4.1.0-beta.1`, is drafted as a GitHub pre-release. GitHub does not work that out from the version itself, so the workflow sets the flag.

Publishing the draft is a manual step. It creates the `v<version>` tag and triggers `publish-feed.yml`, which downloads the asset from the release, verifies its provenance and publishes it to the NewOrbit Azure Artifacts feed. The provenance check accepts only an asset attested by `draft-release.yml` in this repository from the commit the tag points to, so a tarball uploaded by hand, or one kept from an earlier build of the same version, is refused. Pre-releases are not published to the feed.

If a job fails, re-run it. A version that is already on the feed with the same bytes is left alone and the job still succeeds, so re-running is safe and is the normal way to recover. If the feed already has that version with different content, for example from a manual publish, the job fails and says so; the feed cannot be overwritten, so bump the version and release again.

To check an asset you have downloaded:

```bash
gh attestation verify neworbit-twotime-<version>.tgz --repo NewOrbit/twotime
```

### Writing a changelog entry

The heading is `## <version>`, matching the version in `package.json` exactly. That string is what the workflow looks for, and a mismatch quietly gets you GitHub's generated notes instead. Under the heading, use plain bullets.

Write for the person using twotime: what they will notice, and what they have to do about it. Newest section first. No dates, and no Unreleased section. Dependency bumps and internal refactors do not belong in the changelog, because they are invisible to the user.

### Feed authentication

Authentication to the feed is a Microsoft Entra federated credential, so there is no secret to rotate. An admin sets this up once:

1. An Entra app registration with a federated credential for the repository `NewOrbit/twotime`, entity type Environment, environment name `feed`.
2. That app's service principal added to the NewOrbit feed as a Contributor.
3. A GitHub environment named `feed`, holding the variables `AZURE_CLIENT_ID` and `AZURE_TENANT_ID`. Both are plain variables rather than secrets.

### Manual publish (backup)

Use this only when the automation is broken.

1. Ensure you have enough privileges to add a package to the NewOrbit registry.
2. The npm package `vsts-npm-auth` should already be installed as part of a general `pnpm install`. Otherwise install it manually by using `pnpm add -D vsts-npm-auth`.
3. Unless you already have this all set up, add a `.npmrc` file to the project in the same directory as `package.json` with the following contents:

    ```none
    registry=https://registry.npmjs.org/
    @neworbit:registry=https://pkgs.dev.azure.com/neworbit/_packaging/NewOrbit/npm/registry/
    always-auth=true
    ```

    This file must be ignored by git, as it will contain an unencrypted authentication token.

4. Run `pnpm exec vsts-npm-auth -config .npmrc` to get an Azure Artifacts token added.
    - You don't need to do this every time. npm will give a 401 unauthorized error when you need to run it again.
    - You should get an email entitled "Azure DevOps personal access token added".

5. Publish the package with `pnpm publish`, then check it exists in [NewOrbit internal artefacts](https://dev.azure.com/neworbit/NewOrbit%20Internal/_artifacts/feed/NewOrbit).
    - Publishing rebuilds the bundle and runs the tests and linter first, see `prepublishOnly` in `package.json`.
    - Preview the tarball contents with `pnpm pack --dry-run`. It should contain little more than `dist/twotime.cjs`.
    - `pnpm publish` refuses to publish from a dirty working tree unless you pass `--no-git-checks`.

## Recent history

The codebase was very old and most library dependencies were hugely behind current versions. In January 2025, a `npm audit` reported 85 vulnerabilities (1 low, 22 moderate, 50 high, 12 critical). Most were centred on the `harvest` package which looks like it's been abandoned. Ian F updated everything to more modern versions as part of a piece of work to tighten up the reporting of task time-remaining. Several old libraries such as moment were factored out.

In Aug 2026 the packages that had been left behind, `chalk`, `configstore` and `commander`, were taken to their current majors. The `inquirer` family was replaced rather than upgraded: `inquirer-autocomplete-prompt` deep-imports paths that inquirer stopped publishing at v10, and inquirer v10+ is itself only a legacy-API wrapper over `@inquirer/prompts`. Depending on `@inquirer/prompts` directly, and using its `search` prompt in place of the autocomplete one, removed four packages and took the bundle from 2.1 MB to under 500 KB.

There are currently no vulnerabilities reported by `pnpm audit`, or on packaging the utility.

In Aug 2026 the repo moved from npm to pnpm and picked up the standard NewOrbit
`minimumReleaseAge` and `trustPolicy` settings in `pnpm-workspace.yaml`. The
resolved dependency tree was identical to npm's at that point.

Three prompt behaviours to be aware of before changing this code:

- Interrupting a prompt with Ctrl+C does not kill the process. `@inquirer/core` rejects the prompt promise with an `ExitPromptError` and leaves it to the application, so an uncaught one reaches the user as an unhandled-rejection stack trace. Every command is therefore wrapped in `runCommand` (`src/utils/run-command.ts`), which treats that one error as a cancellation and rethrows everything else. Wrap any new command the same way.
- `@inquirer/input` defaults to `validationFailureMode: 'keep'`, which leaves a rejected value in the buffer so the next attempt appends to it. The prompts that validate set it to `'clear'` instead. Removing that will produce inputs like `notanumber999`.
- `search` resolves its `source` asynchronously, so the highlighted item lags slightly behind the typed term.

Packages held back on purpose, as of Aug 2026:

| Package                | Held at | Why                                                                                              |
| ---------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `eslint`, `@eslint/js` | 9.x     | `eslint-config-neworbit@11` declares `peerDependencies: { eslint: "9.x" }`                       |
| `typescript`           | 6.x     | `@typescript-eslint` 8.x declares `typescript: ">=4.8.4 <6.1.0"`, so TS 7 breaks `pnpm run lint` |
| `@types/node`          | 24.x    | Should track the `engines.node` floor, not run ahead of it                                       |

## To Do

Delete the public package! At the moment this isn't possible as there are several owners who have left the company.

Revisit the three held packages above when their blockers clear: `eslint` 10 needs a new `eslint-config-neworbit`, and TypeScript 7 needs `typescript-eslint` 9.
