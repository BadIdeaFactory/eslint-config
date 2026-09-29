import { readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import type {
	FixtureCase,
	RuleFixtures,
	RuleSet,
	SampleExtension,
	SampleKind,
} from './types.ts';
import type { Dirent } from 'node:fs';

const { dirname: FIXTURE_ROOT } = import.meta;

const SCRIPT_EXTENSION = 'cjs';
const SAMPLE_EXTENSIONS: SampleExtension[] = [SCRIPT_EXTENSION, 'js', 'ts'];
const SAMPLE_EXTENSION_LIST = new Intl.ListFormat('en', {
	type: 'disjunction',
}).format(SAMPLE_EXTENSIONS.map((extension) => `.${extension}`));
const SAMPLE_KINDS = ['valid', 'invalid'] as const;

// Some rule prefixes aren't valid file paths, this lets us
// redirect them to fixture paths that can actually exist
const RULE_ID_PREFIXES: Record<RuleSet, string> = {
	core: '',
	typescript: '@typescript-eslint/',
};

const isHiddenName = (name: string) => name.startsWith('.');

const visibleEntriesIn = (path: string) =>
	readdirSync(path, { withFileTypes: true })
		.filter((entry) => !isHiddenName(entry.name))
		.sort((left, right) => (left.name < right.name ? -1 : 1));

const visibleDirectoryNamesIn = (path: string) =>
	visibleEntriesIn(path)
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name);

const sampleSourceAt = (samplePath: string) =>
	readFileSync(samplePath, 'utf8').replace(/\r?\n$/v, '');

const isRuleSet = (name: string): name is RuleSet =>
	Object.hasOwn(RULE_ID_PREFIXES, name);

const isScriptSamplePath = (samplePath: string) =>
	samplePath.endsWith(`.${SCRIPT_EXTENSION}`);

const sampleExtensionOf = (samplePath: string) =>
	SAMPLE_EXTENSIONS.find((extension) => samplePath.endsWith(`.${extension}`));

const isSampleFileEntry = (entry: Dirent) =>
	!entry.isDirectory() && sampleExtensionOf(entry.name) !== undefined;

const assertNoStrayEntriesIn = (rulePath: string, ruleEntries: Dirent[]) => {
	const strayNames = ruleEntries
		.map((entry) => entry.name)
		.filter((name) => !SAMPLE_KINDS.some((sampleKind) => sampleKind === name));
	if (strayNames.length !== 0) {
		throw new Error(
			`Fixture '${rulePath}' holds ${strayNames.join(', ')}. A rule folder holds its 'valid/' and 'invalid/' case directories and nothing else.`,
		);
	}
};

const caseDirectoryPathFor = (
	rulePath: string,
	ruleEntries: Dirent[],
	sampleKind: SampleKind,
) => {
	const found = ruleEntries.some(
		(entry) => entry.isDirectory() && entry.name === sampleKind,
	);
	if (!found) {
		throw new Error(
			`Fixture '${rulePath}' has no '${sampleKind}/' directory. Every rule keeps its samples as named cases in 'valid/' and 'invalid/'.`,
		);
	}
	return join(rulePath, sampleKind);
};

const casePathsIn = (caseDirectory: string) => {
	const entries = visibleEntriesIn(caseDirectory);
	const strayNames = entries
		.filter((entry) => !isSampleFileEntry(entry))
		.map((entry) => entry.name);
	if (strayNames.length !== 0) {
		throw new Error(
			`Fixture directory '${caseDirectory}' holds ${strayNames.join(', ')}, which is not a ${SAMPLE_EXTENSION_LIST} sample file.`,
		);
	}
	if (entries.length === 0) {
		throw new Error(
			`Fixture directory '${caseDirectory}' holds no cases. Every half needs at least one.`,
		);
	}
	return entries.map((entry) => join(caseDirectory, entry.name));
};

const assertOneParsingMode = (rulePath: string, casePaths: string[]) => {
	const scriptCasePaths = casePaths.filter(isScriptSamplePath);
	const mixesParsingModes =
		scriptCasePaths.length !== 0 && scriptCasePaths.length !== casePaths.length;
	if (mixesParsingModes) {
		throw new Error(
			`Fixture '${rulePath}' mixes .${SCRIPT_EXTENSION} samples with module samples. Every sample for one rule shares a parsing mode.`,
		);
	}
};

const parsesAsScript = (casePaths: string[]) =>
	casePaths.every(isScriptSamplePath);

const fixtureCaseAt = (samplePath: string): FixtureCase => {
	const extension = sampleExtensionOf(samplePath);
	if (extension === undefined) {
		throw new Error(`'${samplePath}' is not a sample file.`);
	}
	return {
		name: basename(samplePath, extname(samplePath)),
		source: sampleSourceAt(samplePath),
		extension,
	};
};

const loadFixturesFrom = (fixtureRoot: string): RuleFixtures => {
	const loaded: RuleFixtures = {};
	for (const ruleSet of visibleDirectoryNamesIn(fixtureRoot)) {
		if (!isRuleSet(ruleSet)) {
			throw new Error(
				`Fixture directory '${ruleSet}' is not a known rule set. Add it to RuleSet.`,
			);
		}
		const ruleSetPath = join(fixtureRoot, ruleSet);
		for (const rule of visibleDirectoryNamesIn(ruleSetPath)) {
			const rulePath = join(ruleSetPath, rule);
			const ruleEntries = visibleEntriesIn(rulePath);
			assertNoStrayEntriesIn(rulePath, ruleEntries);
			const validCasePaths = casePathsIn(
				caseDirectoryPathFor(rulePath, ruleEntries, 'valid'),
			);
			const invalidCasePaths = casePathsIn(
				caseDirectoryPathFor(rulePath, ruleEntries, 'invalid'),
			);
			const allCasePaths = [...validCasePaths, ...invalidCasePaths];
			assertOneParsingMode(rulePath, allCasePaths);
			loaded[`${RULE_ID_PREFIXES[ruleSet]}${rule}`] = {
				valid: validCasePaths.map(fixtureCaseAt),
				invalid: invalidCasePaths.map(fixtureCaseAt),
				script: parsesAsScript(allCasePaths),
				ruleSet,
			};
		}
	}
	return loaded;
};

const fixtures = loadFixturesFrom(FIXTURE_ROOT);

export { fixtures, loadFixturesFrom };
