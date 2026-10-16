const fetchUser = (client, id) =>
	client.get(`/users/${id}`).then(
		(response) => response.body,
		() => undefined,
	);
