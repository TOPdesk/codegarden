class Mushrooms extends GameObject {
	constructor(game: Phaser.Game, model: GameObjectModel) {
		super(game, model, "mushrooms", true)
	}

	doAction(gnome: Gnome) {
		gnome.floating = 2;
		return true;
	}
}
