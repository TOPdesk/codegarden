class Mushrooms extends GameObject {
	constructor(game: Phaser.Game, public model: MushroomModel) {
		super(game, model, "mushrooms_" + model.amount, true);
	}

	doAction(gnome: Gnome) {
		if (!this.model.amount && !gnome.wateringCan) {
			return false;
		}

		if (gnome.wateringCan) {
			ParticleEmitters.waterObject(this.game, this.x, this.y);
			gnome.wateringCan = false;
			if (this.model.amount < 3) {
				this.model.amount++;
			}
		}
		else {
			gnome.floating = 2;
			this.model.amount--;
		}
		this.updateTexture();
		return true;
	}

	determineTexture() {
		return "mushrooms_" + this.model.amount;
	}
}

interface MushroomModel extends GameObjectModel {
	amount: number;
}
