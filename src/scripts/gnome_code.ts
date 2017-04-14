/// <reference path="gameworld.ts"/>
/// <reference path="entities/gnome.ts"/>

class GnomeCode {
	constructor(public libraries: Command[][]) {}

	/**
	 * Executes the next command.
	 */
	executeNextCommand(gameWorld: GameWorld, gnomes: Gnome[]) {
		gnomes.forEach(gnome => {
			let command = gnome.codeStack.pop();

			if (command instanceof RunnableCommand) {
				command.fn();
			}

			if (command === undefined) {
				gameWorld.killGnome(gnome, CauseOfDeath.CODE_RAN_OUT);
				return;
			}

			switch (command.type) {
				case CommandType.WALK: gameWorld.tryMove(gnome); break;
				case CommandType.LEFT: gnome.rotateLeft(); break;
				case CommandType.RIGHT: gnome.rotateRight(); break;
				case CommandType.ACT: gameWorld.doGnomeAction(gnome); break;
				case CommandType.CALL_ROUTINE: this.queueUpRoutine(gameWorld, gnome, command); break;
				case CommandType.DELAY: gnome.delay(); break;
			}
		});
	}

	private queueUpRoutine(gameWorld: GameWorld, gnome: Gnome, command: Command) {
		let routine = this.libraries[command.args[0]];
		if (!routine || !routine.length) {
			gameWorld.killGnome(gnome, CauseOfDeath.CODE_RAN_OUT);
			return;
		}

		for (let i = routine.length - 1; i >= 0; i--) {
			gnome.codeStack.push(routine[i]);
		}
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
				return "commandDelay";
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
