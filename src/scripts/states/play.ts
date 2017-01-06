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

			this.initializeButtons();
			this.initializeCodeEditor();
			this.drawSpawnButton();
		}

		initializeButtons() {
			let gnomeCodeButtons = document.getElementById("gnomeCodeButtons");
			gnomeCodeButtons.addEventListener("click", evt => this.handleCommandButtonClick(evt));


			Sortable.create(gnomeCodeButtons, {
				group: {
					name: "gnomeCode",
					pull: "clone",
					put: false
				},
				sort: false
			});

			PlayState.appendCommandToGui(gnomeCodeButtons, CommandType.WALK);
			PlayState.appendCommandToGui(gnomeCodeButtons, CommandType.LEFT);
			PlayState.appendCommandToGui(gnomeCodeButtons, CommandType.RIGHT);
			PlayState.appendCommandToGui(gnomeCodeButtons, CommandType.ACT);
		}

		initializeCodeEditor() {
			let codeEditor = document.getElementById("gnomeCodeEditor");
			let routine = this.gameWorld.spawnedGnomeRoutine["main"];
			Sortable.create(codeEditor, {
				group: {
					name: "gnomeCode",
					pull: false,
					put: true
				},
				animation: 150,
				onSort: (evt) => {
					let command = evt.from.id === "gnomeCodeEditor" ?
						routine.splice(evt.oldIndex, 1)[0] : new Command(parseInt(evt.item.dataset["commandType"]));
					routine.splice(evt.newIndex, 0, command);
				}
			});

			codeEditor.innerHTML = "";
			this.gameWorld.spawnedGnomeRoutine["main"].forEach(command => {
				PlayState.appendCommandToGui(codeEditor, command.type);
			});
			codeEditor.addEventListener("click", evt => this.handleCommandClick(evt));
		}

		drawSpawnButton() {
			let spawnButton = this.drawButton(94, 10, "play_button", () => this.gameWorld.spawnGnome());
			spawnButton.events.onInputOver.add(() => {
				this.gameWorld.toggleSpawnPointIndicator(true);
			});
			spawnButton.events.onInputOut.add(() => {
				this.gameWorld.toggleSpawnPointIndicator(false);
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

		private handleCommandButtonClick(evt: MouseEvent) {
			let target = evt.target as HTMLElement;
			if (!target.classList.contains("commandButton")) {
				return;
			}
			let gnomeCodeButtons = document.getElementById("gnomeCodeButtons");
			let commandType = parseInt(target.dataset["commandType"]);
			this.gameWorld.spawnedGnomeRoutine["main"].push(new Command(commandType));
			PlayState.appendCommandToGui(document.getElementById("gnomeCodeEditor"), commandType);
		}

		private handleCommandClick(evt: MouseEvent) {
			let target = evt.target as HTMLElement;
			if (!target.classList.contains("commandButton")) {
				return;
			}
			let editor = document.getElementById("gnomeCodeEditor");
			let index = Array.prototype.indexOf.call(editor.children, target);
			this.gameWorld.spawnedGnomeRoutine["main"].splice(index, 1);
			editor.removeChild(target);
		}

		private static appendCommandToGui(gui: HTMLElement, commandType: CommandType) {
			let button = document.createElement("DIV");
			button.classList.add("commandButton");
			button.classList.add(CommandType.imageClass(commandType));
			button.dataset["commandType"] = commandType.toString();
			gui.appendChild(button);
		}
	}
}
