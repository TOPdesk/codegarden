/// <reference path="../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="states/boot.ts"/>

class Game extends Phaser.Game {
	MOBILE;

	constructor() {
		//noinspection TypeScriptValidateTypes
		super("100%", "100%", Phaser.AUTO, "canvasContainer");
		this.MOBILE= window.screen.availWidth < 500;
	}

	start() {
		this.state.add("boot", States.BootState, true);
	}
}

window["codeGarden"] = new Game();
