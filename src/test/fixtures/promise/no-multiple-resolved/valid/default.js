const load = (cache, key) =>
	new Promise((resolve, reject) => {
		if (cache.has(key)) {
			resolve(cache.get(key));
		} else {
			reject(new Error(`No entry for ${key}`));
		}
	});
