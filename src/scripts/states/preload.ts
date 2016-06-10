/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="play.ts"/>

namespace States {

	export class PreloadState extends Phaser.State {

		preload() {
			let x = this.game.width / 2;
			let y = this.game.height / 2;

			let logo = this.game.add.sprite(x, y, "logo");
			logo.anchor.set(0.5);

			let progressBar = this.game.add.sprite(x, y + 100, "progressBar");
			progressBar.anchor.set(0.5);
			this.load.setPreloadSprite(progressBar);

			this.load.image("stage_block", "assets/images/stage_block.png");
			this.load.image("gnome_normal", "assets/images/gnome_normal.png");
			this.load.image("control_left", "assets/images/control_left.png");
			this.load.image("control_right", "assets/images/control_right.png");
			this.load.image("control_forward", "assets/images/control_forward.png");
		}

		create() {
			this.game.time.events.add(0, () => {
				this.game.state.start("play");
			}, this);
		}
	}
}
