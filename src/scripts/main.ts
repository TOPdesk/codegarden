/// <reference path="../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="states/boot.ts"/>

class Game extends Phaser.Game {

	constructor() {
		//noinspection TypeScriptValidateTypes
		super("100", "100", Phaser.AUTO, "content", null);
	}

	start() {
		this.state.add("boot", States.BootState, true);
	}
}

let codeGarden = new Game();
