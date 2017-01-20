/// <reference path="../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="coordinates.ts"/>
/// <reference path="world_constants.ts"/>
///<reference path="gameObject.ts"/>

const TREE_IMAGE_PREFIX = "tree-";
const MAX_TREE_LEVEL = 6;

class Tree extends GameObject {
	get waterContent() {
		return this.model.waterContent;
	}

	set waterContent(newContent: number) {
		this.model.waterContent = newContent;
		this.displayWaterLevel();
		if (this.model.treeLevel < MAX_TREE_LEVEL && this.waterContent >= this.model.requiredWater) {
			this.model.treeLevel++;
			this.loadTexture(TREE_IMAGE_PREFIX + this.model.treeLevel);
			this.waterContent = 0;
			this.calculateRequiredWater();
		}
	}

	constructor(game: Phaser.Game, public model: TreeModel) {
		super(game, model, TREE_IMAGE_PREFIX + "1", false);
		if (!model.treeLevel) {
			model.treeLevel = 1;
		}
		if (!model.requiredWater) {
			this.calculateRequiredWater();
		}
		if (!model.waterContent) {
			model.waterContent = 0;
		}
		this.calculateRequiredWater();

		game.add.existing(this);
	}

	addWater() {
		this.waterContent = this.waterContent + 1;
	}

	calculateRequiredWater() {
		if (this.model.treeLevel >= MAX_TREE_LEVEL) {
			//No more growing
			this.model.requiredWater = 0;
		}
		else {
			this.model.requiredWater = this.model.treeLevel;
		}
	}

	private displayWaterLevel() {
		let dropY = this.y - 60;
		let initialDropX = this.x - 10 * this.model.requiredWater;
		for (let i = 0; i < this.model.requiredWater; i++) {
			let spriteKey = i < this.model.waterContent ? "waterdrop_filled" : "waterdrop_empty";
			let sprite = this.game.add.sprite(initialDropX + i * 20, dropY, spriteKey);
			let firstTween = this.game.add.tween(sprite).from({ alpha: 0 }, 50, null, true);
			let secondTween = this.game.add.tween(sprite).to({ alpha: 0 }, 300, null, false, 1000);

			secondTween.onComplete.add(() => sprite.destroy(false), this);
			firstTween.chain(secondTween);
		}
	}
}

interface TreeModel extends GameObjectModel {
	treeLevel: number;
	requiredWater: number;
	waterContent: number;
}
