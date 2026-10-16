const load = (cache, key) =>
	new Promise((resolve, reject) => {
		if (cache.has(key)) {
			resolve(cache.get(key));
		}
		reject(new Error(`No entry for ${key}`));
	});
