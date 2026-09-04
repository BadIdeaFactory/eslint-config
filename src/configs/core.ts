import type { Linter } from 'eslint';

const core: Linter.Config = {
	name: '@biffud/eslint-config/core',
	rules: {
		'no-console': 'error',
		yoda: ['error', 'never'],
	},
};

export { core };
