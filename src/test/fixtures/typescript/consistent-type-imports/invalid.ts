import { Stats } from 'node:fs';
const sizeOf = (stats: Stats): number => stats.size;
