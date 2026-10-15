const box = {
	get value() {
		this.reads += 1;
	},
};
box;
