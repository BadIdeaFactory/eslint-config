import { core } from './configs/core.ts';
import { promise } from './configs/promise.ts';
import { typescript, typescriptHandoffs } from './configs/typescript.ts';
import type { Linter } from 'eslint';

const configs: Linter.Config[] = [
	typescript,
	core,
	promise,
	typescriptHandoffs,
];

export default configs;
