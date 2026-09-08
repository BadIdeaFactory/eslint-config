import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ESLint } from 'eslint';
import configs from '../index.ts';
import { fixtures } from './fixtures/index.ts';
import type { Linter } from 'eslint';

const SEVERITY_CODES = { off: 0, warn: 1, error: 2 };

const MODULE_SAMPLE_PATHS = ['sample.js', 'sample.ts'];

// A rule set whose samples end in .cjs is asking to be parsed as a classic
// script. Nothing else can demonstrate `with`, a legacy octal or a `delete` of
// a variable, all of which are syntax errors under the module semantics the
// other samples get.
const SCRIPT_SAMPLE_PATHS = ['sample.cjs'];

const withoutRules = (config: Linter.Config): Linter.Config => {
	const copy = { ...config };
	delete copy.rules;
	return copy;
};

const languageSetupOnly = configs.map(withoutRules);

const firstDeclarationOfEachRule = () => {
	const declared = new Map<string, Linter.RuleEntry>();
	for (const config of configs) {
		for (const [ruleId, entry] of Object.entries(config.rules ?? {})) {
			if (entry !== undefined && !declared.has(ruleId)) {
				declared.set(ruleId, entry);
			}
		}
	}
	return declared;
};

const severityCode = (entry: Linter.RuleEntry | undefined) => {
	const severity = Array.isArray(entry) ? entry[0] : entry;
	return typeof severity === 'string' ? SEVERITY_CODES[severity] : severity;
};

const reportsInIsolation = async (
	ruleId: string,
	entry: Linter.RuleEntry,
	source: string,
	filePath: string,
	script = false,
) => {
	const linter = new ESLint({
		overrideConfigFile: true,
		overrideConfig: [
			...languageSetupOnly,
			...(script
				? [{ languageOptions: { sourceType: 'script' as const } }]
				: []),
			{ rules: { [ruleId]: entry } },
		],
	});
	const [result] = await linter.lintText(source, { filePath });
	return (result?.messages ?? []).map(
		(message) => message.ruleId ?? `parse error: ${message.message}`,
	);
};

const rulesBelowError = () =>
	[...firstDeclarationOfEachRule().entries()]
		.filter(([, entry]) => severityCode(entry) !== SEVERITY_CODES.error)
		.map(([ruleId]) => ruleId);

const rulesCancelledIn = (resolved: Linter.Config | undefined) =>
	[...firstDeclarationOfEachRule().entries()]
		.filter(
			([ruleId, entry]) =>
				severityCode(resolved?.rules?.[ruleId]) !== severityCode(entry),
		)
		.map(([ruleId]) => ruleId);

const published = new ESLint({
	overrideConfigFile: true,
	overrideConfig: [...configs],
});

describe('the published config', () => {
	it('ships every rule at error severity', () => {
		assert.deepEqual(rulesBelowError(), []);
	});

	it('ships a fixture for every rule it declares', () => {
		assert.deepEqual(
			[...firstDeclarationOfEachRule().keys()].sort(),
			Object.keys(fixtures).sort(),
		);
	});

	describe('survives its own composition', () => {
		for (const filePath of MODULE_SAMPLE_PATHS) {
			it(`keeps every rule at its declared severity in ${filePath}`, async () => {
				const resolved = (await published.calculateConfigForFile(filePath)) as
					Linter.Config | undefined;
				assert.deepEqual(rulesCancelledIn(resolved), []);
			});
		}
	});

	for (const [ruleId, { valid, invalid, script }] of Object.entries(fixtures)) {
		const entry = firstDeclarationOfEachRule().get(ruleId) ?? 'error';
		const paths = script ? SCRIPT_SAMPLE_PATHS : MODULE_SAMPLE_PATHS;

		describe(ruleId, () => {
			for (const filePath of paths) {
				it(`reports the invalid sample in ${filePath}`, async () => {
					assert.deepEqual(
						await reportsInIsolation(ruleId, entry, invalid, filePath, script),
						[ruleId],
					);
				});

				it(`leaves the valid sample alone in ${filePath}`, async () => {
					assert.deepEqual(
						await reportsInIsolation(ruleId, entry, valid, filePath, script),
						[],
					);
				});
			}
		});
	}
});
