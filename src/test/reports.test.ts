import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assertReportsThisRuleAndNothingElse } from './reports.ts';

describe('the invalid-sample assertion', () => {
	it('accepts a sample reporting the rule once', () => {
		assert.doesNotThrow(() => {
			assertReportsThisRuleAndNothingElse('no-var', ['no-var']);
		});
	});

	it('accepts a sample reporting the rule twice', () => {
		assert.doesNotThrow(() => {
			assertReportsThisRuleAndNothingElse('no-var', ['no-var', 'no-var']);
		});
	});

	it('refuses a sample reporting nothing at all', () => {
		assert.throws(() => {
			assertReportsThisRuleAndNothingElse('no-var', []);
		});
	});

	it('refuses a sample also reporting another rule', () => {
		assert.throws(() => {
			assertReportsThisRuleAndNothingElse('no-var', ['no-var', 'eqeqeq']);
		});
	});

	it('refuses a sample reporting only another rule', () => {
		assert.throws(() => {
			assertReportsThisRuleAndNothingElse('no-var', ['eqeqeq']);
		});
	});
});
