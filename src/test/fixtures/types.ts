interface RuleFixture {
	valid: string;
	invalid: string;
	script: boolean;
}

type RuleFixtures = Record<string, RuleFixture>;

export type { RuleFixture, RuleFixtures };
