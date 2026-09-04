import { execFileSync } from 'node:child_process';

// The major position means the supported ESLint major and nothing else, so a
// breaking-change marker and a change to the `eslint` peer major are the same
// event described twice. This asserts they always travel together: a marker
// without a peer bump would publish a major this package never earned, and a
// peer bump without a marker would ship new ESLint support as a minor.

const DEFAULT_BASE = 'origin/main';
const DEFAULT_HEAD = 'HEAD';
const EXIT_FAILURE = 1;

const BREAKING_SUBJECT = /^[a-z]+(?:\([^)]*\))?!:/;
const BREAKING_FOOTER = /^BREAKING[ -]CHANGE:/mu;
const FIRST_NUMBER = /\d+/;

const FIELD = '';
const RECORD = '';

interface Commit {
	sha: string;
	message: string;
}

const git = (args: readonly string[]): string =>
	execFileSync('git', [...args], { encoding: 'utf8' });

const commitsIn = (base: string, head: string): Commit[] =>
	git(['log', `--format=%h${FIELD}%B${RECORD}`, `${base}..${head}`])
		.split(RECORD)
		.map((record) => record.trim())
		.filter((record) => record !== '')
		.map((record) => {
			const [sha = '', message = ''] = record.split(FIELD);
			return { sha, message: message.trim() };
		});

const isBreaking = ({ message }: Commit): boolean =>
	BREAKING_SUBJECT.test(message) || BREAKING_FOOTER.test(message);

const peerMajorAt = (ref: string): string | undefined => {
	const parsed: unknown = JSON.parse(git(['show', `${ref}:package.json`]));
	if (typeof parsed !== 'object' || parsed === null) return undefined;

	const { peerDependencies } = parsed as {
		peerDependencies?: Record<string, string>;
	};
	const range = peerDependencies?.eslint;
	if (range === undefined) return undefined;

	const [major] = FIRST_NUMBER.exec(range) ?? [];
	return major;
};

const [, , base = DEFAULT_BASE, head = DEFAULT_HEAD] = process.argv;

const [breaking] = commitsIn(base, head).filter(isBreaking);
const before = peerMajorAt(base);
const after = peerMajorAt(head);
const peerMoved = before !== after;

const change = `${before ?? '?'} -> ${after ?? '?'}`;

if (breaking !== undefined && !peerMoved) {
	console.error(
		`${breaking.sha} marks a breaking change, but the eslint peer major ` +
			`is still ${before ?? '?'}.\n\n` +
			'The major position means the supported ESLint major and nothing ' +
			'else. Either move `peerDependencies.eslint` to the major this ' +
			'branch actually supports, or drop the breaking marker: a rule ' +
			'change is a `feat`, however disruptive it is to consumers.',
	);
	process.exit(EXIT_FAILURE);
}

if (peerMoved && breaking === undefined) {
	console.error(
		`The eslint peer major changed ${change}, but no commit on this ` +
			'branch marks a breaking change.\n\n' +
			'Supporting a new ESLint major is the one thing that bumps our ' +
			'major, so it needs a `!` after the type or a `BREAKING CHANGE:` ' +
			'footer. Without one this ships as a minor and goes on claiming ' +
			'support this package no longer has.',
	);
	process.exit(EXIT_FAILURE);
}

console.log(
	peerMoved
		? `A breaking change is marked and the eslint peer major changed ${change}. They agree.`
		: `No breaking change is marked and the eslint peer major is unchanged (${before ?? '?'}). They agree.`,
);
