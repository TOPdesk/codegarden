/// <reference path="../scripts/coordinates.ts" />
/// <reference path="../../node_modules/@types/jasmine/index.d.ts" />

function comparePoints(expected: Point, actual: Point): void {
	expect(actual).toEqual(
		jasmine.objectContaining({
			x: expected.x,
			y: expected.y
		})
	);
}

describe("Neighbors of point x=1, y=1", () => {
	const POINT: MapPoint = new MapPoint(1, 1);

	it("is x=0, y=1 at NW", () => {
		comparePoints(new MapPoint(0, 1), POINT.getNeighbor(Direction.NW));
	});
	it("is x=1, y=0 at NE", () => {
		comparePoints(new MapPoint(1, 0), POINT.getNeighbor(Direction.NE));
	});
	it("is x=2, y=1 at SE", () => {
		comparePoints(new MapPoint(2, 1), POINT.getNeighbor(Direction.SE));
	});
	it("is x=1, y=2 at SW", () => {
		comparePoints(new MapPoint(1, 2), POINT.getNeighbor(Direction.SW));
	});
});

describe("Right rotation of Direction starting from NW", () => {
	let direction: Direction = Direction.NW;

	it("is first NE ", () => {
		direction = Direction.rotateRight(direction);
		expect(direction).toBe(Direction.NE);
	});
	it("is SE then", () => {
		direction = Direction.rotateRight(direction);
		expect(direction).toBe(Direction.SE);
	});
	it("is SW then", () => {
		direction = Direction.rotateRight(direction);
		expect(direction).toBe(Direction.SW);
	});
	it("is NW again", () => {
		direction = Direction.rotateRight(direction);
		expect(direction).toBe(Direction.NW);
	});
});

describe("Left rotation of Direction starting from NW", () => {
	let direction: Direction;
	beforeAll(() => direction = Direction.NW);

	it("is first SW ", () => {
		direction = Direction.rotateLeft(direction);
		expect(direction).toBe(Direction.SW);
	});
	it("is SE then", () => {
		direction = Direction.rotateLeft(direction);
		expect(direction).toBe(Direction.SE);
	});
	it("is NE then", () => {
		direction = Direction.rotateLeft(direction);
		expect(direction).toBe(Direction.NE);
	});
	it("is NW again", () => {
		direction = Direction.rotateLeft(direction);
		expect(direction).toBe(Direction.NW);
	});
});

describe("X delta when moving to Directions", () => {
	it("is -1 when NW", () => {
		expect(Direction.getXDelta(Direction.NW)).toBe(-1);
	});
	it("is 0 when NE", () => {
		expect(Direction.getXDelta(Direction.NE)).toBe(0);
	});
	it("is 1 when SE", () => {
		expect(Direction.getXDelta(Direction.SE)).toBe(1);
	});
	it("is 0 when SW", () => {
		expect(Direction.getXDelta(Direction.SW)).toBe(0);
	});
});

describe("Y delta when moving to Directions", () => {
	it("is 0 when NW", () => {
		expect(Direction.getYDelta(Direction.NW)).toBe(0);
	});
	it("is -1 when NE", () => {
		expect(Direction.getYDelta(Direction.NE)).toBe(-1);
	});
	it("is 0 when SE", () => {
		expect(Direction.getYDelta(Direction.SE)).toBe(0);
	});
	it("is 1 when SW", () => {
		expect(Direction.getYDelta(Direction.SW)).toBe(1);
	});
});

describe("CoordinateTransformer", () => {
	let transformer: CoordinateTransformer = new CoordinateTransformer(25, 50);

	it("Returns correct screen coordinates on map coordinates(x=0, y=0)", () => {
		comparePoints(transformer.map_to_screen(new MapPoint(0, 0)), new ScreenPoint(0, 0));
	});
	it("Returns correct screen coordinates on map coordinates(x=0, y=1)", () => {
		comparePoints(transformer.map_to_screen(new MapPoint(0, 1)), new ScreenPoint(-12.5, 25));
	});
	it("Returns correct screen coordinates on map coordinates(x=1, y=0)", () => {
		comparePoints(transformer.map_to_screen(new MapPoint(1, 0)), new ScreenPoint(12.5, 25));
	});
	it("Returns correct screen coordinates on map coordinates(x=2, y=1)", () => {
		comparePoints(transformer.map_to_screen(new MapPoint(2, 1)), new ScreenPoint(12.5, 75));
	});
	it("Returns correct screen coordinates on map coordinates(x=0, y=2)", () => {
		comparePoints(transformer.map_to_screen(new MapPoint(0, 2)), new ScreenPoint(-25, 50));
	});
});
