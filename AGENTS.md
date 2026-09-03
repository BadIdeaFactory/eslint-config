# Agent Guide for @biffud/eslint-config

This document provides context for LLM agents contributing to the
`BadIdeaFactory/eslint-config` repository.

## Project Overview

`@biffud/eslint-config` is a shareable ESLint flat configuration for ESLint 10,
intended to be strict, type-aware, and opinionated.

**Key Technologies:**

- Node.js (see `.node-version` for the current version) with TypeScript
- ESM throughout — `package.json` sets `"type": "module"`
- ESLint 10 (flat config), `typescript-eslint`, `eslint-plugin-import-x`
- Prettier for formatting

For specific dependency versions, consult `package.json`.

**Status:** early. Tooling, CI, and dependency automation exist, and
`src/index.ts` exports a real — if very short — `configs` array that this
repository already lints itself with.

## The Two Configs

There are two distinct things in this repo and it is easy to confuse them:

| File                | Role                                          |
| ------------------- | --------------------------------------------- |
| `eslint.config.mjs` | How this repository lints **itself**          |
| `src/index.ts`      | What this repository **publishes** for others |

`eslint.config.mjs` imports `configs` from `./src/index.ts` and spreads it in,
so the repo already eats its own dog food; Node's native type stripping is what
lets a `.mjs` config import the TypeScript source directly. The rules still
written inline in `eslint.config.mjs` are the ones that have yet to move to
`src/`. When you move a rule, move it; do not duplicate it in both places.

A rule belongs inline only while it is genuinely repo-specific (the
`eslint.config.mjs` default-export exemption, say). Anything this package would
want to impose on a consumer belongs in `src/`.

## Quick Reference Commands

```bash
# Install dependencies
npm ci

# Lint everything (eslint, prettier, tsc)
npm run lint

# Run the config tests
npm test

# Auto-fix formatting and fixable lint errors
npm run format

# Build to dist/
npm run build
```

## After Making Changes

**Always run the formatter and linter after making ANY changes, including
documentation, configuration, and JSON files:**

```bash
# Auto-fix formatting issues (run this first)
npm run format

# Check for remaining problems
npm run lint
```

`npm run format` fixes Prettier formatting and ESLint auto-fixable rules
(including import ordering). `npm run lint` additionally runs `tsc --noEmit`
against `tsconfig.dev.json`. Run `npm test` too whenever you touch `src/`.

## Project Structure

```
src/
├── configs/            # The rules, split by concern
│   ├── core.ts         # Core ESLint rules; universal, no `files`
│   └── typescript.ts   # Language setup that makes `.ts` lintable at all
├── index.ts            # Composes the modules; exports `configs`
└── test/               # See src/test/README.md
    ├── config.test.ts  # One generic harness; derives everything it runs
    └── fixtures/       # Per-rule sample pairs, split on the same seams
```

`src/configs/` and `src/test/fixtures/` are split along the same seams
deliberately, so contributors working on unrelated areas rarely touch the same
file. Adding a rule means editing one module and one fixture file — never
writing a new test.

The structure will grow as the config does. Update this section when it does.

## Code Conventions

### TypeScript

1. **No default exports** — always use named exports

   ```typescript
   // Good
   export { configs };

   // Bad
   export default configs;
   ```

   `eslint.config.mjs` is the sole exception; ESLint requires a default export
   there, and the config turns the rule off for that file specifically.

2. **No magic numbers** — pull them out into named constants

3. **Import ordering** — auto-sorted and alphabetized: builtin, external,
   internal, parent, sibling, index, object, type. No blank lines between
   groups.

4. **Explicit return types** — required for all functions (except test files)

5. **Type-only imports** — `verbatimModuleSyntax` is on, so type-only imports
   must use `import type`

### Module system and file extensions

This is an ESM project configured so Node can run the TypeScript sources
directly via native type stripping. That imposes two rules:

- **Relative imports carry an explicit `.ts` extension** —
  `import { thing } from './thing.ts'`. `allowImportingTsExtensions` and
  `rewriteRelativeImportExtensions` are enabled, so `tsc` rewrites these to
  `.js` on emit.
- **`erasableSyntaxOnly` is on** — no `enum`, no parameter properties, no
  namespaces with runtime output. Use `const` objects with `as const` and union
  types in place of enums.

### Comments

Do not write inline comments that restate what a rule's own documentation says.
A reader who wants to know what `yoda` does will go read the `yoda` docs, and a
comment that paraphrases them is one more thing to keep in sync.

The comment that _is_ wanted is the one explaining a decision the reader cannot
recover from the code: why we deviate from a rule's default options, why a rule
is switched off for a subset of files, why a preset is ordered where it is.
Rules that simply state a default need no commentary.

### Formatting

Tabs for indentation, single quotes. Prettier reads `.editorconfig` for the
indentation settings, so `.prettierrc` only overrides `singleQuote`. Do not
hand-format; run `npm run format`.

### Config authoring notes

- Import `typescript-eslint` by named export (`import { configs as tsConfigs }`)
  rather than the default. The default export also carries a `configs` member,
  which trips `import-x/no-named-as-default-member`.
- `eslint-config-prettier` goes **last** in the config array so it can turn off
  every stylistic rule the earlier presets enabled.
- Non-TypeScript files are not in the type-aware program. Give them
  `tsConfigs.disableTypeChecked` rather than widening `tsconfig.dev.json`.
- **No top-level `await` in anything reachable from `src/index.ts`.** The
  package is published ESM-only, and CommonJS consumers reach it through Node's
  `require(esm)`, which refuses any module that is not fully synchronous. A
  single top-level `await` would silently cut off every `eslint.config.cjs`
  user. Keep the exported config plain, synchronous data.

## Versioning Policy

This package does **not** use conventional semantic versioning, and the
difference matters when you are deciding how to release a change. Because
almost every change to a lint config breaks somebody's build, "breaking" is not
a useful thing for the major number to signal. The positions are reassigned:

- **Major — the supported ESLint major, and nothing else.** `10.x.x` supports
  ESLint 10. Bump it if and only if this package moves to a new ESLint major.
  Never bump the major to signal that a change is disruptive, and never bump it
  to mark a milestone.
- **Minor — rule changes and other breaking changes.** Adding a rule, tightening
  a rule, removing a rule, renaming an export. If a consumer's `npm run lint`
  could newly fail, it is a minor.
- **Patch — everything else.** Both non-breaking additions and bug fixes land
  here. There is no separate position for "new but harmless."

When in doubt between minor and patch, ask whether a consumer who changed
nothing could see a new lint error. If yes, minor.

The `peerDependencies` range on `eslint` should always agree with the major —
`10.x.x` pairs with `"eslint": "^10.0.0"`. If you change one, change the other.

After changing the version, run `npm install --package-lock-only` so
`package-lock.json` stays in sync; CI's `npm-install` job fails on the drift.

## Dependencies

`typescript-eslint` is a **runtime `dependency`, not a devDependency.**
`src/configs/typescript.ts` ships its parser, and without a parser the config
cannot claim `**/*.ts` at all — ESLint's default parser cannot read a type
annotation, so a config that names `.ts` files without supplying one produces
parse errors rather than lint results. Anything else this package reaches for
at config-resolution time (a plugin, a parser, a resolver) belongs in
`dependencies` for the same reason.

`typescript-eslint` declares its own `typescript` peer range, so this package
does not restate one. That is the same reasoning as the absent `engines` field
below: a second copy would add no enforcement and would rot.

## Version Constraints

`.github/dependabot.yml` ignores major updates for two dependencies, and the
reasons are worth preserving:

- **TypeScript stays on 6.0.x.** `typescript-eslint` declares a peer range of
  `typescript: ">=4.8.4 <6.1.0"`, so the ceiling is 6.1, not 7. The
  devDependency is therefore `~6.0.3` rather than `^6.0.3`, and Dependabot holds
  back minors as well as majors. Widen both together, and only once the
  `typescript-eslint` peer range actually moves.
- **`@types/node` tracks `.node-version`.** It follows the Node version this
  repository develops against, not the newest Node release. Bump it when
  `.node-version` moves, not before.

**`package.json` declares no `engines` field, deliberately.** Do not add one.
The only real Node constraint comes from ESLint, which is a peer dependency and
declares its own range; npm enforces `engines` for every package in the tree,
not just the root, so an unsupported Node already fails (or warns) on ESLint's
declaration. A second copy here would add no enforcement and would rot — see
`eslint-config-airbnb-base`, still claiming Node 10, and `eslint-config-standard`,
still claiming Node 12.

`.node-version` pins the development environment and is unrelated; keep it
current, and leave `engines` absent.

Note that `eslint-config-love` — used as the base in sibling projects — is
**not** usable here: it declares an `eslint: "^9.35.0"` peer and this project
targets ESLint 10 deliberately. Do not add it back as a shortcut.

If you are asked to upgrade anything held back, verify the upstream peer ranges
first rather than assuming they have moved.

## CI

`.github/workflows/ci.yml` runs on pushes to `main` and on pull requests, with
one job apiece for:

- `actionlint` — workflow file validity
- `npm-install` — verifies `package-lock.json` is in sync with `package.json`
- `eslint`, `prettier`, `tsc` — the three parts of `npm run lint`
- `test` — `npm test`
- `build` — verifies `npm run build` succeeds

### What the tests are for

`src/test/config.test.ts` tests the **configuration**, never the rules. The
contributor-facing detail — how to add a rule, how to choose its two samples —
lives in `src/test/README.md`; read that before adding a rule.

The one policy worth restating here: fixtures carry no copy of a rule's
severity or options. A `valid`/`invalid` sample pair pins the chosen option
more tightly than a restatement would, and unlike a restatement it cannot be
brought back into agreement by copying a value across. Resist any suggestion to
add an expected-rules table; it would be a second copy of the config.

The suite resolves `configs` on its own. Layering a third-party config into it
(`eslint-config-prettier` was the tempting one) tests that dependency rather
than us: it would turn the suite red when _they_ changed their disable list,
point the reader at our config, and nothing of ours would have moved. What a
consumer stacks around us is outside our control and not ours to assert on.

The suite also asserts that no rule ships below `error` severity. That is
policy — a strict shared config that emits warnings is one whose rules get
ignored — and it is load-bearing, because it is the only assertion that catches
a severity we downgrade ourselves.

Note the gap this leaves: the tests and the self-lint both exercise `src/`, the
source. Nothing yet exercises `dist/`, the `exports` map, or a CommonJS
`require()` of the published package.

## Maintaining This Document

Keep this document current as the codebase evolves. Update it when:

- New patterns or conventions are established
- The project structure changes
- New npm scripts or CI jobs are added
- Version constraints are lifted or added

**Guidelines for updates:**

- Keep the document user-agnostic (no local paths or developer-specific
  references)
- Reference version files (`.node-version`, `package.json`) rather than
  hardcoding versions
- Remove outdated information rather than letting it accumulate
