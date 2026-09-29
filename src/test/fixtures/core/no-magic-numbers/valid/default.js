const SECONDS_PER_MINUTE = 60;

function nextPage(pages, seconds) {
	const minutes = seconds / SECONDS_PER_MINUTE;
	if (pages.length === 0) {
		return minutes;
	}
	return pages.length + 1;
}
