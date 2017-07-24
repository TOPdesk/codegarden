/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>
/// <reference path="../world_constants.ts"/>
///<reference path="game_object.ts"/>

class SpookTree extends GameObject {

	eating: number = 0;

	determineTexture() {
        //TODO: Change to spook tree sprite when finished.
		return "tree-1";
	}

	constructor(game: Phaser.Game, public model: SpookTreeModel) {
		super(game, model, "tree-1", false);

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
		if (gnome && this.eating === 0) {
			this.eating += 3;
			//TODO new animation for this death.
			gnome.die(CauseOfDeath.CODE_RAN_OUT);
		}
		else if (this.eating) {
			this.eating--;
		}
	}
}

interface SpookTreeModel extends GameObjectModel {
	direction: Direction;
}
