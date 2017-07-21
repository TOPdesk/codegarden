/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>
/// <reference path="../world_constants.ts"/>
///<reference path="game_object.ts"/>

class SpookTree extends GameObject {

	eating: number = 0;
	codestack: Command[] = [];

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
}

interface SpookTreeModel extends GameObjectModel {
	direction: Direction;
}
