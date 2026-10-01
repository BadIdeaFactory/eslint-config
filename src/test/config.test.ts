import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ESLint } from 'eslint';
import configs from '../index.ts';
import { fixtures } from './fixtures/index.ts';
import { assertReportsThisRuleAndNothingElse } from './reports.ts';
import type {
	FixtureCase,
	RuleFixture,
	RuleSet,
	SampleExtension,
	SampleKind,
} from './fixtures/types.ts';
import type { Linter } from 'eslint';

const SEVERITY_CODES = { off: 0, warn: 1, error: 2 };

const SAMPLE_KINDS: SampleKind[] = ['valid', 'invalid'];

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

// A .ts sample carries TypeScript syntax, which only a .ts path can parse. A
// .js sample is plain JavaScript and goes everywhere its rule set reaches.
const CASE_PATHS: Record<SampleExtension, (ruleSet: RuleSet) => string[]> = {
	cjs: () => SCRIPT_SAMPLE_PATHS,
	js: (ruleSet) => REACHED_PATHS[ruleSet],
	ts: () => [samplePath('ts')],
};

const casePathsFor = (ruleSet: RuleSet, { extension }: FixtureCase) =>
	CASE_PATHS[extension](ruleSet);

const samplePathsIn = (ruleSet: RuleSet, cases: FixtureCase[]) =>
	cases.flatMap((fixtureCase) => casePathsFor(ruleSet, fixtureCase));

const samplePathsFor = ({ ruleSet, valid, invalid }: RuleFixture) =>
	samplePathsIn(ruleSet, [...valid, ...invalid]);

const unreachedPathsIn = (ruleSet: RuleSet, cases: FixtureCase[]) => {
	const linted = samplePathsIn(ruleSet, cases);
	return REACHED_PATHS[ruleSet].filter((path) => !linted.includes(path));
};

const halvesMissingReachedPaths = () =>
	Object.entries(fixtures)
		.filter(([, { script }]) => !script)
		.flatMap(([ruleId, fixture]) =>
			SAMPLE_KINDS.filter(
				(sampleKind) =>
					unreachedPathsIn(fixture.ruleSet, fixture[sampleKind]).length !== 0,
			).map((sampleKind) => `${ruleId} ${sampleKind}/`),
		);

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

interface IsolatedLint {
	ruleId: string;
	entry: Linter.RuleEntry;
	source: string;
	filePath: string;
	script: boolean;
}

const reportsInIsolation = async ({
	ruleId,
	entry,
	source,
	filePath,
	script,
}: IsolatedLint) => {
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
		const { [ruleId]: fixture } = fixtures;
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

const isConfig = (value: unknown): value is Linter.Config =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const resolvedConfigFor = async (filePath: string) => {
	const resolved: unknown = await published.calculateConfigForFile(filePath);
	return isConfig(resolved) ? resolved : undefined;
};

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

	it('demonstrates each half of every rule on every path its rule set reaches', () => {
		assert.deepEqual(halvesMissingReachedPaths(), []);
	});

	describe('survives its own composition', () => {
		for (const filePath of new Set(Object.values(REACHED_PATHS).flat())) {
			it(`keeps every rule at its declared severity in ${filePath}`, async () => {
				const resolved = await resolvedConfigFor(filePath);
				assert.deepEqual(rulesCancelledIn(resolved, filePath), []);
			});

			it(`reports unused disable directives as errors in ${filePath}`, async () => {
				const resolved = await resolvedConfigFor(filePath);
				assert.equal(
					resolved?.linterOptions?.reportUnusedDisableDirectives,
					SEVERITY_CODES.error,
				);
			});
		}
	});

	for (const [ruleId, fixture] of Object.entries(fixtures)) {
		const entry = firstDeclarationOfEachRule().get(ruleId) ?? 'error';
		const { valid, invalid, script, ruleSet } = fixture;

		describe(ruleId, () => {
			for (const invalidCase of invalid) {
				for (const filePath of casePathsFor(ruleSet, invalidCase)) {
					it(`reports invalid/${invalidCase.name} in ${filePath}`, async () => {
						const reportedRuleIds = await reportsInIsolation({
							ruleId,
							entry,
							source: invalidCase.source,
							filePath,
							script,
						});
						assertReportsThisRuleAndNothingElse(ruleId, reportedRuleIds);
					});
				}
			}

			for (const validCase of valid) {
				for (const filePath of casePathsFor(ruleSet, validCase)) {
					it(`leaves valid/${validCase.name} alone in ${filePath}`, async () => {
						assert.deepEqual(
							await reportsInIsolation({
								ruleId,
								entry,
								source: validCase.source,
								filePath,
								script,
							}),
							[],
						);
					});
				}
			}
		});
	}
});
