/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="preload.ts"/>
/// <reference path="play.ts"/>

namespace States {
	export class BootState extends Phaser.State {

		init() {
			this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
			this.game.camera.bounds = null;
		}

		preload() {
			this.game.load.image("progressBar", "assets/images/progressbar.png");
			this.game.load.image("logo", "assets/images/logo.png");

			this.game.state.add("preload", PreloadState);
			this.game.state.add("play", PlayState);
		}

		create() {
			this.game.state.start("preload");
		}
	}
}
