# Config tests

It might seem silly to write tests for a lint configuration, but this allows us to
figure out if we've accidentally introduced a misconfiguration or a regression.

That said, we are _NOT_ trying to validate that the linter itself is implemented
correctly. This just means we aren't trying to comprehensively cover all types of
edge case in what the rule does; instead a single valid / invalid per configuration
element of a rule is appropriate.

In addition to checking according to the defined fixtures, the suite fails if a rule
has no fixture, a fixture has no rule, or any rule ships below `error`. The exceptions
are rules we switch off because they contradict one we enable. Each group in
`CONTRADICTING_RULES` lists rules that can't be on together; the suite checks that
we enforce exactly one of each group and that the rest resolve to `off`.

## Fixtures

Every rule we use has a folder of samples under `fixtures/`, grouped by the module in
`src/configs/` that declares it:

```
fixtures/core/yoda/
├── invalid/
│   └── default.js
└── valid/
    └── default.js
```

- Each `invalid/` sample must report the rule and nothing else.
- Each `valid/` sample must report nothing.

Pick samples that would flip if the option changed. Under `'never'`, the
`yoda` invalid sample errors and the valid one doesn't; under `'always'` both
would flip. That is how a sample pair pins an option.

Most rules need one case per side, called `default`. Add more, with
descriptive names, when one pair can't cover every option — see
`typescript/naming-convention`.

Write samples the way you'd write normal code, and keep them to what the rule
needs. They are excluded from Prettier, ESLint and `tsc`, because some of them
are deliberately malformed.

## File extensions

- `.js` samples are linted as both `sample.js` and `sample.ts`, with the
  exceptions below.
- `.ts` samples are linted only as `sample.ts`.
- `.cjs` samples are linted as a script rather than a module. Use them only for
  syntax a module can't contain, like `with`.

TypeScript rules only run against `sample.ts`. Core rules that a TypeScript rule
replaces are switched off for `.ts` files and listed in `HANDED_OFF_RULES`, so their
samples only run against `sample.js`.

`sample.ts` is a real file because type-aware rules only get types for files a
tsconfig covers. Its contents are never read; each sample is linted as text
under that path.
