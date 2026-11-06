import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ESLint } from 'eslint';
import configs, { namingConventionOptionsWithout } from '../index.ts';
import type { Linter } from 'eslint';

const RULE_ID = '@typescript-eslint/naming-convention';
const SAMPLE_PATH = 'src/test/sample.ts';
const TYPESCRIPT_FILES = ['**/*.{ts,mts,cts,tsx}'];

const shippedEntry = () =>
	configs.findLast((config) => config.rules?.[RULE_ID] !== undefined)?.rules?.[
		RULE_ID
	];

const omitting = (
	omitted: string[],
	...overrides: unknown[]
): Linter.Config => ({
	files: TYPESCRIPT_FILES,
	rules: {
		[RULE_ID]: [
			'error',
			...namingConventionOptionsWithout(omitted),
			...overrides,
		],
	},
});

const reportsFor = async (source: string, override: Linter.Config) => {
	const linter = new ESLint({
		overrideConfigFile: true,
		overrideConfig: [...configs, override],
	});
	const [result] = await linter.lintText(source, { filePath: SAMPLE_PATH });
	return (result?.messages ?? []).map((message) => message.ruleId);
};

const snakeCaseVariables = omitting(['variable'], {
	selector: 'variable',
	format: ['snake_case'],
});

describe('namingConventionOptionsWithout', () => {
	it('returns the shipped options when nothing is omitted', () => {
		assert.deepEqual(
			['error', ...namingConventionOptionsWithout([])],
			shippedEntry(),
		);
	});

	it('drops every entry for an omitted selector', async () => {
		assert.deepEqual(
			await reportsFor('export const MAX_VALUE = 1;\n', omitting(['variable'])),
			[RULE_ID],
		);
	});

	it('keeps the rest of a grouped entry', async () => {
		assert.deepEqual(
			await reportsFor(
				'export const settings = { snake_key: 1 };\n',
				omitting(['typeProperty']),
			),
			[],
		);
	});

	it('drops the omitted part of a grouped entry', async () => {
		assert.deepEqual(
			await reportsFor(
				'export interface Settings {\n\tsnake_key: number;\n}\n',
				omitting(['typeProperty']),
			),
			[RULE_ID],
		);
	});

	it('throws for a selector it has no entry for', () => {
		assert.throws(() => namingConventionOptionsWithout(['class']), /class/v);
	});

	it('lets an override replace the omitted entries', async () => {
		assert.deepEqual(
			await reportsFor('export const snake_value = 1;\n', snakeCaseVariables),
			[],
		);
	});

	it('keeps enforcing the entries it did not omit', async () => {
		assert.deepEqual(
			await reportsFor(
				'export type snake_type = string;\n',
				snakeCaseVariables,
			),
			[RULE_ID],
		);
	});
});
