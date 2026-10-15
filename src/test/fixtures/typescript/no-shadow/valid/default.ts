const total = 0;
const sum = (values: number[]): number => {
	let running = 0;
	for (const value of values) {
		running += value;
	}
	return running;
};
export { total, sum };
