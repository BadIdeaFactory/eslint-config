# Config tests

These tests check to make sure the **configuration** is what we expect and is being applied
in ways we expect. Importantly we are not trying to test the rules themselves (e.g. Whether
`yoda` handles `exceptRange` correctly is not our problem). We want to be sure that our config
ships in a way that (A) won't break other people's configurations and (B) enforces rules we are
expecting.

`config.test.ts` is the actual test file but it derives the actual expected conditions from
`src/configs/` and `fixtures/`. Adding a rule generally should not require writing a
new test, but it will usually involve adding a new fixture.

A sample's extension says what it contains, and so where it can be linted. A `.js`
sample is plain JavaScript and is linted as every path its rule set reaches. A `.ts`
sample carries TypeScript syntax and is linted as `sample.ts` alone; a core rule uses
one to pin an option that only TypeScript code can reach, beside `.js` cases for the
rest. Each half of a core rule still needs a `.js` case, so that the rule is shown to
reach `.js` at all.

A rule whose samples end in `.cjs` is parsed as a classic script rather than a module.
Nothing else can demonstrate `with`, a legacy octal or a `delete` of a variable, which
are syntax errors under the module semantics every other sample gets. Use it only when
the rule is about syntax a module cannot contain. Every case for such a rule is a
`.cjs`; a fixture mixing script and module samples is refused.

Fixtures are grouped by rule set, one directory per module in `src/configs/`. A rule
set names the prefix its rule ids carry — `core` adds nothing, `typescript` adds
`@typescript-eslint/` — because a rule id stops being a legal directory name once it
carries a plugin. Adding a rule set means naming it in `RuleSet` in `fixtures/types.ts`
and giving it a prefix; the loader refuses a directory it does not recognise rather
than inventing a rule id for it.

Samples live on disk, so that a sample spanning several lines — or carrying a character
that would otherwise have to be escaped — reads as the code it is. Every rule holds two
case directories, `valid/` and `invalid/`, with one file per case; where one case is all
a rule needs, that case is named `default`. The folder is ignored by Prettier, ESLint
and `tsc`, since the samples are deliberately malformed, and those ignores reach the
case directories with it.

The suite resolves `configs` on its own, with nothing layered on top. What a consumer
stacks around us is their business and outside our control; what we can and should
check is that our own modules do not cancel each other out, and that every rule
actually reaches the files it is meant to.

## Adding a rule

A rule is not finished until it has a fixture. The suite asserts that the set of rules
declared in `src/configs/` and the set of rules with fixtures are the same set, so
adding one without the other fails.

1. Add the rule to the matching module in `src/configs/`.
2. Add a folder to the matching rule set in `fixtures/`, holding a `valid/` and an
   `invalid/` directory. One case in each is enough to start — `default.js` in both
   for a core rule, `default.ts` for a TypeScript one.

The two directories are split along the same seams on purpose, so that contributors
working on unrelated areas of the config are rarely editing the same file.

## Choosing the samples

Each fixture has a `valid` half and an `invalid` half:

- `invalid` — every message it reports must be this rule, and there must be at least
  one. Reporting the rule more than once is fine, and some rules cannot do otherwise:
  a sample that reports its rule twice is still demonstrating that rule and nothing
  else, so the suite asserts the rule rather than a count.
- `valid` — must report nothing at all.

Choose the samples so that they **pin the option you chose**. `yoda` is the model:
under `'never'` the invalid sample errors and the valid one does not, and under
`'always'` both results invert. That is why the fixtures carry no copy of the rule's
severity or options — the samples constrain them more tightly than a restatement
would, and unlike a restatement they cannot be brought back into agreement by copying
a value across.

Samples that read the same whichever option is set document nothing, and that holds
for every case in a directory too. Check that they actually invert before you commit
them — nothing enforces this, so it is on you.

Keep samples free of anything the rule under test does not need, and write what is left
the way you would write it anywhere else. A sample is read far more often than it is
run, so it takes the line breaks and the indentation it would have in real code —
statements one per line, blocks opened and closed. Do not squeeze one onto a single
line; brevity here is measured in what a reader has to hold in their head, not in
newlines.

The exception is a rule about line structure. `no-unexpected-multiline` is the whole of
its own sample, and `no-irregular-whitespace` is a sample you cannot even see. Those
carry their formatting as content, and reformatting them repairs the violation instead
of presenting it — which is why the fixture directory is ignored by Prettier, and why
`npm run format` must never be pointed at it.

Each sample is linted against **that rule alone**, always, so an unrelated violation
inside one is harmless: a `while (true)` in the `no-constant-condition` sample does not
have to answer to `no-unreachable-loop`. It was once otherwise, and adding a rule then
meant editing unrelated samples that happened to also report it.

## One case, or several

One case in each half is enough for a rule with one option, and that is what nearly
every rule here ships: `valid/default` against `invalid/default`. The name earns
its keep once there is more than one, because it is what the test output prints — a
failure reads `reports invalid/multiline` rather than naming only the rule.

One case stops being enough for a rule whose options are a list rather than a set of
flags: `@typescript-eslint/naming-convention` takes a selector per kind of name —
variables, types, properties — and no single pair can pin more than one of them.
Shipping such a rule against one pair would leave most of what it enforces untested,
and a later edit to any other selector could not fail anything. That rule holds a case
per selector:

```
fixtures/typescript/naming-convention/
├── invalid/
│   ├── property.ts
│   ├── type.ts
│   └── variable.ts
└── valid/
    ├── property.ts
    ├── type.ts
    └── variable.ts
```

Each case is linted on its own, so a failure says which case broke rather than only
which rule. The two halves are independent: a rule may hold several invalid cases
against a single valid one.

The loader refuses a fixture it cannot read unambiguously rather than testing less than
it appears to: a rule missing its `valid/` or `invalid/` directory, a case directory
with no cases in it, one holding an entry that is not a sample file, and anything else
sitting in a rule's folder — a stray `cases/` directory, or a `valid.js` left over from
before the case directories, either of which would otherwise sit there unread. Hidden
entries are ignored at every level, so an editor or Finder dropping one in costs
nothing.

Everything above still applies to every case. A case earns its place by inverting when
the option changes, and a directory whose cases all read the same whichever option is
set documents no more than one of them would.

## Every rule is an error

The suite asserts that no rule ships below `error`. This is deliberate policy, not an
oversight to be relaxed the first time a rule feels harsh: a strict shared config that
emits warnings is a config whose rules get ignored. If a rule is not worth failing a
build over, it is not worth shipping.

It is also load-bearing for the tests. Comparing a declared severity against a resolved
one cannot see a downgrade we make ourselves — both ends move together — and an
`invalid` sample still reports its rule id at any severity. Without this assertion an
`error` quietly becoming a `warn` passes the whole suite.

## Why most samples run twice

Each `.js` sample of a core rule is linted as both `sample.js` and `sample.ts`. A
shareable config reaches `.js` for free, but reaches `.ts` only for as long as something
in it keeps supplying a parser. That asymmetry is invisible from inside this repository — `eslint.config.mjs`
supplies a parser of its own either way — and it was a real bug here before
`src/configs/typescript.ts` existed.

TypeScript rules are the exception and run once. They are declared in the same block as
the parser that makes `.ts` lintable at all, so `.js` is a file they are never asked
about; linting one there would report a missing plugin rather than a missing violation.
Which paths a rule set reaches is `REACHED_PATHS` in `config.test.ts`, and the
composition test reads the same table, so a rule that stopped reaching the files it is
meant for fails there rather than passing quietly. A `.ts` sample runs once for the
same reason a TypeScript rule does: `sample.ts` is the only path that can parse it.

## Why sample.ts is a real file

`sample.ts` exists on disk; `sample.js` and `sample.cjs` do not. The type-aware rules
get their types from the project service, which supplies them only for a file some
tsconfig already covers, and a path the suite invents belongs to no project. Nothing
reads what is committed at `sample.ts` — every lint replaces the contents — so it holds
the smallest thing `isolatedModules` still accepts as a module.

The alternative was to hand the suite its own inferred project, and that quietly cost
the suite its best assertion: with the tests supplying type information themselves, a
published config that stopped supplying any still passed every one of them. Leave the
types coming from the config under test.
