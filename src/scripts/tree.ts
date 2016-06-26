/// <reference path="../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="coordinates.ts"/>
/// <reference path="world_constants.ts"/>

const TREE_X_OFFSET = 56;
const TREE_Y_OFFSET = -88;

class Tree extends Phaser.Sprite {
	private tweenToLocation: any;
	private _location: MapPoint;
	set location(location: MapPoint) {
		this._location = location;
		this.tweenToLocation().start();
	}
	get location(): MapPoint {
		return this._location;
	}

	private _waterContent: number = 0;
	get waterContent(): number {
		return this._waterContent;
	}

	constructor(game: Phaser.Game, x: number, y: number) {
		super(game, 0, 0, "tree-1");
		this.anchor.set(0.5, 1);
		this._location = new MapPoint(x, y);
		let screenCoordinates: ScreenPoint = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(this.location);
		this.x = screenCoordinates.x + TREE_X_OFFSET;
		this.y = screenCoordinates.y + TREE_Y_OFFSET;
		game.add.existing(this);
	}

  addWater() {
    this._waterContent = this._waterContent + 1;
    console.log(this._waterContent);
  }
}
