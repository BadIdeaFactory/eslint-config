const values = [1, 2];
const all = values.reduce<number[]>((into, value) => into.concat(value), []);
