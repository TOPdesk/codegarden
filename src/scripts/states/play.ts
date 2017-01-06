/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../gnome.ts"/>
/// <reference path="../gnome_code.ts"/>
/// <reference path="../gameworld.ts"/>
///<reference path="../../../node_modules/@types/sortablejs/index.d.ts"/>

namespace States {
	const CAMERA_OFFSET_X = -400;
	const CAMERA_OFFSET_Y = -300;

	export class PlayState extends Phaser.State {
		private gameWorld: GameWorld;

		create() {
			this.game.camera.setPosition(CAMERA_OFFSET_X, CAMERA_OFFSET_Y);
			this.gameWorld = new GameWorld(this.game);
			this.gameWorld.loadLevel("tutorial_level_1");

			let exampleCode = [
				new Command(CommandType.RIGHT),
				new Command(CommandType.WALK),
				new Command(CommandType.LEFT),
				new Command(CommandType.ACT),
				new Command(CommandType.LEFT),
				new Command(CommandType.LEFT),
				new Command(CommandType.ACT),
			];
			this.gameWorld.spawnedGnomeRoutine = { main: exampleCode };

			let codeEditor = document.getElementById("gnomeCodeEditor");
			let routine = this.gameWorld.spawnedGnomeRoutine["main"];
			Sortable.create(codeEditor, {
				animation: 150,
				onSort: (evt) => {
					let command = routine.splice(evt.oldIndex, 1);
					routine.splice(evt.newIndex, 0, command[0]);
				}
			});
			this.redrawCommandButtons();
			this.drawButtons();
		}

		redrawCommandButtons() {
			let codeEditor = document.getElementById("gnomeCodeEditor");

			codeEditor.innerHTML = "";
			this.gameWorld.spawnedGnomeRoutine["main"].forEach((command, index, array) => {
				let button = document.createElement("DIV");
				button.classList.add("commandButton");
				button.classList.add(CommandType.imageClass(command.type));
				button.addEventListener("click", () => {
					array.splice(index, 1);
					this.redrawCommandButtons();
				});
				codeEditor.appendChild(button);
			});
		}

		drawButtons() {
			this.addCommandButtonListener("commandButtonMoveForward", CommandType.WALK);
			this.addCommandButtonListener("commandButtonTurnLeft", CommandType.LEFT);
			this.addCommandButtonListener("commandButtonTurnRight", CommandType.RIGHT);
			this.addCommandButtonListener("commandButtonPerformAction", CommandType.ACT);

			let spawnButton = this.drawButton(94, 10, "play_button", () => this.gameWorld.spawnGnome());
			spawnButton.events.onInputOver.add(() => {
				this.gameWorld.toggleSpawnPointIndicator(true);
			});
			spawnButton.events.onInputOut.add(() => {
				this.gameWorld.toggleSpawnPointIndicator(false);
			});
		}

		private addCommandButtonListener(id: string, commandType: CommandType) {
			document.getElementById(id).addEventListener("click", () => {
				this.gameWorld.spawnedGnomeRoutine["main"].push(new Command(commandType));
				this.redrawCommandButtons();
			});
		}

		private drawButton(x: number, y: number, pictureKey, trigger: Function): Phaser.Sprite {
			let button = this.game.add.sprite(x, y, pictureKey);
			button.inputEnabled = true;
			button.fixedToCamera = true;
			button.events.onInputDown.add(trigger, this);
			button.input.useHandCursor = true;
			return button;
		}
	}
}
