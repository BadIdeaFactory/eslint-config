interface Greets {
	greet: (name: string) => string;
}
class Greeter implements Greets {
	private readonly greeting = 'Hello';
	greet(name: string): string {
		return `${this.greeting}, ${name}`;
	}
}
