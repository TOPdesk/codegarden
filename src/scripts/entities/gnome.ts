/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>
/// <reference path="../gnome_code.ts"/>
/// <reference path="../world_constants.ts"/>

const GNOME_X_OFFSET = 60;
const GNOME_Y_OFFSET = -85;

class Gnome extends Phaser.Sprite {
	location: MapPoint;

	private _wateringCan: boolean = false;
	set wateringCan(wateringCan: boolean) {
		this._wateringCan = wateringCan;
		this.faceDirection();
	}
	get wateringCan(): boolean {
		return this._wateringCan;
	}

	private _floating = 0;
	set floating(floating: number) {
		this._floating = floating;
		this.faceDirection();
	}
	get floating(): number {
		return this._floating;
	}

	public codeStack: Command[];

	constructor(game: Phaser.Game, x: number, y: number, public direction: Direction, code: Command[]) {
		super(game, 0, 0, "gnome_regular_front");
		this.codeStack = code.slice();
		this.codeStack.reverse();

		this.faceDirection();
		this.anchor.set(0.5, 1);
		this.location = new MapPoint(x, y);
		let screenCoordinates: ScreenPoint = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(this.location);
		this.x = screenCoordinates.x + GNOME_X_OFFSET;
		this.y = screenCoordinates.y + GNOME_Y_OFFSET;
		this.game.add.tween(this).from({alpha: 0}, 500, Phaser.Easing.Quartic.Out, true);
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

	walkTo(newLocation: MapPoint) {
		this.location = newLocation;
		if (this.floating) {
			this.floating--;
		}
		this.tweenToLocation().start();
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
					this.game.add.sound("falling_gnome_scream").play();
				});
				tween.chain().to({y: this.y + 500, alpha: 0}, 500, Phaser.Easing.Quartic.In);
				break;
			case (CauseOfDeath.DROWNING):
				tween.onChildComplete.add(() => {
					this.loadTexture("gnome_drowning");
				});
				tween.to({alpha: 0}, 500, Phaser.Easing.Quartic.Out);
				break;
			case (CauseOfDeath.CODE_RAN_OUT):
				tween.to({alpha: 0}, 500, Phaser.Easing.Quartic.Out);
				break;
		}

		tween.start();
		tween.onComplete.add(() => this.destroy(false), this);
	}

	private faceDirection() {
		if (this.direction === Direction.NE || this.direction === Direction.SW) {
			this.scale.x = -1;
		}
		else {
			this.scale.x = 1;
		}

		let facingFront = (this.direction === Direction.SE || this.direction === Direction.SW);
		let gnomeTextureBase = (this.wateringCan ? "gnome_water" : "gnome_regular");
		let gnomeTexture = gnomeTextureBase + (facingFront ? "_front" : "_back");
		this.loadTexture(gnomeTexture);
		this.animations.add("walk");
	}

	private tweenToLocation() {
		this.animations.play("walk", 30, true);
		let tween = this.game.add.tween(this);
		let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(this.location);
		return tween.to({
			x: screenCoordinates.x + GNOME_X_OFFSET, y: screenCoordinates.y + GNOME_Y_OFFSET,
		}, WorldConstants.TURN_LENGTH_IN_MILLIS, Phaser.Easing.Linear.None);
	}
}

enum CauseOfDeath {
	NOTHING, //This should be the first one
	FALLING,
	DROWNING,
	CODE_RAN_OUT
}
