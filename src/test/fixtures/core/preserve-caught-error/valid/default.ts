try {
	null;
} catch (failure) {
	throw new Error('x', { cause: failure });
}
