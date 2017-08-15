const WATERFALL_X_OFFSET_RIGHT = 47;
const WATERFALL_X_OFFSET_LEFT = 67;
const WATERFALL_Y_OFFSET = -97;

class Level {
	//Array access should be done in [y][x] order!
	private layout: Array<Array<WorldConstants.BlockType>>;
	private objectModels: any;
	private victoryConditions: Array<VictoryCondition>;
	private objectMap = {};

	public houses: House[] = [];
	public codeBuildings: CodeBuilding[] = [];
	public libraries: CodeBuilding[] = [];
	public spookTrees: SpookTree[] = [];

	constructor(levelDefinition) {
		let levelDefinitionCopy = JSON.parse(JSON.stringify(levelDefinition));
		this.layout = levelDefinitionCopy.layout;
		this.objectModels = levelDefinitionCopy.objects;
		this.victoryConditions = levelDefinitionCopy.victoryConditions;
	}

	pointIsPassable(point: MapPoint): boolean {
		let object = this.getObject(point);
		return !object || object.passable;
	}

	getPointCauseOfDeath(point: MapPoint, hasMoved: boolean): CauseOfDeath {
		let block = this.getBlock(point);
		if (block === null) {
			return CauseOfDeath.FALLING;
		}

		if (block === WorldConstants.BlockType.WATER
				|| (!hasMoved && block === WorldConstants.BlockType.SWAMP)) {
			return CauseOfDeath.DROWNING;
		}

		let object = this.getObject(point);
		if (object && object.causeOfDeath) {
			object.hasKilledGnome = true;
			return object.causeOfDeath;
		}

		return CauseOfDeath.NOTHING;
	}

	getBlock(point: MapPoint) {
		if (this.layout[point.y] === undefined || this.layout[point.y][point.x] === undefined) {
			return null;
		}

		return this.layout[point.y][point.x];
	}

	getObject(point: MapPoint) {
		return this.objectMap[point.toString()];
	}

	checkVictory() {
		if (!this.victoryConditions) {
			return false;
		}
		for (let victoryCondition of this.victoryConditions) {
			if (!VictoryCondition.check(victoryCondition, this.objectModels)) {
				return false;
			}
		}
		return true;
	}

	doObjectAction(actionLocation: MapPoint, gnome: Gnome) {
		let object = this.objectMap[actionLocation.toString()];
		if (object) {
			return object.doAction(gnome);
		}

		return false;
	}

	/**
	 * Resets the level to its initial state, but code buildings keep their code.
	 */
	softReset() {
		for (let key in this.objectMap) {
			if (this.objectMap.hasOwnProperty(key)) {
				this.objectMap[key].softReset();
			}
		}
	}

	renderStage(blockGroup: Phaser.Group) {
		let rows = this.layout.length;
		let columns = this.layout[0].length;

		for (let row = 0; row < rows; row++) {
			for (let column = 0; column < columns; column++) {
				let blockType = this.layout[row][column];
				this.renderBlock(blockGroup, column, row, blockType);
				if (blockType === WorldConstants.BlockType.WATER) {
					if (row === rows - 1) {
						this.renderWaterFall(blockGroup, column, row, true);
					}
					if (column === columns - 1) {
						this.renderWaterFall(blockGroup, column, row, false);
					}
				}
			}
		}
	}

	renderObjects(entityGroup: Phaser.Group) {
		for (let i = 0; i < this.objectModels.length; i++) {
			let model = this.objectModels[i];
			let objectInstance = this.renderObject(entityGroup.game, model);
			entityGroup.add(objectInstance);
			this.objectMap[new MapPoint(model.positionX, model.positionY).toString()] = objectInstance;
		}
	}

	renderObject(game: Phaser.Game, model): Phaser.Sprite {
		let object = ObjectType.instantiate(game, model, this.libraries.length);
		if (object instanceof House) {
			this.houses.push(object);
		}
		if (object instanceof CodeBuilding) {
			this.codeBuildings.push(object);
			if (object.model.type === "LIBRARY") {
				this.libraries.push(object);
			}
		}
		if (object instanceof SpookTree) {
			this.spookTrees.push(object);
		}
		return object;
	}

	renderBlock(blockGroup: Phaser.Group, x: number, y: number, blockType: WorldConstants.BlockType) {
		let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(new MapPoint(x, y));
		let block = blockGroup.game.add.sprite(
			screenCoordinates.x, screenCoordinates.y, WorldConstants.SPRITE_SHEET, this.getBlockSprite(blockType));
		block.anchor.y = 1;
		blockGroup.add(block);
	}

	renderWaterFall(blockGroup: Phaser.Group, x: number, y: number, leftSide: boolean) {
		let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(new MapPoint(x, y));
		let sprite = new Phaser.Sprite(blockGroup.game,
			screenCoordinates.x + (leftSide ? WATERFALL_X_OFFSET_LEFT : WATERFALL_X_OFFSET_RIGHT),
			screenCoordinates.y + WATERFALL_Y_OFFSET,
			WorldConstants.SPRITE_SHEET);
		sprite.anchor.y = 0;
		sprite.anchor.x = 0;
		if (leftSide) {
			sprite.scale.x = -1;
		}
		sprite.animations.add("flow", Phaser.Animation.generateFrameNames("waterfall_", 0, 3));
		sprite.alpha = 0.5;
		sprite.animations.play("flow", 10, true);
		blockGroup.add(sprite);
	}

	private getBlockSprite(blockType: WorldConstants.BlockType): string {
		switch (blockType) {
			case WorldConstants.BlockType.GRASS:
				return "stage_block";
			case WorldConstants.BlockType.WATER:
				return "water_block";
			case WorldConstants.BlockType.DESERT:
				return "desert_block";
			case WorldConstants.BlockType.STONE:
				return "stone_block";
			case WorldConstants.BlockType.SWAMP:
				return "swamp_ground_block";
			default:
				return "stage_block"; //TODO throw an error instead?
		}
	}
}
