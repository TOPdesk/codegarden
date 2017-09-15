/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>
/// <reference path="../gnome_code.ts"/>
/// <reference path="../world_constants.ts"/>

const GNOME_X_OFFSET = 60;
const GNOME_Y_OFFSET = -85;

const FLOATING_ANIMATION_FRAMERATE = 10;
const WALKING_ANIMATION_FRAMERATE = 30;

class Gnome extends Phaser.Sprite {
	public delayed = 0;
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
			this.animations.play("float_start_" + this.getFrontBackPrefix());
		}
		if (this._floating && !floating) {
			this.animations.play("float_stop_" + this.getFrontBackPrefix());
		}
		this._floating = floating;
	}
	get floating(): number {
		return this._floating;
	}

	public codeStack: Command[];

	constructor(game: Phaser.Game, x: number, y: number, public direction: Direction, code: Command[]) {
		super(game, 0, 0, WorldConstants.SPRITE_SHEET);
		this.codeStack = code.slice();
		this.codeStack.reverse();

		this.registerAnimations();

		this.determineSprite();
		this.anchor.set(0.5, 1);
		this.location = new MapPoint(x, y);
		let screenCoordinates: ScreenPoint = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(this.location);
		this.x = screenCoordinates.x + GNOME_X_OFFSET;
		this.y = screenCoordinates.y + GNOME_Y_OFFSET;
		game.add.existing(this);
	}

	private registerAnimations() {
		this.animations.add("floating_front",
			Phaser.Animation.generateFrameNames("gnome_floating_front_", 0, 3), FLOATING_ANIMATION_FRAMERATE, true);
		this.animations.add("float_start_front",
			Phaser.Animation.generateFrameNames("gnome_float_start_front_", 0, 3), FLOATING_ANIMATION_FRAMERATE);
		this.animations.add("float_stop_front",
			Phaser.Animation.generateFrameNames("gnome_float_start_front_", 3, 0), FLOATING_ANIMATION_FRAMERATE);

		this.animations.add("floating_back",
			Phaser.Animation.generateFrameNames("gnome_floating_back_", 0, 3), FLOATING_ANIMATION_FRAMERATE, true);
		this.animations.add("float_start_back",
			Phaser.Animation.generateFrameNames("gnome_float_start_back_", 0, 3), FLOATING_ANIMATION_FRAMERATE);
		this.animations.add("float_stop_back",
			Phaser.Animation.generateFrameNames("gnome_float_start_back_", 3, 0), FLOATING_ANIMATION_FRAMERATE);

		this.animations.add("gnome_regular_walk_front",
			Phaser.Animation.generateFrameNames("gnome_regular_walk_front_", 0, 3), WALKING_ANIMATION_FRAMERATE);
		this.animations.add("gnome_regular_walk_back",
			Phaser.Animation.generateFrameNames("gnome_regular_walk_back_", 0, 3), WALKING_ANIMATION_FRAMERATE);
		this.animations.add("gnome_wateringcan_walk_front",
			Phaser.Animation.generateFrameNames("gnome_wateringcan_walk_front_", 0, 3), WALKING_ANIMATION_FRAMERATE);
		this.animations.add("gnome_wateringcan_walk_back",
			Phaser.Animation.generateFrameNames("gnome_wateringcan_walk_back_", 0, 3), WALKING_ANIMATION_FRAMERATE);
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
		this.frameName = "gnome_waiting";
	}

	lookConfused() {
		ParticleEmitters.questionMarks(this.game, this.x, this.y);
	}

	readBook() {
		//There is no texture for a floating gnome reading a book... yet.
		if (!this.floating) {
			this.frameName = "gnome_reading";
		}
	}

	walkTo(newLocation: MapPoint) {
		this.location = newLocation;
		this.determineSprite(true);
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
						this.game.world.add(this); //Makes it possible to fall behind blocks
						this.sendToBack();
					}
					this.game.add.sound("falling_gnome_scream").play();
				});
				tween.chain().to({y: this.y + 500, alpha: 0}, 500, Phaser.Easing.Quartic.In);
				break;
			case (CauseOfDeath.DROWNING):
				tween.onChildComplete.add(() => {
					this.frameName = "gnome_drowning";
					this.game.add.sound("bubbles").play();
				});
				tween.to({alpha: 0}, 500, Phaser.Easing.Quartic.Out);
				break;
			case (CauseOfDeath.CACTUS):
				tween.onComplete.add(() => ParticleEmitters.beardExplosion(this.game, this.x, this.y));
				break;
			case (CauseOfDeath.CODE_RAN_OUT):
				tween.to({alpha: 0}, WorldConstants.FAST_TURN_LENGTH, Phaser.Easing.Quartic.Out);
				break;
		}

		tween.start();
		tween.onComplete.add(() => this.destroy(false), this);
	}

	private determineSprite(isWalking: boolean = false) {
		if (this.direction === Direction.NE || this.direction === Direction.SW) {
			this.scale.x = -1;
		}
		else {
			this.scale.x = 1;
		}

		if (this.floating) {
			this.animations.play("floating_" + this.getFrontBackPrefix());
			return;
		}

		let gnomeSpriteBase = (this.wateringCan ? "gnome_wateringcan_walk_" : "gnome_regular_walk_");
		let gnomeSprite = gnomeSpriteBase + this.getFrontBackPrefix();
		if (isWalking) {
			this.animations.play(gnomeSprite);
		}
		else {
			this.frameName = gnomeSprite + "_0";
		}
	}

	private tweenToLocation() {
		let tween = this.game.add.tween(this);
		let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(this.location);
		return tween.to({
			x: screenCoordinates.x + GNOME_X_OFFSET, y: screenCoordinates.y + GNOME_Y_OFFSET,
		}, WorldConstants.FAST_TURN_LENGTH, Phaser.Easing.Linear.None);
	}

	private getFrontBackPrefix() {
		let isFacingFront = this.direction === Direction.SE || this.direction === Direction.SW;
		return isFacingFront ? "front" : "back";
	}
}

enum CauseOfDeath {
	NOTHING, //Represents the gnome staying alive; This should be the first one
	FALLING,
	DROWNING,
	CODE_RAN_OUT,
	CACTUS
}
