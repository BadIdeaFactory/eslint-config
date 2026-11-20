const SUBJECT_MAX_LENGTH = 50;
const BODY_MAX_LINE_LENGTH = 72;
const DEPENDABOT_SIGN_OFF = /^Signed-off-by: dependabot\[bot\]/mv;
const ERROR = 2;

interface ParsedCommit {
	raw?: string | null;
	subject?: string | null;
}

const isDependabotCommit = ({ raw }: ParsedCommit): boolean =>
	DEPENDABOT_SIGN_OFF.test(raw ?? '');

const subjectMaxLengthUnlessDependabot = (
	parsed: ParsedCommit,
	_when?: string,
	maxLength = SUBJECT_MAX_LENGTH,
): [boolean, string] => [
	isDependabotCommit(parsed) || (parsed.subject ?? '').length <= maxLength,
	`subject must not be longer than ${String(maxLength)} characters`,
];

export default {
	extends: ['@commitlint/config-conventional'],
	plugins: [
		{
			rules: {
				'subject-max-length-unless-dependabot':
					subjectMaxLengthUnlessDependabot,
			},
		},
	],
	rules: {
		'header-max-length': [0],
		'subject-max-length-unless-dependabot': [
			ERROR,
			'always',
			SUBJECT_MAX_LENGTH,
		],
		'subject-case': [ERROR, 'never', ['lower-case']],
		'body-max-line-length': [ERROR, 'always', BODY_MAX_LINE_LENGTH],
	},
};
