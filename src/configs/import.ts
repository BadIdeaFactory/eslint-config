import importPlugin from '@biffud/eslint-plugin-import';
import type { Linter } from 'eslint';

const FILES_DEFAULT_EXPORTING_BY_CONVENTION = [
	'**/*.config.{js,mjs,cjs,ts,mts,cts}',
	'**/*.stories.{js,jsx,ts,tsx}',
];

const imports: Linter.Config = {
	name: '@biffud/eslint-config/import',
	plugins: {
		import: importPlugin,
	},
	rules: {
		'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
		'import/first': 'error',
		'import/newline-after-import': 'error',
		'import/no-absolute-path': 'error',
		'import/no-amd': 'error',
		'import/no-default-export': 'error',
		'import/no-duplicates': 'error',
		'import/no-empty-named-blocks': 'error',
		'import/no-extraneous-dependencies': 'error',
		'import/no-mutable-exports': 'error',
		'import/no-named-export': 'off',
		'import/no-relative-packages': 'error',
		'import/no-useless-path-segments': 'error',
		'import/no-webpack-loader-syntax': 'error',
		'import/order': [
			'error',
			{
				groups: [
					'builtin',
					'external',
					'internal',
					'parent',
					'sibling',
					'index',
					'object',
					'type',
				],
				'newlines-between': 'never',
				alphabetize: {
					order: 'asc',
					caseInsensitive: true,
				},
			},
		],
		'import/prefer-default-export': 'off',
	},
};

const conventionalDefaultExports: Linter.Config = {
	name: '@biffud/eslint-config/import-conventional-default-exports',
	files: FILES_DEFAULT_EXPORTING_BY_CONVENTION,
	rules: {
		'import/no-default-export': 'off',
	},
};

export { conventionalDefaultExports, imports };
