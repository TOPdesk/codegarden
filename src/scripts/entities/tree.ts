/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>
/// <reference path="../world_constants.ts"/>
///<reference path="game_object.ts"/>

const TREE_IMAGE_PREFIX = "tree-";
const MAX_TREE_LEVEL = 6;

class Tree extends GameObject {
	determineTexture() {
		return TREE_IMAGE_PREFIX + this.model.treeLevel;
	}

	constructor(game: Phaser.Game, public model: TreeModel) {
		super(game, Tree.addDefaults(model), TREE_IMAGE_PREFIX + model.treeLevel, false);
	}

	private static addDefaults(model: TreeModel) {
		if (!model.treeLevel) {
			model.treeLevel = 1;
		}
		return model;
	}

	doAction(gnome: Gnome) {
		if (gnome.wateringCan) {
			if (this.model.treeLevel < MAX_TREE_LEVEL) {
				this.model.treeLevel++;
			}
			ParticleEmitters.waterObject(this.game, this.x, this.y);
			this.updateTexture();
			gnome.wateringCan = false;
			return true;
		}
		return false;
	}
}

interface TreeModel extends GameObjectModel {
	treeLevel: number;
}
