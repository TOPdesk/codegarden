/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>
/// <reference path="../world_constants.ts"/>
///<reference path="game_object.ts"/>

class SpookTree extends GameObject {

	eating: number = 0;
	objectEating: string = "";

	determineTexture() {
		if (this.eating && this.objectEating === "gnome") {
			return "evil-tree-eating";
		}
		else if (this.eating && this.objectEating === "frog") {
			return "evil-tree-eating frog";
		}
		else {
			return "evil-tree";
		}
	}

	constructor(game: Phaser.Game, public model: SpookTreeModel) {
		super(game, model, "evil-tree", false);

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
		this.determineTexture();
		this.updateTexture();
		if (gnome && this.eating === 0) {
			this.eating += 3;
			//TODO new animation for this death.
			gnome.die(CauseOfDeath.CODE_RAN_OUT);
			this.objectEating = "gnome";
			gnome.codeStack = [];
		}
		else if (this.eating) {
			this.eating--;
		}
	}
}

interface SpookTreeModel extends GameObjectModel {
	direction: Direction;
}
