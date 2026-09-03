import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import { flatConfigs as importX } from 'eslint-plugin-import-x';
import globals from 'globals';
import { configs as tsConfigs } from 'typescript-eslint';
import { configs as biffudConfigs } from './src/index.ts';

// How this repository lints itself. Rules this package publishes come from
// `./src`; anything still inline below has yet to move there.
export default defineConfig([
	globalIgnores(['dist/']),
	js.configs.recommended,
	tsConfigs.strictTypeChecked,
	tsConfigs.stylisticTypeChecked,
	importX.recommended,
	importX.typescript,
	...biffudConfigs,
	{
		languageOptions: {
			globals: {
				...globals.node,
			},
			parserOptions: {
				project: './tsconfig.dev.json',
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/explicit-function-return-type': 'error',

			'@typescript-eslint/no-magic-numbers': [
				'error',
				{
					detectObjects: false,
					ignoreEnums: true,
				},
			],

			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					caughtErrors: 'none',
				},
			],

			// `verbatimModuleSyntax` is on, so type-only imports have to say so.
			'@typescript-eslint/consistent-type-imports': 'error',

			// Unlike some code bases we explicitly do not want default exports.
			'import-x/prefer-default-export': 'off',
			'import-x/no-default-export': 'error',

			'import-x/order': [
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
		},
	},
	{
		files: ['**/*.test.ts', 'src/test/**/*.ts'],
		rules: {
			// Forcing return type definitions in our ad-hoc test functions is not
			// worth the added effort / verbosity.
			'@typescript-eslint/explicit-function-return-type': 'off',

			// Tests use hard coded numbers in lots of places, and that's OK.
			'@typescript-eslint/no-magic-numbers': 'off',

			// `node:test` returns a promise from `describe` and `it` that the
			// runner itself owns; there is nothing useful to await at the call
			// site, and awaiting would serialise the suite.
			'@typescript-eslint/no-floating-promises': 'off',
		},
	},
	{
		// This file is the one place a default export is the required shape, and
		// it is not covered by the type-aware program.
		files: ['eslint.config.mjs'],
		extends: [tsConfigs.disableTypeChecked],
		rules: {
			'import-x/no-default-export': 'off',
		},
	},
	prettier,
]);
