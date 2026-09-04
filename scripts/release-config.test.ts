import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { analyzeCommits } from '@semantic-release/commit-analyzer';
import { generateNotes } from '@semantic-release/release-notes-generator';

// `.releaserc.json` decides version numbers and npm versions are immutable, so
// it is worth more than a config file's usual scrutiny. Nothing else exercises
// it: a dry run with no releasable commit never reaches the notes generator,
// which is how a preset that could not render at all sat here undetected.
//
// These cases load the real file rather than a fixture, so a change to it has
// to survive them.

const RELEASERC = join(import.meta.dirname, '..', '.releaserc.json');

type ConfiguredPlugin = [name: string, config: Record<string, unknown>];
type Plugin = string | ConfiguredPlugin;

const plugins = (
	JSON.parse(readFileSync(RELEASERC, 'utf8')) as { plugins: Plugin[] }
).plugins;

const configFor = (name: string): Record<string, unknown> => {
	const entry = plugins.find(
		(plugin): plugin is ConfiguredPlugin =>
			Array.isArray(plugin) && plugin[0] === name,
	);
	assert.ok(entry, `${name} should be configured in .releaserc.json`);
	return entry[1];
};

const commit = (message: string) => ({
	hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
	commit: {
		long: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
		short: 'a1b2c3d',
	},
	message,
	subject: message.split('\n')[0],
	author: {},
	committer: {},
	tree: {},
});

const bumpFor = async (message: string) =>
	analyzeCommits(configFor('@semantic-release/commit-analyzer'), {
		commits: [commit(message)],
		logger: { log: () => undefined },
		cwd: process.cwd(),
		options: {},
	});

const notesFor = async (messages: string[]) =>
	generateNotes(configFor('@semantic-release/release-notes-generator'), {
		cwd: process.cwd(),
		options: {
			repositoryUrl: 'https://github.com/BadIdeaFactory/eslint-config.git',
		},
		lastRelease: { version: '10.0.0', gitTag: 'v10.0.0' },
		nextRelease: {
			version: '10.1.0',
			gitTag: 'v10.1.0',
			name: 'v10.1.0',
			channel: null,
			type: 'minor',
		},
		commits: messages.map(commit),
		logger: { log: () => undefined },
	});

describe('release configuration', () => {
	describe('the version it would choose', () => {
		const cases = [
			// A breaking marker is reserved for moving to a new ESLint major. The
			// default preset parses `feat!` to no type at all, releasing nothing or
			// letting an unrelated commit carry the release out as a patch.
			['feat!: Move to ESLint 11', 'major'],
			['fix!: Move to ESLint 11', 'major'],
			['feat: Move to ESLint 11\n\nBREAKING CHANGE: ESLint 11 now.', 'major'],
			['feat: Add a rule', 'minor'],
			['fix: Correct the parser wiring', 'patch'],
			['ci: Tweak a workflow', null],
			['docs: Explain a thing', null],
			['chore(deps-dev): Bump something', null],
		] as const;

		for (const [message, expected] of cases) {
			it(`treats ${JSON.stringify(message.split('\n')[0])} as ${String(expected)}`, async () => {
				assert.equal(await bumpFor(message), expected);
			});
		}
	});

	describe('the notes it would write', () => {
		it('renders them at all', async () => {
			const notes = await notesFor(['feat: Add a rule']);
			assert.match(notes, /### Features/);
			assert.match(notes, /Add a rule/);
		});

		it('never claims to close an issue a commit merely references', async () => {
			const notes = await notesFor([
				'feat: Add a rule\n\nWhy.\n\nIssue #5 Create some initial rules',
				'fix: Correct a thing\n\nSee https://example.com/pull/42#issuecomment-1',
			]);
			assert.doesNotMatch(notes, /closes/i);
		});
	});
});
