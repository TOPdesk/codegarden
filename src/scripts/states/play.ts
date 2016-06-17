/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>
/// <reference path="../gnome.ts"/>
/// <reference path="../world_constants.ts"/>

namespace States {
	export class PlayState extends Phaser.State {
		private gnome: Gnome;

		create() {
			let stage = new Array<Array<WorldConstants.BlockType>>(5);
			for (let x = 0; x < 5; x++) {
				stage[x] = new Array<WorldConstants.BlockType>(5);
				for (let y = 0; y < 5; y++) {
					stage[x][y] = WorldConstants.BlockType.GRASS;
				}
			}

			this.renderStage(stage);
			this.gnome = new Gnome(this.game, 360, 0);
			this.gnome.alpha = 0;
			this.game.tweens.pauseAll();
			console.log(this.game.tweens);

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

		renderStage(stage: Array<Array<WorldConstants.BlockType>>) {
			let stepsToSouthWest = stage.length;
			let stepsToSouthEast = stage[0].length;

			console.log(stepsToSouthWest);
			console.log(stepsToSouthEast);

			for (let southWestPosition = 0; southWestPosition < stepsToSouthWest; southWestPosition++) {
				for (let southEastPosition = 0; southEastPosition < stepsToSouthEast; southEastPosition++) {

					if (stage[southWestPosition][southEastPosition] === WorldConstants.BlockType.GRASS) {
						this.renderGrassBlock(southWestPosition, southEastPosition);
					}
				}
			}
		}

		renderGrassBlock(x: number, y: number) {
			let diffX = WorldConstants.BLOCK_WIDTH / 2;
			let diffY = WorldConstants.BLOCK_HEIGHT / 2;
			let positionX = WorldConstants.WORLD_ORIGIN_X - (diffX * x) + (diffX * y);
			let finalPositionY = WorldConstants.WORLD_ORIGIN_Y + (diffY * x) + (diffY * y);

			let block = this.game.add.sprite(positionX, -100, "stage_block");
			this.game.add.tween(block).to({ y: finalPositionY }, this.rnd.integerInRange(1500, 2000), Phaser.Easing.Bounce.Out).start();
		}

	}
}
