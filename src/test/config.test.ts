import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ESLint } from 'eslint';
import configs from '../index.ts';
import { fixtures } from './fixtures/index.ts';
import type { Linter } from 'eslint';

const SEVERITY_CODES = { off: 0, warn: 1, error: 2 };

const SAMPLE_PATHS = ['sample.js', 'sample.ts'];

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
) => {
	const linter = new ESLint({
		overrideConfigFile: true,
		overrideConfig: [...languageSetupOnly, { rules: { [ruleId]: entry } }],
	});
	const [result] = await linter.lintText(source, { filePath });
	return (result?.messages ?? []).map(
		(message) => message.ruleId ?? `parse error: ${message.message}`,
	);
};

const published = new ESLint({
	overrideConfigFile: true,
	overrideConfig: [...configs],
});

describe('the published config', () => {
	it('ships every rule at error severity', () => {
		const downgraded = [...firstDeclarationOfEachRule().entries()]
			.filter(([, entry]) => severityCode(entry) !== SEVERITY_CODES.error)
			.map(([ruleId]) => ruleId);
		assert.deepEqual(downgraded, []);
	});

	it('ships a fixture for every rule it declares', () => {
		assert.deepEqual(
			[...firstDeclarationOfEachRule().keys()].sort(),
			Object.keys(fixtures).sort(),
		);
	});

	describe('survives its own composition', () => {
		for (const filePath of SAMPLE_PATHS) {
			it(`keeps every rule at its declared severity in ${filePath}`, async () => {
				const resolved = (await published.calculateConfigForFile(filePath)) as
					Linter.Config | undefined;
				const cancelled = [...firstDeclarationOfEachRule().entries()]
					.filter(
						([ruleId, entry]) =>
							severityCode(resolved?.rules?.[ruleId]) !== severityCode(entry),
					)
					.map(([ruleId]) => ruleId);
				assert.deepEqual(cancelled, []);
			});
		}
	});

	for (const [ruleId, { valid, invalid }] of Object.entries(fixtures)) {
		const entry = firstDeclarationOfEachRule().get(ruleId) ?? 'error';

		describe(ruleId, () => {
			for (const filePath of SAMPLE_PATHS) {
				it(`reports the invalid sample in ${filePath}`, async () => {
					assert.deepEqual(
						await reportsInIsolation(ruleId, entry, invalid, filePath),
						[ruleId],
					);
				});

				it(`leaves the valid sample alone in ${filePath}`, async () => {
					assert.deepEqual(
						await reportsInIsolation(ruleId, entry, valid, filePath),
						[],
					);
				});
			}
		});
	}
});
