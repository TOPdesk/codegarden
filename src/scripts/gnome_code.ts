/// <reference path="gameworld.ts"/>
/// <reference path="entities/gnome.ts"/>

class GnomeCode {
	constructor(public libraries: Command[][]) {}

	/**
	 * Executes the next command.
	 */
	executeNextCommand(gameWorld: GameWorld, gnomes: Gnome[]) {
		//First act, then move, then die, so that interactions between gnomes will work as expected
		let walkingGnomes = [];
		let gnomeDeaths = [];
		gnomes.slice().sort((a, b) => a.wateringCan ? 1 : -1).forEach(gnome => {
			if (gnome.delayed) {
				gnome.delayed--;
				return;
			}
			let command = gnome.codeStack.pop();

			if (command instanceof RunnableCommand) {
				command.fn();
			}

			if (command === undefined) {
				gnomeDeaths.push({
					gnome: gnome,
					reason: CauseOfDeath.CODE_RAN_OUT
				});
			}
			else {
				if (command.type !== CommandType.WALK) {
					let deathReason = gameWorld.level.getPointCauseOfDeath(gnome.location, false);
					if (deathReason) {
						gnomeDeaths.push({
							gnome: gnome,
							reason: deathReason
						});
					}
				}

				switch (command.type) {
					case CommandType.WALK: walkingGnomes.push(gnome); break;
					case CommandType.LEFT: gnome.rotateLeft(); break;
					case CommandType.RIGHT: gnome.rotateRight(); break;
					case CommandType.ACT: gameWorld.doGnomeAction(gnome); break;
					case CommandType.CALL_ROUTINE:
						gnome.readBook();
						if (!this.queueUpRoutine(gnome, command)) {
							gnomeDeaths.push({
								gnome: gnome,
								reason: CauseOfDeath.CODE_RAN_OUT
							});
						}
						break;
					case CommandType.DELAY: gnome.delay(); break;
				}
			}
		});

		walkingGnomes.forEach(gnome => {
			let hasMoved = gameWorld.tryMove(gnome);
			let deathReason = gameWorld.level.getPointCauseOfDeath(gnome.location, hasMoved);
			if (deathReason) {
				gnomeDeaths.push({
					gnome: gnome,
					reason: deathReason
				});
			}
		});
		gnomeDeaths.forEach(death => {
			if (death.gnome.floating &&
				(death.reason === CauseOfDeath.FALLING || death.reason === CauseOfDeath.DROWNING)) {
				//Floating gnomes are immune to falling/drowning
				return;
			}
			gameWorld.killGnome(death.gnome, death.reason);
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
			default: throw new Error("Cannot parse command " + shorthand);
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
