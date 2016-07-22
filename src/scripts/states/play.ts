/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../gnome.ts"/>
/// <reference path="../gnome_code.ts"/>
/// <reference path="../gameworld.ts"/>

namespace States {
	const CAMERA_OFFSET_X = -400;
	const CAMERA_OFFSET_Y = -200;

	export class PlayState extends Phaser.State {
		private gameWorld: GameWorld;
		private gnomeCode: GnomeCode;

		create() {
			this.game.camera.setPosition(CAMERA_OFFSET_X, CAMERA_OFFSET_Y);
			this.gameWorld = new GameWorld(this.game);
			this.gameWorld.loadLevel("example_level");

			let exampleRoutine: Array<Command> = [
				new Command(CommandType.ACT),
				new Command(CommandType.RIGHT),
				new Command(CommandType.WALK),
				new Command(CommandType.RIGHT),
				new Command(CommandType.ACT),
				new Command(CommandType.LEFT),
				new Command(CommandType.WALK)
			];
			exampleRoutine.push(new Command(CommandType.WALK));
			let exampleCode: { [key: string]: Array<Command> } = { main: exampleRoutine };
			this.gnomeCode = new GnomeCode(exampleCode);

			this.drawButtons();

			let timer = this.game.time.create();
			timer.loop(1000, () => {
				if (this.gameWorld.gnome.gnomeCode) {
					this.gameWorld.gnome.gnomeCode.executeNextCommand(this.gameWorld);
				}
				else {
					this.gameWorld.gnome.gnomeCode = new GnomeCode(exampleCode);
				}
			});
			timer.start();
		}

		drawButtons() {
			this.drawButton(10, 10, "control_forward", this.gameWorld.tryMove);
			this.drawButton(10, 94, "control_left", this.gameWorld.rotateLeft);
			this.drawButton(10, 178, "control_right", this.gameWorld.rotateRight);
			this.drawButton(10, 262, "control_action", this.gameWorld.doGnomeAction);
		}

		private drawButton(x: number, y: number, pictureKey, trigger: Function) {
			let button = this.game.add.sprite(x, y, pictureKey, trigger);
			button.inputEnabled = true;
			button.fixedToCamera = true;
			button.events.onInputDown.add(trigger, this.gameWorld);
		}
	}
}
