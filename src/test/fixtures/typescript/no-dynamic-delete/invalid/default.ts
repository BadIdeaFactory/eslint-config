const forget = (scores: Record<string, number>, name: string): void => {
	delete scores[name];
};
