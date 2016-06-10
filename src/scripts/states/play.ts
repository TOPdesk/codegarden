/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>
/// <reference path="../gnome.ts"/>
/// <reference path="../world_constants.ts"/>

namespace States {
	export class PlayState extends Phaser.State {
		private gnome: Gnome;

		create() {
			let blocks = this.renderStage(5, 5);
			this.gnome = new Gnome(this.game, 360, 0);
			this.gnome.alpha = 0;
			this.game.tweens.pauseAll();
			//TODO _add is internal API that we should not be using in this way
			this.game.tweens._add[0].onComplete.add(function () {
				this.game.add.tween(this.gnome).to({
					x: WorldConstants.WORLD_ORIGIN_X + 60, y: WorldConstants.WORLD_ORIGIN_Y, alpha: 1 }, 500, Phaser.Easing.Quartic.Out).start();
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
			let diffX = WorldConstants.BLOCK_WIDTH / 2;
			let diffY = WorldConstants.BLOCK_HEIGHT / 2;

			for (let nw = 0; nw < northWestWidth; nw++) {
				for (let sw = 0; sw < southWestWidth; sw++) {
					let finalPositionY = WorldConstants.WORLD_ORIGIN_Y + (diffY * nw) + (diffY * sw);
					let block = this.game.add.sprite(WorldConstants.WORLD_ORIGIN_X - (diffX * nw) + (diffX * sw), -100, "stage_block");
					this.game.add.tween(block).to({ y: finalPositionY }, this.rnd.integerInRange(1500, 2000), Phaser.Easing.Bounce.Out).start();
				}
			}
		}

	}
}
