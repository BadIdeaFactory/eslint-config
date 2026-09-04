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
	'no-console': {
		valid: "process.stdout.write('hello');",
		invalid: "console.log('hello');",
	},
	yoda: {
		valid: 'const value = 1; if (value === 1) { value; }',
		invalid: 'const value = 1; if (1 === value) { value; }',
	},
};

export { core };
