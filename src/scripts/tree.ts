/// <reference path="../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="coordinates.ts"/>
/// <reference path="world_constants.ts"/>

const TREE_X_OFFSET = 56;
const TREE_Y_OFFSET = -88;
const TREE_IMAGE_PREFIX = "tree-";
const MAX_TREE_LEVEL = 6;

class Tree extends Phaser.Sprite {
	private tweenToLocation: any;
	private _location: MapPoint;
	private requiredWater: number;
	private treeLevel = 1;

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
		this.displayWaterLevel();
		if (this.treeLevel < MAX_TREE_LEVEL && this.waterContent >= this.requiredWater) {
			console.log("Your tree is evolving...");
			this.treeLevel++;
			this.loadTexture(TREE_IMAGE_PREFIX + this.treeLevel);
			this.waterContent = 0;
			this.calculateRequiredWater();
		}
	}

	constructor(game: Phaser.Game, x: number, y: number) {
		super(game, 0, 0, TREE_IMAGE_PREFIX + "1");
		this.anchor.set(0.5, 1);
		this._location = new MapPoint(x, y);
		this.calculateRequiredWater();
		let screenCoordinates: ScreenPoint = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(this.location);
		this.x = screenCoordinates.x + TREE_X_OFFSET;
		this.y = screenCoordinates.y + TREE_Y_OFFSET;
		game.add.existing(this);
	}

	addWater() {
		this.waterContent = this.waterContent + 1;
	}

	calculateRequiredWater() {
		if (this.treeLevel >= MAX_TREE_LEVEL) {
			//No more growing
			this.requiredWater = 0;
		}
		else {
			this.requiredWater = this.treeLevel;
		}
	}

	private displayWaterLevel() {
		let dropY = this.y - 60;
		let initialDropX = this.x - 10 * this.requiredWater;
		for (let i = 0; i < this.requiredWater; i++) {
			let spriteKey = i < this._waterContent ? "waterdrop_filled" : "waterdrop_empty";
			let sprite = this.game.add.sprite(initialDropX + i * 20, dropY, spriteKey);
			let firstTween = this.game.add.tween(sprite).from({ alpha: 0 }, 50, null, true);
			let secondTween = this.game.add.tween(sprite).to({ alpha: 0 }, 300, null, false, 1000);

			secondTween.onComplete.add(() => sprite.destroy(false), this);
			firstTween.chain(secondTween);
		}
	}
}
