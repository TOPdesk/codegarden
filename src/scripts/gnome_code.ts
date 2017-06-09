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
		let dyingGnomes = [];
		gnomes.slice().sort((a, b) => a.wateringCan ? 1 : -1).forEach(gnome => {
			let command = gnome.codeStack.pop();

			if (command instanceof RunnableCommand) {
				command.fn();
			}

			if (command === undefined) {
				dyingGnomes.push(gnome);
			}
			else {
				switch (command.type) {
					case CommandType.WALK: walkingGnomes.push(gnome); break;
					case CommandType.LEFT: gnome.rotateLeft(); break;
					case CommandType.RIGHT: gnome.rotateRight(); break;
					case CommandType.ACT: gameWorld.doGnomeAction(gnome); break;
					case CommandType.CALL_ROUTINE:
						gnome.readBook();
						if (!this.queueUpRoutine(gnome, command)) {
							dyingGnomes.push(gnome);
						}
						break;
					case CommandType.DELAY: gnome.delay(); break;
				}
			}
		});

		walkingGnomes.forEach(gnome => gameWorld.tryMove(gnome));
		dyingGnomes.forEach(gnome => gameWorld.killGnome(gnome, CauseOfDeath.CODE_RAN_OUT));
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
}
