type RuleSet = 'core' | 'import' | 'promise' | 'typescript';

type SampleKind = 'valid' | 'invalid';

type SampleExtension = 'cjs' | 'js' | 'ts';

interface FixtureCase {
	name: string;
	source: string;
	extension: SampleExtension;
}

interface RuleFixture {
	valid: FixtureCase[];
	invalid: FixtureCase[];
	script: boolean;
	ruleSet: RuleSet;
}

type RuleFixtures = Record<string, RuleFixture>;

export type {
	FixtureCase,
	RuleFixture,
	RuleFixtures,
	RuleSet,
	SampleExtension,
	SampleKind,
};
