import type { Linter } from 'eslint';

// The published configurations will live here.
//
// Nothing is defined yet -- this exists so that the build, type check, and lint
// pipelines have something real to run against. The rules this repository
// currently lints itself with are in `eslint.config.mjs`; moving them here, and
// then consuming them from that file, is the next step.
const configs: Linter.Config[] = [];

export { configs };
