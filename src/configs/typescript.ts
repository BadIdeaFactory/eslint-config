import { parser, plugin } from 'typescript-eslint';
import type { Linter } from 'eslint';

// Without this block the package would not reach `.ts` at all: ESLint only
// considers `.js`, `.mjs` and `.cjs` lintable by default, and its default
// parser cannot read a type annotation.
const typescript: Linter.Config = {
	name: '@biffud/eslint-config/typescript',
	files: ['**/*.{ts,mts,cts,tsx}'],
	plugins: {
		'@typescript-eslint': plugin,
	},
	languageOptions: {
		parser,
		parserOptions: {
			projectService: true,
		},
	},
	rules: {
		'@typescript-eslint/await-thenable': 'error',
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/no-extra-non-null-assertion': 'error',
		'@typescript-eslint/no-floating-promises': 'error',
		'@typescript-eslint/no-inferrable-types': 'error',
		'@typescript-eslint/no-meaningless-void-operator': [
			'error',
			{ checkNever: true },
		],
		'@typescript-eslint/no-misused-promises': 'error',
		'@typescript-eslint/no-redundant-type-constituents': 'error',
		'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
		'@typescript-eslint/no-unnecessary-condition': [
			'error',
			{ allowConstantLoopConditions: 'only-allowed-literals' },
		],
		'@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
		'@typescript-eslint/no-unnecessary-qualifier': 'error',
		'@typescript-eslint/no-unnecessary-template-expression': 'error',
		'@typescript-eslint/no-unnecessary-type-arguments': 'error',
		'@typescript-eslint/no-unnecessary-type-assertion': 'error',
		'@typescript-eslint/no-unnecessary-type-constraint': 'error',
		'@typescript-eslint/no-unnecessary-type-conversion': 'error',
		'@typescript-eslint/no-unnecessary-type-parameters': 'error',
		'@typescript-eslint/no-unsafe-argument': 'error',
		'@typescript-eslint/no-unsafe-assignment': 'error',
		'@typescript-eslint/no-unsafe-call': 'error',
		'@typescript-eslint/no-unsafe-function-type': 'error',
		'@typescript-eslint/no-unsafe-member-access': 'error',
		'@typescript-eslint/no-unsafe-return': 'error',
		'@typescript-eslint/no-unsafe-type-assertion': 'error',
		'@typescript-eslint/no-useless-constructor': 'error',
		'@typescript-eslint/no-useless-default-assignment': 'error',
		'@typescript-eslint/prefer-promise-reject-errors': 'error',
		'@typescript-eslint/promise-function-async': 'error',
		'@typescript-eslint/require-await': 'error',
		'@typescript-eslint/return-await': ['error', 'always'],
		'@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
	},
};

export { typescript };
