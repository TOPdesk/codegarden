/// <reference path="../libs/phaser/typescript/phaser.d.ts"/>

class House extends GameObject {
	public gnomeCode: { [key: string]: Array<Command> };

	constructor(game: Phaser.Game, public model: HouseModel) {
		super(game, model, House.determineSprite(model.direction), false);
		this.inputEnabled = true;
		this.input.pixelPerfectClick = true;
		this.input.useHandCursor = true;

		let code = [];
		if (model.initialCode) {
			for (let i = 0; i < model.initialCode.length; i++) {
				code.push(CommandType.getCommandTypeForShorthand(model.initialCode.charAt(i)));
			}
		}
		this.gnomeCode = { main: code };

		game.add.existing(this);
	}

	static determineSprite(direction: Direction) {
		switch (direction) {
			case Direction.NE: return "house_ne";
			case Direction.NW: return "house_nw";
			case Direction.SE: return "house_se";
			case Direction.SW: return "house_sw";
		}
	}
}

interface HouseModel extends GameObjectModel {
	initialCode?: string;
	sizeLimit: number;
	direction: Direction;
}
