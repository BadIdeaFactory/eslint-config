// Neither plugin ships types, and both are exercised by `release-config.test.ts`
// rather than by anything we publish. Only the surface that test touches is
// declared here; widen it if the test grows.

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
