// The rule sets are the modules in `src/configs/`, split the same way.
type RuleSet = 'core' | 'typescript';

type SampleKind = 'valid' | 'invalid';

interface FixtureCase {
	name: string;
	source: string;
}

interface RuleFixture {
	valid: FixtureCase[];
	invalid: FixtureCase[];
	script: boolean;
	ruleSet: RuleSet;
}

type RuleFixtures = Record<string, RuleFixture>;

export type { FixtureCase, RuleFixture, RuleFixtures, RuleSet, SampleKind };
