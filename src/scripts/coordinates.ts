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
let p: Point = new Point;
p.x = 0;
p.y = 0;
let q: Point = ct.map_to_screen(p);
document.body.innerHTML = q.x + " " + q.y;
*/

class Point {
	x: number;
	y: number;
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
}

class CoordinateTransformer {
	halfTileWidth: number;
	halfTileHeight: number;

	constructor(tileWidth, tileHeight) {
		this.halfTileWidth = tileWidth / 2;
		this.halfTileHeight = tileHeight / 2;
	}

	map_to_screen(map: Point) {
		let screen: Point = new Point();
		screen.x = (map.x - map.y) * this.halfTileWidth;
		screen.y = (map.x + map.y) * this.halfTileHeight;
		return screen;
	}

	screen_to_map(screen: Point) {
		let map: Point = new Point();
		map.x = (screen.x / this.halfTileWidth + screen.y / this.halfTileHeight) / 2;
		map.y = (screen.y / this.halfTileHeight - screen.x / this.halfTileWidth) / 2;
		return map;
	}
}
