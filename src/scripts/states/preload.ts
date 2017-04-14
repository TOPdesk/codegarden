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

			this.load.spritesheet("gnome_regular_front", "assets/images/gnome_regular_front.png", 70, 100);
			this.load.spritesheet("gnome_regular_back", "assets/images/gnome_regular_back.png", 70, 100);
			this.load.spritesheet("gnome_water_front", "assets/images/gnome_water_front.png", 70, 100);
			this.load.spritesheet("gnome_water_back", "assets/images/gnome_water_back.png", 70, 100);
			this.load.spritesheet("gnome_float_start_front", "assets/images/gnome_float_start_front.png", 70, 150);
			this.load.spritesheet("gnome_floating_front", "assets/images/gnome_floating_front.png", 70, 150);

			this.load.image("gnome_drowning", "assets/images/gnome_drowning.png");

			this.load.image("control_action", "assets/images/control_action.png");
			this.load.image("control_left", "assets/images/control_left.png");
			this.load.image("control_right", "assets/images/control_right.png");
			this.load.image("control_forward", "assets/images/control_forward.png");
			this.load.image("control_library", "assets/images/control_library.png");

			this.load.image("main_menu_options", "assets/images/main-menu-options.png");
			this.load.image("main_menu_continue", "assets/images/main-menu-continue.png");
			this.load.image("main_menu_start", "assets/images/main-menu-start.png");

			this.load.image("play_button", "assets/images/play_button.png");

			this.load.image("tree-1", "assets/images/tree-1.png");
			this.load.image("tree-2", "assets/images/tree-2.png");
			this.load.image("tree-3", "assets/images/tree-3.png");
			this.load.image("tree-4", "assets/images/tree-4.png");
			this.load.image("tree-5", "assets/images/tree-5.png");
			this.load.image("tree-6", "assets/images/tree-6.png");

			this.load.image("house_ne", "assets/images/house_back_right.png");
			this.load.image("house_nw", "assets/images/house_back_left.png");
			this.load.image("house_se", "assets/images/house_front_right.png");
			this.load.image("house_sw", "assets/images/house_front_left.png");

			this.load.image("mushrooms_0", "assets/images/mushrooms_0.png");
			this.load.image("mushrooms_1", "assets/images/mushrooms_1.png");
			this.load.image("mushrooms_2", "assets/images/mushrooms_2.png");
			this.load.image("mushrooms_3", "assets/images/mushrooms_3.png");

			this.load.image("rock", "assets/images/rock.png");

<<<<<<< HEAD
			this.load.image("library", "assets/images/library.png");
=======
			this.load.image("button", "assets/images/action-button.png");
>>>>>>> Fix menu

			this.load.image("waterdrop_empty", "assets/images/waterdrop_empty.png");
			this.load.image("waterdrop_filled", "assets/images/waterdrop_filled.png");

			this.load.spritesheet("waterfall", "assets/images/waterfall.png", 80, 240);

			this.load.audio("falling_gnome_scream", "assets/sound/wilhelm_scream.ogg");
			this.load.json("tutorial_level_1", "assets/levels/tutorial_level_1.json");
			this.load.json("tutorial_level_2", "assets/levels/tutorial_level_2.json");
			this.load.json("tutorial_level_3", "assets/levels/tutorial_level_3.json");
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
