/// <reference path="../libs/phaser/typescript/phaser.d.ts"/>

/// <reference path="coordinates.ts"/>
/// <reference path="gnome.ts"/>
/// <reference path="tree.ts"/>
/// <reference path="world_constants.ts"/>

/**
 * This class is responsible for keeping track of the world state and handling collisions.
 */
class GameWorld {
	constructor(public game: Phaser.Game) {
		this.blockGroup = game.add.group(game.world, "blocks");
		this.entityGroup = game.add.group(game.world, "entities");
	}

	public level: Level;
	public gnome: Gnome;
	private blockGroup: Phaser.Group;
	private entityGroup: Phaser.Group;

	/**
	 * Loads the level with the provided name. It should be a JSON file that is loaded into the cache
	 * in the preloader.
	 */
	loadLevel(levelName: string) {
		let levelDefinition = this.game.cache.getJSON(levelName).LEVEL_DEFINITION;
		this.level = new Level(levelDefinition);
		this.level.renderStage(this.blockGroup);
		this.gnome = this.level.renderGnome(this.entityGroup);
		this.level.renderObjects(this.entityGroup);
	}

	/**
	 * Rotate active gnome left
	 */
	rotateLeft() {
		this.gnome.rotateLeft();
	}

	/**
	 * Rotate active gnome right
	 */
	rotateRight() {
		this.gnome.rotateRight();
	}

	/**
	 * Performs an action with the active gnome. Results depend on gnome location
	 */
	doGnomeAction() {
		let actionLocation = this.gnome.location.getNeighbor(this.gnome.direction);
		let block = this.level.getBlock(actionLocation);
		if (this.gnome.wateringCan) {
			if (this.level.waterObject(actionLocation)) {
				this.gnome.wateringCan = false;
			}
		}
		else if (block === WorldConstants.BlockType.WATER) {
			this.gnome.wateringCan = true;
		}
	}

	tryMove() {
		let newLocation = this.gnome.location.getNeighbor(this.gnome.direction);
		if (this.level.pointIsPassable(newLocation)) {
			this.gnome.location = newLocation;
			this.determineEntityZIndices();
		}

		let causeOfDeath = this.level.getPointCauseOfDeath(newLocation);
		if (causeOfDeath !== null) {
			this.killGnome(causeOfDeath);
		}
	}

	killGnome(causeOfDeath: CauseOfDeath) {
		this.entityGroup.remove(this.gnome);
		this.game.world.add(this.gnome);
		this.gnome.die(causeOfDeath);
		this.gnome = new Gnome(this.game, this.level.spawnpoint.positionX, this.level.spawnpoint.positionY);
		this.entityGroup.add(this.gnome);
		this.determineEntityZIndices();
	}

	private determineEntityZIndices() {
		this.entityGroup.customSort((a, b) => {
				let aZIndex = a.location.x + a.location.y;
				let bZIndex = b.location.x + b.location.y;
				if (aZIndex > bZIndex) {
					return 1;
				}
				else if (aZIndex < bZIndex) {
					return -1;
				}
				return 0;
			});
	}
}

class Level {
	//Array access should be done in [y][x] order!
	private layout: Array<Array<WorldConstants.BlockType>>;
	spawnpoint: any;
	private gnome: any;
	private objects: any;
	private objectMap = {};

	constructor(levelDefinition) {
		this.layout = levelDefinition.layout;
		this.spawnpoint = levelDefinition.spawnpoint;
		this.gnome = levelDefinition.gnome;
		this.objects = levelDefinition.objects;
	}

	pointIsPassable(point: Point): boolean {
		//All objects are impassable for now
		return !(point.toString() in this.objectMap);
	}

	getPointCauseOfDeath(point: MapPoint): CauseOfDeath {
		let block = this.getBlock(point);
		if (block === null) {
			return CauseOfDeath.FALLING;
		}

		if (block === WorldConstants.BlockType.WATER) {
			return CauseOfDeath.DROWNING;
		}

		return null;
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

	renderGnome(entityGroup: Phaser.Group): Gnome {
		let gnome = new Gnome(entityGroup.game, this.gnome.positionX, this.gnome.positionY);
		entityGroup.add(gnome);
		return gnome;
	}

	renderObjects(entityGroup: Phaser.Group) {
		for (let i = 0; i < this.objects.length; i++) {
			let object = this.objects[i];
			let objectInstance = this.renderObject(entityGroup.game, object.type, object.positionX, object.positionY);
			entityGroup.add(objectInstance);
			this.objectMap[new MapPoint(object.positionX, object.positionY).toString()] = objectInstance;
		}
	}

	renderObject(game: Phaser.Game, type: String, x: number, y: number): Phaser.Sprite {
		if (type === "TREE") {
			return new Tree(game, x, y);
		}
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
			default: return "stage_block"; //TODO throw an error instead?
		}
	}
}
