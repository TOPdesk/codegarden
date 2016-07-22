/// <reference path="gameworld.ts"/>
/// <reference path="gnome.ts"/>

class GnomeCode {
	private routineMap: { [key: string]: Array<Command> };
	private futureCommandStack: Array<Command> = [];

	constructor(routineMap: { [key: string]: Array<Command> }) {
		this.routineMap = routineMap;
		if ("main" in routineMap) {
			this.queueUpRoutine(routineMap["main"]);
		}
	}

	/**
	 * Executes the next command.
	 */
	executeNextCommand(gameWorld: GameWorld) {
		if (this.futureCommandStack.length === 0) {
			gameWorld.killGnome(CauseOfDeath.CODE_RAN_OUT);
			return;
		}

		let command = this.futureCommandStack.pop();
		switch (command.type) {
			case CommandType.WALK:
				gameWorld.tryMove();
				break;
			case CommandType.LEFT:
				gameWorld.rotateLeft();
				break;
			case CommandType.RIGHT:
				gameWorld.rotateRight();
				break;
			case CommandType.ACT:
				gameWorld.doGnomeAction();
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
