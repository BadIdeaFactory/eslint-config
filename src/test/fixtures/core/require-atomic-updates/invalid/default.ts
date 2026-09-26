const holder = { value: 0 };
const run = async () => {
	holder.value += await Promise.resolve(1);
};
run;
