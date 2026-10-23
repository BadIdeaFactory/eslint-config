# Contributing

## Setup

You need the Node version in [`.node-version`](.node-version).

```bash
npm ci
```

## Commands

| Command               | What it does                                      |
| --------------------- | ------------------------------------------------- |
| `npm run lint`        | ESLint, Prettier and `tsc`                        |
| `npm run format`      | Fixes what Prettier and ESLint can fix            |
| `npm test`            | Runs the config tests                             |
| `npm run build`       | Builds to `dist/`                                 |
| `npm run lint:commit` | Checks this branch's commit messages              |
| `npm run lint:major`  | Checks breaking changes against the `eslint` peer |

The last two read git history and need `origin/main` fetched.

## Adding a rule

1. Add the rule to the matching module in [`src/configs/`](src/configs). Only
   spell out options where you are overriding the default, and don't comment
   the entry — the reasoning goes in the commit message.
2. Add a `valid/` and an `invalid/` sample for it under
   [`src/test/fixtures/`](src/test/fixtures). See
   [`src/test/README.md`](src/test/README.md).
3. Commit it as a `feat`, with a body that says why.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org), and
the type decides the next version, so it is worth getting right:

| Marker                             | Release | Use for                                                       |
| ---------------------------------- | ------- | ------------------------------------------------------------- |
| `feat`                             | Minor   | A consumer who changed nothing could newly see a lint error   |
| `fix`                              | Patch   | Everything else that should reach consumers                   |
| `!` or a `BREAKING CHANGE:` footer | Major   | This package moved to a new ESLint major. Nothing else, ever. |

`build`, `chore`, `ci`, `docs`, `refactor`, `style` and `test` release nothing.

Past the type, follow the
[seven rules of a great commit message](https://cbea.ms/git-commit/). The type
doesn't count towards the fifty characters:

```
feat: Add the yoda rule and consume it here
```

## Releases

Every merge to `main` publishes. semantic-release picks the version from the
commit types since the last tag; nobody edits `version` in `package.json`.

npm versions can't be taken back, so the guard is before the merge:
`npm run lint:major` fails a branch that marks a breaking change without moving
the `eslint` peer major, or moves it without marking one. If you change the
peer range, run `npm install --package-lock-only` afterwards.
