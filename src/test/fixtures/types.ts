// The rule sets are the modules in `src/configs/`, split the same way.
type RuleSet = 'core' | 'typescript';

interface RuleFixture {
	valid: string;
	invalid: string;
	script: boolean;
	ruleSet: RuleSet;
}

type RuleFixtures = Record<string, RuleFixture>;

export type { RuleFixture, RuleFixtures, RuleSet };
