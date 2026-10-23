import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const SCRIPT = join(import.meta.dirname, 'check-major.ts');
const BEFORE = '^10.0.0';

interface Commit {
	subject: string;
	newPeerRange?: string;
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
		commits: [{ subject: 'feat: Support ESLint 11', newPeerRange: '^11.0.0' }],
		fails: true,
	},
	{
		name: 'passes when the marker and the peer major agree',
		commits: [{ subject: 'feat!: Move to ESLint 11', newPeerRange: '^11.0.0' }],
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
			{
				subject: 'chore: Point the peer range at ESLint 11',
				newPeerRange: '^11.0.0',
			},
		],
		fails: false,
	},
	{
		name: 'ignores a peer range that moves without changing major',
		commits: [
			{ subject: 'fix: Widen the peer range', newPeerRange: '^10.2.0' },
		],
		fails: false,
	},
];

const manifest = (eslint: string): string =>
	`${JSON.stringify({ name: 'fixture', peerDependencies: { eslint } }, null, '\t')}\n`;

const checkInFreshRepository = ({ commits }: Scenario): number => {
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

		for (const { subject, newPeerRange } of commits) {
			if (newPeerRange !== undefined) {
				writeFileSync(join(dir, 'package.json'), manifest(newPeerRange));
				git('add', 'package.json');
			}
			git('commit', '--quiet', '--allow-empty', '--message', subject);
		}

		const { status } = spawnSync('node', [SCRIPT, base, 'HEAD'], {
			cwd: dir,
			stdio: 'pipe',
		});
		return status ?? -1;
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
};

describe('check-major', () => {
	for (const scenario of scenarios) {
		it(scenario.name, () => {
			assert.equal(
				checkInFreshRepository(scenario) !== 0,
				scenario.fails,
				`expected the check to ${scenario.fails ? 'fail' : 'pass'}`,
			);
		});
	}
});
