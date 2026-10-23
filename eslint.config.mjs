import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import { flatConfigs as importX } from 'eslint-plugin-import-x';
import globals from 'globals';
import { configs as tsConfigs } from 'typescript-eslint';
import biffudConfigs from './src/index.ts';

const TEST_FILES = ['**/*.test.ts', 'src/test/**/*.ts'];
const RULE_TABLE_FILES = ['src/configs/**/*.ts'];
const FILES_REQUIRING_DEFAULT_EXPORT = ['eslint.config.mjs', 'src/index.ts'];
const FILES_OUTSIDE_TYPESCRIPT_PROJECT = ['eslint.config.mjs'];

export default defineConfig([
	globalIgnores(['dist/', 'src/test/fixtures/*/*/']),
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
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
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
		files: TEST_FILES,
		rules: {
			'@typescript-eslint/explicit-function-return-type': 'off',
			'no-magic-numbers': 'off',
			'@typescript-eslint/no-floating-promises': 'off',
		},
	},
	{
		files: RULE_TABLE_FILES,
		rules: {
			'no-magic-numbers': 'off',
		},
	},
	{
		files: FILES_REQUIRING_DEFAULT_EXPORT,
		rules: {
			'import-x/no-default-export': 'off',
		},
	},
	{
		files: FILES_OUTSIDE_TYPESCRIPT_PROJECT,
		extends: [tsConfigs.disableTypeChecked],
	},
	prettier,
]);
