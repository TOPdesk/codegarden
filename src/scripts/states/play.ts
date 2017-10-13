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

		private currentLevel: string | object;
		private timeControls;
		private gnomeCodeEditor;

		init(initialLevel?: string | object) {
			this.currentLevel = initialLevel || LevelList.LEVELS[0];
		}

		create() {
			super.create();
			this.addHotKeys();

			this.gameWorld = new GameWorld(this.game);
			this.timeControls = new TimeControls(this.game, this.gameWorld, () => this.handleLevelVictory());
			this.gnomeCodeEditor = new GnomeCodeEditor(this.game, this.gameWorld);

			if (typeof(this.currentLevel) === "string") {
				this.gameWorld.loadLevel(this.currentLevel);
			}
			else {
				this.gameWorld.loadLevelFromDefinition(this.currentLevel);
			}

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
						this.gnomeCodeEditor.deleteLastCommand();
						break;
					default:
						this.handlePotentialCommandHotkey(event.keyCode);
				}
			};
		}

		private selectNextCodeBuilding() {
			if (!this.gameWorld.selectedBuilding) {
				this.gameWorld.selectCodeBuilding(this.gameWorld.level.codeBuildings[0]);
				return;
			}

			let nextIndex = this.gameWorld.level.codeBuildings.indexOf(this.gameWorld.selectedBuilding) + 1;
			if (nextIndex >= this.gameWorld.level.codeBuildings.length) {
				nextIndex = 0;
			}
			this.gameWorld.selectCodeBuilding(this.gameWorld.level.codeBuildings[nextIndex]);
		}

		private handlePotentialCommandHotkey(keyCode: number) {
			switch (keyCode) {
				case Phaser.Keyboard.LEFT:
					this.gnomeCodeEditor.appendCommand(new Command(CommandType.LEFT));
					break;
				case Phaser.Keyboard.RIGHT:
					this.gnomeCodeEditor.appendCommand(new Command(CommandType.RIGHT));
					break;
				case Phaser.Keyboard.UP:
					this.gnomeCodeEditor.appendCommand(new Command(CommandType.WALK));
					break;
				case Phaser.Keyboard.DOWN:
				case Phaser.Keyboard.SPACEBAR:
					this.gnomeCodeEditor.appendCommand(new Command(CommandType.ACT));
					break;
				default:
					let libraryIndex = keyCode - Phaser.Keyboard.ONE;
					if (libraryIndex < 0 || libraryIndex >= this.gameWorld.level.libraries.length) {
						return;
					}
					this.gnomeCodeEditor.appendCommand(new Command(CommandType.CALL_ROUTINE, [libraryIndex]));
			}
		}
	}
}
