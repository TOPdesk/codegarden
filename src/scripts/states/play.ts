/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>

namespace States {
	const BLOCK_WIDTH: number = 110;
	const BLOCK_HEIGHT: number = 68;
	const WORLD_ORIGIN_X: number = 300;
	const WORLD_ORIGIN_Y: number = 100;

	const COORDINATE_TRANSFORMER: CoordinateTransformer = new CoordinateTransformer(BLOCK_WIDTH, BLOCK_HEIGHT);

	class Gnome extends Phaser.Sprite {
		private location: Point = new Point(0, 0);
		private direction: Direction = Direction.SE;

		constructor(game: Phaser.Game, x: number, y: number) {
			super(game, x, y, "gnome_normal");
			this.anchor.setTo(.5, .5);
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

		moveForward() {
			let newLocation = this.location.getNeighbor(this.direction);
			this.location = newLocation;
			let screenCoordinates = COORDINATE_TRANSFORMER.map_to_screen(newLocation);
			this.game.add.tween(this).to({
				x: screenCoordinates.x + WORLD_ORIGIN_X + 60, y: screenCoordinates.y + WORLD_ORIGIN_Y,
			}, 500, Phaser.Easing.Quartic.Out).start();
		}

		private faceDirection() {
			switch (this.direction) {
				case Direction.NW:
					this.scale.x = -1;
					this.scale.y = -1;
					break;
				case Direction.NE:
					this.scale.x = 1;
					this.scale.y = -1;
					break;
				case Direction.SE:
					this.scale.x = 1;
					this.scale.y = 1;
					break;
				case Direction.SW:
					this.scale.x = -1;
					this.scale.y = 1;
					break;
			}
		}
	}

	export class PlayState extends Phaser.State {
		private gnome: Gnome;

		create() {
			let blocks = this.renderStage(5, 5);
			this.gnome = new Gnome(this.game, 360, 0);
			this.gnome.alpha = 0;
			this.game.tweens.pauseAll();
			//TODO _add is internal API that we should not be using in this way
			this.game.tweens._add[0].onComplete.add(function () {
				this.game.add.tween(this.gnome).to({ x: WORLD_ORIGIN_X + 60, y: WORLD_ORIGIN_Y, alpha: 1 }, 500, Phaser.Easing.Quartic.Out).start();
			}, this);

			this.drawButtons();
		}

		drawButtons() {
			let moveButton = this.game.add.sprite(10, 10, "control_forward");
			moveButton.inputEnabled = true;
			moveButton.events.onInputDown.add(this.gnome.moveForward, this.gnome);

			let rotateLeftButton = this.game.add.sprite(10, 94, "control_left");
			rotateLeftButton.inputEnabled = true;
			rotateLeftButton.events.onInputDown.add(this.gnome.rotateLeft, this.gnome);

			let rotateRightButton = this.game.add.sprite(10, 178, "control_right");
			rotateRightButton.inputEnabled = true;
			rotateRightButton.events.onInputDown.add(this.gnome.rotateRight, this.gnome);
		}

		renderStage(northWestWidth, southWestWidth) {
			let diffX = BLOCK_WIDTH / 2;
			let diffY = BLOCK_HEIGHT / 2;

			for (let nw = 0; nw < northWestWidth; nw++) {
				for (let sw = 0; sw < southWestWidth; sw++) {
					let finalPositionY = WORLD_ORIGIN_Y + (diffY * nw) + (diffY * sw);
					let block = this.game.add.sprite(WORLD_ORIGIN_X - (diffX * nw) + (diffX * sw), -100, "stage_block");
					this.game.add.tween(block).to({ y: finalPositionY }, this.rnd.integerInRange(1500, 2000), Phaser.Easing.Bounce.Out).start();
				}
			}
		}

	}
}
