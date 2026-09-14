export const withoutId = (user: { id: string; name: string }): object => {
	const { id, ...rest } = user;
	return rest;
};
export const label = (detail: string, _event: string): string => detail;
