function outer() {
	return arguments.callee;
}
outer;
