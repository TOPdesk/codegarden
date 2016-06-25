/// <reference path="../scripts/coordinates.ts" />
/// <reference path="../libs/dt-jasmine/jasmine.d.ts" />

describe("Neighbors of point x=1, y=1", () => {
    const POINT: Point = new Point(1, 1);
    
    function comparePoints(expected: Point, actual: Point): void {
         expect(actual).toEqual(
            jasmine.objectContaining({
                x: expected.x,
                y: expected.y
            })
        );
    }
    
    it("NW is x=0, y=1", () => {
        comparePoints(new Point(0, 1), POINT.getNeighbor(Direction.NW));
    });
    it("NE is x=1, y=0", () => {
        comparePoints(new Point(1, 0), POINT.getNeighbor(Direction.NE));
    });
    it("SE is x=2, y=1", () => {
        comparePoints(new Point(2, 1), POINT.getNeighbor(Direction.SE));
    });
    it("SW is x=1, y=2", () => {
        comparePoints(new Point(1, 2), POINT.getNeighbor(Direction.SW));
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