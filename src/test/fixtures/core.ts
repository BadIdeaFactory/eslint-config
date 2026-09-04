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
	'no-async-promise-executor': {
		valid: 'new Promise((resolve) => { resolve(1); });',
		invalid: 'new Promise(async (resolve) => { resolve(1); });',
	},
	'no-case-declarations': {
		valid:
			'const value = 1; switch (value) { case 1: { const inner = 1; inner; break; } }',
		invalid:
			'const value = 1; switch (value) { case 1: const inner = 1; inner; break; }',
	},
	'no-class-assign': {
		valid: 'class Thing {} Thing;',
		invalid: 'class Thing {} Thing = null;',
	},
	'no-compare-neg-zero': {
		valid: 'const value = 0; if (Object.is(value, -0)) { value; }',
		invalid: 'const value = 0; if (value === -0) { value; }',
	},
	'no-cond-assign': {
		valid: 'let value = 1; if (value === 2) { value; }',
		invalid: 'let value = 1; if (value = 2) { value; }',
	},
	'no-console': {
		valid: "process.stdout.write('hello');",
		invalid: "console.log('hello');",
	},
	'no-const-assign': {
		valid: 'let value = 1; value = 2;',
		invalid: 'const value = 1; value = 2;',
	},
	'no-constructor-return': {
		valid: 'class Thing { constructor() { return; } }',
		invalid: 'class Thing { constructor() { return 1; } }',
	},
	'no-control-regex': {
		valid: 'const pattern = /\\x20/; pattern;',
		invalid: 'const pattern = /\\x1f/; pattern;',
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
	'no-dupe-keys': {
		valid: 'const shape = { first: 1, second: 2 }; shape;',
		invalid: 'const shape = { first: 1, first: 2 }; shape;',
	},
	'no-duplicate-case': {
		valid: 'const value = 1; switch (value) { case 1: break; case 2: break; }',
		invalid:
			'const value = 1; switch (value) { case 1: break; case 1: break; }',
	},
	'no-empty-character-class': {
		valid: 'const pattern = /a[b]/; pattern;',
		invalid: 'const pattern = /a[]/; pattern;',
	},
	'no-empty-pattern': {
		valid: 'const { first } = { first: 1 }; first;',
		invalid: 'const {} = { first: 1 };',
	},
	'no-empty-static-block': {
		valid: 'class Thing { static { Thing.name; } }',
		invalid: 'class Thing { static {} }',
	},
	'no-eval': {
		valid: "const source = '{}'; JSON.parse(source);",
		invalid: "const source = '{}'; eval(source);",
	},
	'no-ex-assign': {
		valid: 'try { null; } catch (failure) { failure; }',
		invalid: 'try { null; } catch (failure) { failure = null; }',
	},
	'no-extend-native': {
		valid: 'const helper = { custom: null }; helper;',
		invalid: 'Object.prototype.custom = null;',
	},
	'no-extra-bind': {
		valid: 'const bound = function () { return this; }.bind(null); bound;',
		invalid: 'const bound = function () { return 1; }.bind(null); bound;',
	},
	'no-extra-boolean-cast': {
		valid: 'const value = 1; if (value) { value; }',
		invalid: 'const value = 1; if (Boolean(value)) { value; }',
	},
	'no-fallthrough': {
		valid: 'const value = 1; switch (value) { case 1: break; case 2: break; }',
		invalid:
			'const value = 1; switch (value) { case 1: value; case 2: break; }',
	},
	'no-func-assign': {
		valid: 'function thing() {} const alias = thing; alias;',
		invalid: 'function thing() {} thing = null;',
	},
	yoda: {
		valid: 'const value = 1; if (value === 1) { value; }',
		invalid: 'const value = 1; if (1 === value) { value; }',
	},
};

export { core };
