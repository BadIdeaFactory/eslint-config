import type { RuleFixtures } from './types.ts';

const core: RuleFixtures = {
	'accessor-pairs': {
		valid: 'class Thing { get value() { return 1; } }',
		invalid: 'class Thing { set value(next) { next; } }',
	},
	'array-callback-return': {
		valid: '[1].forEach((value) => { value; });',
		invalid: '[1].forEach((value) => value);',
	},
	'arrow-body-style': {
		valid: 'const make = () => ({}); make;',
		invalid: 'const make = () => { return {}; }; make;',
	},
	'consistent-this': {
		valid: 'const that = this; that;',
		invalid: 'const self = this; self;',
	},
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
	eqeqeq: {
		valid: 'const value = null; if (value === null) { value; }',
		invalid: 'const value = null; if (value == null) { value; }',
	},
	'for-direction': {
		valid: 'for (let index = 0; index < 2; index += 1) { index; }',
		invalid: 'for (let index = 0; index < 2; index -= 1) { index; }',
	},
	'grouped-accessor-pairs': {
		valid:
			'class Thing { get value() { return 1; } set value(next) { next; } }',
		invalid:
			'class Thing { set value(next) { next; } get value() { return 1; } }',
	},
	'guard-for-in': {
		valid:
			'const source = { a: 1 }; for (const key of Object.keys(source)) { key; }',
		invalid: 'const source = { a: 1 }; for (const key in source) { key; }',
	},
	'logical-assignment-operators': {
		valid: 'let value = null; value ??= 1; value;',
		invalid: 'let value = null; if (!value) { value = 1; } value;',
	},
	'new-cap': {
		valid: 'function Thing() { return 1; } const made = Thing(); made;',
		invalid: 'function thing() { return 1; } const made = new thing(); made;',
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
	'no-caller': {
		valid: 'function outer() { return outer; } outer;',
		invalid: 'function outer() { return arguments.callee; } outer;',
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
	'no-constant-binary-expression': {
		valid: 'const value = 1; if (value === 1) { value; }',
		invalid: 'const values = [1]; if (values === []) { values; }',
	},
	'no-constructor-return': {
		valid: 'class Thing { constructor() { this.ready = true; } }',
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
	'no-empty': {
		valid: 'try { null; } catch (failure) { failure; }',
		invalid: 'try { null; } catch (failure) {}',
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
	'no-labels': {
		valid: 'for (const value of [1]) { value; }',
		invalid: 'outer: for (const value of [1]) { value; }',
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
	'no-loop-func': {
		valid: 'const made = [1].map((value) => () => value); made;',
		invalid:
			'let outer = 1; const made = []; for (const value of [1]) { made.push(() => outer); value; } outer = 2; made;',
	},
	'no-loss-of-precision': {
		valid: 'const value = 12345; value;',
		invalid: 'const value = 9007199254740993; value;',
	},
	'no-multi-assign': {
		valid: 'let first = 1; let second = 1; first; second;',
		invalid: 'let first; let second; first = second = 1; first; second;',
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
	'no-obj-calls': {
		valid: 'const value = Math.max(1, 2); value;',
		invalid: 'const value = Math(1); value;',
	},
	'no-object-constructor': {
		valid: 'const holder = {}; holder;',
		invalid: 'const holder = new Object(); holder;',
	},
	'no-param-reassign': {
		valid: 'const run = (holder) => holder.first; run;',
		invalid: 'const run = (holder) => { holder.first = 1; }; run;',
	},
	'no-plusplus': {
		valid: 'let count = 0; count += 1; count;',
		invalid: 'let count = 0; count++; count;',
	},
	'no-promise-executor-return': {
		valid: 'const task = new Promise((resolve) => { resolve(1); }); task;',
		invalid: 'const task = new Promise((resolve) => resolve(1)); task;',
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
	'no-return-assign': {
		valid: 'let value = 1; function run() { value = 2; return value; } run;',
		invalid: 'let value = 1; function run() { return (value = 2); } run;',
	},
	'no-script-url': {
		valid: "const target = 'https://example.com'; target;",
		invalid: "const target = 'javascript:void(0)'; target;",
	},
	'no-self-assign': {
		valid:
			'const holder = { first: 1, second: 2 }; holder.first = holder.second;',
		invalid: 'const holder = { first: 1 }; holder.first = holder.first;',
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
	'no-shadow-restricted-names': {
		valid: 'const value = 1; value;',
		invalid: 'const undefined = 1; undefined;',
	},
	'no-sparse-arrays': {
		valid: 'const values = [1, 2]; values;',
		invalid: 'const values = [1, , 2]; values;',
	},
	'no-template-curly-in-string': {
		valid: 'const name = 1; const text = `${name}`; text;',
		invalid: "const name = 1; const text = '${name}'; text; name;",
	},
	'no-this-before-super': {
		valid:
			'class Base {} class Thing extends Base { constructor() { super(); this.ready = true; } }',
		invalid:
			'class Base {} class Thing extends Base { constructor() { this.ready = true; super(); } }',
	},
	'no-unmodified-loop-condition': {
		valid: 'let index = 0; while (index < 2) { index += 1; } index;',
		invalid: 'let index = 0; while (index < 2) { null; } index;',
	},
	'no-unneeded-ternary': {
		valid: 'const value = 1; const next = value ?? 2; next;',
		invalid: 'const value = 1; const next = value ? value : 2; next;',
	},
	'no-unreachable': {
		valid: 'const run = () => { null; }; run;',
		invalid: 'const run = () => { return 1; null; }; run;',
	},
	'no-unreachable-loop': {
		valid: 'for (const value of [1, 2]) { value; }',
		invalid: 'for (const value of [1, 2]) { value; break; }',
	},
	'no-unsafe-finally': {
		valid: 'const run = () => { try { return 1; } finally { null; } }; run;',
		invalid:
			'const run = () => { try { return 1; } finally { return 2; } }; run;',
	},
	'no-unsafe-negation': {
		valid: "const holder = {}; if (!('first' in holder)) { holder; }",
		invalid: "const holder = {}; if (!'first' in holder) { holder; }",
	},
	'no-useless-backreference': {
		valid: 'const pattern = /(?<letter>a)\\k<letter>/; pattern;',
		invalid: 'const pattern = /(?<letter>a)|\\k<letter>/; pattern;',
	},
	'no-useless-call': {
		valid: 'const show = (value) => value; show(1);',
		invalid: 'const show = (value) => value; show.call(null, 1);',
	},
	'no-useless-catch': {
		valid: 'try { null; } catch (failure) { failure; }',
		invalid: 'try { null; } catch (failure) { throw failure; }',
	},
	'no-useless-computed-key': {
		valid: 'const shape = { first: 1 }; shape;',
		invalid: "const shape = { ['first']: 1 }; shape;",
	},
	'no-useless-concat': {
		valid: "const text = 'ab'; text;",
		invalid: "const text = 'a' + 'b'; text;",
	},
	'no-useless-escape': {
		valid: "const text = 'a'; text;",
		invalid: "const text = '\\a'; text;",
	},
	'no-useless-rename': {
		valid: 'const { first } = { first: 1 }; first;',
		invalid: 'const { first: first } = { first: 1 }; first;',
	},
	'no-useless-return': {
		valid: 'const run = () => { null; }; run;',
		invalid: 'const run = () => { null; return; }; run;',
	},
	'no-var': {
		valid: 'let value = 1; value;',
		invalid: 'var value = 1; value;',
	},
	'no-void': {
		valid: 'void 0;',
		invalid: 'const value = void 0; value;',
	},
	'object-shorthand': {
		valid: 'const shape = { run() { return 1; } }; shape;',
		invalid: 'const shape = { run: function () { return 1; } }; shape;',
	},
	'one-var': {
		valid: 'let first = 1; let second = 2; first; second;',
		invalid: 'let first = 1, second = 2; first; second;',
	},
	'operator-assignment': {
		valid: 'let value = 1; value += 1; value;',
		invalid: 'let value = 1; value = value + 1; value;',
	},
	'prefer-arrow-callback': {
		valid: 'const doubled = [1].map((value) => value); doubled;',
		invalid:
			'const doubled = [1].map(function double(value) { return value; }); doubled;',
	},
	'prefer-exponentiation-operator': {
		valid: 'const value = 2 ** 3; value;',
		invalid: 'const value = Math.pow(2, 3); value;',
	},
	'prefer-named-capture-group': {
		valid: 'const pattern = /(?<letter>a)/; pattern;',
		invalid: 'const pattern = /(a)/; pattern;',
	},
	'prefer-numeric-literals': {
		valid: 'const value = 0b111; value;',
		invalid: "const value = parseInt('111', 2); value;",
	},
	'prefer-object-has-own': {
		valid: "const holder = {}; Object.hasOwn(holder, 'first');",
		invalid:
			"const holder = {}; Object.prototype.hasOwnProperty.call(holder, 'first');",
	},
	'prefer-object-spread': {
		valid: 'const merged = { ...{ first: 1 } }; merged;',
		invalid: 'const merged = Object.assign({}, { first: 1 }); merged;',
	},
	'prefer-rest-params': {
		valid: 'const collect = (...values) => values; collect;',
		invalid: 'function collect() { return arguments; } collect;',
	},
	'prefer-spread': {
		valid: 'const show = (value) => value; const args = [1]; show(...args);',
		invalid:
			'const show = (value) => value; const args = [1]; show.apply(null, args);',
	},
	'prefer-template': {
		valid: 'const name = 1; const text = `a${name}`; text;',
		invalid: "const name = 1; const text = 'a' + name; text;",
	},
	radix: {
		valid: "const value = parseInt('1', 10); value;",
		invalid: "const value = parseInt('1'); value;",
	},
	'require-atomic-updates': {
		valid:
			'const holder = { value: 0 }; const run = async () => { const next = await Promise.resolve(1); holder.value += next; }; run;',
		invalid:
			'const holder = { value: 0 }; const run = async () => { holder.value += await Promise.resolve(1); }; run;',
	},
	'require-yield': {
		valid: 'function* items() { yield 1; } items;',
		invalid: 'function* items() { return 1; } items;',
	},
	'symbol-description': {
		valid: "const marker = Symbol('marker'); marker;",
		invalid: 'const marker = Symbol(); marker;',
	},
	'use-isnan': {
		valid:
			'const values = [1]; values.findIndex((value) => Number.isNaN(value));',
		invalid: 'const values = [1]; values.indexOf(NaN);',
	},
	'valid-typeof': {
		valid: "const value = 1; if (typeof value === 'number') { value; }",
		invalid:
			"const value = 1; const expected = 'number'; if (typeof value === expected) { value; }",
	},
	yoda: {
		valid: 'const value = 1; if (value === 1) { value; }',
		invalid: 'const value = 1; if (1 === value) { value; }',
	},
};

export { core };
