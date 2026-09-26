interface Greets {
	greet: (name: string) => string;
}
class Greeter implements Greets {
	greet(name: string): string {
		return `Hello, ${name}`;
	}
}
