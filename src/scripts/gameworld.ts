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

	/**
	 * Loads the level with the provided name. It should be a JSON file that is loaded into the cache
	 * in the preloader.
	 */
	loadLevel(levelName: string) {
		let levelDefinition = this.game.cache.getJSON(levelName).LEVEL_DEFINITION;
		this.level = new Level(levelDefinition);
	}

	tryMove(gnome: Gnome) {
		let newLocation = gnome.location.getNeighbor(gnome.direction);
		if (this.level.pointIsPassable(newLocation)) {
			gnome.location = newLocation;
		}
	}
}

class Level {
	private layout: Array<Array<WorldConstants.BlockType>>;

	constructor(levelDefinition) {
		this.layout = levelDefinition.layout;
	}

	pointIsPassable(point: Point): boolean {
		if (this.layout[point.x] === undefined || this.layout[point.x][point.y] === undefined) {
			return false;
		}
		return true;
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

	renderBlock(game: Phaser.Game, x: number, y: number, blockType: WorldConstants.BlockType) {
		let screenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(new Point(x, y));
		let block = game.add.sprite(screenCoordinates.x, -100, this.getBlockSprite(blockType));
		block.anchor.y = 1;
		game.add.tween(block).to({ y: screenCoordinates.y }, game.rnd.integerInRange(1500, 2000), Phaser.Easing.Bounce.Out).start();
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
