interface Point {
	x: number;
}
const distance = (point: Point): number => Math.abs(point.x);
distance({ x: 0 });
