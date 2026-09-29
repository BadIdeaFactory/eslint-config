// The rule sets are the modules in `src/configs/`, split the same way.
type RuleSet = 'core' | 'typescript';

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
