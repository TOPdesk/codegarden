/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>

const OBJECT_SPRITE_X_OFFSET = 56;
const OBJECT_SPRITE_Y_OFFSET = -88;

class GameObject extends Phaser.Sprite {
	get location(): MapPoint {
		return new MapPoint(this.model.positionX, this.model.positionY);
	}

	constructor(game: Phaser.Game, public model: GameObjectModel, sprite, public passable) {
		super(game, 0, 0, sprite);
		this.anchor.set(0.5, 1);
		let screenCoordinates: ScreenPoint = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(this.location);
		this.x = screenCoordinates.x + OBJECT_SPRITE_X_OFFSET;
		this.y = screenCoordinates.y + OBJECT_SPRITE_Y_OFFSET;

		game.add.existing(this);
	}
}

interface GameObjectModel {
	type: string;
	positionX: number;
	positionY: number;
}

namespace ObjectType {
	export function instantiate(game: Phaser.Game, model) {
		switch (model.type) {
			case "TREE": return new Tree(game, model);
			case "HOUSE": return new House(game, model);
			case "ROCK": return new GameObject(game, model, "rock", false);
			case "MUSHROOMS": return new GameObject(game, model, "mushrooms", true);
			default: throw new Error("Unknown object type " + model.type);
		}
	}
}
