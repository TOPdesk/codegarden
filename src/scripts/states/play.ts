/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>
/// <reference path="../gnome.ts"/>
/// <reference path="../world_constants.ts"/>

namespace States {
	const CAMERA_OFFSET_X = -400;
	const CAMERA_OFFSET_Y = -100;

	export class PlayState extends Phaser.State {
		private gnome: Gnome;

		create() {
			this.game.camera.setPosition(CAMERA_OFFSET_X, CAMERA_OFFSET_Y);
			let level = this.game.cache.getJSON("example_level").LEVEL_DEFINITION;

			let stage = new Array<Array<WorldConstants.BlockType>>();
			for (let row = 0; row < level.layout.length; row++) {
				if (level.layout[row] === undefined) {
					break;
				}
				stage[row] = new Array<WorldConstants.BlockType>();
				for (let column = 0; column < level.layout[0].length; column++) {
					stage[row][column] = Number(level.layout[row][column]);
				}
			}

			this.renderStage(stage);
			this.gnome = new Gnome(this.game, 60, 0);
			this.gnome.alpha = 0;
			this.game.tweens.pauseAll();

			//TODO _add is internal API that we should not be using in this way
			this.game.tweens._add[0].onComplete.add(function () {
				this.game.add.tween(this.gnome).to({ alpha: 1 }, 500, Phaser.Easing.Quartic.Out).start();
			}, this);

			this.drawButtons();
		}

		drawButtons() {
			this.drawButton(10, 10, "control_forward", this.gnome.moveForward);
			this.drawButton(10, 94, "control_left", this.gnome.rotateLeft);
			this.drawButton(10, 178, "control_right", this.gnome.rotateRight);
		}

		private drawButton(x: number, y: number, pictureKey, trigger: Function) {
			let button = this.game.add.sprite(x, y, pictureKey, trigger);
			button.inputEnabled = true;
			button.fixedToCamera = true;
			button.events.onInputDown.add(trigger, this.gnome);
		}

		renderStage(stage: Array<Array<WorldConstants.BlockType>>) {
			let rows = stage.length;
			let columns = stage[0].length;

			for (let row = 0; row < rows; row++) {
				for (let column = 0; column < columns; column++) {
					this.renderBlock(column, row, stage[row][column]);
				}
			}
		}

		renderBlock(x: number, y: number, blockType: WorldConstants.BlockType) {
			let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(new Point(x, y));
			let block = this.game.add.sprite(screenCoordinates.x, -100, this.getBlockSprite(blockType));
			block.anchor.y = 1;
			this.game.add.tween(block).to({ y: screenCoordinates.y }, this.rnd.integerInRange(1500, 2000), Phaser.Easing.Bounce.Out).start();
		}

		private getBlockSprite(blockType: WorldConstants.BlockType): string {
			switch (blockType) {
				case WorldConstants.BlockType.GRASS:
					return "stage_block";
				case WorldConstants.BlockType.WATER:
					return "water_block";
				default: return "stage_block"; //TODO throw an error instead?
			}
		}
	}
}
