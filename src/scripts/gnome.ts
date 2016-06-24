/// <reference path="coordinates.ts"/>
/// <reference path="world_constants.ts"/>

class Gnome extends Phaser.Sprite {
	private _location: Point;
	set location(location: Point) {
		this._location = location;
		this.tweenToLocation().start();
	}
	get location(): Point {
		return this._location;
	}

	public direction: Direction = Direction.SE;

	constructor(game: Phaser.Game, x: number, y: number) {
		super(game, 0, 0, "gnome_facing_se");
		this.anchor.set(0.4, 1);
		this._location = new Point(x, y);
		let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(this.location);
		this.x = screenCoordinates.x + 60;
		this.y = screenCoordinates.y - 100;
		game.add.existing(this);
	}

	rotateLeft() {
		this.direction = Direction.rotateLeft(this.direction);
		this.faceDirection();
	}

	rotateRight() {
		this.direction = Direction.rotateRight(this.direction);
		this.faceDirection();
	}

	die(cause: CauseOfDeath) {
		this.game.tweens.removeFrom(this);
		let tween = this.tweenToLocation();

		switch (cause) {
			case (CauseOfDeath.FALLING):
				tween.onChildComplete.add(() => {
					if (this.location.x < 0 || this.location.y < 0) {
						this.sendToBack();
					}
				});
				tween.chain().to({y: this.y + 500, alpha: 0}, 500, Phaser.Easing.Quartic.In);
				break;
			case (CauseOfDeath.DROWNING):
				tween.onChildComplete.add(() => {
					this.loadTexture("gnome_drowning");
					this.anchor.y = 0.7;
				});
				tween.to({alpha: 0}, 500, Phaser.Easing.Quartic.Out);
				break;
		}

		tween.start();
		tween.onComplete.add(() => this.destroy(false), this);
	}

	private faceDirection() {
		switch (this.direction) {
			case Direction.NW:
				this.loadTexture("gnome_facing_nw");
				this.scale.x = 1;
				break;
			case Direction.NE:
				this.loadTexture("gnome_facing_nw");
				this.scale.x = -1;
				break;
			case Direction.SE:
				this.loadTexture("gnome_facing_se");
				this.scale.x = 1;
				break;
			case Direction.SW:
				this.loadTexture("gnome_facing_se");
				this.scale.x = -1;
				break;
		}
	}

	private tweenToLocation() {
		let tween = this.game.add.tween(this);
		let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(this.location);
		return tween.to({
			x: screenCoordinates.x + 60, y: screenCoordinates.y - 100,
		}, 500, Phaser.Easing.Quartic.Out);
	}
}

enum CauseOfDeath {
	FALLING,
	DROWNING
}
