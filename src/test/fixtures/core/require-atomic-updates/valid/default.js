const holder = { value: 0 };
const run = async () => {
	const next = await Promise.resolve(1);
	holder.value += next;
};
run;
