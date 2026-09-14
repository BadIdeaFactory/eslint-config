const sealed = (target: object): void => {
	Object.seal(target);
};
@sealed
class Defaults {
	static readonly retries = 3;
}
