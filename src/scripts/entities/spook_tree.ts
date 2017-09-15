/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>
/// <reference path="../world_constants.ts"/>
///<reference path="game_object.ts"/>

class SpookTree extends GameObject {
	determineTexture() {
		let textureName = "evil-tree-";
		if (this.model.eating) {
			textureName += `eating-${this.model.objectEating}-`;
		}
		textureName += this.getFrontBackPrefix();
		return textureName;
	}

	updateTexture() {
		super.updateTexture();
		if (this.model.direction === Direction.NE || this.model.direction === Direction.SE) {
			this.scale.x = -1;
		}
		else {
			this.scale.x = 1;
		}
	}

	constructor(game: Phaser.Game, public model: SpookTreeModel) {
		super(game, model, "evil-tree-front", false);
		this.updateTexture();
		game.add.existing(this);
	}

	doAction(gnome: Gnome) {
		if (gnome.wateringCan) {
			gnome.wateringCan = false;
			return true;
		}
		return false;
	}

	checkForGnomes(gnome: Gnome) {
		if (gnome && !this.model.eating) {
			this.model.eating = 3;
			//TODO the evil trees aren't working properly right now
			this.model.objectEating = "gnome";
		}
		else if (this.model.eating) {
			this.model.eating--;
		}
		this.updateTexture();
	}

	getFrontBackPrefix() {
		let isFacingFront = this.model.direction === Direction.SE || this.model.direction === Direction.SW;
		return isFacingFront ? "front" : "back";
	}
}

interface SpookTreeModel extends GameObjectModel {
	direction: Direction;
	eating?: number; //Represents the amount of turns left before the tree is done eating
	objectEating?: "frog" | "gnome";
}
