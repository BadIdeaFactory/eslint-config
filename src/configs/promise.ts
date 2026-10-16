import promisePlugin from 'eslint-plugin-promise';
import type { Linter } from 'eslint';

const promise: Linter.Config = {
	name: '@biffud/eslint-config/promise',
	plugins: {
		promise: promisePlugin,
	},
	rules: {
		'promise/avoid-new': 'error',
		'promise/catch-or-return': ['error', { allowFinally: true }],
		'promise/no-multiple-resolved': 'error',
		'promise/no-new-statics': 'error',
		'promise/no-return-wrap': 'error',
		'promise/param-names': 'error',
		'promise/prefer-catch': 'error',
	},
};

export { promise };
