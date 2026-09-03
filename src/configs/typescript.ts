import { parser } from 'typescript-eslint';
import type { Linter } from 'eslint';

// Without this block the package would not reach `.ts` at all: ESLint only
// considers `.js`, `.mjs` and `.cjs` lintable by default, and its default
// parser cannot read a type annotation.
const typescript: Linter.Config = {
	name: '@biffud/eslint-config/typescript',
	files: ['**/*.{ts,mts,cts,tsx}'],
	languageOptions: {
		parser,
	},
};

export { typescript };
