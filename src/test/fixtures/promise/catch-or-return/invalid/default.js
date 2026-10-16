const refresh = (cache) => {
	cache.load().then((entries) => {
		cache.replace(entries);
	});
};
