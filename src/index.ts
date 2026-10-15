import { core } from './configs/core.ts';
import { promise } from './configs/promise.ts';
import { typescript } from './configs/typescript.ts';
import type { Linter } from 'eslint';

const configs: Linter.Config[] = [typescript, core, promise];

export default configs;
