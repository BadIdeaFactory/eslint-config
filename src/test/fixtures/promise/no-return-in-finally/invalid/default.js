const save = (record) =>
	record.save().finally(() => {
		return record.unlock();
	});
