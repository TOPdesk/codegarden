/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../gameworld.ts"/>

namespace States {
	const SECRET_CODE = "ETGNOMEHOME";

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

			this.createMenuOption(
				this.createMenuImage(-90, -210, "main_menu_continue"),
				this.createMenuButton("Continue", 0, -250),
				new MapPoint(0, 0),
				this.continueGame
			);
			this.createMenuOption(
				this.createMenuImage(250, -75, "main_menu_options"),
				this.createMenuButton("Credits", 340, -115),
				new MapPoint(4, 0),
				this.credits
			);
			this.createMenuOption(
				this.createMenuImage(-250, 150, "main_menu_start"),
				this.createMenuButton("Start Game", -250, 200),
				new MapPoint(2, 4),
				this.startGame
			);

			this.game.input.keyboard.onDownCallback = this.handleKeyDown;

			let timer = this.game.time.create();
			timer.loop(WorldConstants.TURN_LENGTH_IN_MILLIS, () => {
				this.gameWorld.nextTick();
			});
			timer.start();
		}

		private handleKeyDown = () => {
			let enteredKey: String = this.game.input.keyboard.event.key;

			if (enteredKey.length === 1) {
				this.enteredCode += enteredKey.toUpperCase();
			}
			else {
				return;
			}

			if (this.enteredCode.length > SECRET_CODE.length) {
				this.enteredCode = this.enteredCode.substr(this.enteredCode.length - SECRET_CODE.length);
			}

			if (SECRET_CODE === this.enteredCode) {
				console.log("Released levels: " + LevelList.LEVELS.join(", "));
				console.log("Experimental levels: " + LevelList.EXPERIMENTAL_LEVELS.join(", "));
				let level = prompt("Continue from which level?");
				if (level) {
					this.game.state.start("play", true, false, level);
				}
			}
		};

		private createMenuButton(text: string, x: number, y: number): Phaser.Text {
			return this.game.add.text(x, y, text, MENU_BUTTON_STYLE);
		}

		private createMenuImage(x: number, y: number, key: string): Phaser.Image {
			let img = this.game.add.image(x, y, WorldConstants.SPRITE_SHEET, key);
			img.scale.set(0.5, 0.5);
			return img;
		}

		private createMenuOption(image: Phaser.Image, text: Phaser.Text, location: MapPoint, onClick: Function) {
			image.inputEnabled = true;
			image.input.useHandCursor = true;
			image.events.onInputUp.add(onClick, this);

			text.inputEnabled = true;
			text.input.useHandCursor = true;
			text.events.onInputUp.add(onClick, this);

			let button = this.gameWorld.level.getObject(location);
			button.inputEnabled = true;
			button.input.useHandCursor = true;
			button.events.onInputUp.add(onClick, this);
		}

		private startGame(): void {
			this.runProgram([
				new Command(CommandType.WALK),
				new Command(CommandType.WALK),
				new Command(CommandType.ACT),
				new RunnableCommand(() => this.game.state.start("play"))
			]);
		}

		private continueGame(): void {
			this.runProgram([
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
			]);
		}

		private credits(): void {
			this.runProgram([
				new Command(CommandType.WALK),
				new Command(CommandType.LEFT),
				new Command(CommandType.WALK),
				new Command(CommandType.WALK),
				new Command(CommandType.LEFT),
				new Command(CommandType.WALK),
				new Command(CommandType.ACT),
				new RunnableCommand(() => this.game.state.start("credits"))
			]);
		}

		private runProgram(code: Command[]) {
			this.gameWorld.level.houses[0].gnomeCode = code;
			this.gameWorld.spawnGnomes();
		}
	}
}
