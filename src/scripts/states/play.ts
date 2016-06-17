/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>
/// <reference path="../gnome.ts"/>
/// <reference path="../world_constants.ts"/>

namespace States {
	export class PlayState extends Phaser.State {
		private gnome: Gnome;

		create() {
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
			let positionX = screenCoordinates.x + WorldConstants.WORLD_ORIGIN_X;
			let finalPositionY = screenCoordinates.y + WorldConstants.WORLD_ORIGIN_Y;

			if (blockType === WorldConstants.BlockType.WATER) {
				finalPositionY += 20;
			}

			let block = this.game.add.sprite(positionX, -100, this.getBlockSprite(blockType));
			this.game.add.tween(block).to({ y: finalPositionY }, this.rnd.integerInRange(1500, 2000), Phaser.Easing.Bounce.Out).start();
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
