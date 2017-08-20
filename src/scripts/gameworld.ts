/// <reference path="../../node_modules/phaser/typescript/phaser.d.ts"/>

/// <reference path="coordinates.ts"/>
/// <reference path="entities/gnome.ts"/>
/// <reference path="entities/tree.ts"/>
/// <reference path="world_constants.ts"/>
/// <reference path="victory_condition.ts"/>
/// <reference path="messages/message.ts"/>
///<reference path="entities/game_object.ts"/>
///<reference path="entities/house.ts"/>


/**
 * This class is responsible for keeping track of the world state and handling collisions.
 */
class GameWorld {
	constructor(public game: Phaser.Game) {
		this.blockGroup = game.add.group(game.world, "blocks");
		this.entityGroup = game.add.group(game.world, "entities");
	}

	public level: Level;

	private gnomes: Array<Gnome>;
	private gnomeCode: GnomeCode;
	private blockGroup: Phaser.Group;
	private entityGroup: Phaser.Group;

	private selectedBuilding: CodeBuilding;
	private selectedBuildingGnomeGhost: Gnome;

	public levelIsWon = false;
	public selectionListener: (building?: CodeBuilding, libraries?: CodeBuilding[]) => void;

	/**
	 * Loads the level with the provided name. It should be a JSON file that is loaded into the cache
	 * in the preloader.
	 */
	loadLevel(levelName: string) {
		let levelDefinition = this.game.cache.getJSON(levelName).LEVEL_DEFINITION;
		this.loadLevelFromDefinition(levelDefinition);
	}

	loadLevelFromDefinition(levelDefinition: any) {
		if (this.selectedBuildingGnomeGhost) {
			this.selectedBuildingGnomeGhost.destroy();
			this.selectedBuildingGnomeGhost = null;
		}
		this.selectedBuilding = null;
		this.levelIsWon = false;
		this.blockGroup.removeAll(true);
		this.entityGroup.removeAll(true);
		this.gnomes = [];
		if (this.selectionListener) {
			this.selectionListener();
		}

		this.level = new Level(levelDefinition);
		this.level.renderStage(this.blockGroup);
		this.level.renderObjects(this.entityGroup);
		if (levelDefinition.introMessage) {
			Messages.show(this.game, levelDefinition.introMessage);
		}
		this.gnomeCode = new GnomeCode(this.level.libraries.map(library => library.gnomeCode));

		this.level.codeBuildings.forEach(building => {
			building.events.onInputDown.add(() => this.selectCodeBuilding(building));
		});
		this.determineEntityZIndices();
	}

	selectCodeBuilding(building: CodeBuilding) {
		if (this.selectedBuilding) {
			this.selectedBuilding.deselect();
		}
		if (this.selectedBuildingGnomeGhost) {
			this.selectedBuildingGnomeGhost.destroy();
			this.selectedBuildingGnomeGhost = null;
		}
		this.selectedBuilding = building;
		this.selectedBuilding.select();
		if (this.selectionListener) {
			this.selectionListener(building, this.level.libraries);
		}
		if (building instanceof House) {
			this.selectedBuildingGnomeGhost = this.spawnGnome(building);
			this.selectedBuildingGnomeGhost.alpha = 0.3;
			this.game.add.tween(this.selectedBuildingGnomeGhost)
				.to({y: this.selectedBuildingGnomeGhost.y - 3}, 1000, Phaser.Easing.Sinusoidal.InOut, true)
				.yoyo(true, 0)
				.repeat(-1);
		}
	}

	/**
	 * Performs an action with the active gnome. Results depend on gnome location
	 */
	doGnomeAction(gnome: Gnome) {
		let actionLocation = gnome.location.getNeighbor(gnome.direction);
		let block = this.level.getBlock(actionLocation);

		let adjacentGnome = this.gnomes.filter(g => g.location.equals(actionLocation))[0];
		let adjacentObject = this.level.getObject(actionLocation);

		if (!adjacentObject || !adjacentObject.doAction(gnome)) {
			if (!gnome.floating && block === WorldConstants.BlockType.WATER) {
				gnome.wateringCan = true;
			}
			else if (adjacentGnome && gnome.wateringCan && !adjacentGnome.wateringCan) {
				gnome.wateringCan = false;
				adjacentGnome.wateringCan = true;
			}
		}
	}

	/**
	 * Try to move the gnome forward. This will fail if there's an obstacle in the way.
	 */
	tryMove(gnome: Gnome): boolean {
		let newLocation = gnome.location.getNeighbor(gnome.direction);
		let gnomeExistsInLocation = this.gnomes.filter(g => g.location.equals(newLocation)).length;
		if (!gnomeExistsInLocation && this.level.pointIsPassable(newLocation)) {
			gnome.walkTo(newLocation);
			this.determineEntityZIndices();

			if (this.level.getBlock(newLocation) === WorldConstants.BlockType.SWAMP) {
				//Swamp slows gnomes down
				gnome.delayed++;
			}
			return true;
		}
		return false;
	}

	killGnome(gnome: Gnome, causeOfDeath: CauseOfDeath) {
		this.gnomes.splice(this.gnomes.indexOf(gnome), 1);
		gnome.die(causeOfDeath);
	}

	resetGame() {
		let livingGnomes = this.gnomes.length;
		this.gnomes.forEach((gnome) => {
			this.killGnome(gnome, CauseOfDeath.CODE_RAN_OUT);
		});
		this.level.softReset();

		if (!livingGnomes) {
			this.spawnGnomes();
		}
	}

	spawnGnomes() {
		if (this.selectedBuildingGnomeGhost) {
			this.selectedBuildingGnomeGhost.destroy();
			this.selectedBuildingGnomeGhost = null;
		}
		this.level.houses.forEach(house => {
			let newGnome = this.spawnGnome(house);
			this.entityGroup.add(newGnome);
			this.gnomes.push(newGnome);
			this.determineEntityZIndices();
		});
	}

	private spawnGnome(house): Gnome {
		return new Gnome(this.game,
			house.model.positionX + Direction.getXDelta(house.model.direction),
			house.model.positionY + Direction.getYDelta(house.model.direction),
			house.model.direction,
			this.addDelay(house.gnomeCode, house.delay));
	}

	getIfRunning() {
		return this.gnomes.length > 0;
	}

	private addDelay(gnomeCode: Command[], delay: number) {
		let newGnomeCode = [];
		for (let i = 0; i < delay; i++) {
			newGnomeCode.push(new Command(CommandType.DELAY));
		}
		return newGnomeCode.concat(gnomeCode);
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

	/**
	 * Causes 1 unit of time to pass in the world.
	 */
	public nextTick() {
		this.gnomeCode.executeNextCommand(this, this.gnomes);
		this.level.spookTrees.forEach(tree => {
			tree.checkForGnomes(this.gnomes.filter(gnome => {
				return tree.location.getNeighbor(tree.model.direction).equals(gnome.location);
			})[0]);
		});
		if (!this.levelIsWon && this.level.checkVictory()) {
			this.levelIsWon = true;
		}
	}
}
