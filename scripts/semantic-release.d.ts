declare module '@semantic-release/commit-analyzer' {
	export function analyzeCommits(
		pluginConfig: unknown,
		context: unknown,
	): Promise<string | null>;
}

declare module '@semantic-release/release-notes-generator' {
	export function generateNotes(
		pluginConfig: unknown,
		context: unknown,
	): Promise<string>;
}
