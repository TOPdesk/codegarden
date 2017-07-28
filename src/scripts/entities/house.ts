/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
///<reference path="code_building.ts"/>

class House extends CodeBuilding {
	public gnomeCode: Command[];
	public delay: number;

	constructor(game: Phaser.Game, public model: HouseModel) {
		super(game, model, House.determineSprite(model.direction));
		this.delay = model.delay;
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

interface HouseModel extends CodeBuildingModel {
	direction: Direction;
}
