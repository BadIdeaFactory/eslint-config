function describe(text: string): string;
function describe(count: number): string;
function describe(value: string | number): string {
	return String(value);
}
