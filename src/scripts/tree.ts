/// <reference path="../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="coordinates.ts"/>
/// <reference path="world_constants.ts"/>

const TREE_X_OFFSET = 56;
const TREE_Y_OFFSET = -88;
const IMAGE_PREFIX = "tree-";
const MAX_TREE_LEVEL = 6;

class Tree extends Phaser.Sprite {
	private const TYPE = WorldConstants.ObjectType.TREE;

	private tweenToLocation: any;
	private _location: MapPoint;
	private requiredWater: number;

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

	set waterContent(newContent: number) {
		this._waterContent = newContent;
		if (this.waterContent === this.requiredWater) {
			console.log("Your tree is evolving...");
			this.loadTexture(IMAGE_PREFIX + this.requiredWater);
			this.waterContent = 0;
			this.updateRequiredWater();
		}
	}

	constructor(game: Phaser.Game, x: number, y: number) {
		super(game, 0, 0, IMAGE_PREFIX + "1");
		this.anchor.set(0.5, 1);
		this._location = new MapPoint(x, y);
		this.updateRequiredWater();
		let screenCoordinates: ScreenPoint = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(this.location);
		this.x = screenCoordinates.x + TREE_X_OFFSET;
		this.y = screenCoordinates.y + TREE_Y_OFFSET;
		game.add.existing(this);
	}

	addWater() {
		this.waterContent = this.waterContent + 1;
	}

	updateRequiredWater() {
		if (this.requiredWater === MAX_TREE_LEVEL) {
			//No more growing
			this.requiredWater = 1;
		}
		this.requiredWater = parseInt(this.key.substring(this.key.indexOf(IMAGE_PREFIX) + IMAGE_PREFIX.length)) + 1;
	}
}
