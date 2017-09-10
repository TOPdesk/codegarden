class Button extends GameObject {
	constructor(game: Phaser.Game, public model: GameObjectModel) {
		super(game, model, "action_button", false);
	}

	doAction(gnome: Gnome): boolean {
		return true;
	}
}