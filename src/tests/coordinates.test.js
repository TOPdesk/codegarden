function comparePoints(expected, actual) {
	expect(actual).to.deep.equal(expected);
}

describe("Getting the neighbor of a point x=1, y=1 in direction", () => {
	const POINT = new MapPoint(1, 1);
	
	it("NW gives x=0, y=1", () => {
		comparePoints(new MapPoint(0, 1), POINT.getNeighbor(Direction.NW));
	});
	it("NE gives x=1, y=0", () => {
		comparePoints(new MapPoint(1, 0), POINT.getNeighbor(Direction.NE));
	});
	it("SE gives x=2, y=1", () => {
		comparePoints(new MapPoint(2, 1), POINT.getNeighbor(Direction.SE));
	});
	it("SW gives x=1, y=2", () => {
		comparePoints(new MapPoint(1, 2), POINT.getNeighbor(Direction.SW));
	});
});

describe("Right rotation of Direction", () => {
	it("NW gives NE", () => {
		expect(Direction.rotateRight(Direction.NW)).to.equal(Direction.NE);
	});
	it("NE gives SE", () => {
		expect(Direction.rotateRight(Direction.NE)).to.equal(Direction.SE);
	});
	it("SE gives SW", () => {
		expect(Direction.rotateRight(Direction.SE)).to.equal(Direction.SW);
	});
	it("SW gives NW", () => {
		expect(Direction.rotateRight(Direction.SW)).to.equal(Direction.NW);
	});
});

describe("Left rotation of Direction", () => {
	let direction = Direction.NW;
	
	it("NW gives SW ", () => {
		expect(Direction.rotateLeft(Direction.NW)).to.equal(Direction.SW);
	});
	it("SW gives SE", () => {
		expect(Direction.rotateLeft(Direction.SW)).to.equal(Direction.SE);
	});
	it("SE gives NE", () => {
		expect(Direction.rotateLeft(Direction.SE)).to.equal(Direction.NE);
	});
	it("NE gives NW", () => {
		expect(Direction.rotateLeft(Direction.NE)).to.equal(Direction.NW);
	});
});

describe("X delta when moving in a Direction", () => {
	it("is -1 when NW", () => {
		expect(Direction.getXDelta(Direction.NW)).to.equal(-1);
	});
	it("is 0 when NE", () => {
		expect(Direction.getXDelta(Direction.NE)).to.equal(0);
	});
	it("is 1 when SE", () => {
		expect(Direction.getXDelta(Direction.SE)).to.equal(1);
	});
	it("is 0 when SW", () => {
		expect(Direction.getXDelta(Direction.SW)).to.equal(0);
	});
});

describe("Y delta when moving in a Direction", () => {
	it("is 0 when NW", () => {
		expect(Direction.getYDelta(Direction.NW)).to.equal(0);
	});
	it("is -1 when NE", () => {
		expect(Direction.getYDelta(Direction.NE)).to.equal(-1);
	});
	it("is 0 when SE", () => {
		expect(Direction.getYDelta(Direction.SE)).to.equal(0);
	});
	it("is 1 when SW", () => {
		expect(Direction.getYDelta(Direction.SW)).to.equal(1);
	});
});

describe("The CoordinateTransformer", () => {
	let transformer = new CoordinateTransformer(25, 50);
	
	it("returns correct screen coordinates on various isometric map coordinates", () => {
		comparePoints(transformer.map_to_screen(new MapPoint(0, 0)), new ScreenPoint(0, 0));
		comparePoints(transformer.map_to_screen(new MapPoint(0, 1)), new ScreenPoint(-12.5, 25));
		comparePoints(transformer.map_to_screen(new MapPoint(1, 0)), new ScreenPoint(12.5, 25));
		comparePoints(transformer.map_to_screen(new MapPoint(2, 1)), new ScreenPoint(12.5, 75));
		comparePoints(transformer.map_to_screen(new MapPoint(0, 2)), new ScreenPoint(-25, 50));
	});
});
