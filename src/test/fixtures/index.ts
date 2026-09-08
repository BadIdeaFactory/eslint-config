import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RuleFixtures } from './types.ts';

const FIXTURE_ROOT = import.meta.dirname;

const directoriesIn = (path: string) =>
	readdirSync(path, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();

const sample = (path: string) =>
	readFileSync(path, 'utf8').replace(/\r?\n$/, '');

const load = (): RuleFixtures => {
	const loaded: RuleFixtures = {};
	for (const ruleSet of directoriesIn(FIXTURE_ROOT)) {
		const setPath = join(FIXTURE_ROOT, ruleSet);
		for (const rule of directoriesIn(setPath)) {
			loaded[rule] = {
				valid: sample(join(setPath, rule, 'valid.ts')),
				invalid: sample(join(setPath, rule, 'invalid.ts')),
			};
		}
	}
	return loaded;
};

const fixtures = load();

export { fixtures };
