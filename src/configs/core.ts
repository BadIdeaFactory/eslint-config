import type { Linter } from 'eslint';

const core: Linter.Config = {
	name: '@biffud/eslint-config/core',
	rules: {
		'default-case-last': 'error',
		'no-console': 'error',
		yoda: ['error', 'never'],
	},
};

export { core };
