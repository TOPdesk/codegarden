/// <reference path="../libs/phaser/typescript/phaser.d.ts"/>

/// <reference path="coordinates.ts"/>
/// <reference path="gnome.ts"/>
/// <reference path="world_constants.ts"/>

/**
 * This class is responsible for keeping track of the world state and handling collisions.
 */
class GameWorld {
	constructor(public game: Phaser.Game) {}

	public level: Level;
	public gnome: Gnome;

	/**
	 * Loads the level with the provided name. It should be a JSON file that is loaded into the cache
	 * in the preloader.
	 */
	loadLevel(levelName: string) {
		let levelDefinition = this.game.cache.getJSON(levelName).LEVEL_DEFINITION;
		this.level = new Level(levelDefinition);
		this.level.renderStage(this.game);
    this.gnome = this.level.renderGnome(this.game);
    this.level.renderObjects(this.game);
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
			this.level.waterBlock(actionLocation);
			this.gnome.wateringCan = false;
		}
		else if (block === WorldConstants.BlockType.WATER) {
			this.gnome.wateringCan = true;
		}
	}

	tryMove() {
		let newLocation = this.gnome.location.getNeighbor(this.gnome.direction);
		if (this.level.pointIsPassable(newLocation)) {
			this.gnome.location = newLocation;
		}

		let causeOfDeath = this.level.getPointCauseOfDeath(newLocation);
		if (causeOfDeath !== null) {
			this.gnome.die(causeOfDeath);
			this.gnome = new Gnome(this.game, this.level.spawnpoint.positionX, this.level.spawnpoint.positionY);
		}
	}
}

class Level {
	//Array access should be done in [y][x] order!
	private layout: Array<Array<WorldConstants.BlockType>>;

	constructor(levelDefinition) {
		this.layout = levelDefinition.layout;
    this.spawnpoint = levelDefinition.spawnpoint;
    this.gnome = levelDefinition.gnome;
    this.objects = levelDefinition.objects;
	}

	pointIsPassable(point: Point): boolean {
		//TODO some entities are impassable
		return true;
	}

	getPointCauseOfDeath(point: Point): CauseOfDeath {
		let block = this.getBlock(point);
		if (block === null) {
			return CauseOfDeath.FALLING;
		}

		if (block === WorldConstants.BlockType.WATER) {
			return CauseOfDeath.DROWNING;
		}

		return null;
	}

	getBlock(point: Point) {
		if (this.layout[point.y] === undefined || this.layout[point.y][point.x] === undefined) {
			return null;
		}

		return this.layout[point.y][point.x];
	}

	waterBlock(point: Point) {
		//TODO when trees are implemented, this should water them
	}

	renderStage(game: Phaser.Game) {
		let rows = this.layout.length;
		let columns = this.layout[0].length;

		for (let row = 0; row < rows; row++) {
			for (let column = 0; column < columns; column++) {
				this.renderBlock(game, column, row, this.layout[row][column]);
			}
		}
	}

  renderGnome(game: Phaser.game) : Gnome {
    return new Gnome(game, this.gnome.positionX, this.gnome.positionY);
  }

  renderObjects(game: Phaser.game) {

    for (let i = 0; i < this.objects.length; i++) {
      console.log(this.objects[i]);
    }
  }

  renderObject(type: String, x: number, y: number) {

  }

	renderBlock(game: Phaser.Game, x: number, y: number, blockType: WorldConstants.BlockType) {
		let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(new Point(x, y));
		let block = game.add.sprite(screenCoordinates.x, screenCoordinates.y, this.getBlockSprite(blockType));
		block.anchor.y = 1;
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
