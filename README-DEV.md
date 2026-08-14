# Twotime Developer Guide

This section has been added for the benefit of developers needing to do any work on the utility.

## Go-to people

Tom Hyde - repo administrator
Ian French - latest developer to do any work on the utility

## Preparation

Clone the repo: `git clone https://github.com/NewOrbit/twotime.git`

Change directory to the cloned repo, install dependencies and sanity-check the build, e.g. from PowerShell:

```powershell
cd twotime
npm install
npm run prepublishOnly
```

## Developing the code

1. From the root of the repo, i.e. the same folder as this README:
1. Ensure the `package.json` file contains the correct name and version.
1. `npm run typecheck`, then `npm run lint`, then `npm run test`.

Nothing is compiled to an intermediate folder, so there is nothing to delete
between runs.

## Testing

Tests use Node's built-in test runner (`node:test`) with `node:assert/strict`,
and run straight from the TypeScript sources with no build step:

```powershell
npm run test
npm run test:watch
```

Fixtures are plain `describe` / `it` blocks. There is no `.each` helper in
`node:test`, so table-driven cases are an array and a `for...of` loop that
declares one `it()` per case. Keep the loop *outside* `it()`, so every case is
an independent test and a failure in one does not mask the rest.

Multi-column tables get a named, labelled-tuple array so each column is
self-documenting; single-value tables inline the array in the `for` header:

```ts
const cases: [input: string, hours: number, minutes: number][] = [ /* ... */ ];
for (const [input, hours, minutes] of cases) { /* it(...) */ }

for (const version of ["1.0.0", "0.5.0"]) { /* it(...) */ }
```

Assertions use `node:assert/strict` (`deepStrictEqual` / `strictEqual`). Note
this is deliberately strict about keys whose value is `undefined`, matching the
behaviour of the alsatian suite this replaced.

`npm run test` does **not** type-check: Node erases types without checking
them, so `npm run typecheck` is a separate gate and both run in CI.

## How the package is built

The published package is a single self-contained file, `dist/twotime.cjs`, produced by `npm run bundle`, which runs esbuild straight from `src/index.ts` with no `tsc` emit step. Type checking is a separate gate (`npm run typecheck`, i.e. `tsc --noEmit`), because Node's native type stripping erases types without checking them. Bundling means users installing the package get one file with no dependency tree, which makes both installation and cold start dramatically faster (an unbundled install was ~23,000 files, and on Windows every file paid a Defender scan on first run).

Because of this, **all runtime dependencies deliberately live in `devDependencies`**. They are compiled into the bundle at build time and must not be moved back to `dependencies`, or users would download them for nothing. If you add a new runtime package, install it as a dev dependency and then *run* the bundle (`node dist/twotime.cjs --help`). A successful esbuild run does not prove the bundle works. See below.

### Why the bundle is CJS

The `.cjs` extension looks like a leftover from before the package became ESM, but it is doing real work and should not be flipped to ESM without re-testing.

esbuild converts a CommonJS dependency by wrapping it in a factory and rewriting every `require()` it can resolve statically. Anything it cannot resolve falls back to a `__require` helper. In CJS output that helper forwards to the real `require` and works. In ESM output there is no `require` to forward to, so it becomes a stub that throws `Dynamic require of "x" is not supported` at run time.

Building this project with `--format=esm` produces a bundle that dies immediately:

```none
    Error: Dynamic require of "fs" is not supported
        at node_modules/graceful-fs/graceful-fs.js
```

`table` has no ESM release at all, and `configstore` pulls in `graceful-fs`, so the dependency graph will stay mixed for a while yet. CJS output can absorb both CJS and ESM inputs. ESM output can only absorb ESM.

Note that esbuild gives no warning about any of this. It reports success and a plausible file size, and the failure only shows up when the bundle is run. That is why the check above is "run it" rather than "look for warnings".

An ESM bundle can be made to work by injecting `createRequire` via `--banner:js`, and in this project every unresolved require happens to be a Node builtin, so it would stay self-contained. But that only buys the file extension. The CJS dependencies would still be working only because they were handed a `require` back, and if one of them ever reaches for a non-builtin at run time, the single-file property breaks silently. Not worth it until the graph is ESM-only.

## Running the code

There are several new scripts added to `package.json` to enable running the utility with one of the arguments, for example starting a timer:

```powershell
npm run start
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
export type EntityType = typeof EntityType[keyof typeof EntityType];
```

`EntityType.BUG` still works as a value and `: EntityType` still works as a
type. Two consequences worth knowing: `@typescript-eslint/no-redeclare` is
switched off in `eslint.config.mjs` because it flags this pattern (TypeScript
itself still reports genuine redeclarations as TS2451), and unlike an `enum` the
type is not nominal: a bare `"Bug"` is assignable to `EntityType`.

## Publishing the code

This will be done manually when necessary, rather than tying it to a DevOps pipeline.

1. Ensure you have enough privileges to add a package to the NewOrbit registry.
2. The npm package `vsts-npm-auth` should already be installed as part of a general `npm install`.  Otherwise install it manually by using `npm install vsts-npm-auth`
3. Unless you already have this all set up, add a `.npmrc` file to the project in the same directory as package.json with the following contents:

```none
registry=https://registry.npmjs.org/
@neworbit:registry=https://pkgs.dev.azure.com/neworbit/_packaging/NewOrbit/npm/registry/
always-auth=true
```

(This file must be ignored by git as it will contain an unencrypted authentication token.)
4. Run vsts-npm-auth to get an Azure Artifacts token added:  `npx vsts-npm-auth -config .npmrc`.  Note:
    - You don't need to do this every time. npm will give a 401 unauthorized error when you need to run it again.
    - You should get an email entitled "Azure DevOps personal access token added".
5. Publish the package with `npm publish`.  Check it exists in [NewOrbit internal artefacts](https://dev.azure.com/neworbit/NewOrbit%20Internal/_artifacts/feed/NewOrbit).  Publishing automatically rebuilds the bundle and runs the tests and linter first (see `prepublishOnly` in `package.json`); you can preview the tarball contents with `npm pack --dry-run`.  It should contain little more than `dist/twotime.cjs`.

## Recent history

The codebase was very old and most library dependencies were hugely behind current versions.  In January 2025, a `npm audit` reported 85 vulnerabilities (1 low, 22 moderate, 50 high, 12 critical). Most were centred on the `harvest` package which looks like it's been abandoned.  Ian F updated everything to more modern versions as part of a piece of work to tighten up the reporting of task time-remaining.  Several old libraries such as moment were factored out.

There are currently no vulnerabilities reported by `npm audit`, or on packaging the utility.

The Jan 2025 notes recorded that `chalk`, `configstore` and the `inquirer` family were stuck on old majors because upgrading produced `ERR_REQUIRE_ESM` at run time. That blocker has gone, for two separate reasons: this package is now `"type": "module"`, so its own sources import ESM natively, and `require()` of an ESM module has worked since Node 20.19 / 22.12 / 23 anyway, as long as the module graph has no top-level await. Those packages were all taken to their current majors in Aug 2026 with no interop workarounds.

The `inquirer` family was replaced rather than upgraded. `inquirer-autocomplete-prompt` deep-imports `inquirer/lib/*`, and inquirer stopped publishing those paths in its `exports` map at v10, so the autocomplete prompt cannot work on any modern inquirer. As `inquirer` v10+ is itself only a legacy-API wrapper over `@inquirer/prompts`, the package now depends on `@inquirer/prompts` directly and uses `search` in place of the autocomplete prompt. That removed four dependencies (`inquirer`, `inquirer-autocomplete-prompt` and both `@types/*` packages, as the new one ships its own types) and took the bundle from 2.1 MB to under 500 KB.

Three prompt behaviours to be aware of before changing this code:

- Interrupting a prompt with Ctrl+C does not kill the process. `@inquirer/core` rejects the prompt promise with an `ExitPromptError` and leaves it to the application, so an uncaught one reaches the user as an unhandled-rejection stack trace. Every command is therefore wrapped in `runCommand` (`src/utils/run-command.ts`), which treats that one error as a cancellation and rethrows everything else. Wrap any new command the same way.
- `@inquirer/input` defaults to `validationFailureMode: 'keep'`, which leaves a rejected value in the buffer so the next attempt appends to it. The prompts that validate set it to `'clear'` instead. Removing that will produce inputs like `notanumber999`.
- `search` resolves its `source` asynchronously, so the highlighted item lags slightly behind the typed term.

Packages held back on purpose, as of Aug 2026:

| Package | Held at | Why |
| --- | --- | --- |
| `eslint`, `@eslint/js` | 9.x | `eslint-config-neworbit@11` declares `peerDependencies: { eslint: "9.x" }` |
| `typescript` | 6.x | `@typescript-eslint` 8.x declares `typescript: ">=4.8.4 <6.1.0"`, so TS 7 breaks `npm run lint` |
| `@types/node` | 24.x | Should track the `engines.node` floor, not run ahead of it |

## To Do

Delete the public package!  At the moment this isn't possible as there are several owners who have left the company.

Revisit the three held packages above when their blockers clear: `eslint` 10 needs a new `eslint-config-neworbit`, and TypeScript 7 needs `typescript-eslint` 9.
