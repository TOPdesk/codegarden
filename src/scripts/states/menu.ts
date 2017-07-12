/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../gameworld.ts"/>

namespace States {
	const MENU_BUTTON_STYLE = {
		font: "32px MessageFont",
		fill: "#ff0044",
		align: "center"
	};

	export class MenuState extends Phaser.State {
		private gameWorld: GameWorld;
		private enteredCode = "";

		create(): void {
			this.game.camera.setPosition(-400, -300);
			this.gameWorld = new GameWorld(this.game);
			this.gameWorld.loadLevel("menu_level");
			this.game.stage.backgroundColor = 0xffffff;

			this.createMenuButton("Continue", 0, -250, this.continueGame);
			this.createMenuButton("Start Game", -250, 200, this.startGame);
			this.createMenuButton("Credits", 340, -115, this.credits);

			this.createMenuImage(250, -75, "main_menu_options");
			this.createMenuImage(-250, 150, "main_menu_start");
			this.createMenuImage(-90, -210, "main_menu_continue");

			this.game.input.keyboard.onDownCallback = this.handleKeyDown;
		}

		private handleKeyDown = () => {
			let enteredKey: String = this.game.input.keyboard.event.key;
			let code = "ETGNOMEHOME";

			if (enteredKey.length === 1) {
				this.enteredCode += enteredKey.toUpperCase();
			}
			else {
				return;
			}

			if (!(code.substr(0, this.enteredCode.length) === this.enteredCode)) {
				this.enteredCode = "";
			}

			if (code === this.enteredCode) {
				Messages.show(this.game, "Are you a wizard?\nClick here to choose a level.",
					{
						callback: () => {
							let level = prompt("Continue from which level?", "tutorial_level_6");
							if (level) {
								this.game.state.start("play", true, false, level);
							}
						}
					});
			}
		};

		private createMenuButton(text: string, x: number, y: number, onClick: Function): Phaser.Text {
			let button = this.game.add.text(x, y, text, MENU_BUTTON_STYLE);
			button.inputEnabled = true;
			button.input.useHandCursor = true;
			button.events.onInputUp.add(onClick, this);
			return button;
		}

		private createMenuImage(x: number, y: number, key: string): Phaser.Image {
			let img = this.game.add.image(x, y, WorldConstants.SPRITE_SHEET, key);
			img.scale.set(0.5, 0.5);
			return img;
		}

		private startGame(): void {
			this.gameWorld.level.houses[0].gnomeCode = [
				new Command(CommandType.WALK),
				new Command(CommandType.WALK),
				new Command(CommandType.ACT),
				new RunnableCommand(() => this.game.state.start("play"))
			];
			this.gameWorld.spawnGnomes();
		}

		private continueGame(): void {

			this.gameWorld.level.houses[0].gnomeCode = [
				new Command(CommandType.WALK),
				new Command(CommandType.RIGHT),
				new Command(CommandType.WALK),
				new Command(CommandType.WALK),
				new Command(CommandType.RIGHT),
				new Command(CommandType.WALK),
				new Command(CommandType.ACT),
				new RunnableCommand(() => {
					this.game.state.start("play", true, false, SaveGame.getLevel());
			})
			];
			this.gameWorld.spawnGnomes();
		}

		private credits(): void {
			this.gameWorld.level.houses[0].gnomeCode = [
				new Command(CommandType.WALK),
				new Command(CommandType.LEFT),
				new Command(CommandType.WALK),
				new Command(CommandType.WALK),
				new Command(CommandType.LEFT),
				new Command(CommandType.WALK),
				new Command(CommandType.ACT),
				new RunnableCommand(() => this.game.state.start("credits"))
			];
			this.gameWorld.spawnGnomes();
		}
	}
}
