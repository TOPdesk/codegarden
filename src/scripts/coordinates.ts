/*
CoordinateTransformer is a class that takes tile sizes and
transforms a isometric tile coordinate system to screen coordinates
and back.

Example tile coordinate in ASCII art:

          (0,0)
     (0,1)     (1,0)
(0,2)     (1,1)     (2,0)
     (1,2)     (2,1)
          (2,2)

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

class CoordinateTransformer {
    half_tile_width: number;
    half_tile_height: number;
    
    constructor(tile_width, tile_height) {
        this.half_tile_width = tile_width / 2;
        this.half_tile_height = tile_height / 2;
    }
    
    map_to_screen(map: Point) {
        let screen: Point = new Point();
        screen.x = (map.x - map.y) * this.half_tile_width;
        screen.y = (map.x + map.y) * this.half_tile_height;
        return screen;
    }
    
    screen_to_map(screen: Point) {
        let map: Point = new Point();
        map.x = (screen.x / this.half_tile_width + screen.y / this.half_tile_height) / 2;
        map.y = (screen.y / this.half_tile_height - screen.x / this.half_tile_width) / 2;
        return map;
    }   
}
