/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../gnome.ts"/>
/// <reference path="../gameworld.ts"/>

namespace States {
	const CAMERA_OFFSET_X = -400;
	const CAMERA_OFFSET_Y = -200;

	export class PlayState extends Phaser.State {
		private gameWorld: GameWorld;

		create() {
			this.game.camera.setPosition(CAMERA_OFFSET_X, CAMERA_OFFSET_Y);
			this.gameWorld = new GameWorld(this.game);
			this.gameWorld.loadLevel("example_level");

			this.drawButtons();
		}

		drawButtons() {
			this.drawButton(10, 10, "control_forward", () => this.gameWorld.tryMove());
			this.drawButton(10, 94, "control_left", this.gameWorld.rotateLeft);
			this.drawButton(10, 178, "control_right", this.gameWorld.rotateRight);
		}

		private drawButton(x: number, y: number, pictureKey, trigger: Function) {
			let button = this.game.add.sprite(x, y, pictureKey, trigger);
			button.inputEnabled = true;
			button.fixedToCamera = true;
			button.events.onInputDown.add(trigger, this.gameWorld);
		}
	}
}
