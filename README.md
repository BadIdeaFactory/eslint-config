![CI](https://github.com/BadIdeaFactory/eslint-config/actions/workflows/ci.yml/badge.svg)

# @biffud/eslint-config

Expertly implemented ESLint configurations for overengineered projects.

A shareable [ESLint](https://eslint.org) configuration that pressures everybody on your team to care a little bit too much about code quality.

## Rules

Every rule this config sets lives in [`src/configs/`](src/configs), split by concern,
and those files are the whole source of truth — if a rule is not in there, this package
does not set it. [`src/index.ts`](src/index.ts) just composes them in order.

Rules are listed with their options spelled out even where those match the rule's own
defaults. Where we deviate from a default, the reason is written next to the rule.

Every rule ships with a pair of code samples pinning the behaviour we expect from it;
see [`src/test/`](src/test).

## Versioning

This package deliberately does **not** follow semantic versioning since just about
every rule change would be breaking.

Since adapting a well established standard feels like a terrible idea, it feels appropriate
for us to do so. Given that, our three positions are being reassigned:

| Position  | Meaning                                                       |
| --------- | ------------------------------------------------------------- |
| **Major** | The ESLint major version this package supports. Nothing else. |
| **Minor** | Rule changes and any other breaking change.                   |
| **Patch** | Everything else — non-breaking additions and fixes alike.     |

Practical consequence for consumers: use `~10.2.0` if you want your lint results to stay put, since that admits patch releases only. Use `^10.2.0` only if you are prepared for rule changes to arrive on their own schedule.

## Development

### Requirements

- Node — see [`.node-version`](.node-version) for the expected version

### Setup

Install dependencies:

```bash
npm install
```

### Common Commands

To type check, lint, and check formatting:

```bash
npm run lint
```

To automatically fix what can be fixed:

```bash
npm run format
```

To build the package to `dist/`:

```bash
npm run build
```

### Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org), and
the type decides the next version, so it is worth getting right:

| Marker                             | Release | Use for                                                       |
| ---------------------------------- | ------- | ------------------------------------------------------------- |
| `feat`                             | Minor   | A consumer who changed nothing could newly see a lint error   |
| `fix`                              | Patch   | Everything else that should reach consumers                   |
| `!` or a `BREAKING CHANGE:` footer | Major   | This package moved to a new ESLint major. Nothing else, ever. |

`build`, `chore`, `ci`, `docs`, `refactor`, `style` and `test` release nothing.
A breaking change is marked with a `!` after the type or a `BREAKING CHANGE:`
footer; it is never a type of its own.

The type is metadata and is not part of the description, which gets the fifty
characters to itself:

```
feat: Add the yoda rule and consume it here
```

CI checks what it can — those fifty characters, the absent full stop, a body
wrapped at seventy-two, and a description that is not wholly lower-case. The
rest is convention rather than enforcement: the capitalization, the imperative
mood, and a body that explains the why. All of it comes from the
[seven rules of a great commit message](https://cbea.ms/git-commit/).

To check this branch's commits before opening a pull request:

```bash
npm run lint:commit
```

## License

[AGPL-3.0](LICENSE)
