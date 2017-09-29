/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../entities/gnome.ts"/>
/// <reference path="../gnome_code.ts"/>
/// <reference path="../gameworld.ts"/>
///<reference path="../../../node_modules/@types/sortablejs/index.d.ts"/>
///<reference path="../level_list.ts"/>
///<reference path="./abstract_level_state.ts"/>

namespace States {
	export class PlayState extends States.AbstractLevelState {
		private gameWorld: GameWorld;
		private selectedCodeBuilding: CodeBuilding;

		private codeEditorSortable;

		private currentLevel: string | object;
		private timeControls;

		init(initialLevel?: string | object) {
			this.currentLevel = initialLevel || LevelList.LEVELS[0];
		}

		create() {
			super.create();
			this.initializeEditor();
			this.addHotKeys();

			document.getElementById("innerCodeEditor").addEventListener("click", evt => this.deleteClickedCommand(evt));

			this.gameWorld = new GameWorld(this.game);
			this.gameWorld.selectionListener = (building, libraries) => {
				this.selectedCodeBuilding = building;
				States.PlayState.cleanupCommandButtonBar();
				if (building) {
					this.initializeButtons(libraries);
				}
				this.showCodeInEditor();
			};
			if (typeof(this.currentLevel) === "string") {
				this.gameWorld.loadLevel(this.currentLevel);
			}
			else {
				this.gameWorld.loadLevelFromDefinition(this.currentLevel);
			}

			this.timeControls = new TimeControls(this.game, this.gameWorld, () => this.handleLevelVictory());
		}

		private handleLevelVictory() {
			let nextLevel = LevelList.getNext(this.currentLevel);
			Messages.show(this.game, "Good work! Click here to continue", {
				callback: () => {
					this.loadNextLevel();
				}
			});
			SaveGame.setLevel(nextLevel);
		}

		loadNextLevel() {
			let nextLevel = LevelList.getNext(this.currentLevel);
			if (nextLevel) {
				this.currentLevel = nextLevel;
				this.gameWorld.loadLevel(nextLevel);
			}
			else {
				this.game.state.start("menu");
			}
		}

		addHotKeys() {
			this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.TAB);
			this.game.input.keyboard.onUpCallback = (event) => {
				switch (event.keyCode) {
					case Phaser.Keyboard.ENTER:
						if (this.gameWorld.levelIsWon) {
							this.loadNextLevel();
						}
						else {
							this.timeControls.playFastOrPause();
						}
						break;
					case Phaser.Keyboard.TAB:
						this.selectNextCodeBuilding();
						break;
					case Phaser.Keyboard.BACKSPACE:
						this.deleteLastCommand();
						break;
					default:
						this.handlePotentialCommandHotkey(event.keyCode);
				}
			};
		}

		private selectNextCodeBuilding() {
			if (!this.selectedCodeBuilding) {
				this.gameWorld.selectCodeBuilding(this.gameWorld.level.codeBuildings[0]);
				return;
			}

			let nextIndex = this.gameWorld.level.codeBuildings.indexOf(this.selectedCodeBuilding) + 1;
			if (nextIndex >= this.gameWorld.level.codeBuildings.length) {
				nextIndex = 0;
			}
			this.gameWorld.selectCodeBuilding(this.gameWorld.level.codeBuildings[nextIndex]);
		}

		private deleteLastCommand() {
			if (!this.selectedCodeBuilding
				|| this.selectedCodeBuilding.model.readonly
				|| !this.selectedCodeBuilding.gnomeCode.length) {
				return;
			}

			this.selectedCodeBuilding.gnomeCode.pop();
			this.displaySelectedBuildingCode();
		}

		private handlePotentialCommandHotkey(keyCode: number) {
			if (!this.selectedCodeBuilding
				|| this.selectedCodeBuilding.model.readonly
				|| this.selectedCodeBuilding.gnomeCode.length >= this.selectedCodeBuilding.model.sizeLimit) {
				return;
			}

			switch (keyCode) {
				case Phaser.Keyboard.LEFT: this.appendCommand(CommandType.LEFT); break;
				case Phaser.Keyboard.RIGHT: this.appendCommand(CommandType.RIGHT); break;
				case Phaser.Keyboard.UP: this.appendCommand(CommandType.WALK); break;
				case Phaser.Keyboard.DOWN:
				case Phaser.Keyboard.SPACEBAR:
					this.appendCommand(CommandType.ACT);
					break;
				default:
					let libraryIndex = keyCode - Phaser.Keyboard.ONE;
					if (libraryIndex < 0 || libraryIndex >= this.gameWorld.level.libraries.length) {
						return;
					}
					this.appendCommand(CommandType.CALL_ROUTINE, libraryIndex);
			}
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

					if (routine.length > this.selectedCodeBuilding.model.sizeLimit) {
						routine.splice(this.selectedCodeBuilding.model.sizeLimit);
					}

					this.displaySelectedBuildingCode();
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
			this.displaySelectedBuildingCode();
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
				if (this.selectedCodeBuilding.delay) {
					label.innerText = "This building has a delay of " + this.selectedCodeBuilding.delay;
				}
				else {
					label.innerText = "";
				}
			}
		}

		private handleCommandButtonClick(evt: MouseEvent) {
			let target = evt.target as HTMLElement;
			if (!target.classList.contains("commandButton")
				|| this.selectedCodeBuilding.model.readonly
				|| this.selectedCodeBuilding.gnomeCode.length >= this.selectedCodeBuilding.model.sizeLimit
				|| this.gameWorld.hasLivingGnomes()) {
				return;
			}

			let commandType = parseInt(target.dataset["commandType"]);
			let command = target.dataset["libraryIndex"] ?
				new Command(commandType, [parseInt(target.dataset["libraryIndex"])]) : new Command(commandType);
			this.selectedCodeBuilding.gnomeCode.push(command);
			this.displaySelectedBuildingCode();
		}

		private deleteClickedCommand(evt: MouseEvent) {
			let target = evt.target as HTMLElement;
			if (!target.classList.contains("commandButton") || target.classList.contains("commandPlaceholder")
					|| this.selectedCodeBuilding.model.readonly || this.gameWorld.hasLivingGnomes()) {
				return;
			}
			let editor = document.getElementById("innerCodeEditor");
			let index = Array.prototype.indexOf.call(editor.children, target);
			this.selectedCodeBuilding.gnomeCode.splice(index, 1);
			this.displaySelectedBuildingCode();
		}

		private appendCommand(commandType: CommandType, libraryIndex?: number) {
			let routine = this.selectedCodeBuilding.gnomeCode;
			routine.push(new Command(commandType, libraryIndex !== undefined ? [libraryIndex] : undefined));
			this.displaySelectedBuildingCode();
		}

		private displaySelectedBuildingCode() {
			let innerCodeEditor = document.getElementById("innerCodeEditor");
			innerCodeEditor.innerHTML = "";
			this.codeEditorSortable.options.disabled = this.selectedCodeBuilding.model.readonly;

			this.selectedCodeBuilding.gnomeCode.forEach(command => {
				PlayState.appendCommandToGui(innerCodeEditor, command.type, command.args[0]);
			});

			let numberOfPlaceholders = this.selectedCodeBuilding.model.sizeLimit - this.selectedCodeBuilding.gnomeCode.length;
			for (let i = 0; i < numberOfPlaceholders; i++) {
				let button = document.createElement("DIV");
				button.classList.add("commandButton");
				button.classList.add("commandPlaceholder");
				innerCodeEditor.appendChild(button);
			}
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
	}
}
