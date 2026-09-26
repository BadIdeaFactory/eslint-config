import assert from 'node:assert/strict';

const distinctRuleIdsIn = (reportedRuleIds: string[]) => [
	...new Set(reportedRuleIds),
];

const assertReportsThisRuleAndNothingElse = (
	ruleId: string,
	reportedRuleIds: string[],
): void => {
	assert.deepEqual(distinctRuleIdsIn(reportedRuleIds), [ruleId]);
};

export { assertReportsThisRuleAndNothingElse };
