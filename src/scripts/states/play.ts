/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../coordinates.ts"/>
/// <reference path="../gnome.ts"/>
/// <reference path="../world_constants.ts"/>

namespace States {
	export class PlayState extends Phaser.State {
		private gnome: Gnome;

		create() {
			let stage: WorldConstants.BlockType[][] = [
				[0, 0, 0, 0, 1, 1],
				[0, 0, 0, 1, 1, 1],
				[0, 1, 0, 1, 0, 0],
				[0, 0, 0, 1, 1, 0],
				[0, 0, 0, 0, 1, 0],
				[0, 0, 1, 1, 1, 0],
			];

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

			for (let x = 0; x < stepsToSouthWest; x++) {
				for (let y = 0; y < stepsToSouthEast; y++) {
					this.renderBlock(x, y, stage[x][y]);
				}
			}
		}

		renderBlock(x: number, y: number, blockType: WorldConstants.BlockType) {
			let diffX = WorldConstants.BLOCK_WIDTH / 2;
			let diffY = WorldConstants.BLOCK_HEIGHT / 2;
			let positionX = WorldConstants.WORLD_ORIGIN_X - (diffX * x) + (diffX * y);
			let finalPositionY = WorldConstants.WORLD_ORIGIN_Y + (diffY * x) + (diffY * y);

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

		renderWaterBlock(x: number, y: number) {
			let diffX = WorldConstants.BLOCK_WIDTH / 2;
			let diffY = WorldConstants.BLOCK_HEIGHT / 2;
			let positionX = WorldConstants.WORLD_ORIGIN_X - (diffX * x) + (diffX * y);
			let finalPositionY = WorldConstants.WORLD_ORIGIN_Y + (diffY * x) + (diffY * y);

			let block = this.game.add.sprite(positionX, -100, "stage_block");
			this.game.add.tween(block).to({ y: finalPositionY }, this.rnd.integerInRange(1500, 2000), Phaser.Easing.Bounce.Out).start();
		}

	}
}
