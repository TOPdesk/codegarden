/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../entities/gnome.ts"/>
/// <reference path="../gnome_code.ts"/>
/// <reference path="../gameworld.ts"/>
///<reference path="../../../node_modules/@types/sortablejs/index.d.ts"/>

namespace States {
	const CAMERA_OFFSET_X = -400;
	const CAMERA_OFFSET_Y = -300;

	export class PlayState extends Phaser.State {
		private gameWorld: GameWorld;
		private selectedSpawnPoint: House;
		private spawnIndicator: Phaser.Graphics;

		private codeEditorSortable;

		private initialLevel: string;

		init(initialLevel?: string) {
			this.initialLevel = initialLevel || "tutorial_level_1";
		}

		create() {
			this.game.camera.setPosition(CAMERA_OFFSET_X, CAMERA_OFFSET_Y);

			this.gameWorld = new GameWorld(this.game);
			this.gameWorld.loadLevel(this.initialLevel);

			this.initializeSpawnIndicator();
			this.initializeButtons();
			this.initializeEditor();
			this.drawSpawnButton();

			document.getElementById("innerCodeEditor").addEventListener("click", evt => this.handleCommandClick(evt));

			this.gameWorld.selectionListener = house => {
				this.selectedSpawnPoint = house;
				this.toggleSpawnIndicator(house);
				document.getElementById("gnomeCodeButtons").style.display = house ? "block" : "none";
				this.showCodeInEditor();
			};
		}

		shutdown() {
			//Remove all listeners from the relevant DOM elements by cloning them
			let codeButtonBar = document.getElementById("gnomeCodeButtons");
			let buttonBarClone = codeButtonBar.cloneNode();
			codeButtonBar.parentNode.replaceChild(buttonBarClone, codeButtonBar);

			let gnomeCodeEditor = document.getElementById("gnomeCodeEditor");
			gnomeCodeEditor.style.display = "none";
			let codeEditorClone = gnomeCodeEditor.cloneNode(true);
			gnomeCodeEditor.parentNode.replaceChild(codeEditorClone, gnomeCodeEditor);
		}

		initializeButtons() {
			let gnomeCodeButtons = document.getElementById("gnomeCodeButtons");
			gnomeCodeButtons.addEventListener("click", (evt) => this.handleCommandButtonClick(evt));

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

		initializeEditor() {
			let innerCodeEditor = document.getElementById("innerCodeEditor");
			this.codeEditorSortable = Sortable.create(innerCodeEditor, {
				group: {
					name: "gnomeCode",
					pull: false,
					put: true
				},
				animation: 150,
				onSort: (evt) => {
					let routine = this.selectedSpawnPoint.gnomeCode;
					let command = evt.from.id === "innerCodeEditor" ?
						routine.splice(evt.oldIndex, 1)[0] : new Command(parseInt(evt.item.dataset["commandType"]));
					routine.splice(evt.newIndex, 0, command);

					if (routine.length > this.selectedSpawnPoint.model.sizeLimit) {
						routine.splice(this.selectedSpawnPoint.model.sizeLimit);
						while (innerCodeEditor.children.length > this.selectedSpawnPoint.model.sizeLimit) {
							innerCodeEditor.removeChild(innerCodeEditor.children.item(this.selectedSpawnPoint.model.sizeLimit));
						}
					}

					this.updateCommandsLabel();
				}
			});
		}

		showCodeInEditor() {
			let outerEditor = document.getElementById("gnomeCodeEditor");
			outerEditor.style.display = this.selectedSpawnPoint ? "block" : "none";
			if (!this.selectedSpawnPoint) {
				return;
			}

			outerEditor.classList.toggle("readonly", this.selectedSpawnPoint.model.readonly);
			outerEditor.classList.toggle("editable", !this.selectedSpawnPoint.model.readonly);
			this.updateCommandsLabel();
			let innerCodeEditor = document.getElementById("innerCodeEditor");
			innerCodeEditor.innerHTML = "";
			this.codeEditorSortable.options.disabled = this.selectedSpawnPoint.model.readonly;

			this.selectedSpawnPoint.gnomeCode.forEach(command => {
				PlayState.appendCommandToGui(innerCodeEditor, command.type);
			});
		}

		updateCommandsLabel() {
			let label = document.getElementById("codeEditorLabel");
			if (this.selectedSpawnPoint.model.readonly) {
				label.innerText = "This gnome's routine can't be changed";
			}
			else {
				label.innerText = this.selectedSpawnPoint.gnomeCode.length + "/" + this.selectedSpawnPoint.model.sizeLimit + " commands used";
			}
		}

		initializeSpawnIndicator() {
			this.spawnIndicator = this.game.add.graphics(0, 0);
			this.spawnIndicator.beginFill(0xffff00, 0.3);
			this.spawnIndicator.moveTo(0, -1000);
			this.spawnIndicator.lineTo(0, -100);
			this.spawnIndicator.lineTo(WorldConstants.BLOCK_WIDTH / 2, -100 + WorldConstants.BLOCK_HEIGHT / 2);
			this.spawnIndicator.lineTo(WorldConstants.BLOCK_WIDTH, -100);
			this.spawnIndicator.lineTo(WorldConstants.BLOCK_WIDTH, -1000);
			this.spawnIndicator.endFill();

			this.spawnIndicator.alpha = 0;
		}

		toggleSpawnIndicator(house?: House) {
			if (house) {
				let spawnScreenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(house.location);
				if (this.spawnIndicator.x === spawnScreenCoordinates.x && this.spawnIndicator.y === spawnScreenCoordinates.y) {
					return;
				}
				this.spawnIndicator.x = spawnScreenCoordinates.x;
				this.spawnIndicator.y = spawnScreenCoordinates.y;
			}

			this.spawnIndicator.alpha = house ? 0 : 1;
			this.game.add.tween(this.spawnIndicator).to({alpha: house ? 1 : 0}, 300, null, true);
		}

		drawSpawnButton() {
			this.drawButton(94, 10, "play_button", () => this.gameWorld.spawnGnomes());
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
			if (!target.classList.contains("commandButton")
				|| this.selectedSpawnPoint.model.readonly
				|| this.selectedSpawnPoint.gnomeCode.length >= this.selectedSpawnPoint.model.sizeLimit) {
				return;
			}

			let commandType = parseInt(target.dataset["commandType"]);
			this.selectedSpawnPoint.gnomeCode.push(new Command(commandType));
			PlayState.appendCommandToGui(document.getElementById("innerCodeEditor"), commandType);
			this.updateCommandsLabel();
		}

		private handleCommandClick(evt: MouseEvent) {
			let target = evt.target as HTMLElement;
			if (!target.classList.contains("commandButton") || this.selectedSpawnPoint.model.readonly) {
				return;
			}
			let editor = document.getElementById("innerCodeEditor");
			let index = Array.prototype.indexOf.call(editor.children, target);
			this.selectedSpawnPoint.gnomeCode.splice(index, 1);
			editor.removeChild(target);
			this.updateCommandsLabel();
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
