const fail = (): never => {
	throw new Error('x');
};
void fail();
