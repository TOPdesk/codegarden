/// <reference path="../libs/phaser/typescript/phaser.d.ts"/>

class House extends Phaser.Sprite {
	public gnomeCode: { [key: string]: Array<Command> };

	get location(): MapPoint {
		return new MapPoint(this.model.positionX, this.model.positionY);
	}

	constructor(game: Phaser.Game, public model: HouseModel) {
		super(game, 0, 0, House.determineSprite(model.direction));
		this.anchor.set(0.5, 1);
		let screenCoordinates: ScreenPoint = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(this.location);
		this.x = screenCoordinates.x + TREE_X_OFFSET;
		this.y = screenCoordinates.y + TREE_Y_OFFSET;
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

interface HouseModel {
	positionX: number;
	positionY: number;
	initialCode?: string;
	sizeLimit: number;
	direction: Direction;
}
