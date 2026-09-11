class Greeter {
	name = 'biffud';
	later(): () => string {
		const { name } = this;
		return () => name;
	}
}
