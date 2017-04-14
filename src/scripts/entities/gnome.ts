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
		this.determineSprite();
	}
	get wateringCan(): boolean {
		return this._wateringCan;
	}

	private _floating = 0;
	set floating(floating: number) {
		if (!this._floating && floating) {
			//Animation to start floating
			this.loadTexture("gnome_float_start_front");
			this.animations.add("walk");
			this.animations.play("walk", 10);
		}
		if (this._floating && !floating) {
			//Animation to stop floating
			this.loadTexture("gnome_float_start_front");
			this.animations.add("walk", [3, 2, 1, 0]);
			this.animations.play("walk", 10);
		}
		this._floating = floating;
	}
	get floating(): number {
		return this._floating;
	}

	public codeStack: Command[];

	constructor(game: Phaser.Game, x: number, y: number, public direction: Direction, code: Command[]) {
		super(game, 0, 0, "gnome_regular_front");
		this.codeStack = code.slice();
		this.codeStack.reverse();

		this.determineSprite();
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
		this.determineSprite();
	}

	rotateRight() {
		this.direction = Direction.rotateRight(this.direction);
		this.determineSprite();
	}

	delay() {
		this.determineSprite();
	}

	walkTo(newLocation: MapPoint) {
		this.location = newLocation;
		this.animations.play("walk", 30, true);
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

	private determineSprite() {
		if (this.direction === Direction.NE || this.direction === Direction.SW) {
			this.scale.x = -1;
		}
		else {
			this.scale.x = 1;
		}

		let facingFront = (this.direction === Direction.SE || this.direction === Direction.SW);

		let gnomeTextureBase = (this.wateringCan ? "gnome_water" : "gnome_regular");
		let gnomeTexture = gnomeTextureBase + (facingFront ? "_front" : "_back");
		if (this.floating) {
			gnomeTexture = "gnome_floating_front";
		}
		this.loadTexture(gnomeTexture);
		if (this.floating) {
			this.animations.add("walk");
			this.animations.play("walk", 10, true);
		}
		else {
			this.animations.add("walk");
		}
	}

	private tweenToLocation() {
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
