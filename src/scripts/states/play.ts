/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../gnome.ts"/>
/// <reference path="../gameworld.ts"/>

namespace States {
	const CAMERA_OFFSET_X = -400;
	const CAMERA_OFFSET_Y = -200;

	export class PlayState extends Phaser.State {
		private gameWorld: GameWorld;
		private gnome: Gnome;

		create() {
			this.game.camera.setPosition(CAMERA_OFFSET_X, CAMERA_OFFSET_Y);
			this.gameWorld = new GameWorld(this.game);
			this.gameWorld.loadLevel("example_level");
			this.gameWorld.level.renderStage(this.game);

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
			this.drawButton(10, 10, "control_forward", () => this.gameWorld.tryMove(this.gnome));
			this.drawButton(10, 94, "control_left", this.gnome.rotateLeft);
			this.drawButton(10, 178, "control_right", this.gnome.rotateRight);
		}

		private drawButton(x: number, y: number, pictureKey, trigger: Function) {
			let button = this.game.add.sprite(x, y, pictureKey, trigger);
			button.inputEnabled = true;
			button.fixedToCamera = true;
			button.events.onInputDown.add(trigger, this.gnome);
		}
	}
}
