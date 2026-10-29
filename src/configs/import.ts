import importPlugin from '@biffud/eslint-plugin-import';
import type { Linter } from 'eslint';

const imports: Linter.Config = {
	name: '@biffud/eslint-config/import',
	plugins: {
		import: importPlugin,
	},
	rules: {
		'import/no-default-export': 'error',
		'import/no-named-export': 'off',
		'import/prefer-default-export': 'off',
	},
};

export { imports };
