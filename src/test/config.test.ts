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

const UNUSED_COMMENT_OPTIONS = [
	'reportUnusedDisableDirectives',
	'reportUnusedInlineConfigs',
] as const;

const samplePath = (extension: string) => `src/test/sample.${extension}`;

const REACHED_PATHS: Record<RuleSet, string[]> = {
	core: [samplePath('js'), samplePath('ts')],
	import: [samplePath('js'), samplePath('ts')],
	promise: [samplePath('js'), samplePath('ts')],
	typescript: [samplePath('ts')],
};

const HANDED_OFF_RULES = [
	'no-dupe-class-members',
	'no-redeclare',
	'no-throw-literal',
	'no-unused-private-class-members',
	'no-unused-vars',
];

const HANDED_OFF_PATHS = [samplePath('ts')];

const TYPESCRIPT_SYNTAX_RULES = ['import/consistent-type-specifier-style'];

const PATHS_WITHOUT_TYPESCRIPT_SYNTAX = [samplePath('js')];

const CONTRADICTING_RULES = [
	['import/no-default-export', 'import/no-named-export'],
	['import/no-default-export', 'import/prefer-default-export'],
];

const CONVENTIONAL_DEFAULT_EXPORT_PATHS = [
	'eslint.config.mjs',
	'vite.config.ts',
	'src/button.stories.tsx',
];

const isHandedOffAt = (ruleId: string, path: string) =>
	HANDED_OFF_RULES.includes(ruleId) && HANDED_OFF_PATHS.includes(path);

const lacksSyntaxFor = (ruleId: string, path: string) =>
	TYPESCRIPT_SYNTAX_RULES.includes(ruleId) &&
	PATHS_WITHOUT_TYPESCRIPT_SYNTAX.includes(path);

const reachedPathsFor = (ruleId: string, ruleSet: RuleSet) =>
	REACHED_PATHS[ruleSet].filter(
		(path) => !isHandedOffAt(ruleId, path) && !lacksSyntaxFor(ruleId, path),
	);

const SCRIPT_SAMPLE_PATHS = [samplePath('cjs')];

const CASE_PATHS_BY_EXTENSION: Record<
	SampleExtension,
	(ruleId: string, ruleSet: RuleSet) => string[]
> = {
	cjs: () => SCRIPT_SAMPLE_PATHS,
	js: reachedPathsFor,
	ts: () => [samplePath('ts')],
};

const casePathsFor = (
	ruleId: string,
	ruleSet: RuleSet,
	{ extension }: FixtureCase,
) => CASE_PATHS_BY_EXTENSION[extension](ruleId, ruleSet);

const samplePathsIn = (
	ruleId: string,
	ruleSet: RuleSet,
	cases: FixtureCase[],
) => cases.flatMap((fixtureCase) => casePathsFor(ruleId, ruleSet, fixtureCase));

const samplePathsFor = (
	ruleId: string,
	{ ruleSet, valid, invalid }: RuleFixture,
) => samplePathsIn(ruleId, ruleSet, [...valid, ...invalid]);

const unreachedPathsIn = (
	ruleId: string,
	ruleSet: RuleSet,
	cases: FixtureCase[],
) => {
	const linted = samplePathsIn(ruleId, ruleSet, cases);
	return reachedPathsFor(ruleId, ruleSet).filter(
		(path) => !linted.includes(path),
	);
};

const halvesMissingReachedPaths = () =>
	Object.entries(fixtures)
		.filter(([, { script }]) => !script)
		.flatMap(([ruleId, fixture]) =>
			SAMPLE_KINDS.filter(
				(sampleKind) =>
					unreachedPathsIn(ruleId, fixture.ruleSet, fixture[sampleKind])
						.length !== 0,
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

const isEnforced = (ruleId: string) =>
	severityCode(firstDeclarationOfEachRule().get(ruleId)) ===
	SEVERITY_CODES.error;

const groupsNotEnforcingExactlyOne = () =>
	CONTRADICTING_RULES.filter((group) => group.filter(isEnforced).length !== 1);

const switchedOffCounterparts = () => [
	...new Set(
		CONTRADICTING_RULES.flatMap((group) =>
			group.filter((ruleId) => !isEnforced(ruleId)),
		),
	),
];

const enforcedRules = () =>
	[...firstDeclarationOfEachRule().entries()].filter(
		([ruleId]) => !switchedOffCounterparts().includes(ruleId),
	);

const rulesBelowError = () =>
	enforcedRules()
		.filter(([, entry]) => severityCode(entry) !== SEVERITY_CODES.error)
		.map(([ruleId]) => ruleId);

const isDemonstratedAt = (ruleId: string, filePath: string) => {
	const { [ruleId]: fixture } = fixtures;
	return (
		fixture !== undefined && samplePathsFor(ruleId, fixture).includes(filePath)
	);
};

const rulesReaching = (filePath: string) =>
	[...firstDeclarationOfEachRule().entries()].filter(([ruleId]) =>
		isDemonstratedAt(ruleId, filePath),
	);

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
			enforcedRules()
				.map(([ruleId]) => ruleId)
				.sort(),
			Object.keys(fixtures).sort(),
		);
	});

	it('demonstrates each half of every rule on every path its rule set reaches', () => {
		assert.deepEqual(halvesMissingReachedPaths(), []);
	});

	it('enforces exactly one rule of each contradicting group', () => {
		assert.deepEqual(groupsNotEnforcingExactlyOne(), []);
	});

	describe('switches off rules that contradict its own', () => {
		for (const filePath of new Set(Object.values(REACHED_PATHS).flat())) {
			for (const ruleId of switchedOffCounterparts()) {
				it(`switches ${ruleId} off in ${filePath}`, async () => {
					const resolved = await resolvedConfigFor(filePath);
					assert.equal(
						severityCode(resolved?.rules?.[ruleId]),
						SEVERITY_CODES.off,
					);
				});
			}
		}
	});

	describe('hands core rules to their extensions', () => {
		for (const filePath of HANDED_OFF_PATHS) {
			for (const ruleId of HANDED_OFF_RULES) {
				it(`switches ${ruleId} off in ${filePath}`, async () => {
					const resolved = await resolvedConfigFor(filePath);
					assert.equal(
						severityCode(resolved?.rules?.[ruleId]),
						SEVERITY_CODES.off,
					);
				});
			}
		}
	});

	describe('allows default exports where tooling expects them', () => {
		for (const filePath of CONVENTIONAL_DEFAULT_EXPORT_PATHS) {
			it(`switches import/no-default-export off in ${filePath}`, async () => {
				const resolved = await resolvedConfigFor(filePath);
				assert.equal(
					severityCode(resolved?.rules?.['import/no-default-export']),
					SEVERITY_CODES.off,
				);
			});
		}
	});

	describe('survives its own composition', () => {
		for (const filePath of new Set(Object.values(REACHED_PATHS).flat())) {
			it(`keeps every rule at its declared severity in ${filePath}`, async () => {
				const resolved = await resolvedConfigFor(filePath);
				assert.deepEqual(rulesCancelledIn(resolved, filePath), []);
			});

			for (const option of UNUSED_COMMENT_OPTIONS) {
				it(`sets ${option} to error in ${filePath}`, async () => {
					const resolved = await resolvedConfigFor(filePath);
					assert.equal(resolved?.linterOptions?.[option], SEVERITY_CODES.error);
				});
			}
		}
	});

	for (const [ruleId, fixture] of Object.entries(fixtures)) {
		const entry = firstDeclarationOfEachRule().get(ruleId) ?? 'error';
		const { valid, invalid, script, ruleSet } = fixture;

		describe(ruleId, () => {
			for (const invalidCase of invalid) {
				for (const filePath of casePathsFor(ruleId, ruleSet, invalidCase)) {
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
				for (const filePath of casePathsFor(ruleId, ruleSet, validCase)) {
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
