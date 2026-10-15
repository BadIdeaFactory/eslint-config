class Counter {
	count = 0;
	private step = 1;
	increment(): void {
		this.count += this.step;
	}
}
export { Counter };
