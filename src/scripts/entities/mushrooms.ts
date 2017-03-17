class Mushrooms extends GameObject {
	constructor(game: Phaser.Game, public model: MushroomModel) {
		super(game, model, "mushrooms_" + model.amount, true);
	}

	doAction(gnome: Gnome) {
		if (!this.model.amount && !gnome.wateringCan) {
			return false;
		}

		if (gnome.wateringCan) {
			gnome.wateringCan = false;
			if (this.model.amount < 3) {
				this.model.amount++;
			}
		}
		else {
			gnome.floating = 2;
			this.model.amount--;
		}
		this.loadTexture("mushrooms_" + this.model.amount);
		return true;
	}
}

interface MushroomModel extends GameObjectModel {
	amount: number;
}
