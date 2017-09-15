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

	getFrontBackPrefix() {
		let isFacingFront = this.model.direction === Direction.SE || this.model.direction === Direction.SW;
		return isFacingFront ? "front" : "back";
	}

	eatGnome() {
		this.model.eating = 4;
		this.model.objectEating = "gnome";
		this.game.time.events.add(WorldConstants.FAST_TURN_LENGTH, () => {
			this.updateTexture();
		});
	}

	digestFood() {
		if (this.model.eating) {
			this.model.eating--;
			if (!this.model.eating) {
				this.updateTexture();
			}
			else {
				ParticleEmitters.chewing(this.game, this.x, this.y);
			}
		}
	}
}

interface SpookTreeModel extends GameObjectModel {
	direction: Direction;
	eating?: number; //Represents the amount of turns which the tree spends eating
	objectEating?: "frog" | "gnome";
}
