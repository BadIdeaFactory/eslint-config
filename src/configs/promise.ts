import promisePlugin from 'eslint-plugin-promise';
import type { Linter } from 'eslint';

const promise: Linter.Config = {
	name: '@biffud/eslint-config/promise',
	plugins: {
		promise: promisePlugin,
	},
	rules: {
		'promise/avoid-new': 'error',
		'promise/no-multiple-resolved': 'error',
		'promise/no-return-wrap': 'error',
	},
};

export { promise };
