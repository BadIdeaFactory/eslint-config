const parse = (response) =>
	response.text().then((text) => {
		if (text === '') {
			throw new Error('Empty response');
		}
		return JSON.parse(text);
	});
