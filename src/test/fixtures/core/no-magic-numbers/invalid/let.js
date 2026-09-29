let retries = 3;

function retry() {
	retries -= 1;
	return retries;
}
