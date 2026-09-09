import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ESLint } from 'eslint';
import configs from '../index.ts';
import { fixtures } from './fixtures/index.ts';
import type { RuleFixture, RuleSet } from './fixtures/types.ts';
import type { Linter } from 'eslint';

const SEVERITY_CODES = { off: 0, warn: 1, error: 2 };

// `sample.ts` exists on disk, and has to: the project service types only a
// file some tsconfig covers, and an invented path is in none. The `.js` and
// `.cjs` samples are text alone.
const samplePath = (extension: string) => `src/test/sample.${extension}`;

// Core rules run in both: a shareable config reaches `.js` for free, but
// reaches `.ts` only while something in it supplies a parser. TypeScript rules
// ship in that same block, so `.js` has no plugin to resolve their ids against.
const REACHED_PATHS: Record<RuleSet, string[]> = {
	core: [samplePath('js'), samplePath('ts')],
	typescript: [samplePath('ts')],
};

// A rule whose samples end in .cjs is asking to be parsed as a classic script.
// Nothing else can demonstrate `with`, a legacy octal or a `delete` of a
// variable, all of which are syntax errors under the module semantics the other
// samples get.
const SCRIPT_SAMPLE_PATHS = [samplePath('cjs')];

const samplePathsFor = ({ script, ruleSet }: RuleFixture) =>
	script ? SCRIPT_SAMPLE_PATHS : REACHED_PATHS[ruleSet];

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

// A rule reaches a path when the fixture demonstrating it is linted there.
const rulesReaching = (filePath: string) =>
	[...firstDeclarationOfEachRule().entries()].filter(([ruleId]) => {
		const fixture = fixtures[ruleId];
		return fixture !== undefined && samplePathsFor(fixture).includes(filePath);
	});

const rulesCancelledIn = (
	resolved: Linter.Config | undefined,
	filePath: string,
) =>
	rulesReaching(filePath)
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
		for (const filePath of new Set(Object.values(REACHED_PATHS).flat())) {
			it(`keeps every rule at its declared severity in ${filePath}`, async () => {
				const resolved = (await published.calculateConfigForFile(filePath)) as
					Linter.Config | undefined;
				assert.deepEqual(rulesCancelledIn(resolved, filePath), []);
			});
		}
	});

	for (const [ruleId, fixture] of Object.entries(fixtures)) {
		const entry = firstDeclarationOfEachRule().get(ruleId) ?? 'error';
		const { valid, invalid, script } = fixture;

		describe(ruleId, () => {
			for (const filePath of samplePathsFor(fixture)) {
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
