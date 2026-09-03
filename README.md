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

## License

[AGPL-3.0](LICENSE)
