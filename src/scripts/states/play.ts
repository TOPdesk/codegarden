/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>

namespace States {

	export class PlayState extends Phaser.State {
		gnome;

		create() {
			let blocks = this.renderStage(5, 5);
			this.gnome = this.game.add.sprite(340, 0, "gnome_normal");
			this.gnome.alpha = 0;
			this.game.tweens.pauseAll();
			//TODO _add is internal API that we should not be using in this way
			this.game.tweens._add[0].onComplete.add(function () {
				this.game.add.tween(this.gnome).to({ x: blocks[0].x + 40, y: blocks[0].y - 40, alpha: 1 }, 500, "Quart.easeOut").start();
			}, this);
		}

		moveGnome(block) {
			// this.gnome.x = block.x + 40;
			// this.gnome.y = block.y - 40;
			this.game.add.tween(this.gnome).to({ x: block.x + 40, y: block.y - 40 }, 2000, "Quart.easeOut").start();
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
							this.moveGnome(block);
						}, this);
					block.input.pixelPerfectClick = true;
				}
			}

			return blocks;
		}

	}
}
