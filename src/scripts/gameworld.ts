/// <reference path="../libs/phaser/typescript/phaser.d.ts"/>

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

		this.startCodeTimer();
	}

	public level: Level;

	private gnomes: Array<Gnome>;
	private gnomeCode: GnomeCode;
	private blockGroup: Phaser.Group;
	private entityGroup: Phaser.Group;
	private hasWon = false;

	private selectedBuilding: CodeBuilding;

	public selectionListener: (building?: CodeBuilding, libraries?: CodeBuilding[]) => void;

	/**
	 * Loads the level with the provided name. It should be a JSON file that is loaded into the cache
	 * in the preloader.
	 */
	loadLevel(levelName: string) {
		this.selectedBuilding = null;
		this.hasWon = false;
		this.blockGroup.removeAll(true);
		this.entityGroup.removeAll(true);
		this.gnomes = [];
		if (this.selectionListener) {
			this.selectionListener();
		}

		let levelDefinition = this.game.cache.getJSON(levelName).LEVEL_DEFINITION;
		this.level = new Level(levelDefinition);
		this.level.renderStage(this.blockGroup);
		this.level.renderObjects(this.entityGroup);
		if (levelDefinition.introMessage) {
			Messages.show(this.game, levelDefinition.introMessage);
		}
		this.gnomeCode = new GnomeCode(this.level.libraries.map(library => library.gnomeCode));

		this.level.codeBuildings.forEach(building => {
			building.events.onInputDown.add(() => {
				if (this.selectedBuilding) {
					this.selectedBuilding.deselect();
				}
				this.selectedBuilding = building;
				this.selectedBuilding.select();
				if (this.selectionListener) {
					this.selectionListener(building, this.level.libraries);
				}
			});
		});
		this.determineEntityZIndices();
	}

	/**
	 * Performs an action with the active gnome. Results depend on gnome location
	 */
	doGnomeAction(gnome: Gnome) {
		let actionLocation = gnome.location.getNeighbor(gnome.direction);
		let block = this.level.getBlock(actionLocation);

		let gnomesInLocation = this.gnomes.filter(g => g.location.equals(actionLocation));
		let adjacentGnome = gnomesInLocation[0];

		if (!this.level.doObjectAction(actionLocation, gnome)) {
			if (!gnome.floating && block === WorldConstants.BlockType.WATER) {
				gnome.wateringCan = true;
			}
			else if (!gnome.floating && adjacentGnome && gnome.wateringCan && !adjacentGnome.wateringCan) {
				gnome.wateringCan = false;
				adjacentGnome.wateringCan = true;
			}
		}
	}

	/**
	 * Try to move the gnome forward. Depending on what's in the way, this might succeed, fail, or kill the gnome.
	 */
	tryMove(gnome: Gnome) {
		let newLocation = gnome.location.getNeighbor(gnome.direction);
		let gnomeExistsInLocation = this.gnomes.filter(g => g.location.equals(newLocation)).length;
		if (!gnomeExistsInLocation && this.level.pointIsPassable(newLocation)) {
			gnome.walkTo(newLocation);
			this.determineEntityZIndices();
		}

		//Right now, terrain can't kill a gnome if it's floating
		if (gnome.floating) {
			return;
		}
		let causeOfDeath = this.level.getPointCauseOfDeath(newLocation);
		if (causeOfDeath) {
			this.killGnome(gnome, causeOfDeath);
		}
	}

	killGnome(gnome: Gnome, causeOfDeath: CauseOfDeath) {
		this.gnomes.splice(this.gnomes.indexOf(gnome), 1);
		this.entityGroup.remove(gnome);
		this.game.world.add(gnome);
		gnome.die(causeOfDeath);
	}

	resetGame() {
		this.gnomes.forEach((gnome) => {
			this.killGnome(gnome, CauseOfDeath.CODE_RAN_OUT);
		});
	}

	spawnGnomes() {
		this.level.houses.forEach(house => {
			let newGnome = new Gnome(this.game,
				house.model.positionX + Direction.getXDelta(house.model.direction),
				house.model.positionY + Direction.getYDelta(house.model.direction),
				house.model.direction,
				this.addDelay(house.gnomeCode, house.delay));
			this.entityGroup.add(newGnome);
			this.gnomes.push(newGnome);
			this.determineEntityZIndices();
		});
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

	private startCodeTimer() {
		let timer = this.game.time.create();
		timer.loop(WorldConstants.TURN_LENGTH_IN_MILLIS, () => {
			this.gnomeCode.executeNextCommand(this, this.gnomes);
			if (!this.hasWon && this.level.checkVictory()) {
				this.winLevel();
			}
		});
		timer.start();
	}

	private winLevel() {
		this.hasWon = true;
		Messages.show(this.game, "Good work! Click here to continue", {
			callback: () => {
				if (this.level.nextLevel) {
					this.loadLevel(this.level.nextLevel);
				}
				else {
					this.game.state.start("menu");
				}
			}
		});
		localStorage.setItem("lastLevel", this.level.nextLevel);
	}
}
