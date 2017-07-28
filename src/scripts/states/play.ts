/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../entities/gnome.ts"/>
/// <reference path="../gnome_code.ts"/>
/// <reference path="../gameworld.ts"/>
///<reference path="../../../node_modules/@types/sortablejs/index.d.ts"/>

namespace States {
	const CAMERA_OFFSET_X = -400;
	const CAMERA_OFFSET_Y = -300;

	export class PlayState extends Phaser.State {
		private gameWorld: GameWorld;
		private selectedCodeBuilding: CodeBuilding;

		private codeEditorSortable;

		private initialLevel: string | object;

		init(initialLevel?: string | object) {
			this.initialLevel = initialLevel || "tutorial_level_1";
		}

		create() {
			this.game.camera.setPosition(CAMERA_OFFSET_X, CAMERA_OFFSET_Y);
			this.game.stage.backgroundColor = 0xffffff;

			this.initializeEditor();
			this.drawSpawnButton();
			this.addHotKeys();

			document.getElementById("innerCodeEditor").addEventListener("click", evt => this.handleCommandClick(evt));

			this.gameWorld = new GameWorld(this.game);
			this.gameWorld.selectionListener = (building, libraries) => {
				this.selectedCodeBuilding = building;
				States.PlayState.cleanupCommandButtonBar();
				if (building) {
					this.initializeButtons(libraries);
				}
				this.showCodeInEditor();
			};
			if (typeof(this.initialLevel) === "string") {
				this.gameWorld.loadLevel(this.initialLevel);
			}
			else {
				this.gameWorld.loadLevelFromDefinition(this.initialLevel);
			}

			this.startWorldTimer();
		}

		private startWorldTimer() {
			let timer = this.game.time.create();
			timer.loop(WorldConstants.TURN_LENGTH_IN_MILLIS, () => {
				this.gameWorld.nextTick();
			});
			timer.start();
		}

		addHotKeys() {
			let innerCodeEditor = document.getElementById("innerCodeEditor");

			this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(() => {
				if (this.gameWorld.levelIsWon) {
					this.gameWorld.loadNextLevel();
				}
				else {
					this.gameWorld.resetGame();
				}
			}, this);

			this.game.input.keyboard.addKey(Phaser.Keyboard.TAB).onDown.add(() => {
				if (!this.selectedCodeBuilding) {
					this.gameWorld.selectCodeBuilding(this.gameWorld.level.codeBuildings[0]);
					return;
				}

				let index = this.gameWorld.level.codeBuildings.indexOf(this.selectedCodeBuilding);
				if (index + 1 >= this.gameWorld.level.codeBuildings.length) {
					this.gameWorld.selectCodeBuilding(this.gameWorld.level.codeBuildings[0]);
				}
				else {
					this.gameWorld.selectCodeBuilding(this.gameWorld.level.codeBuildings[index + 1]);
				}
			}, this);

			window.addEventListener("keydown", (event) => {
				if (!this.selectedCodeBuilding) {
					return;
				}

				let routine = this.selectedCodeBuilding.gnomeCode;
				let sizeLimit = this.selectedCodeBuilding.model.sizeLimit;
				let readonly = this.selectedCodeBuilding.model.readonly;
				PlayState.removePlaceholders(innerCodeEditor);
				if ((event.keyCode === 8 || event.keyCode === 46) && routine.length > 0 && !readonly) {
					innerCodeEditor.removeChild(innerCodeEditor.children[routine.length - 1]);
					routine.pop();
				}
				if (event.keyCode === 37 && routine.length < sizeLimit && !readonly) {
					PlayState.appendCommandToGui(innerCodeEditor, CommandType.LEFT);
					routine.push(new Command(CommandType.LEFT));
				}
				if (event.keyCode === 38 && routine.length < sizeLimit && !readonly) {
					PlayState.appendCommandToGui(innerCodeEditor, CommandType.WALK);
					routine.push(new Command(CommandType.WALK));
				}
				if (event.keyCode === 39 && routine.length < sizeLimit && !readonly) {
					PlayState.appendCommandToGui(innerCodeEditor, CommandType.RIGHT);
					routine.push(new Command(CommandType.RIGHT));
				}
				if ((event.keyCode === 40 || event.keyCode === 32) && routine.length < sizeLimit && !readonly) {
					PlayState.appendCommandToGui(innerCodeEditor, CommandType.ACT);
					routine.push(new Command(CommandType.ACT));
				}
				if ((event.keyCode >= 49 && event.keyCode < 58) && routine.length < sizeLimit && !readonly
					&& this.gameWorld.level.libraries.length > (event.keyCode - 49)) {
					PlayState.appendCommandToGui(innerCodeEditor, CommandType.CALL_ROUTINE, event.keyCode - 49);
					routine.push(new Command(CommandType.CALL_ROUTINE, [event.keyCode - 49]));
				}
				if ((event.keyCode >= 97 && event.keyCode < 106) && routine.length < sizeLimit && !readonly
					&& this.gameWorld.level.libraries.length > (event.keyCode - 97)) {
					PlayState.appendCommandToGui(innerCodeEditor, CommandType.CALL_ROUTINE, event.keyCode - 97);
					routine.push(new Command(CommandType.CALL_ROUTINE, [event.keyCode - 97]));
				}
				PlayState.appendPlaceholders(innerCodeEditor, this.selectedCodeBuilding.model.sizeLimit - routine.length);
			});
		}

		shutdown() {
			States.PlayState.cleanupCommandButtonBar();

			document.getElementById("mushroomSelectionHint").style.display = "none";
			let gnomeCodeEditor = document.getElementById("gnomeCodeEditor");
			gnomeCodeEditor.style.display = "none";
			let codeEditorClone = gnomeCodeEditor.cloneNode(true);
			gnomeCodeEditor.parentNode.replaceChild(codeEditorClone, gnomeCodeEditor);
		}

		static cleanupCommandButtonBar() {
			//Remove all listeners from the relevant DOM elements by cloning them
			let buttonBar = document.getElementById("gnomeCodeButtons");
			let buttonBarClone = buttonBar.cloneNode();
			buttonBar.parentNode.replaceChild(buttonBarClone, buttonBar);
			buttonBar.style.display = "none";
			document.getElementById("mushroomSelectionHint").style.display = "none";
		}

		initializeButtons(libraries: CodeBuilding[]) {
			let gnomeCodeButtons = document.getElementById("gnomeCodeButtons");
			gnomeCodeButtons.style.display = "block";
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
			for (let i = 0; i < libraries.length; i++) {
				PlayState.appendCommandToGui(gnomeCodeButtons, CommandType.CALL_ROUTINE, i);
			}
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
				filter: ".commandPlaceholder",
				onSort: (evt) => {
					let routine = this.selectedCodeBuilding.gnomeCode;
					let command = evt.from.id === "innerCodeEditor" ?
						routine.splice(evt.oldIndex, 1)[0] : this.parseCommandFromMouseEvent(evt);
					routine.splice(evt.newIndex, 0, command);

					PlayState.removePlaceholders(innerCodeEditor);

					if (routine.length > this.selectedCodeBuilding.model.sizeLimit) {
						routine.splice(this.selectedCodeBuilding.model.sizeLimit);
						while (innerCodeEditor.children.length > this.selectedCodeBuilding.model.sizeLimit) {
							innerCodeEditor.removeChild(innerCodeEditor.children.item(this.selectedCodeBuilding.model.sizeLimit));
						}
					}

					PlayState.appendPlaceholders(innerCodeEditor, this.selectedCodeBuilding.model.sizeLimit - routine.length);
				}
			});
		}

		parseCommandFromMouseEvent(event) {
			let commandType = parseInt(event.item.dataset["commandType"]);
			let command = event.item.dataset["libraryIndex"] ?
				new Command(commandType, [parseInt(event.item.dataset["libraryIndex"])]) : new Command(commandType);
			return command;
		}

		showCodeInEditor() {
			let outerEditor = document.getElementById("gnomeCodeEditor");
			outerEditor.style.display = this.selectedCodeBuilding ? "block" : "none";
			document.getElementById("mushroomSelectionHint").style.display = this.selectedCodeBuilding ? "none" : "block";
			if (!this.selectedCodeBuilding) {
				return;
			}

			outerEditor.classList.toggle("readonly", this.selectedCodeBuilding.model.readonly);
			outerEditor.classList.toggle("editable", !this.selectedCodeBuilding.model.readonly);
			this.updateCommandsLabel();
			let innerCodeEditor = document.getElementById("innerCodeEditor");
			innerCodeEditor.innerHTML = "";
			this.codeEditorSortable.options.disabled = this.selectedCodeBuilding.model.readonly;

			this.selectedCodeBuilding.gnomeCode.forEach(command => {
				PlayState.appendCommandToGui(innerCodeEditor, command.type, command.args[0]);
			});

			PlayState.appendPlaceholders(innerCodeEditor, this.selectedCodeBuilding.model.sizeLimit - this.selectedCodeBuilding.gnomeCode.length);
		}

		updateCommandsLabel() {
			let label = document.getElementById("codeEditorLabel");
			if (this.selectedCodeBuilding.model.readonly) {
				if (this.selectedCodeBuilding.model.type === "LIBRARY") {
					label.innerText = "This library routine can't be changed";
				}
				else {
					label.innerText = "This gnome's routine can't be changed";
				}
			}
			else {
				let commandsUsed: number = this.selectedCodeBuilding.gnomeCode.length;
				commandsUsed = commandsUsed > 0 ? commandsUsed : 0;
				if (this.selectedCodeBuilding.delay) {
					label.innerText = "This building has a delay of " + this.selectedCodeBuilding.delay;
				}
				else {
					label.innerText = "";
				}
				PlayState.appendPlaceholders(document.getElementById("innerCodeEditor"), this.selectedCodeBuilding.model.sizeLimit - commandsUsed);
			}
		}

		drawSpawnButton() {
			this.drawButton(94, 10, "play_button", () => {
				this.gameWorld.resetGame();
			});
		}

		private drawButton(x: number, y: number, pictureKey, trigger: Function): Phaser.Sprite {
			let button = this.game.add.sprite(x, y, WorldConstants.SPRITE_SHEET, pictureKey);
			button.inputEnabled = true;
			button.fixedToCamera = true;
			button.events.onInputDown.add(trigger, this);
			button.input.useHandCursor = true;
			return button;
		}

		private handleCommandButtonClick(evt: MouseEvent) {
			let target = evt.target as HTMLElement;
			if (!target.classList.contains("commandButton")
				|| this.selectedCodeBuilding.model.readonly
				|| this.selectedCodeBuilding.gnomeCode.length >= this.selectedCodeBuilding.model.sizeLimit
				|| this.gameWorld.getIfRunning()) {
				return;
			}

			let commandType = parseInt(target.dataset["commandType"]);
			let command = target.dataset["libraryIndex"] ?
				new Command(commandType, [parseInt(target.dataset["libraryIndex"])]) : new Command(commandType);
			this.selectedCodeBuilding.gnomeCode.push(command);
			PlayState.removePlaceholders(document.getElementById("innerCodeEditor"));

			PlayState.appendCommandToGui(document.getElementById("innerCodeEditor"), commandType, command.args[0]);
			this.updateCommandsLabel();
		}

		private handleCommandClick(evt: MouseEvent) {
			let target = evt.target as HTMLElement;
			if (!target.classList.contains("commandButton") || target.classList.contains("commandPlaceholder")
					|| this.selectedCodeBuilding.model.readonly || this.gameWorld.getIfRunning()) {
				return;
			}
			let editor = document.getElementById("innerCodeEditor");
			let index = Array.prototype.indexOf.call(editor.children, target);
			this.selectedCodeBuilding.gnomeCode.splice(index, 1);
			PlayState.removePlaceholders(document.getElementById("innerCodeEditor"));
			editor.removeChild(target);
			this.updateCommandsLabel();
		}

		private static appendCommandToGui(gui: HTMLElement, commandType: CommandType, libraryIndex?: number) {
			let button = document.createElement("DIV");
			button.classList.add("commandButton", "tooltipped");
			button.dataset["commandType"] = commandType.toString();
			button.classList.add(CommandType.imageClass(commandType));

			let tooltip = document.createElement("SPAN");
			tooltip.classList.add("tooltip");
			tooltip.innerText = CommandType.getTooltip(commandType);
			button.appendChild(tooltip);

			if (libraryIndex !== undefined) {
				button.dataset["libraryIndex"] = libraryIndex.toString();
				button.classList.add(CodeBuilding.getLibraryColor(libraryIndex));
			}
			gui.appendChild(button);
			return button;
		}

		private static removePlaceholders(gui: HTMLElement) {
			let placeholders: NodeListOf<Element> = gui.getElementsByClassName("commandPlaceholder");
			for (let i = placeholders.length - 1; i >= 0; i--) {
				gui.removeChild(placeholders[i]);
			}
		}

		private static appendPlaceholders(gui: HTMLElement, amount: number) {
			for (let i = 0; i < amount; i++) {
				let button = document.createElement("DIV");
				button.classList.add("commandButton");
				button.classList.add("commandPlaceholder");
				gui.appendChild(button);
			}
		}
	}
}
