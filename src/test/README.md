# Config tests

These tests check to make sure the **configuration** is what we expect and is being applied
in ways we expect. Importantly we are not trying to test the rules themselves (e.g. Whether
`yoda` handles `exceptRange` correctly is not our problem). We want to be sure that our config
ships in a way that (A) won't break other people's configurations and (B) enforces rules we are
expecting.

`config.test.ts` is the actual test file but it derives the actual expected conditions from
`src/configs/` and `fixtures/`. Adding a rule generally should not require writing a
new test, but it will usually involve adding a new fixture.

The suite resolves `configs` on its own, with nothing layered on top. What a consumer
stacks around us is their business and outside our control; what we can and should
check is that our own modules do not cancel each other out, and that every rule
actually reaches the files it is meant to.

## Adding a rule

A rule is not finished until it has a fixture. The suite asserts that the set of rules
declared in `src/configs/` and the set of rules with fixtures are the same set, so
adding one without the other fails.

1. Add the rule to the matching module in `src/configs/`.
2. Add a fixture to the matching file in `fixtures/`.

The two directories are split along the same seams on purpose, so that contributors
working on unrelated areas of the config are rarely editing the same file.

## Choosing the two samples

Each fixture is a pair:

- `invalid` — must report exactly this rule, and nothing else.
- `valid` — must report nothing at all.

Choose the pair so that it **pins the option you chose**. `yoda` is the model: under
`'never'` the invalid sample errors and the valid one does not, and under `'always'`
both results invert. That is why the fixtures carry no copy of the rule's severity or
options — the pair constrains them more tightly than a restatement would, and unlike a
restatement it cannot be brought back into agreement by copying a value across.

A pair that reads the same whichever option is set documents nothing. Check that it
actually inverts before you commit it.

Keep samples to one line and free of anything the rule under test does not need. Every
sample is linted by the whole config, so an unrelated violation inside one surfaces as
a confusing failure of the rule you are adding.

## Every rule is an error

The suite asserts that no rule ships below `error`. This is deliberate policy, not an
oversight to be relaxed the first time a rule feels harsh: a strict shared config that
emits warnings is a config whose rules get ignored. If a rule is not worth failing a
build over, it is not worth shipping.

It is also load-bearing for the tests. Comparing a declared severity against a resolved
one cannot see a downgrade we make ourselves — both ends move together — and an
`invalid` sample still reports its rule id at any severity. Without this assertion an
`error` quietly becoming a `warn` passes the whole suite.

## Why every sample runs twice

Each sample is linted as both `sample.js` and `sample.ts`. A shareable config reaches
`.js` for free, but reaches `.ts` only for as long as something in it keeps supplying a
parser. That asymmetry is invisible from inside this repository — `eslint.config.mjs`
supplies a parser of its own either way — and it was a real bug here before
`src/configs/typescript.ts` existed.
