import importPlugin from '@biffud/eslint-plugin-import';
import type { Linter } from 'eslint';

const imports: Linter.Config = {
	name: '@biffud/eslint-config/import',
	plugins: {
		import: importPlugin,
	},
	rules: {},
};

export { imports };
