const run = (f) => f;
run(() => {
	run(() => {
		run(() => {
			null;
		});
	});
});
