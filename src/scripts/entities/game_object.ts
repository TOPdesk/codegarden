/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>

const OBJECT_SPRITE_X_OFFSET = 58;
const OBJECT_SPRITE_Y_OFFSET = -83;

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

	/**
	 * Can be overridden by game objects which have actions
	 * @param gnome the gnome acting on the object
	 * @return true if an action was performed, false otherwise
	 */
	doAction(gnome: Gnome): boolean {
		return false;
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
			case "LIBRARY": return new CodeBuilding(game, model, "library");
			case "ROCK": return new GameObject(game, model, "rock", false);
			case "BUTTON": return new GameObject(game, model, "button", false);
			case "MUSHROOMS": return new Mushrooms(game, model);
			default: throw new Error("Unknown object type " + model.type);
		}
	}
}
