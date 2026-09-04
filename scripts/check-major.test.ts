import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

// The check reads git history and a file at two revisions, so the only honest
// way to test it is against a real repository. Each case builds a throwaway one
// rather than reaching for the repository the suite is running in, which has
// its own history and would drift out from under these expectations.

const SCRIPT = join(import.meta.dirname, 'check-major.ts');
const BEFORE = '^10.0.0';

// A commit carries a new peer range only when the case says so, which is what
// lets a case place the marker and the range change in the same commit or in
// different ones. The check spans a branch, so both have to pass.
interface Commit {
	subject: string;
	peer?: string;
}

interface Scenario {
	name: string;
	commits: Commit[];
	fails: boolean;
}

const scenarios: Scenario[] = [
	{
		name: 'passes when nothing breaking happens',
		commits: [{ subject: 'feat: Add a rule' }],
		fails: false,
	},
	{
		name: 'fails a marked breaking change that leaves the major alone',
		commits: [{ subject: 'feat!: Move to ESLint 11' }],
		fails: true,
	},
	{
		name: 'fails a new peer major that nothing marks as breaking',
		commits: [{ subject: 'feat: Support ESLint 11', peer: '^11.0.0' }],
		fails: true,
	},
	{
		name: 'passes when the marker and the peer major agree',
		commits: [{ subject: 'feat!: Move to ESLint 11', peer: '^11.0.0' }],
		fails: false,
	},
	{
		name: 'reads a BREAKING CHANGE footer, not just the subject',
		commits: [
			{ subject: 'feat: Move to ESLint 11\n\nBREAKING CHANGE: ESLint 11 now.' },
		],
		fails: true,
	},
	{
		name: 'accepts the marker and the peer major in separate commits',
		commits: [
			{ subject: 'feat!: Move to ESLint 11' },
			{ subject: 'chore: Point the peer range at ESLint 11', peer: '^11.0.0' },
		],
		fails: false,
	},
	{
		name: 'ignores a peer range that moves without changing major',
		commits: [{ subject: 'fix: Widen the peer range', peer: '^10.2.0' }],
		fails: false,
	},
];

const manifest = (eslint: string): string =>
	`${JSON.stringify({ name: 'fixture', peerDependencies: { eslint } }, null, '\t')}\n`;

const check = ({ commits }: Scenario): number => {
	const dir = mkdtempSync(join(tmpdir(), 'check-major-'));
	const git = (...args: string[]): string =>
		execFileSync('git', args, { cwd: dir, encoding: 'utf8' });

	try {
		git('init', '--quiet', '--initial-branch=main');
		git('config', 'user.email', 'test@example.com');
		git('config', 'user.name', 'Test');
		git('config', 'commit.gpgsign', 'false');

		writeFileSync(join(dir, 'package.json'), manifest(BEFORE));
		git('add', 'package.json');
		git('commit', '--quiet', '--message', 'chore: Base');
		const base = git('rev-parse', 'HEAD').trim();

		for (const { subject, peer } of commits) {
			if (peer !== undefined) {
				writeFileSync(join(dir, 'package.json'), manifest(peer));
				git('add', 'package.json');
			}
			git('commit', '--quiet', '--allow-empty', '--message', subject);
		}

		try {
			execFileSync('node', [SCRIPT, base, 'HEAD'], { cwd: dir, stdio: 'pipe' });
			return 0;
		} catch (error) {
			return (error as { status?: number }).status ?? -1;
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
};

describe('check-major', () => {
	for (const scenario of scenarios) {
		it(scenario.name, () => {
			assert.equal(
				check(scenario) !== 0,
				scenario.fails,
				`expected the check to ${scenario.fails ? 'fail' : 'pass'}`,
			);
		});
	}
});
