![CI](https://github.com/BadIdeaFactory/eslint-config/actions/workflows/ci.yml/badge.svg)
[![npm](https://img.shields.io/npm/v/@biffud/eslint-config)](https://www.npmjs.com/package/@biffud/eslint-config)
[![License](https://img.shields.io/npm/l/@biffud/eslint-config)](LICENSE)

# @biffud/eslint-config

Expertly implemented ESLint configurations for overengineered projects.

A shareable [ESLint](https://eslint.org) configuration for TypeScript projects that pressures everybody on your team to care a little bit too much about code quality.

## Usage

```bash
npm install --save-dev --save-prefix='~' @biffud/eslint-config
npm install --save-dev eslint
```

```js
// eslint.config.mjs
import biffud from '@biffud/eslint-config';

export default [...biffud];
```

This config is written for TypeScript projects. Its TypeScript rules apply to
`.ts`, `.mts`, `.cts` and `.tsx` files; the core ESLint rules also reach any
JavaScript you lint.

It is type aware and finds your types through typescript-eslint's project
service, so:

- every TypeScript file you lint must be covered by one of your tsconfigs, and
- your own config must not set `parserOptions.project`.

## Rules

Every rule lives in [`src/configs/`](src/configs). A rule set to `'error'` alone
uses ESLint's defaults, so any options you see there are where we deliberately
disagree. The commit that added each rule explains why.

### Overriding Naming Rules

Most rules are easy enough to override, like you would any other lint rule, by
adding followup configurations to your eslint config file. Unfortunately there
is one that's a pain: `@typescript-eslint/naming-convention`.

It doesn't allow for granular configuration modifications. This means if you
want to override the naming convention for a given selector convention you end
up overriding ALL selectors. How annoying!

To make this un-annoying use our fancy `namingConventionOptionsWithout` utility
function. This returns our config entries minus whatever it is you decided you
don't like. Then if you want you can add your own rule for that selector.

```js
// eslint.config.mjs
import biffud, { namingConventionOptionsWithout } from '@biffud/eslint-config';

export default [
	...biffud,
	{
		files: ['**/*.{ts,mts,cts,tsx}'],
		rules: {
			'@typescript-eslint/naming-convention': [
				'error',
				...namingConventionOptionsWithout(['enumMember']),
				{ selector: 'enumMember', format: ['UPPER_CASE'] },
			],
		},
	},
];
```

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

Patch releases never add lint errors, but any minor release can. We recommend
a tilde range (`"@biffud/eslint-config": "~10.2.0"`, not `^`), which takes
patches automatically, and moving to a new minor on purpose when you are ready
to adopt the latest rules.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

[MIT](LICENSE)
