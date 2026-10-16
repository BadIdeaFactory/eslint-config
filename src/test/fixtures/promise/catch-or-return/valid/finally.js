const refresh = (cache, logger) => {
	cache
		.load()
		.then((entries) => {
			cache.replace(entries);
		})
		.catch((error) => {
			logger.error(error);
		})
		.finally(() => {
			cache.unlock();
		});
};
