/// <reference path="../libs/phaser/typescript/phaser.d.ts"/>

/// <reference path="coordinates.ts"/>
/// <reference path="gnome.ts"/>
/// <reference path="tree.ts"/>
/// <reference path="world_constants.ts"/>
/// <reference path="victory_condition.ts"/>
/// <reference path="messages/message.ts"/>

/**
 * This class is responsible for keeping track of the world state and handling collisions.
 */
class GameWorld {
	constructor(public game: Phaser.Game) {
		this.blockGroup = game.add.group(game.world, "blocks");
		this.entityGroup = game.add.group(game.world, "entities");
		this.spawnIndicator = this.createSpawnIndicator();

		this.startCodeTimer();
	}

	public level: Level;
	public spawnedGnomeRoutine: { [key: string]: Array<Command> } = {};
	private gnomes: Array<Gnome>;
	private blockGroup: Phaser.Group;
	private entityGroup: Phaser.Group;
	private spawnIndicator: Phaser.Graphics;

	/**
	 * Loads the level with the provided name. It should be a JSON file that is loaded into the cache
	 * in the preloader.
	 */
	loadLevel(levelName: string) {
		this.blockGroup.removeAll(true);
		this.entityGroup.removeAll(true);
		this.gnomes = [];

		let levelDefinition = this.game.cache.getJSON(levelName).LEVEL_DEFINITION;
		this.level = new Level(levelDefinition);
		this.level.renderStage(this.blockGroup);
		this.level.renderObjects(this.entityGroup);

		this.spawnGnome();
	}

	/**
	 * Performs an action with the active gnome. Results depend on gnome location
	 */
	doGnomeAction(gnome: Gnome) {
		let actionLocation = gnome.location.getNeighbor(gnome.direction);
		let block = this.level.getBlock(actionLocation);
		if (gnome.wateringCan) {
			if (this.level.waterObject(actionLocation)) {
				gnome.wateringCan = false;
			}
		}
		else if (block === WorldConstants.BlockType.WATER) {
			gnome.wateringCan = true;
		}
	}

	/**
	 * Try to move the gnome forward. Depending on what's in the way, this might succeed, fail, or kill the gnome.
	 */
	tryMove(gnome: Gnome) {
		let newLocation = gnome.location.getNeighbor(gnome.direction);
		if (this.level.pointIsPassable(newLocation)) {
			gnome.location = newLocation;
			this.determineEntityZIndices();
		}

		let causeOfDeath = this.level.getPointCauseOfDeath(newLocation);
		if (causeOfDeath !== null) {
			this.killGnome(gnome, causeOfDeath);
		}
	}

	/**
	 * Show/hide the spawn point
	 */
	toggleSpawnPointIndicator(show: boolean) {
		let newAlpha = show ? 1 : 0;
		this.game.add.tween(this.spawnIndicator).to({alpha: newAlpha}, 300, null, true);
	}

	killGnome(gnome: Gnome, causeOfDeath: CauseOfDeath) {
		this.gnomes.splice(this.gnomes.indexOf(gnome), 1);
		this.entityGroup.remove(gnome);
		this.game.world.add(gnome);
		gnome.die(causeOfDeath);
	}

	spawnGnome() {
		let newGnome = new Gnome(this.game, this.level.spawnpoint.positionX, this.level.spawnpoint.positionY, this.spawnedGnomeRoutine);
		this.entityGroup.add(newGnome);
		this.gnomes.push(newGnome);
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

	private startCodeTimer() {
		let timer = this.game.time.create();
		timer.loop(200, () => {
			for (let i = this.gnomes.length - 1; i >= 0; i--) {
				let gnome = this.gnomes[i];
				gnome.executeNextCommand(this);
				this.checkVictory();
			}
		});
		timer.start();
	}

	private createSpawnIndicator(): Phaser.Graphics {
		let indicator = this.game.add.graphics(0, 0);
		indicator.beginFill(0xffff00, 0.3);
		indicator.moveTo(0, -1000);
		indicator.lineTo(0, -100);
		indicator.lineTo(WorldConstants.BLOCK_WIDTH / 2, -100 + WorldConstants.BLOCK_HEIGHT / 2);
		indicator.lineTo(WorldConstants.BLOCK_WIDTH, -100);
		indicator.lineTo(WorldConstants.BLOCK_WIDTH, -1000);
		indicator.endFill();

		let spawnScreenCoordinates = WorldConstants.COORDINATE_TRANSFORMER.map_to_screen(new MapPoint(1, 1));
		indicator.x = spawnScreenCoordinates.x;
		indicator.y = spawnScreenCoordinates.y;

		indicator.alpha = 0;
		return indicator;
	}

	private checkVictory() {
		if (!this.level.checkVictory()) {
			return;
		}

		//TODO: Go to the next level upon achieving victory
		Messages.show("You won!");
	}
}

class Level {
	//Array access should be done in [y][x] order!
	private layout: Array<Array<WorldConstants.BlockType>>;
	spawnpoint: any;
	private gnome: any;
	private objects: any;
	private victoryConditions: Array<VictoryCondition>;
	private objectMap = {};

	constructor(levelDefinition) {
		this.layout = levelDefinition.layout;
		this.spawnpoint = levelDefinition.spawnpoint;
		this.gnome = levelDefinition.gnome;
		this.objects = levelDefinition.objects;
		this.victoryConditions = levelDefinition.victoryConditions;
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

	checkVictory() {
		if (!this.victoryConditions) {
			return false;
		}
		for (let victoryCondition of this.victoryConditions) {
			if (!VictoryCondition.check(victoryCondition, this.objects)) {
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
		for (let i = 0; i < this.objects.length; i++) {
			let model = this.objects[i];
			let objectInstance = this.renderObject(entityGroup.game, model);
			entityGroup.add(objectInstance);
			this.objectMap[new MapPoint(model.positionX, model.positionY).toString()] = objectInstance;
		}
	}

	renderObject(game: Phaser.Game, model): Phaser.Sprite {
		if (model.type === "TREE") {
			return new Tree(game, model);
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
