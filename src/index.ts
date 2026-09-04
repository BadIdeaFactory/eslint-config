import { core } from './configs/core.ts';
import { typescript } from './configs/typescript.ts';
import type { Linter } from 'eslint';

const configs: Linter.Config[] = [typescript, core];

export default configs;
