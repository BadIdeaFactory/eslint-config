import type { RuleFixtures } from './types.ts';

const core: RuleFixtures = {
	'constructor-super': {
		valid:
			'class Base {} class Thing extends Base { constructor() { super(); } }',
		invalid:
			'class Base {} class Thing extends Base { constructor() { null; } }',
	},
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
	'no-alert': {
		valid: "process.stdout.write('hello');",
		invalid: "alert('hello');",
	},
	'no-async-promise-executor': {
		valid: 'const task = new Promise((resolve) => { resolve(1); }); task;',
		invalid:
			'const task = new Promise(async (resolve) => { resolve(1); }); task;',
	},
	'no-await-in-loop': {
		valid:
			'const run = async () => { await Promise.all([1].map(async (v) => v)); }; run;',
		invalid:
			'const run = async () => { for (const v of [1]) { await v; } }; run;',
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
	'no-invalid-regexp': {
		valid: "const pattern = new RegExp('[a]'); pattern;",
		invalid: "const pattern = new RegExp('['); pattern;",
	},
	'no-iterator': {
		valid: 'const holder = {}; holder[Symbol.iterator] = null;',
		invalid: 'const holder = {}; holder.__iterator__ = null;',
	},
	'no-lone-blocks': {
		valid: '{ const scoped = 1; scoped; }',
		invalid: 'const value = 1; { value; }',
	},
	'no-lonely-if': {
		valid:
			'const value = 1; if (value === 1) { value; } else if (value === 2) { value; }',
		invalid:
			'const value = 1; if (value === 1) { value; } else { if (value === 2) { value; } }',
	},
	'no-loss-of-precision': {
		valid: 'const value = 12345; value;',
		invalid: 'const value = 9007199254740993; value;',
	},
	'no-negated-condition': {
		valid: 'const value = 1; if (value === 1) { value; } else { null; }',
		invalid: 'const value = 1; if (value !== 1) { value; } else { null; }',
	},
	'no-new': {
		valid: 'class Thing {} const made = new Thing(); made;',
		invalid: 'class Thing {} new Thing();',
	},
	'no-new-func': {
		valid: 'const make = () => 1; make;',
		invalid: "const make = new Function('return 1'); make;",
	},
	'no-new-native-nonconstructor': {
		valid: "const marker = Symbol('marker'); marker;",
		invalid: "const marker = new Symbol('marker'); marker;",
	},
	'no-new-wrappers': {
		valid: 'const value = String(1); value;',
		invalid: "const value = new String('1'); value;",
	},
	'no-object-constructor': {
		valid: 'const holder = {}; holder;',
		invalid: 'const holder = new Object(); holder;',
	},
	'no-plusplus': {
		valid: 'let count = 0; count += 1; count;',
		invalid: 'let count = 0; count++; count;',
	},
	'no-proto': {
		valid: 'const holder = {}; Object.getPrototypeOf(holder);',
		invalid: 'const holder = {}; holder.__proto__;',
	},
	'no-prototype-builtins': {
		valid: "const holder = {}; Object.hasOwn(holder, 'first');",
		invalid: "const holder = {}; holder.hasOwnProperty('first');",
	},
	'no-regex-spaces': {
		valid: 'const pattern = /a {2}b/; pattern;',
		invalid: 'const pattern = /a  b/; pattern;',
	},
	'no-script-url': {
		valid: "const target = 'https://example.com'; target;",
		invalid: "const target = 'javascript:void(0)'; target;",
	},
	'no-self-compare': {
		valid: 'const value = 1; if (value === 2) { value; }',
		invalid: 'const value = 1; if (value === value) { value; }',
	},
	'no-sequences': {
		valid:
			'let first = 1; let second = 2; first = 3; second = 4; first; second;',
		invalid:
			'let first = 1; let second = 2; first = 3, second = 4; first; second;',
	},
	'no-sparse-arrays': {
		valid: 'const values = [1, 2]; values;',
		invalid: 'const values = [1, , 2]; values;',
	},
	yoda: {
		valid: 'const value = 1; if (value === 1) { value; }',
		invalid: 'const value = 1; if (1 === value) { value; }',
	},
};

export { core };
