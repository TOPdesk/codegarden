/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>

namespace States {

	class Gnome extends Phaser.Sprite {
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

		moveGnome(block) {
			this.game.add.tween(this).to({ x: block.x + 60, y: block.y }, 2000, "Quart.easeOut").start();
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
				this.game.add.tween(this.gnome).to({ x: blocks[0].x + 60, y: blocks[0].y, alpha: 1 }, 500, "Quart.easeOut").start();
			}, this);

			this.drawButtons();
		}

		drawButtons() {
			this.game.add.sprite(10, 10, "move_forward");

			let rotateLeftButton = this.game.add.sprite(10, 60, "rotate_left");
			rotateLeftButton.inputEnabled = true;
			rotateLeftButton.events.onInputDown.add(this.gnome.rotateLeft, this.gnome);

			let rotateRightButton = this.game.add.sprite(10, 110, "rotate_right");
			rotateRightButton.inputEnabled = true;
			rotateRightButton.events.onInputDown.add(this.gnome.rotateRight, this.gnome);
		}

		renderStage(northWestWidth, southWestWidth) {
			let diffX = 55;
			let diffY = 34;

			let startPositionX = 300;
			let startPositionY = 100;

			let blocks = new Array();

			for (let nw = 0; nw < northWestWidth; nw++) {
				for (let sw = 0; sw < southWestWidth; sw++) {
					let finalPositionY = startPositionY + (diffY * nw) + (diffY * sw);
					let block = this.game.add.sprite(startPositionX - (diffX * nw) + (diffX * sw), -100, "stage_block");
					this.game.add.tween(block).to({ y: finalPositionY }, this.rnd.integerInRange(1500, 2000), Phaser.Easing.Bounce.Out).start();

					blocks.push(block);
					block.inputEnabled = true;
					block.events.onInputDown.add(
						function () {
							this.gnome.moveGnome(block);
						}, this);
					block.input.pixelPerfectClick = true;
				}
			}

			return blocks;
		}

	}
}
