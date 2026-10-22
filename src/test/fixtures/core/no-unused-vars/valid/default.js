export const withoutId = (user) => {
	const { id, ...rest } = user;
	return rest;
};
export const label = (detail, _event) => detail;
