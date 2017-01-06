/// <reference path="gameworld.ts"/>
/// <reference path="gnome.ts"/>

class GnomeCode {
	private gnome: Gnome;
	private routineMap: { [key: string]: Array<Command> };
	private futureCommandStack: Array<Command> = [];

	constructor(gnome: Gnome, routineMap: { [key: string]: Array<Command> }) {
		this.gnome = gnome;
		this.routineMap = routineMap;
		if ("main" in routineMap) {
			this.queueUpRoutine(routineMap["main"]);
		}
	}

	/**
	 * Executes the next command.
	 */
	executeNextCommand(gameWorld: GameWorld) {
		let command = this.futureCommandStack.pop();
		if (command === undefined) {
			gameWorld.killGnome(this.gnome, CauseOfDeath.CODE_RAN_OUT);
			return;
		}

		switch (command.type) {
			case CommandType.WALK:
				gameWorld.tryMove(this.gnome);
				break;
			case CommandType.LEFT:
				this.gnome.rotateLeft();
				break;
			case CommandType.RIGHT:
				this.gnome.rotateRight();
				break;
			case CommandType.ACT:
				gameWorld.doGnomeAction(this.gnome);
				break;
			case CommandType.CALL_ROUTINE:
				this.queueUpRoutine(this.routineMap[command.args[0]]); //TODO kill gnome if the routine doesn't exist
				break;
			default:
				break;
		}
	}

	private queueUpRoutine(routine: Array<Command>) {
		for (let i = routine.length; i >= 0; i--) {
			this.futureCommandStack.push(routine[i]);
		}
	}

}

class Command {
	constructor(public type: CommandType, public args: Array<string> = []) {}

	getArgument(index: number): string {
		return this.args[index];
	}
}

enum CommandType {
	WALK,
	LEFT,
	RIGHT,
	ACT,
	CALL_ROUTINE
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
			default:
				return "unknownCommandType";
		}
	}
}
