class Level {
	//Array access should be done in [y][x] order!
	private layout: Array<Array<WorldConstants.BlockType>>;
	private objectModels: any;
	private victoryConditions: Array<VictoryCondition>;
	private objectMap = {};

	public houses: House[] = [];
	public nextLevel?: string;

	constructor(levelDefinition) {
		let levelDefinitionCopy = JSON.parse(JSON.stringify(levelDefinition));
		this.layout = levelDefinitionCopy.layout;
		this.objectModels = levelDefinitionCopy.objects;
		this.victoryConditions = levelDefinitionCopy.victoryConditions;
		this.nextLevel = levelDefinitionCopy.nextLevel;
	}

	pointIsPassable(point: MapPoint): boolean {
		let object = this.getObject(point);
		return !object || object.passable;
	}

	getPointCauseOfDeath(point: MapPoint): CauseOfDeath {
		let block = this.getBlock(point);
		if (block === null) {
			return CauseOfDeath.FALLING;
		}

		if (block === WorldConstants.BlockType.WATER) {
			return CauseOfDeath.DROWNING;
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

	waterObject(point: MapPoint) {
		let object = this.objectMap[point.toString()];
		if (object && object.addWater) {
			object.addWater();
			return true;
		}

		return false;
	}

	renderStage(blockGroup: Phaser.Group) {
		let rows = this.layout.length;
		let columns = this.layout[0].length;

		for (let row = 0; row < rows; row++) {
			for (let column = 0; column < columns; column++) {
				this.renderBlock(blockGroup, column, row, this.layout[row][column]);
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
		let object = ObjectType.instantiate(game, model);
		if (object instanceof House) {
			this.houses.push(object);
		}
		return object;
	}

	renderBlock(blockGroup: Phaser.Group, x: number, y: number, blockType: WorldConstants.BlockType) {
		let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(new MapPoint(x, y));
		let block = blockGroup.game.add.sprite(screenCoordinates.x, screenCoordinates.y, this.getBlockSprite(blockType));
		block.anchor.y = 1;
		blockGroup.add(block);
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
			default:
				return "stage_block"; //TODO throw an error instead?
		}
	}
}
