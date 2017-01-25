/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../gameworld.ts"/>

namespace States {
	const MENU_BUTTON_STYLE = {
		font: "32px Arial",
		fill: "#ff0044",
		align: "center"
	};

	export class MenuState extends Phaser.State {

		create(): void {
			this.game.camera.setPosition(-400, -300);
			let gameWorld = new GameWorld(this.game);
			gameWorld.loadLevel("menu_level");

			this.createMenuButton("Continue", 0, 0, this.continueGame);
			this.createMenuButton("Start Game", 0, 40, this.startGame);
			this.createMenuButton("Options", 0, 80, this.options);
		}

		private createMenuButton(text: string, x: number, y: number, onClick: Function): Phaser.Text {
			let button = this.game.add.text(x, y, text, MENU_BUTTON_STYLE);
			button.inputEnabled = true;
			button.events.onInputUp.add(onClick, this);
			return button;
		}

		private startGame(): void {
			this.game.state.start("play");
		}

		private continueGame(): void {
			let level = prompt("Continue from which level?", "tutorial_level_2");
			this.game.state.start("play", true, false, level);
		}

		private options(): void {
			console.log("options");
		}
	}
}
