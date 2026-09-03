interface RuleFixture {
	valid: string;
	invalid: string;
}

type RuleFixtures = Record<string, RuleFixture>;

export type { RuleFixture, RuleFixtures };
