/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>

namespace States {

	let text: Phaser.Text;

	export class CreditsState extends Phaser.State {

		create(): void {
			let style = {
				font: "32px Arial",
				fill: "#ffd700",
				align: "center"
			};
			this.game.stage.backgroundColor = 0x000000;

			let credits = "Level Design\n\nElmer Jacobs\n\n\nDevelopment\n\nBogdán Bikics\nIris Hupkens\nWytze Roël\nJoris Slob\n\n\n" +
				"Character Art\n\nMarco Tonino\n\n\nTesting\n\nMats Perk";
			text = this.game.add.text(this.game.world.centerX, this.game.world.centerY * 3, credits, style);
			text.anchor.set(0.5);

			this.game.physics.arcade.enable([text]);

			text.body.velocity.setTo(0, -100);
		}

		update(): void {
			if (text.centerY < -text.height / 2 || this.game.input.activePointer.isDown) {
				this.game.state.start("menu");
			}
		}
	}
}
