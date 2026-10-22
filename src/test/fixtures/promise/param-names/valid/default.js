const once = (emitter, name) =>
	new Promise((resolve, reject) => {
		emitter.once(name, resolve);
		emitter.once('error', reject);
	});
