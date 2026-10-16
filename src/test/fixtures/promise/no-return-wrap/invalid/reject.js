const parse = (response) =>
	response.text().then((text) => {
		if (text === '') {
			return Promise.reject(new Error('Empty response'));
		}
		return JSON.parse(text);
	});
