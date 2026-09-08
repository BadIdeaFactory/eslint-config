import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RuleFixtures } from './types.ts';

const FIXTURE_ROOT = import.meta.dirname;

const directoriesIn = (path: string) =>
	readdirSync(path, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();

const sample = (path: string) =>
	readFileSync(path, 'utf8').replace(/\r?\n$/v, '');

const load = (): RuleFixtures => {
	const loaded: RuleFixtures = {};
	for (const ruleSet of directoriesIn(FIXTURE_ROOT)) {
		const setPath = join(FIXTURE_ROOT, ruleSet);
		for (const rule of directoriesIn(setPath)) {
			const rulePath = join(setPath, rule);
			const script = existsSync(join(rulePath, 'valid.cjs'));
			const extension = script ? 'cjs' : 'ts';
			loaded[rule] = {
				valid: sample(join(rulePath, `valid.${extension}`)),
				invalid: sample(join(rulePath, `invalid.${extension}`)),
				script,
			};
		}
	}
	return loaded;
};

const fixtures = load();

export { fixtures };
