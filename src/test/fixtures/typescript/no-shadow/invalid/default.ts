const total = 0;
const sum = (values: number[]): number => {
	let total = 0;
	for (const value of values) {
		total += value;
	}
	return total;
};
export { total, sum };
