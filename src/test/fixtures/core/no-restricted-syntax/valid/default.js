const EXIT_FAILURE = 1;

function fail() {
	process.exitCode = EXIT_FAILURE;
	process.exit(EXIT_FAILURE);
}
