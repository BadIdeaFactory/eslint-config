const forget = (scores: Map<string, number>, name: string): void => {
	scores.delete(name);
};
