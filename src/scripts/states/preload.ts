/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
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

			this.load.atlas(WorldConstants.SPRITE_SHEET, "assets/sprites/sprites.png", "assets/sprites/sprites.json");

			this.load.audio("falling_gnome_scream", "assets/sound/wilhelm_scream.ogg");
			this.load.audio("bubbles", "assets/sound/bubbles.wav");
			this.load.json("tutorial_level_1", "assets/levels/tutorial_level_1.json");
			this.load.json("tutorial_level_2", "assets/levels/tutorial_level_2.json");
			this.load.json("tutorial_level_3", "assets/levels/tutorial_level_3.json");
			this.load.json("tutorial_level_4", "assets/levels/tutorial_level_4.json");
			this.load.json("tutorial_level_5", "assets/levels/tutorial_level_5.json");
			this.load.json("tutorial_level_6", "assets/levels/tutorial_level_6.json");
			this.load.json("menu_level", "assets/levels/menu_level.json");
			this.load.json("test", "assets/levels/example_level.json");
		}

		create() {
			this.game.time.events.add(0, () => {
				this.game.state.start("menu");
			}, this);
		}
	}
}
