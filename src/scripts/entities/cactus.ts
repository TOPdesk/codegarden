class Cactus extends GameObject {
	public readonly causeOfDeath = CauseOfDeath.CACTUS;

	set hasKilledGnome(value) {
		this.model.hasKilledGnome = value;
		this.game.time.events.add(WorldConstants.TURN_LENGTH_IN_MILLIS, () => {
			this.updateTexture();
		});
	}

	constructor(game: Phaser.Game, public model: CactusModel) {
		super(game, model, "cactus", true);
	}

	determineTexture() {
		let textureName = "cactus";
		if (this.model.isWatered) {
			textureName += "_flowery";
		}
		if (this.model.hasKilledGnome) {
			textureName += "_hat";
		}
		return textureName;
	}

	doAction(gnome: Gnome) {
		if (gnome.wateringCan) {
			ParticleEmitters.waterObject(this.game, this.x, this.y);
			this.model.isWatered = true;
			gnome.wateringCan = false;
			this.updateTexture();
			return true;
		}
		return false;
	}
}

interface CactusModel extends GameObjectModel {
	isWatered?: boolean;
	hasKilledGnome?: boolean;
}
