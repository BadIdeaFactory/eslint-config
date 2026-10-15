const parse = (response) =>
	response.text().then((text) => {
		return Promise.resolve(JSON.parse(text));
	});
