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
			this.load.image("water_block", "assets/images/water_block.png");
			this.load.image("desert_block", "assets/images/desert_block.png");
			this.load.image("stone_block", "assets/images/stone_block.png");

			this.load.image("gnome_regular_front", "assets/images/gnome_regular_front.png");
			this.load.image("gnome_regular_back", "assets/images/gnome_regular_back.png");
			this.load.image("gnome_water_front", "assets/images/gnome_water_front.png");
			this.load.image("gnome_water_back", "assets/images/gnome_water_back.png");
			this.load.image("gnome_drowning", "assets/images/gnome_drowning.png");

			this.load.image("control_action", "assets/images/control_action.png");
			this.load.image("control_left", "assets/images/control_left.png");
			this.load.image("control_right", "assets/images/control_right.png");
			this.load.image("control_forward", "assets/images/control_forward.png");

			this.load.image("play_button", "assets/images/play_button.png");

			this.load.image("tree-1", "assets/images/element_tree-1.png");
			this.load.image("tree-2", "assets/images/element_tree-2.png");
			this.load.image("tree-3", "assets/images/element_tree-3.png");
			this.load.image("tree-4", "assets/images/element_tree-4.png");
			this.load.image("tree-5", "assets/images/element_tree-5.png");
			this.load.image("tree-6", "assets/images/element_tree-6.png");

			this.load.image("house_ne", "assets/images/house_back_right.png");
			this.load.image("house_nw", "assets/images/house_back_left.png");
			this.load.image("house_se", "assets/images/house_front_right.png");
			this.load.image("house_sw", "assets/images/house_front_left.png");

			this.load.image("mushrooms", "assets/images/mushrooms.png");
			this.load.image("rock", "assets/images/rock.png");

			this.load.image("waterdrop_empty", "assets/images/waterdrop_empty.png");
			this.load.image("waterdrop_filled", "assets/images/waterdrop_filled.png");

			this.load.audio("falling_gnome_scream", "assets/sound/wilhelm_scream.ogg");
			this.load.json("tutorial_level_1", "assets/levels/tutorial_level_1.json");
			this.load.json("tutorial_level_2", "assets/levels/tutorial_level_2.json");
			this.load.json("menu_level", "assets/levels/menu_level.json");
		}

		create() {
			this.game.time.events.add(0, () => {
				this.game.state.start("menu");
			}, this);
		}
	}
}
