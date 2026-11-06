const NAMING_CONVENTION_OPTIONS = [
	{
		selector: 'default',
		format: ['strictCamelCase'],
		leadingUnderscore: 'forbid',
		trailingUnderscore: 'forbid',
	},
	{ selector: 'typeLike', format: ['StrictPascalCase'] },
	{ selector: 'enumMember', format: ['StrictPascalCase'] },
	{ selector: 'import', format: ['strictCamelCase', 'StrictPascalCase'] },
	{
		selector: 'variable',
		modifiers: ['const'],
		format: ['strictCamelCase', 'UPPER_CASE', 'StrictPascalCase'],
	},
	{
		selector: 'classProperty',
		modifiers: ['static', 'readonly'],
		format: ['strictCamelCase', 'UPPER_CASE'],
	},
	{ selector: 'default', modifiers: ['requiresQuotes'], format: null },
	{
		selector: ['objectLiteralProperty', 'typeProperty'],
		format: null,
	},
	{ selector: 'variable', modifiers: ['destructured'], format: null },
	{ selector: 'parameter', modifiers: ['destructured'], format: null },
	{
		selector: 'parameter',
		modifiers: ['unused'],
		format: null,
		leadingUnderscore: 'allow',
	},
	{
		selector: ['classMethod', 'objectLiteralMethod', 'typeMethod'],
		filter: { regex: '^toJSON$', match: true },
		format: null,
	},
];

const selectorsOf = (option: { selector: string | string[] }): string[] =>
	[option.selector].flat();

const hasEntryFor = (selector: string): boolean =>
	NAMING_CONVENTION_OPTIONS.some((option) =>
		selectorsOf(option).includes(selector),
	);

const namingConventionOptionsWithout = (omitted: string[]): unknown[] => {
	const unmatched = omitted.filter((selector) => !hasEntryFor(selector));
	if (unmatched.length > 0) {
		throw new Error(
			`@biffud/eslint-config has no naming-convention entries to omit for: ${unmatched.join(', ')}`,
		);
	}
	return NAMING_CONVENTION_OPTIONS.flatMap<unknown>((option) => {
		const selectors = selectorsOf(option);
		const kept = selectors.filter((selector) => !omitted.includes(selector));
		if (kept.length === selectors.length) {
			return [option];
		}
		return kept.length > 0 ? [{ ...option, selector: kept }] : [];
	});
};

export { NAMING_CONVENTION_OPTIONS, namingConventionOptionsWithout };
