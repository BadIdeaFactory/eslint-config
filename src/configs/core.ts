import type { Linter } from 'eslint';

const core: Linter.Config = {
	name: '@biffud/eslint-config/core',
	rules: {
		'default-case-last': 'error',
		'for-direction': 'error',
		'guard-for-in': 'error',
		'no-compare-neg-zero': 'error',
		'no-console': 'error',
		'no-debugger': 'error',
		'no-dupe-else-if': 'error',
		'no-duplicate-case': 'error',
		'no-empty-pattern': 'error',
		'no-eval': 'error',
		'no-ex-assign': 'error',
		yoda: ['error', 'never'],
	},
};

export { core };
