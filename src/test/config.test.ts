import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ESLint } from 'eslint';
import { configs } from '../index.ts';
import { fixtures } from './fixtures/index.ts';
import type { Linter } from 'eslint';

const SEVERITY_CODES = { off: 0, warn: 1, error: 2 };

const SAMPLE_PATHS = ['sample.js', 'sample.ts'];

const published = new ESLint({
	overrideConfigFile: true,
	overrideConfig: [...configs],
});

const declaredRules = () => {
	const declared = new Map<string, Linter.RuleEntry>();
	for (const config of configs) {
		for (const [ruleId, entry] of Object.entries(config.rules ?? {})) {
			if (entry !== undefined) {
				declared.set(ruleId, entry);
			}
		}
	}
	return declared;
};

// Rules are declared as `'error'` but resolve to `2`.
const severityCode = (entry: Linter.RuleEntry | undefined) => {
	const severity = Array.isArray(entry) ? entry[0] : entry;
	return typeof severity === 'string' ? SEVERITY_CODES[severity] : severity;
};

const report = async (source: string, filePath: string) => {
	const [result] = await published.lintText(source, { filePath });
	return (result?.messages ?? []).map(
		(message) => message.ruleId ?? `parse error: ${message.message}`,
	);
};

describe('the published config', () => {
	it('ships every rule at error severity', () => {
		const downgraded = [...declaredRules().entries()]
			.filter(([, entry]) => severityCode(entry) !== SEVERITY_CODES.error)
			.map(([ruleId]) => ruleId);
		assert.deepEqual(downgraded, []);
	});

	it('ships a fixture for every rule it declares', () => {
		assert.deepEqual(
			[...declaredRules().keys()].sort(),
			Object.keys(fixtures).sort(),
		);
	});

	for (const [ruleId, { valid, invalid }] of Object.entries(fixtures)) {
		describe(ruleId, () => {
			for (const filePath of SAMPLE_PATHS) {
				it(`reaches ${filePath} at the declared severity`, async () => {
					// ESLint types `calculateConfigForFile` as `Promise<any>`.
					const resolved = (await published.calculateConfigForFile(
						filePath,
					)) as Linter.Config | undefined;
					assert.equal(
						severityCode(resolved?.rules?.[ruleId]),
						severityCode(declaredRules().get(ruleId)),
						`${ruleId} does not reach ${filePath} at the severity it declares`,
					);
				});

				it(`reports the invalid sample in ${filePath}`, async () => {
					assert.deepEqual(await report(invalid, filePath), [ruleId]);
				});

				it(`leaves the valid sample alone in ${filePath}`, async () => {
					assert.deepEqual(await report(valid, filePath), []);
				});
			}
		});
	}
});
