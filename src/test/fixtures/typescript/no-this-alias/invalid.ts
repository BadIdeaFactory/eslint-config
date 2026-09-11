class Greeter {
	name = 'biffud';
	later(): () => string {
		const self = this;
		return () => self.name;
	}
}
