/// <reference path="coordinates.ts"/>
/// <reference path="world_constants.ts"/>

const TREE_X_OFFSET = 56;
const TREE_Y_OFFSET = -88;

class Tree extends Phaser.Sprite {
	private _location: Point;
	set location(location: Point) {
		this._location = location;
		this.tweenToLocation().start();
	}
	get location(): Point {
		return this._location;
	}

	private _waterContent: number = 0;
	get waterContent(): number {
		return this._waterContent;
	}

	constructor(game: Phaser.Game, x: number, y: number) {
		super(game, 0, 0, "tree-1");
		this.anchor.set(0.5, 1);
		this._location = new Point(x, y);
		let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(this.location);
		this.x = screenCoordinates.x + TREE_X_OFFSET;
		this.y = screenCoordinates.y + TREE_Y_OFFSET;
		game.add.existing(this);
	}

  addWater() {
    this._waterContent = this._waterContent + 1;
    console.log(this._waterContent);
  }
