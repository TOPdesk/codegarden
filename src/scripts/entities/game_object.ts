/// <reference path="../../libs/phaser/typescript/phaser.d.ts"/>

const OBJECT_SPRITE_X_OFFSET = 58;
const OBJECT_SPRITE_Y_OFFSET = -83;

class GameObject extends Phaser.Sprite {
	private initialModel: GameObjectModel;

	get location(): MapPoint {
		return new MapPoint(this.model.positionX, this.model.positionY);
	}

	constructor(game: Phaser.Game, public model: GameObjectModel, sprite, public passable) {
		super(game, 0, 0, sprite);
		this.initialModel = JSON.parse(JSON.stringify(model));
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

	/**
	 * Resets the object to its initial state. The default implementation does this by reverting all values in the model
	 * to their initial values. Any information outside the model (e.g. gnomecode) is not affected.
	 */
	softReset() {
		for (let key in this.initialModel) {
			if (this.initialModel.hasOwnProperty(key)) {
				this.model[key] = this.initialModel[key];
			}
		}
		this.determineTexture();
	}

	/**
	 * Override if an object's graphic should change based on its internal state.
	 */
	determineTexture() {
		//noop
	}
}

interface GameObjectModel {
	type: string;
	positionX: number;
	positionY: number;
}

namespace ObjectType {
	export function instantiate(game: Phaser.Game, model, libraryIndex: number) {
		switch (model.type) {
			case "TREE": return new Tree(game, model);
			case "HOUSE": return new House(game, model);
			case "LIBRARY": return new CodeBuilding(game, model, "library-" + CodeBuilding.getLibraryColor(libraryIndex));
			case "ROCK": return new GameObject(game, model, "rock", false);
			case "BUTTON": return new GameObject(game, model, "button", false);
			case "MUSHROOMS": return new Mushrooms(game, model);
			default: throw new Error("Unknown object type " + model.type);
		}
	}
}
