const save = (record) =>
	record.save().finally(() => {
		record.unlock();
	});
