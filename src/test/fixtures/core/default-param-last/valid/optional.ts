const greet = (greeting = 'Hello', name?: string): string =>
	`${greeting}, ${name ?? 'stranger'}`;
greet;
