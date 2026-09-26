import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import { loadFixturesFrom } from './index.ts';

const EMPTY_DIRECTORY = null;

type SampleSourcesByRelativePath = Record<
	string,
	string | typeof EMPTY_DIRECTORY
>;

type SampleSourcesByRuleName = Record<string, SampleSourcesByRelativePath>;

const temporaryFixtureRoots: string[] = [];

const coreFixtureTreeWith = (rules: SampleSourcesByRuleName) => {
	const fixtureRoot = mkdtempSync(join(tmpdir(), 'biffud-fixtures-'));
	temporaryFixtureRoots.push(fixtureRoot);
	for (const [ruleName, sampleSources] of Object.entries(rules)) {
		for (const [relativePath, source] of Object.entries(sampleSources)) {
			const path = join(fixtureRoot, 'core', ruleName, relativePath);
			if (source === EMPTY_DIRECTORY) {
				mkdirSync(path, { recursive: true });
				continue;
			}
			mkdirSync(dirname(path), { recursive: true });
			writeFileSync(path, source);
		}
	}
	return fixtureRoot;
};

describe('the fixture loader', () => {
	after(() => {
		for (const fixtureRoot of temporaryFixtureRoots) {
			rmSync(fixtureRoot, { recursive: true, force: true });
		}
	});

	it('reads each case file as a case named after it', () => {
		const fixtureRoot = coreFixtureTreeWith({
			'no-var': {
				'valid/default.ts': 'let a = 1;\n',
				'invalid/default.ts': 'var a = 1;\n',
			},
		});

		assert.deepEqual(loadFixturesFrom(fixtureRoot), {
			'no-var': {
				valid: [{ name: 'default', source: 'let a = 1;' }],
				invalid: [{ name: 'default', source: 'var a = 1;' }],
				script: false,
				ruleSet: 'core',
			},
		});
	});

	it('names every case in a directory, and sorts them', () => {
		const fixtureRoot = coreFixtureTreeWith({
			curly: {
				'valid/default.ts': 'if (a) {\n\tb();\n}\n',
				'invalid/single.ts': 'if (a) b();\n',
				'invalid/multiline.ts': 'if (a)\n\tb();\n',
			},
		});

		assert.deepEqual(loadFixturesFrom(fixtureRoot), {
			curly: {
				valid: [{ name: 'default', source: 'if (a) {\n\tb();\n}' }],
				invalid: [
					{ name: 'multiline', source: 'if (a)\n\tb();' },
					{ name: 'single', source: 'if (a) b();' },
				],
				script: false,
				ruleSet: 'core',
			},
		});
	});

	it('parses a rule carrying .cjs cases as a script', () => {
		const fixtureRoot = coreFixtureTreeWith({
			'no-with': {
				'valid/default.cjs': 'a.b();\n',
				'invalid/statement.cjs': 'with (a) {\n\tb();\n}\n',
			},
		});

		const { 'no-with': fixture } = loadFixturesFrom(fixtureRoot);

		assert.equal(fixture?.script, true);
	});

	it('ignores a hidden file sitting beside the cases', () => {
		const fixtureRoot = coreFixtureTreeWith({
			curly: {
				'valid/default.ts': 'if (a) {\n\tb();\n}\n',
				'invalid/single.ts': 'if (a) b();\n',
				'invalid/.DS_Store': 'not a sample\n',
			},
		});

		const { curly: fixture } = loadFixturesFrom(fixtureRoot);

		assert.deepEqual(fixture?.invalid, [
			{ name: 'single', source: 'if (a) b();' },
		]);
	});

	it('ignores a hidden directory in the rule set', () => {
		const fixtureRoot = coreFixtureTreeWith({
			'no-var': {
				'valid/default.ts': 'let a = 1;\n',
				'invalid/default.ts': 'var a = 1;\n',
			},
			'.cache': { 'junk.ts': 'not a fixture\n' },
		});

		assert.deepEqual(Object.keys(loadFixturesFrom(fixtureRoot)), ['no-var']);
	});

	it('refuses a case directory holding a file that is not a sample', () => {
		const fixtureRoot = coreFixtureTreeWith({
			curly: {
				'valid/default.ts': 'if (a) {\n\tb();\n}\n',
				'invalid/single.ts': 'if (a) b();\n',
				'invalid/notes.md': 'why this case exists\n',
			},
		});

		assert.throws(() => loadFixturesFrom(fixtureRoot), /notes\.md/v);
	});

	it('refuses a directory sitting among the cases', () => {
		const fixtureRoot = coreFixtureTreeWith({
			curly: {
				'valid/default.ts': 'if (a) {\n\tb();\n}\n',
				'invalid/single.ts': 'if (a) b();\n',
				'invalid/nested': EMPTY_DIRECTORY,
			},
		});

		assert.throws(
			() => loadFixturesFrom(fixtureRoot),
			/nested, which is not a \.ts or \.cjs sample file/v,
		);
	});

	it('refuses a rule mixing script and module cases', () => {
		const fixtureRoot = coreFixtureTreeWith({
			'no-with': {
				'valid/default.cjs': 'a.b();\n',
				'invalid/statement.ts': 'with (a) {\n\tb();\n}\n',
			},
		});

		assert.throws(() => loadFixturesFrom(fixtureRoot), /mixes/v);
	});

	it('refuses a case directory holding no cases', () => {
		const fixtureRoot = coreFixtureTreeWith({
			'no-var': {
				'valid/default.ts': 'let a = 1;\n',
				invalid: EMPTY_DIRECTORY,
			},
		});

		assert.throws(() => loadFixturesFrom(fixtureRoot), /holds no cases/v);
	});

	it('refuses a rule missing one half of its cases', () => {
		const fixtureRoot = coreFixtureTreeWith({
			curly: { 'invalid/default.ts': 'if (a) b();\n' },
		});

		assert.throws(
			() => loadFixturesFrom(fixtureRoot),
			/has no 'valid\/' directory/v,
		);
	});

	it('refuses a sample left beside the case directories', () => {
		const fixtureRoot = coreFixtureTreeWith({
			'no-var': {
				'valid/default.ts': 'let a = 1;\n',
				'invalid/default.ts': 'var a = 1;\n',
				'valid.ts': 'let a = 1;\n',
			},
		});

		assert.throws(() => loadFixturesFrom(fixtureRoot), /holds valid\.ts/v);
	});
});
