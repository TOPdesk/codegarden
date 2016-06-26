/*
CoordinateTransformer is a class that takes tile sizes and
transforms a isometric tile coordinate system to screen coordinates
and back.

Example tile coordinate in ASCII art:

  NW      (0,0)      NE
     (0,1)     (1,0)
(0,2)     (1,1)     (2,0)
     (1,2)     (2,1)
  SW      (2,2)      SE

Example of usage:

let ct: CoordinateTransformer = new CoordinateTransformer(110, 68);
let p: Point = new Point(0, 0)
let q: Point = ct.map_to_screen(p);
document.body.innerHTML = q.x + " " + q.y;
*/

class Point {
	constructor(public x: number, public y: number) {}

	getNeighbor(direction: Direction) {
		return new Point(this.x + Direction.getXDelta(direction), this.y + Direction.getYDelta(direction));
	}
};

enum Direction {
	//These should be in ascending order of right rotation!
	NW,
	NE,
	SE,
	SW
}
namespace Direction {
	export function rotateRight(direction: Direction) {
		return (direction + 1) % 4;
	}

	export function rotateLeft(direction: Direction) {
		return (direction + 3) % 4;
	}

	export function getXDelta(direction: Direction) {
		switch (direction) {
			case Direction.NW:
				return -1;
			case Direction.SE:
				return 1;
			default:
				return 0;
		}
	}

	export function getYDelta(direction: Direction) {
		switch (direction) {
			case Direction.NE:
				return -1;
			case Direction.SW:
				return 1;
			default:
				return 0;
		}
	}
}

class CoordinateTransformer {
	private halfTileWidth: number;
	private halfTileHeight: number;

	constructor(tileWidth, tileHeight) {
		this.halfTileWidth = tileWidth / 2;
		this.halfTileHeight = tileHeight / 2;
	}

	map_to_screen(map: Point): Point {
		let x = (map.x - map.y) * this.halfTileWidth;
		let y = (map.x + map.y) * this.halfTileHeight;
		return new Point(x, y);
	}

	screen_to_map(screen: Point): Point {
		let x = (screen.x / this.halfTileWidth + screen.y / this.halfTileHeight) / 2;
		let y = (screen.y / this.halfTileHeight - screen.x / this.halfTileWidth) / 2;
		return new Point(x, y);
	}
}
