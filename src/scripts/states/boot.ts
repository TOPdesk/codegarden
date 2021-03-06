/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="preload.ts"/>
/// <reference path="play.ts"/>
/// <reference path="menu.ts"/>

namespace States {
	export class BootState extends Phaser.State {

		init() {
			this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
			this.game.camera.bounds = null;
			this.game.stage.backgroundColor = 0xffffff;
		}

		preload() {
			this.game.load.image("progressBar", "assets/images/progressbar.png");
			this.game.load.image("logo", "assets/images/logo.png");

			this.game.state.add("preload", PreloadState);
			this.game.state.add("menu", MenuState);
			this.game.state.add("play", PlayState);
			this.game.state.add("credits", CreditsState);
		}

		create() {
			this.game.state.start("preload");
		}
	}
}
