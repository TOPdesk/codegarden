/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../gnome.ts"/>
/// <reference path="../gnome_code.ts"/>
/// <reference path="../gameworld.ts"/>

namespace States {
	const CAMERA_OFFSET_X = -400;
	const CAMERA_OFFSET_Y = -200;

	export class PlayState extends Phaser.State {
		private gameWorld: GameWorld;
		private spawnedGnomeRoutine: { [key: string]: Array<Command> };
		private gnomeCodeGraphics: Phaser.Graphics;
		private gnomeCodeButtonElements: Phaser.Group;

		create() {
			this.game.camera.setPosition(CAMERA_OFFSET_X, CAMERA_OFFSET_Y);
			this.gameWorld = new GameWorld(this.game);
			this.gameWorld.loadLevel("tutorial_level_1");

			let exampleCode = [
				new Command(CommandType.ACT),
				new Command(CommandType.WALK),
				new Command(CommandType.RIGHT),
				new Command(CommandType.WALK),
				new Command(CommandType.WALK),
			];
			this.spawnedGnomeRoutine = { main: exampleCode };

			this.gnomeCodeGraphics = this.game.add.graphics(20, 500);
			this.gnomeCodeGraphics.fixedToCamera = true;
			this.gnomeCodeButtonElements = this.game.add.group();
			this.redrawGnomeCodeGui();
			this.drawButtons();

			let timer = this.game.time.create();
			timer.loop(200, () => {
				if (this.gameWorld.gnome.gnomeCode) {
					this.gameWorld.gnome.gnomeCode.executeNextCommand(this.gameWorld);
				}
				else {
					this.gameWorld.gnome.gnomeCode = new GnomeCode(this.spawnedGnomeRoutine);
				}
			});
			timer.start();
		}

		redrawGnomeCodeGui() {
			this.gnomeCodeGraphics.clear();
			this.gnomeCodeButtonElements.removeChildren();

			let numberOfCommands = this.spawnedGnomeRoutine["main"].length;
			if (numberOfCommands < 1) {
				return;
			}

			let rectangleWidth = 10 + 84 * Math.min(numberOfCommands, 7);
			let rectangleHeight = 10 + 84 * Math.ceil(numberOfCommands / 7);
			this.gnomeCodeGraphics.lineStyle(4, 0xff5555, 1);
			this.gnomeCodeGraphics.beginFill(0xffffff, 1);
			this.gnomeCodeGraphics.drawRoundedRect(0, 0, rectangleWidth, rectangleHeight, 5);
			this.gnomeCodeGraphics.endFill();

			this.spawnedGnomeRoutine["main"].forEach((command, index, array) => this.drawGnomeRoutineCommand(command, index, array));
		}

		drawGnomeRoutineCommand(command: Command, index: number, array: Command[]) {
			let x = 30 + (index % 7) * 84;
			let y = 510 + Math.floor(index / 7) * 84;

			let button = this.drawButton(x, y, CommandType.imageKey(command.type), () => {
				array.splice(index, 1);
				this.redrawGnomeCodeGui();
			});
			this.gnomeCodeButtonElements.add(button);
		}

		drawButtons() {
			this.drawAddCommandButton(10, 10, CommandType.WALK);
			this.drawAddCommandButton(10, 94, CommandType.LEFT);
			this.drawAddCommandButton(10, 178, CommandType.RIGHT);
			this.drawAddCommandButton(10, 262, CommandType.ACT);
		}

		private drawAddCommandButton(x: number, y: number, type: CommandType) {
			this.drawButton(x, y, CommandType.imageKey(type), () => {
				this.spawnedGnomeRoutine["main"].push(new Command(type));
				this.redrawGnomeCodeGui();
			});
		}

		private drawButton(x: number, y: number, pictureKey, trigger: Function): Phaser.Sprite {
			let button = this.game.add.sprite(x, y, pictureKey);
			button.inputEnabled = true;
			button.fixedToCamera = true;
			button.events.onInputDown.add(trigger, this);
			return button;
		}
	}
}
