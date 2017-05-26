/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="../gameworld.ts"/>

namespace States {
    export class CreditsState extends Phaser.State {

        create(): void {
            let text = this.game.add.text(0, 0, "hoi", {
                font: "32px Arial",
                fill: "#ff0044",
                align: "center"
            });
            text.alpha = 0;

            this.game.add.tween(text).to({ alpha: 1}, 2000, "Linear", true);
        }
    }
}