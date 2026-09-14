class Counter {
	count(): number;
	count(step: number): number;
	count(step = 1): number {
		return step;
	}
}
