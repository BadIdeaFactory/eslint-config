class Thing {
	value(): number {
		return 1;
	}
}
const unbound = new Thing().value;
