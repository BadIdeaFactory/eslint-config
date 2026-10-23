# Agent Guide

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first: it covers setup, commands,
adding a rule, commit messages and releases. This file adds what an agent tends
to get wrong.

## Layout

- `src/configs/` — the published rules, one module per rule set.
- `src/index.ts` — composes the modules into the exported `configs`.
- `src/test/` — the config tests and their fixtures; see its README.
- `scripts/` — `check-major.ts`, the release guard, and its tests.
- `eslint.config.mjs` — how this repository lints itself. It spreads in
  `src/index.ts`; only repo-specific settings belong inline. Don't duplicate a
  rule in both places.

## After any change

Run `npm run format`, then `npm run lint`, then `npm test`.

## Code

- Prefer a well-named constant or helper to a comment. Keep a comment only
  for a constraint the code can't express. Rule entries in `src/configs/`
  never take comments; their reasoning goes in the commit body.
- Named exports only. `eslint.config.mjs` and `src/index.ts` are the exceptions.
- Relative imports end in `.ts`.
- `erasableSyntaxOnly` is on: no `enum`, parameter properties or namespaces.
- Use `import type` for type-only imports.

## Config authoring

- The TypeScript parser, plugin and rules share one config object in
  `src/configs/typescript.ts`. Keep them together.
- Use `projectService`, never `project`.
- No top-level `await` anywhere reachable from `src/index.ts`; CommonJS
  consumers load it with `require(esm)`.
- Anything needed at config-resolution time (a plugin or parser) is a
  `dependency`, not a `devDependency`.
- Import `typescript-eslint` by named export: `import { configs as tsConfigs }`.

## Versioning

`feat` means a consumer could see a new lint error. A `!` or
`BREAKING CHANGE:` means a new ESLint major and nothing else. Getting this
wrong publishes a version that can't be taken back.

## Dependencies

- Don't add an `engines` field.
- Don't add `eslint-config-love`; it doesn't support ESLint 10.
- `typescript`, `@types/node` and `conventional-changelog-conventionalcommits`
  are held back in `.github/dependabot.yml`. Check the upstream peer ranges
  before upgrading any of them.

## Tests

Don't add an expected-rules table. The fixtures already pin each rule's
options, and a table would be a second copy of the config.
