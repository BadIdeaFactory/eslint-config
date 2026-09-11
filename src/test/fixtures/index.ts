import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RuleFixtures, RuleSet } from './types.ts';

const { dirname: FIXTURE_ROOT } = import.meta;

// Some rule prefixes aren't valid file paths, this lets us
// redirect them to fixture paths that can actually exist
const RULE_ID_PREFIXES: Record<RuleSet, string> = {
	core: '',
	typescript: '@typescript-eslint/',
};

const directoriesIn = (path: string) =>
	readdirSync(path, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();

const sample = (path: string) =>
	readFileSync(path, 'utf8').replace(/\r?\n$/v, '');

const isRuleSet = (name: string): name is RuleSet =>
	Object.hasOwn(RULE_ID_PREFIXES, name);

const load = (): RuleFixtures => {
	const loaded: RuleFixtures = {};
	for (const ruleSet of directoriesIn(FIXTURE_ROOT)) {
		if (!isRuleSet(ruleSet)) {
			throw new Error(
				`Fixture directory '${ruleSet}' is not a known rule set. Add it to RuleSet.`,
			);
		}
		const setPath = join(FIXTURE_ROOT, ruleSet);
		for (const rule of directoriesIn(setPath)) {
			const rulePath = join(setPath, rule);
			const script = existsSync(join(rulePath, 'valid.cjs'));
			const extension = script ? 'cjs' : 'ts';
			loaded[`${RULE_ID_PREFIXES[ruleSet]}${rule}`] = {
				valid: sample(join(rulePath, `valid.${extension}`)),
				invalid: sample(join(rulePath, `invalid.${extension}`)),
				script,
				ruleSet,
			};
		}
	}
	return loaded;
};

const fixtures = load();

export { fixtures };
