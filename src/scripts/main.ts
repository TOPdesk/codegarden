/// <reference path="../libs/phaser/typescript/phaser.d.ts"/>
/// <reference path="states/boot.ts"/>

class Game extends Phaser.Game {

	constructor() {
		//noinspection TypeScriptValidateTypes
		super("100", "100", Phaser.AUTO, "content", null, true);
	}

	start() {
		this.state.add("boot", States.BootState, true);
	}
}

(window as any).codeGarden = new Game();
