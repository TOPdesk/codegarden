/// <reference path="gameworld.ts"/>
/// <reference path="entities/gnome.ts"/>

class GnomeCode {
	constructor(public libraries: Command[][]) {}

	/**
	 * Simultaneously executes the next command for all gnomes. If commands conflict with each other,
	 * they are resolved in a deterministic order:
	 * - 'Stationary' commands are resolved first, then movement commands, then any resulting gnome deaths.
	 * - Gnomes without water take priority over those without.
	 * - After that, gnomes take priority in ascending order of X coordinate followed by Y coordinate.
	 */
	executeNextCommand(gameWorld: GameWorld, gnomes: Gnome[]) {
		let undelayedGnomes = this.filterDelayedGnomes(gnomes);
		let sortedGnomes = this.sortGnomesByPriority(undelayedGnomes);

		let stationaryGnomes = [];
		let walkingGnomes = [];
		sortedGnomes.forEach(gnome => {
			let commandType = gnome.codeStack.length ? gnome.codeStack[gnome.codeStack.length - 1].type : null;
			if (commandType === CommandType.WALK) {
				walkingGnomes.push(gnome);
			}
			else {
				stationaryGnomes.push(gnome);
			}
		});

		this.resolveStationaryGnomeCommands(gameWorld, stationaryGnomes);

		let gnomesWhichMoved = [];
		walkingGnomes.forEach(gnome => {
			gnome.codeStack.pop();
			let hasMoved = gameWorld.tryMove(gnome);
			if (hasMoved) {
				gnomesWhichMoved.push(gnome);
			}
		});

		this.resolveGnomeDeaths(gameWorld, sortedGnomes, gnomesWhichMoved);
	}

	private filterDelayedGnomes(gnomes: Gnome[]) {
		let undelayedGnomes = [];
		gnomes.forEach(gnome => {
			if (gnome.delayed) {
				gnome.delayed--;
			}
			else {
				undelayedGnomes.push(gnome);
			}
		});
		return undelayedGnomes;
	}

	private sortGnomesByPriority(gnomes: Gnome[]) {
		return gnomes.slice().sort((a, b) => {
			if (a.wateringCan && !b.wateringCan) {
				return 1;
			}
			if (!a.wateringCan && b.wateringCan) {
				return -1;
			}
			if (a.location.x !== b.location.x) {
				return a.location.x - b.location.x;
			}
			return a.location.y - b.location.y;
		});
	}

	private resolveStationaryGnomeCommands(world: GameWorld, gnomes: Gnome[]) {
		gnomes.forEach(gnome => {
			let command = gnome.codeStack.pop();
			if (command === undefined) {
				return;
			}

			if (command instanceof RunnableCommand) {
				command.fn();
				return;
			}

			switch (command.type) {
				case CommandType.LEFT: gnome.rotateLeft(); break;
				case CommandType.RIGHT: gnome.rotateRight(); break;
				case CommandType.ACT: world.doGnomeAction(gnome); break;
				case CommandType.CALL_ROUTINE:
					this.queueUpRoutine(gnome, command);
					gnome.readBook();
					break;
				case CommandType.DELAY: gnome.delay(); break;
				default: throw new Error("Unknown command type: " + command.type);
			}
		});
	}

	private queueUpRoutine(gnome: Gnome, command: Command): boolean {
		let routine = this.libraries[command.args[0]];
		if (!routine || !routine.length) {
			return false;
		}

		for (let i = routine.length - 1; i >= 0; i--) {
			gnome.codeStack.push(routine[i]);
		}
		return true;
	}

	private resolveGnomeDeaths(gameWorld: GameWorld, gnomes: Gnome[], gnomesWhichMoved: Gnome[]) {
		gnomes.forEach(gnome => {
			if (!gnome.codeStack.length) {
				gameWorld.killGnome(gnome, CauseOfDeath.CODE_RAN_OUT);
			}

			let hasMoved = gnomesWhichMoved.indexOf(gnome) !== -1;
			let deathReason = gameWorld.level.getPointCauseOfDeath(gnome.location, hasMoved);
			if (deathReason) {
				if (gnome.floating &&
						(deathReason === CauseOfDeath.FALLING || deathReason === CauseOfDeath.DROWNING)) {
					//Floating gnomes are immune to falling/drowning
					return;
				}
				gameWorld.killGnome(gnome, deathReason);
			}
		});
	}
}

class Command {
	constructor(public type: CommandType, public args = []) {}
}

class RunnableCommand extends Command {
	fn;
	constructor(fn: Function) {
		super(undefined);
		this.fn = fn;
	};
}

enum CommandType {
	WALK,
	LEFT,
	RIGHT,
	ACT,
	CALL_ROUTINE,
	DELAY
}
namespace CommandType {
	export function imageClass(type: CommandType): string {
		switch (type) {
			case CommandType.WALK:
				return "commandMoveForward";
			case CommandType.LEFT:
				return "commandTurnLeft";
			case CommandType.RIGHT:
				return "commandTurnRight";
			case CommandType.ACT:
				return "commandPerformAction";
			case CommandType.CALL_ROUTINE:
				return "commandLibrary";
			case CommandType.DELAY:
				return "delay";
			default:
				return "unknownCommandType";
		}
	}

	export function getCommandTypeForShorthand(shorthand: string) {
		switch (shorthand) {
			case "W": return new Command(CommandType.WALK);
			case "L": return new Command(CommandType.LEFT);
			case "R": return new Command(CommandType.RIGHT);
			case "A": return new Command(CommandType.ACT);
			case "D": return new Command(CommandType.DELAY);
			default:
				if (shorthand >= "0" && shorthand <= "9") {
					return new Command(CommandType.CALL_ROUTINE, [parseInt(shorthand)]);
				}
				throw new Error("Cannot parse command " + shorthand);
		}
	}

	export function getTooltip(type: CommandType) {
		switch (type) {
			case CommandType.WALK: return "Move forward";
			case CommandType.LEFT: return "Turn left";
			case CommandType.RIGHT: return "Turn right";
			case CommandType.ACT: return "Interact with whatever the gnome is looking at";
			case CommandType.CALL_ROUTINE: return "Read a book from the corresponding library and do what it says";
		}
		return "What does this command do? It's a mystery to everyone!";
	}
}
