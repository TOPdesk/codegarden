/// <reference path="../scripts/coordinates.ts" />
/// <reference path="../libs/dt-jasmine/jasmine.d.ts" />

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
    
    it("NW is x=0, y=1", () => {
        comparePoints(new MapPoint(0, 1), POINT.getNeighbor(Direction.NW));
    });
    it("NE is x=1, y=0", () => {
        comparePoints(new MapPoint(1, 0), POINT.getNeighbor(Direction.NE));
    });
    it("SE is x=2, y=1", () => {
        comparePoints(new MapPoint(2, 1), POINT.getNeighbor(Direction.SE));
    });
    it("SW is x=1, y=2", () => {
        comparePoints(new MapPoint(1, 2), POINT.getNeighbor(Direction.SW));
    });
});

describe("Right rotation of Direction starting from NW", () => {
    let direction: Direction = Direction.NW;

    it("first it's NE ", () => {
        direction = Direction.rotateRight(direction);
        expect(direction).toBe(Direction.NE);  
    });
    it("then it's SE ", () => {
        direction = Direction.rotateRight(direction);
        expect(direction).toBe(Direction.SE); 
    });
    it("then it's SW ", () => {
        direction = Direction.rotateRight(direction);
        expect(direction).toBe(Direction.SW); 
    });
    it("then it's NW again", () => {
        direction = Direction.rotateRight(direction);
        expect(direction).toBe(Direction.NW); 
    });
});

describe("Left rotation of Direction starting from NW", () => {
    let direction: Direction;
    beforeAll(() => direction = Direction.NW);

    it("first it's SW ", () => {
        direction = Direction.rotateLeft(direction);
        expect(direction).toBe(Direction.SW);  
    });
    it("then it's SE ", () => {
        direction = Direction.rotateLeft(direction);
        expect(direction).toBe(Direction.SE); 
    });
    it("then it's NE ", () => {
        direction = Direction.rotateLeft(direction);
        expect(direction).toBe(Direction.NE); 
    });
    it("then it's NW again", () => {
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