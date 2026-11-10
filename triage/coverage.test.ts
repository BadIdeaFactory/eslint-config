import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import configs from '../src/index.ts';
import triage from './rules.json' with { type: 'json' };
import type { Rule } from 'eslint';

type RuleMeta = Pick<Rule.RuleModule, 'meta'>;

const isCurrent = ({ meta }: RuleMeta) =>
	meta?.deprecated === undefined || meta.deprecated === false;

const currentRuleIds = (prefix: string, rules: Record<string, RuleMeta>) =>
	Object.entries(rules)
		.filter(([, rule]) => isCurrent(rule))
		.map(([name]) => `${prefix}${name}`);

const pluginRuleIds = configs
	.flatMap((config) => Object.entries(config.plugins ?? {}))
	.flatMap(([prefix, plugin]) =>
		currentRuleIds(`${prefix}/`, plugin.rules ?? {}),
	);

// eslint-disable-next-line @typescript-eslint/no-deprecated -- ESLint exposes no other list of its core rules
const coreRules = Object.fromEntries(builtinRules);

const upstreamRuleIds = new Set([
	...currentRuleIds('', coreRules),
	...pluginRuleIds,
]);

const configuredRuleIds = new Set(
	configs.flatMap((config) => Object.keys(config.rules ?? {})),
);

const triagedRuleIds = Object.values(triage).flat();

const isTriaged = (ruleId: string) => triagedRuleIds.includes(ruleId);

describe('the rule triage', () => {
	it('configures or triages every current upstream rule', () => {
		assert.deepEqual(
			[...upstreamRuleIds].filter(
				(ruleId) => !configuredRuleIds.has(ruleId) && !isTriaged(ruleId),
			),
			[],
		);
	});

	it('triages only current upstream rules', () => {
		assert.deepEqual(
			triagedRuleIds.filter((ruleId) => !upstreamRuleIds.has(ruleId)),
			[],
		);
	});

	it('triages no rule the config already declares', () => {
		assert.deepEqual(
			triagedRuleIds.filter((ruleId) => configuredRuleIds.has(ruleId)),
			[],
		);
	});

	it('triages each rule once', () => {
		assert.deepEqual(
			triagedRuleIds.filter(
				(ruleId, index) => triagedRuleIds.indexOf(ruleId) !== index,
			),
			[],
		);
	});

	for (const [status, ruleIds] of Object.entries(triage)) {
		it(`keeps ${status} sorted`, () => {
			assert.deepEqual(ruleIds, ruleIds.toSorted());
		});
	}
});
