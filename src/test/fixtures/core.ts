import type { RuleFixtures } from './types.ts';

const core: RuleFixtures = {
	'default-case-last': {
		valid: 'const value = 1; switch (value) { case 1: break; default: break; }',
		invalid:
			'const value = 1; switch (value) { default: break; case 1: break; }',
	},
	'for-direction': {
		valid: 'for (let index = 0; index < 2; index += 1) { index; }',
		invalid: 'for (let index = 0; index < 2; index -= 1) { index; }',
	},
	'guard-for-in': {
		valid:
			'const source = { a: 1 }; for (const key of Object.keys(source)) { key; }',
		invalid: 'const source = { a: 1 }; for (const key in source) { key; }',
	},
	'no-compare-neg-zero': {
		valid: 'const value = 0; if (Object.is(value, -0)) { value; }',
		invalid: 'const value = 0; if (value === -0) { value; }',
	},
	'no-console': {
		valid: "process.stdout.write('hello');",
		invalid: "console.log('hello');",
	},
	'no-debugger': {
		valid: 'const value = 1; value;',
		invalid: 'const value = 1; debugger; value;',
	},
	'no-dupe-else-if': {
		valid:
			'const value = 1; if (value === 1) { value; } else if (value === 2) { value; }',
		invalid:
			'const value = 1; if (value === 1) { value; } else if (value === 1) { value; }',
	},
	'no-duplicate-case': {
		valid: 'const value = 1; switch (value) { case 1: break; case 2: break; }',
		invalid:
			'const value = 1; switch (value) { case 1: break; case 1: break; }',
	},
	'no-empty-pattern': {
		valid: 'const { first } = { first: 1 }; first;',
		invalid: 'const {} = { first: 1 };',
	},
	'no-eval': {
		valid: "const source = '{}'; JSON.parse(source);",
		invalid: "const source = '{}'; eval(source);",
	},
	'no-ex-assign': {
		valid: 'try { null; } catch (failure) { failure; }',
		invalid: 'try { null; } catch (failure) { failure = null; }',
	},
	yoda: {
		valid: 'const value = 1; if (value === 1) { value; }',
		invalid: 'const value = 1; if (1 === value) { value; }',
	},
};

export { core };
