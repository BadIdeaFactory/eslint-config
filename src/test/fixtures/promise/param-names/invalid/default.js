const once = (emitter, name) =>
	new Promise((done, fail) => {
		emitter.once(name, done);
		emitter.once('error', fail);
	});
